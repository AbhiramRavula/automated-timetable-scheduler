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
}

const RoomSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
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
});

export default mongoose.model<IRoom>("Room", RoomSchema);
