import { Router, Request, Response } from "express";
import Institution from "../models/Institution";

const router = Router();

// GET all institutions (global list for profile switcher)
router.get("/", async (req: Request, res: Response) => {
  try {
    const institutions = await Institution.find().sort({ name: 1 });
    res.json(institutions);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch institutions" });
  }
});

// GET institution by ID
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const institution = await Institution.findById(req.params.id);
    if (!institution) return res.status(404).json({ error: "Institution not found" });
    res.json(institution);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch institution" });
  }
});

// POST new institution
router.post("/", async (req: Request, res: Response) => {
  try {
    const institution = new Institution(req.body);
    await institution.save();
    res.status(201).json(institution);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to create institution", details: err.message });
  }
});

// PUT update institution
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const institution = await Institution.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!institution) return res.status(404).json({ error: "Institution not found" });
    res.json(institution);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to update institution" });
  }
});

// DELETE institution
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const institution = await Institution.findByIdAndDelete(req.params.id);
    if (!institution) return res.status(404).json({ error: "Institution not found" });
    // TODO: Consider deleting all associated data (cascading delete)
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to delete institution" });
  }
});

export default router;
