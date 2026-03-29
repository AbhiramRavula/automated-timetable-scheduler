import { Router, Response } from "express";
import Room from "../models/Room";
import { RequestWithInstitution } from "../middleware/institutionMiddleware";

const router = Router();

// GET all rooms
router.get("/", async (req: RequestWithInstitution, res: Response) => {
  const institutionId = req.institutionId;
  try {
    const rooms = await Room.find({ institutionId }).sort({ name: 1 });
    res.json(rooms);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch rooms" });
  }
});

// POST new room
router.post("/", async (req: RequestWithInstitution, res: Response) => {
  const institutionId = req.institutionId;
  try {
    const room = new Room({ ...req.body, institutionId });
    await room.save();
    res.status(201).json(room);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to add room", details: err.message });
  }
});

// PUT update room
router.put("/:id", async (req: RequestWithInstitution, res: Response) => {
  const institutionId = req.institutionId;
  try {
    const room = await Room.findOneAndUpdate({ _id: req.params.id, institutionId }, req.body, { new: true });
    if (!room) return res.status(404).json({ error: "Room not found in this institution" });
    res.json(room);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to update room" });
  }
});

// DELETE room
router.delete("/:id", async (req: RequestWithInstitution, res: Response) => {
  const institutionId = req.institutionId;
  try {
    const room = await Room.findOneAndDelete({ _id: req.params.id, institutionId });
    if (!room) return res.status(404).json({ error: "Room not found in this institution" });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to delete room" });
  }
});

export default router;
