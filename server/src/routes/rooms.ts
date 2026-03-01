import { Router, Request, Response } from "express";
import Room from "../models/Room";

const router = Router();

// GET all rooms
router.get("/", async (req: Request, res: Response) => {
  try {
    const rooms = await Room.find().sort({ name: 1 });
    res.json(rooms);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch rooms" });
  }
});

// POST new room
router.post("/", async (req: Request, res: Response) => {
  try {
    const room = new Room(req.body);
    await room.save();
    res.status(201).json(room);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to add room", details: err.message });
  }
});

// PUT update room
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!room) return res.status(404).json({ error: "Room not found" });
    res.json(room);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to update room" });
  }
});

// DELETE room
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) return res.status(404).json({ error: "Room not found" });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to delete room" });
  }
});

export default router;
