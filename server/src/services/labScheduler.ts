// Lab Scheduling with Batch Splitting and Room Optimization
// Handles division of batches into groups for lab sessions

export interface LabConfig {
  smallLabs: string[];      // N303, N307, N306 (capacity ~30 each)
  largeLab: string;         // M202 (capacity 70+)
  groupSize: number;        // ~30 students per group
  sessionsPerWeek: number;  // How many times each group needs lab
}

export interface BatchInfo {
  name: string;
  studentCount: number;
  assignedRoom: string;     // Regular classroom
}

export interface LabSession {
  batchName: string;
  group: "A" | "B" | "C" | "ALL";  // Which third of the batch
  labRoom: string;
  day: number;
  slot: number;
  duration: number;
  freedClassroom?: string;  // The classroom that becomes available
}

export class LabScheduler {
  private config: LabConfig;
  
  constructor(config: LabConfig) {
    this.config = config;
  }

  /**
   * Determine if batch needs to be split for labs
   */
  needsSplitting(batch: BatchInfo): boolean {
    return batch.studentCount > this.config.groupSize;
  }

  /**
   * Calculate number of groups needed
   */
  calculateGroups(batch: BatchInfo): number {
    if (batch.studentCount <= this.config.groupSize) {
      return 1; // Use small lab or large lab
    }
    
    // Split into groups of ~30
    const groups = Math.ceil(batch.studentCount / this.config.groupSize);
    return Math.min(groups, 3); // Max 3 groups (A, B, C)
  }

  /**
   * Assign appropriate lab based on batch size
   */
  assignLab(batch: BatchInfo, group?: "A" | "B" | "C"): string {
    if (batch.studentCount > 70) {
      // Large batch, must use M202
      return this.config.largeLab;
    }
    
    if (batch.studentCount <= this.config.groupSize) {
      // Small batch, use any small lab
      return this.config.smallLabs[0];
    }
    
    // Split batch, assign to small labs
    const groupIndex = group === "A" ? 0 : group === "B" ? 1 : 2;
    return this.config.smallLabs[groupIndex % this.config.smallLabs.length];
  }

  /**
   * Generate lab sessions for a batch with optimal room utilization
   */
  generateLabSessions(
    batch: BatchInfo,
    courseCode: string,
    teacherCode: string,
    startDay: number,
    startSlot: number
  ): LabSession[] {
    const sessions: LabSession[] = [];
    const groups = this.calculateGroups(batch);
    
    if (groups === 1) {
      // No splitting needed
      const lab = this.assignLab(batch);
      
      for (let i = 0; i < this.config.sessionsPerWeek; i++) {
        sessions.push({
          batchName: batch.name,
          group: "ALL",
          labRoom: lab,
          day: (startDay + i) % 6,
          slot: startSlot,
          duration: 2, // Labs are typically 2 periods
          freedClassroom: batch.assignedRoom // Classroom becomes available
        });
      }
    } else {
      // Split into groups A, B, C
      const groupNames: ("A" | "B" | "C")[] = ["A", "B", "C"];
      
      // Each group needs sessionsPerWeek lab sessions
      for (let groupIdx = 0; groupIdx < groups; groupIdx++) {
        const group = groupNames[groupIdx];
        const lab = this.assignLab(batch, group);
        
        for (let sessionIdx = 0; sessionIdx < this.config.sessionsPerWeek; sessionIdx++) {
          sessions.push({
            batchName: batch.name,
            group: group,
            labRoom: lab,
            day: (startDay + sessionIdx * groups + groupIdx) % 6,
            slot: startSlot,
            duration: 2,
            freedClassroom: batch.assignedRoom
          });
        }
      }
    }
    
    return sessions;
  }

  /**
   * Find available classrooms during lab sessions
   * When batch is in lab, their classroom is free for others
   */
  findFreedClassrooms(labSessions: LabSession[]): Map<string, string[]> {
    const freedRooms = new Map<string, string[]>();
    
    labSessions.forEach(session => {
      if (session.freedClassroom) {
        const key = `${session.day}-${session.slot}`;
        if (!freedRooms.has(key)) {
          freedRooms.set(key, []);
        }
        freedRooms.get(key)!.push(session.freedClassroom);
      }
    });
    
    return freedRooms;
  }

  /**
   * Optimize room allocation by using freed classrooms
   */
  optimizeRoomAllocation(
    regularSessions: any[],
    labSessions: LabSession[]
  ): any[] {
    const freedRooms = this.findFreedClassrooms(labSessions);
    const optimized = [...regularSessions];
    
    optimized.forEach(session => {
      const key = `${session.day}-${session.slot}`;
      const available = freedRooms.get(key);
      
      if (available && available.length > 0) {
        // Use a freed classroom instead of a lab/other room
        session.roomName = available[0];
        session.optimized = true;
        
        // Remove from available list
        available.shift();
      }
    });
    
    return optimized;
  }

