import { Router, Request, Response } from "express";
import Timetable from "../models/Timetable";
import { parseConstraints, proposeSchedule } from "../services/llmService";
import { validateAndScore } from "../services/validator";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const timetables = await Timetable.find().sort({ createdAt: -1 });
    res.json(timetables);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch timetables" });
  }
});

router.post("/generate", async (req: Request, res: Response) => {
  try {
    const { courses, teachers, rooms, constraintsText, batches, metadata } = req.body;

    console.log("📝 Received request to generate timetable");
    console.log("Courses:", courses?.length || 0);
    console.log("Teachers:", teachers?.length || 0);
    console.log("Rooms:", rooms?.length || 0);
    console.log("Batches:", batches?.length || 0);

    console.log("🤖 Parsing constraints...");
    const constraints = await parseConstraints(constraintsText || "");
    console.log("✅ Constraints parsed:", constraints);

    console.log("🤖 Proposing schedule...");
    const rawSchedule = await proposeSchedule({ 
      courses, 
      teachers, 
      rooms, 
      constraints,
      batches 
    });
    console.log("✅ Schedule proposed:", rawSchedule.length, "events");

    console.log("✅ Validating and scoring...");
    const result = validateAndScore(rawSchedule);

    // Group events by batch to create separate timetables
    const timetablesByBatch: { [batch: string]: any } = {};
    
    for (const event of result.events) {
      const batch = event.batch || "DEFAULT";
      if (!timetablesByBatch[batch]) {
        timetablesByBatch[batch] = {
          id: batch.toLowerCase().replace(/\s+/g, "-"),
          class: batch,
          room: "",
          date: new Date().toLocaleDateString("en-GB"),
          wef: new Date().toLocaleDateString("en-GB"),
          classTeacher: "",
          schedule: {
            MON: Array(7).fill(null),
            TUE: Array(7).fill(null),
            WED: Array(7).fill(null),
            THU: Array(7).fill(null),
            FRI: Array(7).fill(null),
            SAT: Array(7).fill(null),
          }
        };
      }
      
      const dayNames = ["MON", "TUE", "WED", "THU", "FRI", "SAT"];
      const dayName = dayNames[event.day];
      
      if (dayName && timetablesByBatch[batch].schedule[dayName]) {
        // Handle multi-slot events (labs)
        if (event.duration > 1) {
          timetablesByBatch[batch].schedule[dayName][event.slot] = {
            subject: event.courseCode,
            span: event.duration
          };
          // Mark subsequent slots as occupied
          for (let i = 1; i < event.duration; i++) {
            timetablesByBatch[batch].schedule[dayName][event.slot + i] = "OCCUPIED";
          }
        } else {
          timetablesByBatch[batch].schedule[dayName][event.slot] = event.courseCode;
        }
      }
    }

    // Build a teacher lookup: teacherCode → name
    const teacherLookup: Record<string, string> = {};
    (teachers || []).forEach((t: any) => {
      teacherLookup[t.code || t.id || t.name] = t.name;
    });

    // Inject faculty_mapping and LUNCH slot into each batch
    for (const batchName of Object.keys(timetablesByBatch)) {
      const batchObj = timetablesByBatch[batchName];

      // Build faculty_mapping from courses belonging to this batch
      const batchCourses = (courses || []).filter(
        (c: any) => (c.batch || "DEFAULT") === batchName
      );
      batchObj.faculty_mapping = batchCourses.map((c: any) => ({
        code: c.code || c.id || c.name,
        subject: c.name || c.subject || c.code,
        abbr: c.code || c.id || c.name,
        faculty: teacherLookup[c.teacherCode] || c.teacherCode || "TBA",
      }));

      // Add LUNCH slot at index 4 for every day that has at least one event
      for (const day of Object.keys(batchObj.schedule)) {
        const row: (string | null)[] = batchObj.schedule[day];
        if (row.some((v: any) => v !== null)) {
          row[4] = "LUNCH";
        }
      }
    }

    // Convert to array
    const timetables = Object.values(timetablesByBatch);

    // Persist to MongoDB
    const persistedTimetable = new Timetable({
      courses: courses || [],
      teachers: teachers || [],
      rooms: rooms || [],
      grid: timetablesByBatch,
      constraintsSnapshot: constraints,
      metrics: result.metrics,
      metadata: metadata || {}
    });

    await persistedTimetable.save();
    console.log("✅ Timetable persisted to MongoDB:", persistedTimetable._id);

    return res.json({
      timetable: result.events, // Keep original format for backward compatibility
      timetables: timetables,   // New format for AllTimetablesView
      metrics: result.metrics,
      hardViolations: result.hardViolations,
    });
  } catch (err: any) {
    console.error("❌ Error generating timetable:");
    console.error(err.message);
    console.error(err.stack);
    return res.status(500).json({ 
      error: "Failed to generate timetable",
      details: err.message 
    });
  }
});

router.post("/validate", async (req: Request, res: Response) => {
  try {
    // TODO: run validator on client-edited timetable
    // const { timetable } = req.body;
    return res.json({ message: "validate placeholder" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to validate timetable" });
  }
});

router.get("/:id", async (req: Request, res: Response) => {
  try {
    // TODO: fetch timetable by id
    const { id } = req.params;
    const timetable = await Timetable.findById(id);
    
    if (!timetable) {
      return res.status(404).json({ error: "Timetable not found" });
    }
    
    return res.json(timetable);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch timetable" });
  }
});

router.get("/:id/metrics", async (req: Request, res: Response) => {
  try {
    // TODO: return stored metrics
    const { id } = req.params;
    const timetable = await Timetable.findById(id);
    
    if (!timetable) {
      return res.status(404).json({ error: "Timetable not found" });
    }
    
    return res.json({ metrics: timetable.metrics });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch metrics" });
  }
});

router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body; // e.g. { label, grid }
    const timetable = await Timetable.findByIdAndUpdate(id, updates, { new: true });
    if (!timetable) return res.status(404).json({ error: "Timetable not found" });
    return res.json(timetable);
  } catch (error) {
    return res.status(500).json({ error: "Failed to update timetable" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = await Timetable.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Timetable not found" });
    return res.json({ success: true, id });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete timetable" });
  }
});

export default router;
