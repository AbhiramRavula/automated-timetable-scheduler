// Advanced Timetable Scheduler with N-1 and N-2 Operators
// Handles NP-hard timetable scheduling problem with local search optimization

export interface Course {
  code: string;
  name: string;
  durationSlots: number;
  teacherCodes: string[];
  batch: string;
  type?: "lecture" | "lab" | "tutorial" | "project";
  isLab?: boolean;          
  requiresSplitting?: boolean; 
  requiredRoomTag?: string; // NEW
}

export interface Teacher {
  code: string;
  name: string;
}

export interface Room {
  name: string;
  capacity: number;
  type?: "lecture" | "lab" | "large-lab"; 
  tags?: string[]; // NEW
}

export interface ScheduleEvent {
  courseCode: string;
  teacherCodes: string[];
  roomName: string;
  batch: string;
  day: number;    // 0-5 (Mon-Sat)
  slot: number;   // 0-6 (7 periods including lunch at slot 4)
  duration: number;
  isProject?: boolean;
}

export interface Constraint {
  type: "hard" | "soft";
  name: string;
  weight?: number;
}

// NEW: Matrix for O(1) conflict detection
class ConflictMatrix {
  private teacherSlots = new Set<string>();
  private roomSlots = new Set<string>();
  private batchSlots = new Set<string>();

  clear() {
    this.teacherSlots.clear();
    this.roomSlots.clear();
    this.batchSlots.clear();
  }

  add(event: ScheduleEvent) {
    for (let i = 0; i < event.duration; i++) {
        const slot = event.slot + i;
        const key = `${event.day}-${slot}`;
        event.teacherCodes.forEach(t => this.teacherSlots.add(`${t}-${key}`));
        this.roomSlots.add(`${event.roomName}-${key}`);
        this.batchSlots.add(`${event.batch}-${key}`);
    }
  }

  remove(event: ScheduleEvent) {
    for (let i = 0; i < event.duration; i++) {
        const slot = event.slot + i;
        const key = `${event.day}-${slot}`;
        event.teacherCodes.forEach(t => this.teacherSlots.delete(`${t}-${key}`));
        this.roomSlots.delete(`${event.roomName}-${key}`);
        this.batchSlots.delete(`${event.batch}-${key}`);
    }
  }

  isConflict(event: ScheduleEvent): boolean {
    for (let i = 0; i < event.duration; i++) {
        const slot = event.slot + i;
        const key = `${event.day}-${slot}`;
        
        if (!event.isProject && event.teacherCodes.some(t => this.teacherSlots.has(`${t}-${key}`))) return true;
        if (this.roomSlots.has(`${event.roomName}-${key}`)) return true;
        if (this.batchSlots.has(`${event.batch}-${key}`)) return true;
    }
    return false;
  }
}

// Updated HardConstraints to use the matrix for speed
class HardConstraints {
  static validate(matrix: ConflictMatrix, newEvent: ScheduleEvent): boolean {
    return !matrix.isConflict(newEvent);
  }

  static timeSlotsOverlap(s1: number, d1: number, s2: number, d2: number): boolean {
    return s1 < s2 + d2 && s2 < s1 + d1;
  }
}

// Soft constraints for optimization
class SoftConstraints {
  // Calculate gap score (prefer fewer gaps in schedule)
  static calculateGapScore(events: ScheduleEvent[], batch: string): number {
    const batchEvents = events.filter(e => e.batch === batch);
    let totalGaps = 0;

    for (let day = 0; day < 6; day++) {
      const dayEvents = batchEvents
        .filter(e => e.day === day)
        .sort((a, b) => a.slot - b.slot);

      if (dayEvents.length > 1) {
        for (let i = 0; i < dayEvents.length - 1; i++) {
          const currentEnd = dayEvents[i].slot + dayEvents[i].duration;
          const nextStart = dayEvents[i + 1].slot;
          const gap = nextStart - currentEnd;
          if (gap > 0 && currentEnd !== 4 && nextStart !== 5) { // Ignore lunch break
            totalGaps += gap;
          }
        }
      }
    }

    return 1 / (1 + totalGaps); // Higher score = fewer gaps
  }