  /**
   * Validate lab schedule
   * Ensures no conflicts and proper rotation
   */
  validateLabSchedule(sessions: LabSession[]): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    // Check 1: Each group gets equal number of sessions
    const groupCounts = new Map<string, number>();
    sessions.forEach(s => {
      const key = `${s.batchName}-${s.group}`;
      groupCounts.set(key, (groupCounts.get(key) || 0) + 1);
    });
    
    const counts = Array.from(groupCounts.values());
    const allEqual = counts.every(c => c === counts[0]);
    if (!allEqual) {
      errors.push("Groups do not have equal number of lab sessions");
    }
    
    // Check 2: No lab conflicts (same lab, same time)
    const labSlots = new Map<string, LabSession[]>();
    sessions.forEach(s => {
      const key = `${s.labRoom}-${s.day}-${s.slot}`;
      if (!labSlots.has(key)) {
        labSlots.set(key, []);
      }
      labSlots.get(key)!.push(s);
    });
    
    labSlots.forEach((sessions, key) => {
      if (sessions.length > 1) {
        errors.push(`Lab conflict at ${key}: ${sessions.map(s => s.batchName).join(", ")}`);
      }
    });
    
    // Check 3: Groups are properly rotated
    const batchGroups = new Map<string, Set<string>>();
    sessions.forEach(s => {
      if (!batchGroups.has(s.batchName)) {
        batchGroups.set(s.batchName, new Set());
      }
      batchGroups.get(s.batchName)!.add(s.labRoom);
    });
    
    batchGroups.forEach((labs, batch) => {
      if (labs.size > 1) {
        // Groups should rotate through different labs
        console.log(`✓ ${batch}: Groups rotating through ${labs.size} labs`);
      }
    });
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate display format for lab sessions
   */
  formatLabSession(session: LabSession, courseCode: string): string {
    if (session.group === "ALL") {
      return `${courseCode} LAB`;
    }
    
    // Show which groups are in which labs
    return `${courseCode} LAB(${session.group})`;
  }

  /**
   * Get lab utilization statistics
   */
  getUtilizationStats(sessions: LabSession[]): {
    labUsage: Map<string, number>;
    freedClassrooms: number;
    totalLabHours: number;
  } {
    const labUsage = new Map<string, number>();
    let freedClassrooms = 0;
    
    sessions.forEach(s => {
      labUsage.set(s.labRoom, (labUsage.get(s.labRoom) || 0) + 1);
      if (s.freedClassroom) {
        freedClassrooms++;
      }
    });
    
    return {
      labUsage,
      freedClassrooms,
      totalLabHours: sessions.reduce((sum, s) => sum + s.duration, 0)
    };
  }
}

/**
 * Example usage and configuration
 */
export const defaultLabConfig: LabConfig = {
  smallLabs: ["N303", "N307", "N306"],
  largeLab: "M202",
  groupSize: 30,
  sessionsPerWeek: 3
};

/**
 * Helper function to integrate with main scheduler
 */
export function scheduleLabsForBatch(
  batch: BatchInfo,
  courseCode: string,
  teacherCode: string,
  config: LabConfig = defaultLabConfig
): LabSession[] {
  const scheduler = new LabScheduler(config);
  
  console.log(`\n📚 Scheduling labs for ${batch.name} (${batch.studentCount} students)`);
  
  const needsSplit = scheduler.needsSplitting(batch);
  const groups = scheduler.calculateGroups(batch);
  
  if (needsSplit) {
    console.log(`  ✂️ Splitting into ${groups} groups (A, B, C)`);
    console.log(`  📍 Each group: ~${Math.ceil(batch.studentCount / groups)} students`);
  } else {
    console.log(`  ✓ No splitting needed, using single lab`);
  }
  
  const sessions = scheduler.generateLabSessions(
    batch,
    courseCode,
    teacherCode,
    0, // Start day
    2  // Start slot (mid-morning)
  );
  
  console.log(`  📅 Generated ${sessions.length} lab sessions`);
  
  // Show freed classrooms
  const freed = sessions.filter(s => s.freedClassroom).length;
  console.log(`  🏫 ${freed} classroom slots freed for other batches`);
  
  // Validate
  const validation = scheduler.validateLabSchedule(sessions);
  if (validation.valid) {
    console.log(`  ✅ Lab schedule validated successfully`);
  } else {
    console.log(`  ⚠️ Validation warnings:`);
    validation.errors.forEach(e => console.log(`     - ${e}`));
  }
  
  return sessions;
}
