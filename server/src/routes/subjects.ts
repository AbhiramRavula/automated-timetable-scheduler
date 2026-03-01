import { Router, Request, Response } from "express";
import Course from "../models/Course";

const router = Router();

// GET all subjects
router.get("/", async (req: Request, res: Response) => {
  try {
    const courses = await Course.find().sort({ code: 1 });
    res.json(courses);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch subjects" });
  }
});

// POST new subject
router.post("/", async (req: Request, res: Response) => {
  try {
    const course = new Course(req.body);
    await course.save();
    res.status(201).json(course);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to add subject", details: err.message });
  }
});

// PUT update subject
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!course) return res.status(404).json({ error: "Subject not found" });
    res.json(course);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to update subject" });
  }
});

// DELETE subject
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ error: "Subject not found" });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to delete subject" });
  }
});

export default router;
