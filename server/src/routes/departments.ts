import { Router, Response } from "express";
import Department from "../models/Department";
import { RequestWithInstitution } from "../middleware/institutionMiddleware";

const router = Router();

// GET all departments for an institution
router.get("/", async (req: RequestWithInstitution, res: Response) => {
  const institutionId = req.institutionId;

  try {
    const departments = await Department.find({ institutionId }).sort({ name: 1 });
    res.json(departments);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch departments" });
  }
});

// POST new department
router.post("/", async (req: RequestWithInstitution, res: Response) => {
  const institutionId = req.institutionId;

  try {
    const departmentData = { ...req.body, institutionId };
    const department = new Department(departmentData);
    await department.save();
    res.status(201).json(department);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to create department", details: err.message });
  }
});

// PUT update department
router.put("/:id", async (req: RequestWithInstitution, res: Response) => {
  const institutionId = req.institutionId;

  try {
    const department = await Department.findOneAndUpdate({ _id: req.params.id, institutionId }, req.body, { new: true });
    if (!department) return res.status(404).json({ error: "Department not found in this institution" });
    res.json(department);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to update department" });
  }
});

// DELETE department
router.delete("/:id", async (req: RequestWithInstitution, res: Response) => {
  const institutionId = req.institutionId;

  try {
    const department = await Department.findOneAndDelete({ _id: req.params.id, institutionId });
    if (!department) return res.status(404).json({ error: "Department not found in this institution" });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to delete department" });
  }
});

export default router;
