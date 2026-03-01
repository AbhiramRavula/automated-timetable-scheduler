import { Router, Request, Response } from "express";
import Teacher from "../models/Teacher";

const router = Router();

// GET all teachers
router.get("/", async (req: Request, res: Response) => {
  try {
    const teachers = await Teacher.find().sort({ name: 1 });
    res.json(teachers);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch faculty" });
  }
});

// POST new teacher
router.post("/", async (req: Request, res: Response) => {
  try {
    const teacher = new Teacher(req.body);
    await teacher.save();
    res.status(201).json(teacher);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to add faculty member", details: err.message });
  }
});

// PUT update teacher
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!teacher) return res.status(404).json({ error: "Faculty member not found" });
    res.json(teacher);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to update faculty member" });
  }
});

// DELETE teacher
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const teacher = await Teacher.findByIdAndDelete(req.params.id);
    if (!teacher) return res.status(404).json({ error: "Faculty member not found" });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to delete faculty member" });
  }
});

export default router;
