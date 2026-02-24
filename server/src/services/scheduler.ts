// Advanced Timetable Scheduler with N-1 and N-2 Operators
// Handles NP-hard timetable scheduling problem with local search optimization

export interface Course {
  code: string;
  name: string;
  durationSlots: number;
  teacherCode: string;
  batch: string;
  isLab?: boolean;          // NEW: Indicates if this is a lab course
  requiresSplitting?: boolean; // NEW: If batch needs to be split for labs
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
  teacherCode: string;
  roomName: string;
  batch: string;
  day: number;    // 0-5 (Mon-Sat)
  slot: number;   // 0-6 (7 periods including lunch at slot 4)
  duration: number;
}

export interface Constraint {
  type: "hard" | "soft";
  name: string;
  weight?: number;
}

// Hard constraints that must never be violated
class HardConstraints {
  // Check if teacher is already teaching at this time
  static teacherConflict(events: ScheduleEvent[], newEvent: ScheduleEvent): boolean {
    return events.some(e => 
      e.teacherCode === newEvent.teacherCode &&
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

  // Calculate balance score (prefer even distribution across days)
  static calculateBalanceScore(events: ScheduleEvent[], batch: string): number {
    const batchEvents = events.filter(e => e.batch === batch);
    const eventsPerDay = new Array(6).fill(0);

    batchEvents.forEach(e => {
      eventsPerDay[e.day]++;
    });

    const avg = batchEvents.length / 6;
    const variance = eventsPerDay.reduce((sum, count) => 
      sum + Math.pow(count - avg, 2), 0) / 6;

    return 1 / (1 + variance); // Higher score = more balanced
  }

  // Prefer morning slots for theory, afternoon for labs
  static calculateTimePreferenceScore(event: ScheduleEvent): number {
    const isLab = event.duration > 1;
    const isMorning = event.slot < 3;

    if (isLab && !isMorning) return 1.0; // Labs in afternoon: good
    if (!isLab && isMorning) return 1.0; // Theory in morning: good
    return 0.5; // Not ideal but acceptable
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
    
    const oldBalance = SoftConstraints.calculateBalanceScore(oldSchedule, batch);
    const newBalance = SoftConstraints.calculateBalanceScore(newSchedule, batch);

    return (newGap + newBalance) > (oldGap + oldBalance);
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
      oldScore += SoftConstraints.calculateBalanceScore(oldSchedule, batch);
      
      newScore += SoftConstraints.calculateGapScore(newSchedule, batch);
      newScore += SoftConstraints.calculateBalanceScore(newSchedule, batch);
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

  // Generate initial feasible solution using greedy approach
  private generateInitialSolution(): ScheduleEvent[] {
    const events: ScheduleEvent[] = [];
    const coursesByBatch = this.groupCoursesByBatch();

    for (const [batch, batchCourses] of Object.entries(coursesByBatch)) {
      let day = 0;
      let slot = 0;

      for (const course of batchCourses) {
        let placed = false;

        // Try to place the course
        while (!placed && day < 6) {
          if (slot === 4) { // Skip lunch
            slot = 5;
          }

          if (slot + course.durationSlots > 7) {
            day++;
            slot = 0;
            continue;
          }

          const room = this.selectRoom(course);
          const newEvent: ScheduleEvent = {
            courseCode: course.code,
            teacherCode: course.teacherCode,
            roomName: room.name,
            batch: batch,
            day: day,
            slot: slot,
            duration: course.durationSlots
          };

          if (HardConstraints.validate(events, newEvent)) {
            events.push(newEvent);
            placed = true;
            slot += course.durationSlots;
          } else {
            slot++;
          }

          if (slot >= 7) {
            day++;
            slot = 0;
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
      const balanceScore = SoftConstraints.calculateBalanceScore(events, batch);
      totalScore += gapScore + balanceScore;
    });

    // Add time preference scores
    events.forEach(event => {
      totalScore += SoftConstraints.calculateTimePreferenceScore(event);
    });

    return totalScore / (batches.length * 2 + events.length);
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
    // Lab courses need lab rooms
    if (course.isLab || course.durationSlots > 1) {
      // Check if it's a large batch (needs M202)
      const batchCourses = this.courses.filter(c => c.batch === course.batch);
      const estimatedBatchSize = batchCourses.length > 10 ? 70 : 60; // Rough estimate
      
      if (estimatedBatchSize > 70) {
        // Need large lab (M202)
        const largeLab = this.rooms.find(r => 
          r.name === "M202" || r.type === "large-lab" || r.capacity > 70
        );
        if (largeLab) return largeLab;
      }
      
      // Use small labs (N303, N307, N306)
      const smallLabs = this.rooms.filter(r => 
        r.type === "lab" || 
        r.name.includes("N30") || 
        (r.capacity >= 25 && r.capacity <= 35)
      );
      
      if (smallLabs.length > 0) {
        // Rotate through available small labs
        const labIndex = Math.floor(Math.random() * smallLabs.length);
        return smallLabs[labIndex];
      }
    }
    
    // Regular lecture rooms
    const lectureRooms = this.rooms.filter(r => 
      r.type === "lecture" || 
      (!r.type && r.capacity >= 40)
    );
    
    if (lectureRooms.length > 0) {
      return lectureRooms[Math.floor(Math.random() * lectureRooms.length)];
    }
    
    // Fallback: any available room
    return this.rooms[Math.floor(Math.random() * this.rooms.length)];
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

    // Step 3: Validate final schedule
    console.log("\n✔️ Step 3: Validating final schedule...");
    const violations = this.validateSchedule(optimizedSchedule);
    
    if (violations.length === 0) {
      console.log("✅ No hard constraint violations!");
    } else {
      console.log(`⚠️ Found ${violations.length} violations:`);
      violations.forEach(v => console.log(`  - ${v}`));
    }

    return optimizedSchedule;
  }

  // Validate entire schedule for hard constraints
  private validateSchedule(events: ScheduleEvent[]): string[] {
    const violations: string[] = [];

    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      const otherEvents = events.filter((_, idx) => idx !== i);

      if (HardConstraints.teacherConflict(otherEvents, event)) {
        violations.push(`Teacher conflict: ${event.teacherCode} at day ${event.day}, slot ${event.slot}`);
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
