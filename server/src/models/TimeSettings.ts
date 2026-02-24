import mongoose, { Schema, Document } from "mongoose";

export interface IPeriod {
  name: string;
  startTime: string;
  endTime: string;
}

export interface ITimeSettings extends Document {
  workingDays: number[]; // 0-6 (0=Sunday, 1=Monday, etc.)
  periodsPerDay: number;
  periods: IPeriod[];
  lunchBreakAfterPeriod: number;
  lunchBreakDuration: number; // in minutes
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TimeSettingsSchema: Schema = new Schema(
  {
    workingDays: {
      type: [Number],
      required: true,
      default: [1, 2, 3, 4, 5, 6], // Mon-Sat
    },
    periodsPerDay: { type: Number, required: true, default: 6 },
    periods: [
      {
        name: { type: String, required: true },
        startTime: { type: String, required: true },
        endTime: { type: String, required: true },
      },
    ],
    lunchBreakAfterPeriod: { type: Number, default: 3 },
    lunchBreakDuration: { type: Number, default: 60 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model<ITimeSettings>("TimeSettings", TimeSettingsSchema);
