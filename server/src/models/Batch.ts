import mongoose, { Schema, Document } from "mongoose";

export interface IBatch extends Document {
  name: string;
  room: string;
  classTeacher: string;
  effectiveDate: string;
  semester: string;
  year: number;
  institutionId: mongoose.Types.ObjectId;
}

const BatchSchema: Schema = new Schema({
  name: { type: String, required: true },
  room: { type: String, required: true },
  classTeacher: { type: String, required: true },
  effectiveDate: { type: String, required: true },
  semester: { type: String, required: true },
  year: { type: Number, required: true, min: 1, max: 4 },
  institutionId: { type: Schema.Types.ObjectId, ref: "Institution", required: true },
});

// Compound index to ensure batch name is unique within an institution
BatchSchema.index({ name: 1, institutionId: 1 }, { unique: true });

export default mongoose.model<IBatch>("Batch", BatchSchema);
