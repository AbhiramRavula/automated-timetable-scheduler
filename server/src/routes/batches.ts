import { Router, Request, Response } from "express";
import Batch from "../models/Batch";

const router = Router();

// Get all batches
router.get("/", async (req: Request, res: Response) => {
  try {
    const batches = await Batch.find();
    return res.json(batches);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch batches" });
  }
});

// Create batch
router.post("/", async (req: Request, res: Response) => {
  try {
    const batch = new Batch(req.body);
    await batch.save();
    return res.status(201).json(batch);
  } catch (error) {
    return res.status(500).json({ error: "Failed to create batch" });
  }
});

// Update batch
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const batch = await Batch.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!batch) {
      return res.status(404).json({ error: "Batch not found" });
    }
    return res.json(batch);
  } catch (error) {
    return res.status(500).json({ error: "Failed to update batch" });
  }
});

// Delete batch
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const batch = await Batch.findByIdAndDelete(req.params.id);
    if (!batch) {
      return res.status(404).json({ error: "Batch not found" });
    }
    return res.json({ message: "Batch deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete batch" });
  }
});

export default router;
