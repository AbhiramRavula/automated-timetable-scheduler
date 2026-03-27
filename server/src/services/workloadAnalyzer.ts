import { ScheduleEvent } from "./scheduler";

export interface FacultyWorkload {
  teacherCode: string;
  teacherName: string;
  teacherDesignation?: string;
  theoryCourses: { code: string; name: string; batch: string; sessions: number }[];
  labCourses: { code: string; name: string; batch: string; sessions: number }[];
  totalSessions: number;
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
        totalSessions: 0,
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
          existing.sessions += 1;
        } else {
          targetList.push({
            code: event.courseCode,
            name: course.name,
            batch: event.batch,
            sessions: 1
          });
        }

        stats.totalSessions += 1;
        stats.totalHours += (event.duration * 50) / 60; // Assuming 50 mins per slot
      });
    });

    return Array.from(workloadMap.values());
  }
}
