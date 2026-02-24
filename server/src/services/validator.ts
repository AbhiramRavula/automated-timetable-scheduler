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
    const tKey = `${e.teacherCode}-${key}`;
    const rKey = `${e.roomName}-${key}`;

    if (teacherSlots.has(tKey)) {
      conflicts++;
      hardViolations.push(`Teacher conflict: ${tKey}`);
    } else {
      teacherSlots.set(tKey, new Set());
    }

    if (roomSlots.has(rKey)) {
      conflicts++;
      hardViolations.push(`Room conflict: ${rKey}`);
    } else {
      roomSlots.set(rKey, new Set());
    }
  }

  // Simple gap/balance scoring (placeholder)
  const gapScore = 0.2;     // TODO: compute from events
  const balanceScore = 0.8; // TODO: compute from events
  const softScore = (1 - gapScore) * 0.4 + balanceScore * 0.6;

  return {
    events,
    hardViolations,
    metrics: { conflicts, gapScore, balanceScore, softScore },
  };
}
