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
}

export interface Teacher {
  code: string;
  name: string;
}

export interface Room {
  name: string;
  capacity: number;
  type?: "lecture" | "lab" | "large-lab"; // NEW: Room type classification
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

// Hard constraints that must never be violated
class HardConstraints {
  static teacherConflict(events: ScheduleEvent[], newEvent: ScheduleEvent): boolean {
    if (newEvent.isProject) return false; // NEW: Projects don't block teachers
    
    return events.some(e => 
      !e.isProject && // NEW: Ignore projects in existing schedule
      e.teacherCodes.some(tc => newEvent.teacherCodes.includes(tc)) &&
      e.day === newEvent.day &&
      this.timeSlotsOverlap(e.slot, e.duration, newEvent.slot, newEvent.duration)
    );
  }

  // Check if room is already occupied
  static roomConflict(events: ScheduleEvent[], newEvent: ScheduleEvent): boolean {
    return events.some(e => 
      e.roomName === newEvent.roomName &&
      e.day === newEvent.day &&
      this.timeSlotsOverlap(e.slot, e.duration, newEvent.slot, newEvent.duration)
    );
  }

  // Check if batch already has a class at this time
  static batchConflict(events: ScheduleEvent[], newEvent: ScheduleEvent): boolean {
    return events.some(e => 
      e.batch === newEvent.batch &&
      e.day === newEvent.day &&
      this.timeSlotsOverlap(e.slot, e.duration, newEvent.slot, newEvent.duration)
    );
  }

  // Check if time slots overlap
  private static timeSlotsOverlap(
    slot1: number, duration1: number,
    slot2: number, duration2: number
  ): boolean {
    const end1 = slot1 + duration1;
    const end2 = slot2 + duration2;
    return slot1 < end2 && slot2 < end1;
  }

  // Check all hard constraints
  static validate(events: ScheduleEvent[], newEvent: ScheduleEvent): boolean {
    return !this.teacherConflict(events, newEvent) &&
           !this.roomConflict(events, newEvent) &&
           !this.batchConflict(events, newEvent);
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
  static apply(events: ScheduleEvent[], rooms: Room[]): ScheduleEvent[] | null {
    if (events.length === 0) return null;

    // Pick a random event to move
    const eventIndex = Math.floor(Math.random() * events.length);
    const eventToMove = events[eventIndex];
    const otherEvents = events.filter((_, i) => i !== eventIndex);

    // Try to find a better slot
    for (let day = 0; day < 6; day++) {
      for (let slot = 0; slot < 7; slot++) {
        if (slot === 4) continue; // Skip lunch

        const newEvent = { ...eventToMove, day, slot };

        if (HardConstraints.validate(otherEvents, newEvent)) {
          const newSchedule = [...otherEvents, newEvent];
          
          // Check if this improves the schedule
          if (this.isBetterSchedule(events, newSchedule, eventToMove.batch)) {
            return newSchedule;
          }
        }
      }
    }

    return null;
  }

  private static isBetterSchedule(
    oldSchedule: ScheduleEvent[],
    newSchedule: ScheduleEvent[],
    batch: string
  ): boolean {
    const oldGap = SoftConstraints.calculateGapScore(oldSchedule, batch);
    const newGap = SoftConstraints.calculateGapScore(newSchedule, batch);
    
    return newGap > oldGap;
  }
}

// N-2 Operator: Swap two events
class N2Operator {
  static apply(events: ScheduleEvent[]): ScheduleEvent[] | null {
    if (events.length < 2) return null;

    // Pick two random events
    const idx1 = Math.floor(Math.random() * events.length);
    let idx2 = Math.floor(Math.random() * events.length);
    while (idx2 === idx1) {
      idx2 = Math.floor(Math.random() * events.length);
    }

    const event1 = events[idx1];
    const event2 = events[idx2];

    // Swap their time slots
    const swappedEvent1 = { ...event1, day: event2.day, slot: event2.slot };
    const swappedEvent2 = { ...event2, day: event1.day, slot: event1.slot };

    const otherEvents = events.filter((_, i) => i !== idx1 && i !== idx2);

    // Validate both swapped events
    if (HardConstraints.validate(otherEvents, swappedEvent1) &&
        HardConstraints.validate([...otherEvents, swappedEvent1], swappedEvent2)) {
      
      const newSchedule = [...otherEvents, swappedEvent1, swappedEvent2];
      
      // Check if swap improves schedule
      if (this.isBetterSchedule(events, newSchedule)) {
        return newSchedule;
      }
    }

    return null;
  }

  private static isBetterSchedule(
    oldSchedule: ScheduleEvent[],
    newSchedule: ScheduleEvent[]
  ): boolean {
    const batches = [...new Set(oldSchedule.map(e => e.batch))];
    
    let oldScore = 0;
    let newScore = 0;

    batches.forEach(batch => {
      oldScore += SoftConstraints.calculateGapScore(oldSchedule, batch);
      newScore += SoftConstraints.calculateGapScore(newSchedule, batch);
    });

    return newScore > oldScore;
  }
}

// Main Scheduler with Local Search Optimization
export class TimetableScheduler {
  private courses: Course[];
  private teachers: Teacher[];
  private rooms: Room[];
  private maxIterations: number;

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
    const coursesByBatch = this.groupCoursesByBatch();

