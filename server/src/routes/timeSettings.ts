import { Router, Request, Response } from "express";
import TimeSettings from "../models/TimeSettings";

const router = Router();

// Get active time settings
router.get("/active", async (req: Request, res: Response) => {
  try {
    const settings = await TimeSettings.findOne({ isActive: true });
    if (!settings) {
      // Return default settings if none exist
      return res.json({
        workingDays: [1, 2, 3, 4, 5, 6],
        periodsPerDay: 6,
        periods: [
          { name: "Period 1", startTime: "09:00", endTime: "10:00" },
          { name: "Period 2", startTime: "10:00", endTime: "11:00" },
          { name: "Period 3", startTime: "11:00", endTime: "12:00" },
          { name: "Lunch Break", startTime: "12:00", endTime: "13:00" },
          { name: "Period 4", startTime: "13:00", endTime: "14:00" },
          { name: "Period 5", startTime: "14:00", endTime: "15:00" },
          { name: "Period 6", startTime: "15:00", endTime: "16:00" },
        ],
        lunchBreakAfterPeriod: 3,
        lunchBreakDuration: 60,
        isActive: true,
      });
    }
    return res.json(settings);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch time settings" });
  }
});

// Create or update time settings
router.post("/", async (req: Request, res: Response) => {
  try {
    // Deactivate all existing settings
    await TimeSettings.updateMany({}, { isActive: false });
    
    // Create new active settings
    const settings = new TimeSettings({ ...req.body, isActive: true });
    await settings.save();
    
    return res.status(201).json(settings);
  } catch (error) {
    return res.status(500).json({ error: "Failed to save time settings" });
  }
});

// Update existing settings
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const settings = await TimeSettings.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!settings) {
      return res.status(404).json({ error: "Settings not found" });
    }
    return res.json(settings);
  } catch (error) {
    return res.status(500).json({ error: "Failed to update settings" });
  }
});

export default router;
