import mongoose, { Schema, Document } from "mongoose";

export interface ICourse extends Document {
  code: string;
  name: string;
  type: "lecture" | "lab" | "tutorial";
  sessionsPerWeek: number;
  durationSlots: number;
  assignedTeacherCode: string;
  batch: string;
  preferredRoomTypes: string[];
  priority: "core" | "elective";
  mustNotClashWith: string[];
}

const CourseSchema: Schema = new Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ["lecture", "lab", "tutorial"],
    required: true,
  },
  sessionsPerWeek: { type: Number, required: true, default: 3 },
  durationSlots: { type: Number, required: true, default: 1 },
  assignedTeacherCode: { type: String, required: true },
  batch: { type: String, required: true },
  preferredRoomTypes: [{ type: String, enum: ["lecture", "lab", "seminar"] }],
  priority: {
    type: String,
    enum: ["core", "elective"],
    default: "core",
  },
  mustNotClashWith: [{ type: String }],
});

export default mongoose.model<ICourse>("Course", CourseSchema);
