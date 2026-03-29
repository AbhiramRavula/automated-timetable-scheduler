import { Router, Response } from "express";
import Teacher from "../models/Teacher";
import { RequestWithInstitution } from "../middleware/institutionMiddleware";

const router = Router();

// GET all teachers
router.get("/", async (req: RequestWithInstitution, res: Response) => {
  const institutionId = req.institutionId;

  try {
    const teachers = await Teacher.find({ institutionId }).sort({ name: 1 });
    res.json(teachers);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch faculty" });
  }
});

// POST new teacher
router.post("/", async (req: RequestWithInstitution, res: Response) => {
  const institutionId = req.institutionId;

  try {
    const teacherData = { ...req.body, institutionId };
    const teacher = new Teacher(teacherData);
    await teacher.save();
    res.status(201).json(teacher);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to add faculty member", details: err.message });
  }
});

// PUT update teacher
router.put("/:id", async (req: RequestWithInstitution, res: Response) => {
  const institutionId = req.institutionId;

  try {
    const teacher = await Teacher.findOneAndUpdate({ _id: req.params.id, institutionId }, req.body, { new: true });
    if (!teacher) return res.status(404).json({ error: "Faculty member not found in this institution" });
    res.json(teacher);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to update faculty member" });
  }
});

// DELETE teacher
router.delete("/:id", async (req: RequestWithInstitution, res: Response) => {
  const institutionId = req.institutionId;

  try {
    const teacher = await Teacher.findOneAndDelete({ _id: req.params.id, institutionId });
    if (!teacher) return res.status(404).json({ error: "Faculty member not found in this institution" });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to delete faculty member" });
  }
});

export default router;
