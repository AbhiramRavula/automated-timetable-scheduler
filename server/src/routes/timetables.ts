import { Router, Request, Response } from "express";
import Timetable from "../models/Timetable";
import { parseConstraints, proposeSchedule } from "../services/llmService";
import { validateAndScore } from "../services/validator";
import { WorkloadAnalyzer } from "../services/workloadAnalyzer";

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
    let constraints: any[] = [];
    let limitReached = false;
    
    try {
      constraints = await parseConstraints(constraintsText || "");
      console.log("✅ Constraints parsed:", constraints);
    } catch (err: any) {
      if (err.name === "LLMLimitError") {
        limitReached = true;
        console.warn("⚠️ AI Limit reached during constraint parsing");
      } else {
        throw err;
      }
    }

    console.log("🤖 Proposing schedule...");
    let rawSchedule: any[] = [];
    try {
      rawSchedule = await proposeSchedule({ 
        courses, 
        teachers, 
        rooms, 
        constraints,
        batches 
      });
      console.log("✅ Schedule proposed:", rawSchedule.length, "events");
    } catch (err: any) {
      if (err.name === "LLMLimitError") {
        limitReached = true;
        console.warn("⚠️ AI Limit reached during schedule proposal, using fallback");
        const { proposeSchedule: fallbackPropose } = require("../services/llmService");
        // Passing null model context via service to trigger fallback inside service
        rawSchedule = await fallbackPropose({ courses, teachers, rooms, constraints: [], batches });
      } else {
        throw err;
      }
    }

    console.log("✅ Validating and scoring...");
    const result = validateAndScore(rawSchedule);

    // Group events by batch to create separate timetables
    const timetablesByBatch: { [batch: string]: any } = {};
    
    // Helper for fuzzy matching codes (strips spaces, case insensitive)
    const normalize = (s: string) => s.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
    const courseMap: Record<string, any> = {};
    (courses || []).forEach((c: any) => {
      courseMap[normalize(c.code)] = c;
    });

    for (const event of result.events) {
      const batch = event.batch || "DEFAULT";
      const dayNames = ["MON", "TUE", "WED", "THU", "FRI", "SAT"];
      const dayName = dayNames[event.day];
      
      const batchData = (batches || []).find((b: any) => normalize(b.name) === normalize(batch));
      
      if (!timetablesByBatch[batch]) {
        timetablesByBatch[batch] = {
          id: batch.toLowerCase().replace(/\s+/g, "-"),
          class: batch,
          room: batchData?.room || "",
          date: new Date().toLocaleDateString("en-GB"),
          wef: batchData?.effectiveDate || new Date().toLocaleDateString("en-GB"),
          classTeacher: batchData?.classTeacher || "",
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
      
      // Use the original course code from database if possible (fuzzy match)
      const normalizedCode = normalize(event.courseCode);
      const matchedCourse = courseMap[normalizedCode];
      const displayCode = matchedCourse ? matchedCourse.code : event.courseCode;

      if (dayName && timetablesByBatch[batch].schedule[dayName]) {
        const eventObj = {
          subject: displayCode,
          room: event.roomName,
          span: event.duration
        };
        
        timetablesByBatch[batch].schedule[dayName][event.slot] = eventObj;
        
        // Mark subsequent slots as occupied
        if (event.duration > 1) {
          for (let i = 1; i < event.duration; i++) {
            timetablesByBatch[batch].schedule[dayName][event.slot + i] = "OCCUPIED";
          }
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

      // Collect all subjects that were actually scheduled in this batch
      const scheduledInThisBatch = new Set<string>();
      Object.values(batchObj.schedule).forEach((row: any) => {
        row.forEach((slot: any) => {
          if (slot && typeof slot === 'object') scheduledInThisBatch.add(normalize(slot.subject));
          else if (slot && slot !== "OCCUPIED" && slot !== "LUNCH") scheduledInThisBatch.add(normalize(slot));
        });
      });

      // Build faculty_mapping: include all courses assigned to this batch
      const batchCourses = (courses || []).filter((c: any) => normalize(c.batch) === normalize(batchName));
      
      console.log(`[DEBUG] Batch: "${batchName}" (normalized: "${normalize(batchName)}")`);
      console.log(`[DEBUG] Found ${batchCourses.length} subjects for this batch.`);
      if (batchCourses.length < 5 && courses && courses.length > 0) {
        console.log(`[DEBUG] First course batch in DB: "${courses[0].batch}" (normalized: "${normalize(courses[0].batch)}")`);
      }

      const batchFacultyMapping: any[] = [];
      
      batchCourses.forEach((c: any) => {
        const faculties = c.teacherCodes.map((tc: string) => teacherLookup[tc] || tc).join(", ");
        batchFacultyMapping.push({
          code: c.code,
          subject: c.name || c.subject || c.code,
          abbr: c.code,
          faculty: faculties || "TBA",
        });
      });

      // Also add any other subjects that were actually scheduled (like LIB, SPORTS, or hallucinations)
      scheduledInThisBatch.forEach(normCode => {
        if (!batchFacultyMapping.some(fm => normalize(fm.code) === normCode)) {
          // Fuzzy match: check if normCode starts with or is part of any course code in the entire list
          const fuzzyMatch = (courses || []).find((c: any) => 
            normalize(c.code).includes(normCode) || normCode.includes(normalize(c.code))
          );
          
          if (fuzzyMatch) {
             const faculties = fuzzyMatch.teacherCodes.map((tc: string) => teacherLookup[tc] || tc).join(", ");
             batchFacultyMapping.push({
               code: fuzzyMatch.code,
               subject: fuzzyMatch.name || fuzzyMatch.subject || fuzzyMatch.code,
               abbr: fuzzyMatch.code,
               faculty: faculties || "TBA",
             });
          } else {
            batchFacultyMapping.push({
              code: normCode.toUpperCase(),
              subject: normCode.includes("lib") ? "Library" : (normCode.includes("sports") ? "Sports" : "Unknown Subject"),
              abbr: normCode.toUpperCase(),
              faculty: "-",
            });
          }
        }
      });

      batchObj.faculty_mapping = batchFacultyMapping;

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

    // Aggregate workload for all teachers
    const workload = WorkloadAnalyzer.getWorkload(result.events as any, teachers, courses);

    // Persist to MongoDB
    const persistedTimetable = new Timetable({
      courses: courses || [],
      teachers: teachers || [],
      rooms: rooms || [],
      grid: timetablesByBatch,
      constraintsSnapshot: constraints,
      metrics: result.metrics,
      workload: workload,
      metadata: { ...metadata, limitReached }
    });

    await persistedTimetable.save();
    console.log("✅ Timetable persisted to MongoDB:", persistedTimetable._id);

    return res.json({
      timetable: result.events, 
      timetables: timetables,   
      metrics: result.metrics,
      hardViolations: result.hardViolations,
      limitReached: limitReached,
      workload: workload
    });
  } catch (err: any) {
    console.error("❌ Error generating timetable:");
    console.error(err.message);
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
