import { GeneratedEvent } from "./llmService";

export interface ValidationResult {
  events: GeneratedEvent[];
  hardViolations: string[];
  metrics: {
    conflicts: number;
    gapScore: number;
    balanceScore: number;
    softScore: number;
  };
}

export function validateAndScore(
  events: GeneratedEvent[]
): ValidationResult {
  const hardViolations: string[] = [];
  let conflicts = 0;

  // Teacher + room conflict detection
  const teacherSlots = new Map<string, Set<string>>();
  const roomSlots = new Map<string, Set<string>>();

  for (const e of events) {
    const key = `${e.day}-${e.slot}`;
    const rKey = `${e.roomName}-${key}`;

    // Room conflict detection
    if (roomSlots.has(rKey)) {
      conflicts++;
      hardViolations.push(`Room conflict: ${rKey}`);
    } else {
      roomSlots.set(rKey, new Set());
    }

    // Teacher conflict detection (skip for projects)
    if (!e.isProject && e.teacherCodes) {
      for (const tc of e.teacherCodes) {
        const tKey = `${tc}-${key}`;
        if (teacherSlots.has(tKey)) {
          conflicts++;
          hardViolations.push(`Teacher conflict: ${tKey}`);
        } else {
          teacherSlots.set(tKey, new Set());
        }
      }
    }
  }

  // Calculate scores
  const batches = [...new Set(events.map(e => e.batch || "DEFAULT"))];
  let totalGapScore = 0;
  let totalBalanceScore = 0;

  batches.forEach(batch => {
    const batchEvents = events.filter(e => e.batch === batch);
    const coreEvents = batchEvents.filter(e => e.courseCode !== "LIB" && e.courseCode !== "SPORTS");
    
    // Gaps
    let gaps = 0;
    for (let day = 0; day < 6; day++) {
      const dayEvents = batchEvents.filter(e => e.day === day).sort((a, b) => a.slot - b.slot);
      if (dayEvents.length > 1) {
        for (let i = 0; i < dayEvents.length - 1; i++) {
          const end = dayEvents[i].slot + dayEvents[i].duration;
          const next = dayEvents[i+1].slot;
          if (next > end && end !== 4 && next !== 5) gaps += (next - end);
        }
      }
    }
    totalGapScore += 1 / (1 + gaps);

    // Balance
    const countsPerDay = Array(6).fill(0);
    coreEvents.forEach(e => countsPerDay[e.day]++);
    const mean = coreEvents.length / 6;
    let variance = 0;
    countsPerDay.forEach(c => variance += Math.pow(c - mean, 2));
    totalBalanceScore += 1 / (1 + variance);
  });

  const gapScore = totalGapScore / batches.length;
  const balanceScore = totalBalanceScore / batches.length;
  const softScore = (gapScore * 0.4) + (balanceScore * 0.6);

  // Final pruning of excess fillers (Safety Layer)
  const finalEvents = pruneExcessFillers(events);

  return {
    events: finalEvents,
    hardViolations,
    metrics: { conflicts, gapScore, balanceScore, softScore },
  };
}

function pruneExcessFillers(events: GeneratedEvent[]): GeneratedEvent[] {
  const batches = [...new Set(events.map(e => e.batch || "DEFAULT"))];
  const pruned: GeneratedEvent[] = [];

  batches.forEach(batch => {
    const batchEvents = events.filter(e => e.batch === batch);
    const nonFillers = batchEvents.filter(e => e.courseCode !== "LIB" && e.courseCode !== "SPORTS");
    const fillers = batchEvents.filter(e => e.courseCode === "LIB" || e.courseCode === "SPORTS");
    
    const batchPrunedFillers: GeneratedEvent[] = [];
    for (let day = 0; day < 6; day++) {
      let libCount = 0;
      let sportsCount = 0;
      const dayFillers = fillers.filter(f => f.day === day).sort((a, b) => a.slot - b.slot);
      
      dayFillers.forEach(f => {
        if (f.courseCode === "LIB" && libCount + f.duration <= 2) {
          batchPrunedFillers.push(f);
          libCount += f.duration;
        } else if (f.courseCode === "SPORTS" && sportsCount + f.duration <= 2) {
          batchPrunedFillers.push(f);
          sportsCount += f.duration;
        }
      });
    }
    pruned.push(...nonFillers, ...batchPrunedFillers);
  });

  return pruned;
}
