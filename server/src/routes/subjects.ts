import { Router, Response } from "express";
import Course from "../models/Course";
import { RequestWithInstitution } from "../middleware/institutionMiddleware";

const router = Router();

// GET all subjects
router.get("/", async (req: RequestWithInstitution, res: Response) => {
  const institutionId = req.institutionId;
  try {
    const courses = await Course.find({ institutionId }).sort({ code: 1 });
    res.json(courses);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch subjects" });
  }
});

// POST new subject
router.post("/", async (req: RequestWithInstitution, res: Response) => {
  const institutionId = req.institutionId;
  try {
    const course = new Course({ ...req.body, institutionId });
    await course.save();
    res.status(201).json(course);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to add subject", details: err.message });
  }
});

// PUT update subject
router.put("/:id", async (req: RequestWithInstitution, res: Response) => {
  const institutionId = req.institutionId;
  try {
    const course = await Course.findOneAndUpdate({ _id: req.params.id, institutionId }, req.body, { new: true });
    if (!course) return res.status(404).json({ error: "Subject not found in this institution" });
    res.json(course);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to update subject" });
  }
});

// DELETE subject
router.delete("/:id", async (req: RequestWithInstitution, res: Response) => {
  const institutionId = req.institutionId;
  try {
    const course = await Course.findOneAndDelete({ _id: req.params.id, institutionId });
    if (!course) return res.status(404).json({ error: "Subject not found in this institution" });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to delete subject" });
  }
});

export default router;
