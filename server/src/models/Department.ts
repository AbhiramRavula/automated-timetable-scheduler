import mongoose, { Schema, Document } from "mongoose";

export interface IDepartment extends Document {
  name: string;
  code: string;
  institutionId: mongoose.Types.ObjectId;
  headOfDepartment: string;
  createdAt: Date;
}

const DepartmentSchema: Schema = new Schema({
  name: { type: String, required: true },
  code: { type: String, required: true },
  institutionId: { type: Schema.Types.ObjectId, ref: "Institution", required: true },
  headOfDepartment: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// Compound index to ensure department code is unique within an institution
DepartmentSchema.index({ code: 1, institutionId: 1 }, { unique: true });

export default mongoose.model<IDepartment>("Department", DepartmentSchema);
