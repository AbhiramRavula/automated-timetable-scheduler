import { ScheduleEvent } from "./scheduler";

export interface FacultyWorkload {
  teacherCode: string;
  teacherName: string;
  teacherDesignation?: string;
  theoryCourses: { code: string; name: string; batch: string; periods: number }[];
  labCourses: { code: string; name: string; batch: string; periods: number }[];
  totalPeriods: number;
  totalHours: number;
}

export class WorkloadAnalyzer {
  static getWorkload(events: ScheduleEvent[], teachers: any[], courses: any[]): FacultyWorkload[] {
    const workloadMap = new Map<string, FacultyWorkload>();

    // Initialize map for all teachers
    teachers.forEach(t => {
      workloadMap.set(t.code || t.id, {
        teacherCode: t.code || t.id,
        teacherName: t.name,
        teacherDesignation: t.designation || t.role || "Faculty",
        theoryCourses: [],
        labCourses: [],
        totalPeriods: 0,
        totalHours: 0
      });
    });

    // Aggregate sessions from events
    events.forEach(event => {
      event.teacherCodes.forEach(tc => {
        const stats = workloadMap.get(tc);
        if (!stats) return;

        const course = courses.find(c => c.code === event.courseCode);
        if (!course) return;

        const isLab = course.type === "lab";
        const targetList = isLab ? stats.labCourses : stats.theoryCourses;

        // Check if course+batch already in list
        const existing = targetList.find(c => c.code === event.courseCode && c.batch === event.batch);
        if (existing) {
          existing.periods += event.duration;
        } else {
          targetList.push({
            code: event.courseCode,
            name: course.name,
            batch: event.batch,
            periods: event.duration
          });
        }

        stats.totalPeriods += event.duration;
        stats.totalHours += event.duration * 1; // Assuming 1 hour per period to match timeSlots
      });
    });

    return Array.from(workloadMap.values());
  }
}
