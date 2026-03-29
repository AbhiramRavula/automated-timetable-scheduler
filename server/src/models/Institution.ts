import mongoose, { Schema, Document } from "mongoose";

export interface IInstitution extends Document {
  name: string;
  code: string;
  address?: string;
  adminEmail?: string;
  createdAt: Date;
}

const InstitutionSchema: Schema = new Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  address: { type: String },
  adminEmail: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IInstitution>("Institution", InstitutionSchema);