    for (const [batch, batchCourses] of Object.entries(coursesByBatch)) {
      // Create a pool of sessions to be scheduled
      let sessionPool: { course: Course, id: number }[] = [];
      batchCourses.forEach(course => {
        // Assume courses have sessionsPerWeek, default to 3 if not specified
        const sessionsCount = (course as any).sessionsPerWeek || 3;
        for (let i = 0; i < sessionsCount; i++) {
          sessionPool.push({ course, id: i });
        }
      });

      // Shuffle the pool for variety
      sessionPool = sessionPool.sort(() => Math.random() - 0.5);

      let day = 0;
      let slot = 0;
      let attempts = 0;
      const maxAttempts = 1000;

      while (sessionPool.length > 0 && attempts < maxAttempts) {
        attempts++;
        const { course } = sessionPool[0];

        if (slot === 4) { // Skip lunch
          slot = 5;
        }

        const duration = course.type === "lab" ? 2 : course.durationSlots;

        if (slot + duration > 7) {
          day++;
          slot = 0;
          if (day >= 6) { // Wrap around and try again if stuck
             day = 0;
          }
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

        if (HardConstraints.validate(events, newEvent)) {
          events.push(newEvent);
          sessionPool.shift(); // Successfully placed
          slot += duration;
        } else {
          // If can't place here, move to next slot or day
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
    let bestScore = this.evaluateSchedule(bestSchedule);

    console.log(`🔍 Starting optimization with initial score: ${bestScore.toFixed(3)}`);

    let improvementCount = 0;
    let noImprovementCount = 0;

    for (let iteration = 0; iteration < this.maxIterations; iteration++) {
      let newSchedule: ScheduleEvent[] | null = null;

      // Randomly choose between N-1 and N-2 operators
      if (Math.random() < 0.5) {
        newSchedule = N1Operator.apply(currentSchedule, this.rooms);
      } else {
        newSchedule = N2Operator.apply(currentSchedule);
      }

      if (newSchedule) {
        const newScore = this.evaluateSchedule(newSchedule);

        // Accept if better (hill climbing)
        if (newScore > bestScore) {
          bestSchedule = newSchedule;
          currentSchedule = newSchedule;
          bestScore = newScore;
          improvementCount++;
          noImprovementCount = 0;
          
          if (iteration % 100 === 0) {
            console.log(`✨ Iteration ${iteration}: Improved score to ${bestScore.toFixed(3)}`);
          }
        } else {
          noImprovementCount++;
        }

        // Early stopping if no improvement for a while
        if (noImprovementCount > 200) {
          console.log(`⏹️ Early stopping at iteration ${iteration} (no improvement)`);
          break;
        }
      }
    }

    console.log(`✅ Optimization complete: ${improvementCount} improvements, final score: ${bestScore.toFixed(3)}`);
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
    // Check if it's a large batch (70 students)
    const batchCourses = this.courses.filter(c => c.batch === course.batch);
    const estimatedBatchSize = batchCourses.length > 5 ? 70 : 30; // 70 for main batches

    // Lab courses need lab rooms
    if (course.isLab || course.type === "lab" || course.durationSlots > 1) {
      const labs = this.rooms.filter(r => 
        r.type === "lab" || 
        r.name.includes("N30") || 
        r.capacity >= 25
      );
      
      if (labs.length > 0) {
        return labs[Math.floor(Math.random() * labs.length)];
      }
    }
    
    // Regular lecture rooms (now mostly 70 capacity)
    const lectureRooms = this.rooms.filter(r => 
      (r.type === "lecture" || !r.type) && r.capacity >= estimatedBatchSize
    );
    
    if (lectureRooms.length > 0) {
      return lectureRooms[Math.floor(Math.random() * lectureRooms.length)];
    }
    
    // Fallback: any available room
    return this.rooms[Math.floor(Math.random() * this.rooms.length)];
  }

  // Fill empty slots with Sports and Library
  private fillGaps(events: ScheduleEvent[]): ScheduleEvent[] {
    const finalEvents = [...events];
    const batches = [...new Set(this.courses.map(c => c.batch || "DEFAULT"))];
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

    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      const otherEvents = events.filter((_, idx) => idx !== i);

      if (HardConstraints.teacherConflict(otherEvents, event)) {
        violations.push(`Teacher conflict: ${event.teacherCodes.join(', ')} at day ${event.day}, slot ${event.slot}`);
      }

      if (HardConstraints.roomConflict(otherEvents, event)) {
        violations.push(`Room conflict: ${event.roomName} at day ${event.day}, slot ${event.slot}`);
      }

      if (HardConstraints.batchConflict(otherEvents, event)) {
        violations.push(`Batch conflict: ${event.batch} at day ${event.day}, slot ${event.slot}`);
      }
    }

    return violations;
  }
}