  // Calculate day balance score (prefer even distribution of core subjects)
  static calculateDayBalanceScore(events: ScheduleEvent[], batch: string): number {
    const batchEvents = events.filter(e => e.batch === batch && e.courseCode !== "LIB" && e.courseCode !== "SPORTS");
    const countsPerDay = Array(6).fill(0);
    
    batchEvents.forEach(e => {
      countsPerDay[e.day] += 1;
    });

    // We want to avoid days with 0 classes if total classes > 5
    const totalClasses = batchEvents.length;
    const emptyDays = countsPerDay.filter(c => c === 0).length;
    
    // Penalize if some days are very heavy and others are empty
    const mean = totalClasses / 6;
    let variance = 0;
    countsPerDay.forEach(c => {
      variance += Math.pow(c - mean, 2);
    });

    const penalty = (emptyDays > 0 && totalClasses > 5) ? 10 : 1;
    return 1 / (1 + (variance * penalty));
  }
}

// N-1 Operator: Move a single event to a different time slot
class N1Operator {
  static apply(matrix: ConflictMatrix, events: ScheduleEvent[], rooms: Room[]): ScheduleEvent[] | null {
    if (events.length === 0) return null;

    const eventIndex = Math.floor(Math.random() * events.length);
    const eventToMove = events[eventIndex];
    
    // Remove current event from matrix to check for new spots
    matrix.remove(eventToMove);

    for (let attempts = 0; attempts < 20; attempts++) {
      const day = Math.floor(Math.random() * 6);
      const slot = Math.floor(Math.random() * 7);
      if (slot === 4) continue;

      const newEvent = { ...eventToMove, day, slot };

      if (HardConstraints.validate(matrix, newEvent)) {
        matrix.add(newEvent); // Add new position to matrix
        const newSchedule = [...events];
        newSchedule[eventIndex] = newEvent;
        return newSchedule;
      }
    }

    matrix.add(eventToMove); // Restore if no spot found
    return null;
  }
}

// N-2 Operator: Swap two events
class N2Operator {
  static apply(matrix: ConflictMatrix, events: ScheduleEvent[]): ScheduleEvent[] | null {
    if (events.length < 2) return null;

    const idx1 = Math.floor(Math.random() * events.length);
    let idx2 = Math.floor(Math.random() * events.length);
    while (idx2 === idx1) idx2 = Math.floor(Math.random() * events.length);

    const e1 = events[idx1];
    const e2 = events[idx2];

    // Remove both from matrix
    matrix.remove(e1);
    matrix.remove(e2);

    const swappedE1 = { ...e1, day: e2.day, slot: e2.slot };
    const swappedE2 = { ...e2, day: e1.day, slot: e1.slot };

    if (HardConstraints.validate(matrix, swappedE1)) {
        matrix.add(swappedE1);
        if (HardConstraints.validate(matrix, swappedE2)) {
            matrix.add(swappedE2);
            const newSchedule = [...events];
            newSchedule[idx1] = swappedE1;
            newSchedule[idx2] = swappedE2;
            return newSchedule;
        }
        matrix.remove(swappedE1);
    }
    
    // Restore if swap fails
    matrix.add(e1);
    matrix.add(e2);
    return null;
  }
}

export class TimetableScheduler {
  private courses: Course[];
  private teachers: Teacher[];
  private rooms: Room[];
  private maxIterations: number;
  private matrix: ConflictMatrix = new ConflictMatrix();

  constructor(
    courses: Course[],
    teachers: Teacher[],
    rooms: Room[],
    maxIterations: number = 1000
  ) {
    this.courses = courses;
    this.teachers = teachers;
    this.rooms = rooms;
    this.maxIterations = maxIterations;
  }

