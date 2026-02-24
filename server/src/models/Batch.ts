import mongoose, { Schema, Document } from "mongoose";

export interface IBatch extends Document {
  name: string;
  room: string;
  classTeacher: string;
  effectiveDate: string;
  semester: string;
  year: number;
}

const BatchSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  room: { type: String, required: true },
  classTeacher: { type: String, required: true },
  effectiveDate: { type: String, required: true },
  semester: { type: String, required: true },
  year: { type: Number, required: true, min: 1, max: 4 },
});

export default mongoose.model<IBatch>("Batch", BatchSchema);
