import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import timetableRoutes from "./routes/timetables";
import batchRoutes from "./routes/batches";
import timeSettingsRoutes from "./routes/timeSettings";
import chatRoutes from "./routes/chat";

dotenv.config();
const app = express();

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/timetable-scheduler";
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", message: "Server running" });
});

// Mount routes
app.use("/api/timetables", timetableRoutes);
app.use("/api/batches", batchRoutes);
app.use("/api/time-settings", timeSettingsRoutes);
app.use("/api/chat", chatRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server on ${PORT}`));
