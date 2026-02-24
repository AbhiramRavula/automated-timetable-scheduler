// Shared types for the timetable scheduler

export interface ScheduleEvent {
  courseCode: string;
  teacherCode: string;
  roomName: string;
  day: number;
  slot: number;
  duration: number;
}

export interface ConstraintModel {
  hardConstraints: {
    noTeacherDoubleBooking: boolean;
    noRoomDoubleBooking: boolean;
    respectRoomCapacity: boolean;
    respectTimeWindows: boolean;
  };
  softConstraints: {
    minimizeGaps: boolean;
    balanceLoad: boolean;
    respectPreferences: boolean;
  };
  customRules?: string[];
}

export interface ValidationResult {
  repairedEvents: ScheduleEvent[];
  hardConstraintViolations: string[];
  softMetrics: {
    gaps: number;
    balance: number;
    preferenceScore: number;
  };
}

export interface GenerateRequest {
  courses: any[];
  teachers: any[];
  rooms: any[];
  constraintsText: string;
}

export interface GenerateResponse {
  timetableId: string;
  timetable: any;
  metrics: any;
  reasoning?: string;
}
