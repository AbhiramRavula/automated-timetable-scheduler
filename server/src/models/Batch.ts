import mongoose, { Schema, Document } from "mongoose";

export interface IBatch extends Document {
  name: string;
  year: number;
  department: string;
  section: string;
  studentCount: number;
  unavailableSlots: { dayIndex: number; slotIndex: number }[];
}

const BatchSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  year: { type: Number, required: true, min: 1, max: 4 },
  department: { type: String, required: true },
  section: { type: String, required: true },
  studentCount: { type: Number, required: true, default: 60 },
  unavailableSlots: [
    {
      dayIndex: { type: Number, required: true },
      slotIndex: { type: Number, required: true },
    },
  ],
});

export default mongoose.model<IBatch>("Batch", BatchSchema);
