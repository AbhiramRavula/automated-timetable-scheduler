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

    // Aggregate periods from events
    const normalize = (s: string) => s?.trim().toUpperCase();

    events.forEach(event => {
      // Use teacherCodes if present, else fallback to teacherCode (for older data)
      const tcs = Array.isArray(event.teacherCodes) && event.teacherCodes.length > 0
        ? event.teacherCodes
        : ((event as any).teacherCode ? [(event as any).teacherCode] : []);

      tcs.forEach(tc => {
        const normTc = normalize(tc);
        // Find in map using normalized codes
        let stats: FacultyWorkload | undefined;
        for (const [key, value] of workloadMap.entries()) {
           if (normalize(key) === normTc) {
             stats = value;
             break;
           }
        }
        
        if (!stats) return;
 
        const course = courses.find(c => normalize(c.code) === normalize(event.courseCode));
        if (!course) return;
 
        const isLab = course.type === "lab";
        const targetList = isLab ? stats.labCourses : stats.theoryCourses;
 
        // Check if course+batch already in list
        const existing = targetList.find(c => normalize(c.code) === normalize(event.courseCode) && normalize(c.batch) === normalize(event.batch));
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
        stats.totalHours += event.duration * 1; 
      });
    });

    return Array.from(workloadMap.values());
  }
}
