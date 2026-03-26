import mongoose, { Schema, Document } from "mongoose";

export interface ITimetableMetrics {
  conflicts: number;
  gapScore: number;
  balanceScore: number;
  softScore: number;
}

export interface ITimetable extends Document {
  courses: any[];
  teachers: any[];
  rooms: any[];
  grid: any;
  constraintsSnapshot: any;
  metrics: ITimetableMetrics;
  workload: any[];
  createdAt: Date;
}

const TimetableSchema: Schema = new Schema({
  courses: [{ type: Schema.Types.Mixed }],
  teachers: [{ type: Schema.Types.Mixed }],
  rooms: [{ type: Schema.Types.Mixed }],
  grid: { type: Schema.Types.Mixed },
  constraintsSnapshot: { type: Schema.Types.Mixed },
  metrics: {
    conflicts: { type: Number, default: 0 },
    gapScore: { type: Number, default: 0 },
    balanceScore: { type: Number, default: 0 },
    softScore: { type: Number, default: 0 },
  },
  workload: [{ type: Schema.Types.Mixed }],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<ITimetable>("Timetable", TimetableSchema);
