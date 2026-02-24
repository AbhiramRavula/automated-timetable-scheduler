import mongoose, { Schema, Document } from "mongoose";

export interface ITeacher extends Document {
  name: string;
  code: string;
  department: string;
  designation: string;
  labOnly: boolean;
  canTeachMultipleCourses: boolean;
  unavailableSlots: { dayIndex: number; slotIndex: number }[];
  maxLoadPerDay: number;
}

const TeacherSchema: Schema = new Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  department: { type: String, required: true },
  designation: {
    type: String,
    enum: ["Professor", "Associate Professor", "Assistant Professor", "Lab Assistant", "Lecturer"],
    default: "Assistant Professor",
  },
  labOnly: { type: Boolean, default: false },
  canTeachMultipleCourses: { type: Boolean, default: true },
  unavailableSlots: [
    {
      dayIndex: { type: Number, required: true },
      slotIndex: { type: Number, required: true },
    },
  ],
  maxLoadPerDay: { type: Number, default: 4 },
});

export default mongoose.model<ITeacher>("Teacher", TeacherSchema);