  // Generate initial feasible solution using round-robin approach for variety
  private generateInitialSolution(): ScheduleEvent[] {
    const events: ScheduleEvent[] = [];
    this.matrix.clear();
    const coursesByBatch = this.groupCoursesByBatch();

    const sortedBatches = Object.entries(coursesByBatch).sort((a, b) => b[1].length - a[1].length);

    for (const [batch, batchCourses] of sortedBatches) {
      let sessionPool: { course: Course, id: number }[] = [];
      
      const sortedBatchCourses = [...batchCourses].sort((a, b) => {
        if (a.type === "lab" && b.type !== "lab") return -1;
        if (a.type !== "lab" && b.type === "lab") return 1;
        return b.durationSlots - a.durationSlots;
      });

      sortedBatchCourses.forEach(course => {
        const sessionsCount = (course as any).sessionsPerWeek || 3;
        for (let i = 0; i < sessionsCount; i++) {
          sessionPool.push({ course, id: i });
        }
      });

      let day = 0;
      let slot = 0;
      let attempts = 0;
      const maxAttempts = 2000;

      while (sessionPool.length > 0 && attempts < maxAttempts) {
        attempts++;
        const { course } = sessionPool[0];

        if (slot === 4) { slot = 5; }

        const duration = course.type === "lab" ? 2 : course.durationSlots;

        if (slot + duration > 7) {
          day++;
          slot = 0;
          if (day >= 6) day = 0;
          continue;
        }

        const room = this.selectRoom(course);
        const newEvent: ScheduleEvent = {
          courseCode: course.code,
          teacherCodes: course.teacherCodes,
          roomName: room.name,
          batch: batch,
          day: day,
          slot: slot,
          duration: duration,
          isProject: course.type === "project"
        };

        if (HardConstraints.validate(this.matrix, newEvent)) {
          events.push(newEvent);
          this.matrix.add(newEvent);
          sessionPool.shift();
          slot += duration;
        } else {
          slot++;
          if (slot >= 7) {
            slot = 0;
            day++;
            if (day >= 6) day = 0;
          }
        }
      }
    }

    return events;
  }

  // Local search optimization using N-1 and N-2 operators
  private optimizeSchedule(initialSchedule: ScheduleEvent[]): ScheduleEvent[] {
    let currentSchedule = [...initialSchedule];
    let bestSchedule = [...initialSchedule];
    let currentScore = this.evaluateSchedule(currentSchedule);
    let bestScore = currentScore;

    let temperature = 1.0;
    const coolingRate = 0.995;
    const minTemperature = 0.01;

    console.log(`🔍 Optimization (Simulated Annealing) starting at score: ${bestScore.toFixed(3)}`);

    for (let iteration = 0; iteration < this.maxIterations && temperature > minTemperature; iteration++) {
      let newSchedule: ScheduleEvent[] | null = null;
      if (Math.random() < 0.5) {
        newSchedule = N1Operator.apply(this.matrix, currentSchedule, this.rooms);
      } else {
        newSchedule = N2Operator.apply(this.matrix, currentSchedule);
      }

      if (newSchedule) {
        const newScore = this.evaluateSchedule(newSchedule);
        const scoreDiff = newScore - currentScore;

        if (scoreDiff > 0 || Math.random() < Math.exp(scoreDiff / temperature)) {
          currentSchedule = newSchedule;
          currentScore = newScore;

          if (currentScore > bestScore) {
            bestSchedule = [...currentSchedule];
            bestScore = currentScore;
          }
        }
      }
      temperature *= coolingRate;
    }

    console.log(`✅ Optimization complete: Score improved to ${bestScore.toFixed(3)}`);
    return bestSchedule;
  }

  // Evaluate overall schedule quality
  private evaluateSchedule(events: ScheduleEvent[]): number {
    const batches = [...new Set(events.map(e => e.batch))];
    let totalScore = 0;

    batches.forEach(batch => {
      const gapScore = SoftConstraints.calculateGapScore(events, batch);
      const balanceScore = SoftConstraints.calculateDayBalanceScore(events, batch);
      // Combine scores: Balance is very important to avoid "all library" days
      totalScore += (gapScore * 0.4) + (balanceScore * 0.6);
    });

    return totalScore / (batches.length + (events.length / 20));
  }

  // Group courses by batch
  private groupCoursesByBatch(): { [batch: string]: Course[] } {
    const grouped: { [batch: string]: Course[] } = {};
    
    this.courses.forEach(course => {
      const batch = course.batch || "DEFAULT";
      if (!grouped[batch]) {
        grouped[batch] = [];
      }
      grouped[batch].push(course);
    });

    return grouped;
  }

