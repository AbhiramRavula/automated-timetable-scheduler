export interface Course {
  code: string;
  name: string;
  durationSlots: number;
  teacherCode: string;
  batch: string;
}

export interface Teacher {
  code: string;
  name: string;
}

export interface Room {
  name: string;
  capacity: number;
}

export interface TimetableEvent {
  courseCode: string;
  teacherCode: string;
  roomName: string;
  day: number;
  slot: number;
  duration: number;
}

export interface Metrics {
  conflicts: number;
  gapScore: number;
  balanceScore: number;
  softScore: number;
}

export interface GenerateResponse {
  timetable: TimetableEvent[];
  metrics: Metrics;
  hardViolations: string[];
}
