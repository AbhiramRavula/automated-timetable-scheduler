import { Router, Response } from "express";
import Timetable from "../models/Timetable";
import { parseConstraints, proposeSchedule } from "../services/llmService";
import { validateAndScore } from "../services/validator";
import { WorkloadAnalyzer } from "../services/workloadAnalyzer";
import { RequestWithInstitution } from "../middleware/institutionMiddleware";

const router = Router();

router.get("/", async (req: RequestWithInstitution, res: Response) => {
  const institutionId = req.institutionId;
  try {
    const timetables = await Timetable.find({ institutionId }).sort({ createdAt: -1 });
    res.json(timetables);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch timetables" });
  }
});

router.post("/generate", async (req: RequestWithInstitution, res: Response) => {
  const institutionId = req.institutionId;
  try {
    const { courses, teachers, rooms, constraintsText, batches, metadata } = req.body;

    console.log("📝 Received request to generate timetable");
    console.log("Institution ID:", institutionId);
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
        
        if (event.duration > 1) {
          for (let i = 1; i < event.duration; i++) {
            timetablesByBatch[batch].schedule[dayName][event.slot + i] = "OCCUPIED";
          }
        }
      }
    }

    const teacherLookup: Record<string, string> = {};
    (teachers || []).forEach((t: any) => {
      teacherLookup[t.code || t.id || t.name] = t.name;
    });

    for (const batchName of Object.keys(timetablesByBatch)) {
      const batchObj = timetablesByBatch[batchName];
      const scheduledInThisBatch = new Set<string>();
      Object.values(batchObj.schedule).forEach((row: any) => {
        row.forEach((slot: any) => {
          if (slot && typeof slot === 'object') scheduledInThisBatch.add(normalize(slot.subject));
          else if (slot && slot !== "OCCUPIED" && slot !== "LUNCH") scheduledInThisBatch.add(normalize(slot));
        });
      });

      const batchCourses = (courses || []).filter((c: any) => normalize(c.batch) === normalize(batchName));
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

      scheduledInThisBatch.forEach(normCode => {
        if (!batchFacultyMapping.some(fm => normalize(fm.code) === normCode)) {
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

      for (const day of Object.keys(batchObj.schedule)) {
        const row: (string | null)[] = batchObj.schedule[day];
        if (row.some((v: any) => v !== null)) {
          row[4] = "LUNCH";
        }
      }
    }

    const timetables = Object.values(timetablesByBatch);
    const workload = WorkloadAnalyzer.getWorkload(result.events as any, teachers, courses);

    const persistedTimetable = new Timetable({
      courses: courses || [],
      teachers: teachers || [],
      rooms: rooms || [],
      grid: timetablesByBatch,
      constraintsSnapshot: constraints,
      metrics: result.metrics,
      workload: workload,
      institutionId: institutionId,
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
    console.error("❌ Error generating timetable:", err.message);
    return res.status(500).json({ 
      error: "Failed to generate timetable",
      details: err.message 
    });
  }
});

router.post("/validate", async (req: RequestWithInstitution, res: Response) => {
  try {
    return res.json({ message: "validate placeholder" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to validate timetable" });
  }
});

router.get("/:id", async (req: RequestWithInstitution, res: Response) => {
  const institutionId = req.institutionId;
  try {
    const timetable = await Timetable.findOne({ _id: req.params.id, institutionId });
    if (!timetable) {
      return res.status(404).json({ error: "Timetable not found in this institution" });
    }
    return res.json(timetable);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch timetable" });
  }
});

router.get("/:id/metrics", async (req: RequestWithInstitution, res: Response) => {
  const institutionId = req.institutionId;
  try {
    const timetable = await Timetable.findOne({ _id: req.params.id, institutionId });
    if (!timetable) {
      return res.status(404).json({ error: "Timetable not found in this institution" });
    }
    return res.json({ metrics: timetable.metrics });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch metrics" });
  }
});

router.patch("/:id", async (req: RequestWithInstitution, res: Response) => {
  const institutionId = req.institutionId;
  try {
    const timetable = await Timetable.findOneAndUpdate(
      { _id: req.params.id, institutionId },
      req.body,
      { new: true }
    );
    if (!timetable) return res.status(404).json({ error: "Timetable not found in this institution" });
    return res.json(timetable);
  } catch (error) {
    return res.status(500).json({ error: "Failed to update timetable" });
  }
});

router.delete("/:id", async (req: RequestWithInstitution, res: Response) => {
  const institutionId = req.institutionId;
  try {
    const deleted = await Timetable.findOneAndDelete({ _id: req.params.id, institutionId });
    if (!deleted) return res.status(404).json({ error: "Timetable not found in this institution" });
    return res.json({ success: true, id: req.params.id });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete timetable" });
  }
});

export default router;