  // Select appropriate room for course
  private selectRoom(course: Course): Room {
    if (course.requiredRoomTag) {
      const taggedRooms = this.rooms.filter(r => 
        r.tags && r.tags.includes(course.requiredRoomTag!)
      );
      if (taggedRooms.length > 0) {
        return taggedRooms[Math.floor(Math.random() * taggedRooms.length)];
      }
    }

    const batchCourses = this.courses.filter(c => c.batch === course.batch);
    const estimatedBatchSize = batchCourses.length > 5 ? 70 : 30;

    if (course.isLab || course.type === "lab" || course.durationSlots > 1) {
      const labs = this.rooms.filter(r => 
        r.type === "lab" || r.capacity >= 25
      );
      
      if (labs.length > 0) {
        return labs[Math.floor(Math.random() * labs.length)];
      }
    }
    
    const lectureRooms = this.rooms.filter(r => 
      (r.type === "lecture" || !r.type) && r.capacity >= estimatedBatchSize
    );
    
    if (lectureRooms.length > 0) {
      return lectureRooms[Math.floor(Math.random() * lectureRooms.length)];
    }
    
    return this.rooms[Math.floor(Math.random() * this.rooms.length)];
  }

  // Fill empty slots with Sports and Library
  private fillGaps(events: ScheduleEvent[]): ScheduleEvent[] {
    const finalEvents = [...events];
    const batches = [...new Set(this.courses.map((c: Course) => c.batch || "DEFAULT"))];
    const roomFallback = this.rooms[0]?.name || "Online";

    for (const batch of batches) {
      for (let day = 0; day < 6; day++) {
        for (let slot = 0; slot < 7; slot++) {
          if (slot === 4) continue; // Skip lunch

          // Check if slot is empty
          const isBusy = finalEvents.some(e => 
            e.batch === batch && 
            e.day === day && 
            slot >= e.slot && slot < e.slot + e.duration
          );

          if (!isBusy) {
            // Fill with Library or Sports
            // Rules: 
            // 1. Sports only in afternoon (slot 5, 6)
            // 2. Max 2 Library per day
            // 3. Max 2 Sports per day
            const dayEvents = finalEvents.filter(e => e.batch === batch && e.day === day);
            const libCount = dayEvents.filter(e => e.courseCode === "LIB").length;
            const sportsCount = dayEvents.filter(e => e.courseCode === "SPORTS").length;

            const canSports = slot > 4 && sportsCount < 2;
            const canLib = libCount < 2;

            if (canSports || canLib) {
              const filler = (canSports && (Math.random() < 0.5 || !canLib)) ? "SPORTS" : "LIB";
              
              finalEvents.push({
                courseCode: filler,
                teacherCodes: ["-"],
                roomName: filler === "SPORTS" ? "Ground" : (this.rooms.find(r => r.name.toLowerCase().includes("library"))?.name || "Library"),
                batch: batch,
                day: day,
                slot: slot,
                duration: 1
              });
            }
          }
        }
      }
    }

    return finalEvents;
  }

  // Main scheduling method
  public schedule(): ScheduleEvent[] {
    console.log("🚀 Starting timetable scheduling...");
    console.log(`📚 Courses: ${this.courses.length}`);
    console.log(`👨‍🏫 Teachers: ${this.teachers.length}`);
    console.log(`🏫 Rooms: ${this.rooms.length}`);

    // Step 1: Generate initial feasible solution
    console.log("\n📝 Step 1: Generating initial solution...");
    const initialSchedule = this.generateInitialSolution();
    console.log(`✅ Initial solution generated: ${initialSchedule.length} events`);

    // Step 2: Optimize using local search
    console.log("\n🔧 Step 2: Optimizing schedule...");
    const optimizedSchedule = this.optimizeSchedule(initialSchedule);

    // Step 2.5: Fill gaps with Sports and Library
    console.log("\n🏃 Step 2.5: Filling gaps with Sports and Library...");
    const filledSchedule = this.fillGaps(optimizedSchedule);

    // Step 3: Validate final schedule
    console.log("\n✔️ Step 3: Validating final schedule...");
    const violations = this.validateSchedule(filledSchedule);
    
    if (violations.length === 0) {
      console.log("✅ No hard constraint violations!");
    } else {
      console.log(`⚠️ Found ${violations.length} violations:`);
      violations.forEach(v => console.log(`  - ${v}`));
    }

    return filledSchedule;
  }

  // Validate entire schedule for hard constraints
  private validateSchedule(events: ScheduleEvent[]): string[] {
    const violations: string[] = [];
    const validationMatrix = new ConflictMatrix();

    for (const event of events) {
      if (validationMatrix.isConflict(event)) {
        violations.push(`Conflict: ${event.courseCode} at day ${event.day}, slot ${event.slot}`);
      }
      validationMatrix.add(event);
    }

    return violations;
  }
}
