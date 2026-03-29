import mongoose, { Schema, Document } from "mongoose";

export interface IRoom extends Document {
  name: string;
  capacity: number;
  type: "lecture" | "lab" | "seminar";
  building: string;
  floor: string;
  availableDays: number[];
  availableSlots: number[];
  tags: string[];
  institutionId: mongoose.Types.ObjectId;
}

const RoomSchema: Schema = new Schema({
  name: { type: String, required: true },
  capacity: { type: Number, required: true },
  type: {
    type: String,
    enum: ["lecture", "lab", "seminar"],
    required: true,
  },
  building: { type: String, default: "Main Building" },
  floor: { type: String, default: "Ground Floor" },
  availableDays: [{ type: Number }],
  availableSlots: [{ type: Number }],
  tags: [{ type: String }],
  institutionId: { type: Schema.Types.ObjectId, ref: "Institution", required: true },
});

// Compound index to ensure room name is unique within an institution
RoomSchema.index({ name: 1, institutionId: 1 }, { unique: true });

export default mongoose.model<IRoom>("Room", RoomSchema);
