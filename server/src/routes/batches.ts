import { Router, Response } from "express";
import Batch from "../models/Batch";
import { RequestWithInstitution } from "../middleware/institutionMiddleware";

const router = Router();

// Get all batches
router.get("/", async (req: RequestWithInstitution, res: Response) => {
  const institutionId = req.institutionId;
  try {
    const batches = await Batch.find({ institutionId });
    return res.json(batches);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch batches" });
  }
});

// Create batch
router.post("/", async (req: RequestWithInstitution, res: Response) => {
  const institutionId = req.institutionId;
  try {
    const batch = new Batch({ ...req.body, institutionId });
    await batch.save();
    return res.status(201).json(batch);
  } catch (error) {
    return res.status(500).json({ error: "Failed to create batch" });
  }
});

// Update batch
router.put("/:id", async (req: RequestWithInstitution, res: Response) => {
  const institutionId = req.institutionId;
  try {
    const batch = await Batch.findOneAndUpdate(
      { _id: req.params.id, institutionId },
      req.body,
      { new: true }
    );
    if (!batch) {
      return res.status(404).json({ error: "Batch not found in this institution" });
    }
    return res.json(batch);
  } catch (error) {
    return res.status(500).json({ error: "Failed to update batch" });
  }
});

// Delete batch
router.delete("/:id", async (req: RequestWithInstitution, res: Response) => {
  const institutionId = req.institutionId;
  try {
    const batch = await Batch.findOneAndDelete({ _id: req.params.id, institutionId });
    if (!batch) {
      return res.status(404).json({ error: "Batch not found in this institution" });
    }
    return res.json({ message: "Batch deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete batch" });
  }
});

export default router;
