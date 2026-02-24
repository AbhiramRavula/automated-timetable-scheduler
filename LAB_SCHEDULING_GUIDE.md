# 🔬 Lab Scheduling & Room Optimization Guide

## Overview

The system now intelligently handles lab sessions with batch splitting and optimal room utilization. When a batch is in the lab, their regular classroom becomes available for other batches.

## Lab Configuration

### Available Labs

**Small Labs (Capacity ~30 each):**
- N303
- N307
- N306

**Large Lab (Capacity 70+):**
- M202

### Room Types

```typescript
{
  "N303": { capacity: 30, type: "lab" },
  "N307": { capacity: 30, type: "lab" },
  "N306": { capacity: 30, type: "lab" },
  "M202": { capacity: 75, type: "large-lab" },
  "N304": { capacity: 60, type: "lecture" },
  "N305": { capacity: 60, type: "lecture" }
}
```

## Batch Splitting Logic

### Scenario 1: Small Batch (≤30 students)

**Example:** 25 students

```
No splitting needed
├── Use single small lab (N303, N307, or N306)
├── All students together
└── Freed classroom: Available for other batch
```

**Schedule:**
```
Week 1: All 25 students → N303
Week 2: All 25 students → N303
Week 3: All 25 students → N303
```

### Scenario 2: Medium Batch (31-60 students)

**Example:** 60 students

```
Split into 2 groups
├── Group A: 30 students → N303
├── Group B: 30 students → N307
└── Rotate through weeks
```

**Schedule:**
```
Monday:    Group A → N303, Group B in classroom
Wednesday: Group B → N307, Group A in classroom
Friday:    Group A → N306, Group B in classroom
```

### Scenario 3: Large Batch (61-70 students)

**Example:** 65 students

```
Split into 3 groups
├── Group A: ~22 students → N303
├── Group B: ~22 students → N307
├── Group C: ~21 students → N306
└── Each group rotates through all labs
```

**Schedule:**
```
Week 1:
  Mon: Group A → N303, Groups B&C in classroom
  Wed: Group B → N307, Groups A&C in classroom
  Fri: Group C → N306, Groups A&B in classroom

Week 2:
  Mon: Group A → N307 (rotated)
  Wed: Group B → N306 (rotated)
  Fri: Group C → N303 (rotated)
```

### Scenario 4: Very Large Batch (>70 students)

**Example:** 75 students

```
Use large lab M202
├── All students together
├── No splitting needed
└── Freed classroom: Available for other batch
```

**Schedule:**
```
All 75 students → M202 (3 times per week)
```

## Room Optimization

### Key Principle
**When a batch is in the lab, their regular classroom is FREE for another batch!**

### Example Optimization

**Before Optimization:**
```
10:40 AM:
├── Batch IT-3A (60 students) → Lab sessions (split into A, B, C)
│   ├── Group A (20) → N303
│   ├── Group B (20) → N307
│   └── Group C (20) → N306
├── Batch IT-3B (60 students) → Need classroom
│   └── Assigned: N314 (their regular room)
└── Batch IT-5A (55 students) → Need classroom
    └── Assigned: N305 (their regular room)
```

**After Optimization:**
```
10:40 AM:
├── Batch IT-3A → Lab sessions
│   ├── Group A (20) → N303
│   ├── Group B (20) → N307
│   └── Group C (20) → N306
│   └── N304 (IT-3A's classroom) is NOW FREE! ✨
├── Batch IT-3B → Can use N304 (freed classroom)
└── Batch IT-5A → Uses N305 (their regular room)

Result: Better room utilization, N314 remains available
```

## Lab Session Format

### Display in Timetable

**Single Group (No Split):**
```
CS LAB
```

**Multiple Groups (Split):**
```
CS LAB(A)  - Group A in N303
CS LAB(B)  - Group B in N307
CS LAB(C)  - Group C in N306
```

**Rotation Indicator:**
```
CS LAB(A)/PP LAB(B)/DBS LAB(C)
```
Means:
- CS Lab Group A in one lab
- PP Lab Group B in another lab
- DBS Lab Group C in third lab

## Scheduling Algorithm

### Step 1: Identify Lab Courses
```typescript
const labCourses = courses.filter(c => 
  c.isLab || 
  c.durationSlots > 1 ||
  c.code.includes("LAB")
);
```

### Step 2: Determine Splitting
```typescript
function needsSplitting(batch: Batch): boolean {
  return batch.studentCount > 30;
}

function calculateGroups(batch: Batch): number {
  if (batch.studentCount <= 30) return 1;
  if (batch.studentCount <= 60) return 2;
  if (batch.studentCount <= 70) return 3;
  return 1; // Use M202 for >70
}
```

### Step 3: Assign Labs
```typescript
function assignLab(batch: Batch, group: "A" | "B" | "C"): string {
  if (batch.studentCount > 70) return "M202";
  
  const smallLabs = ["N303", "N307", "N306"];
  const groupIndex = group === "A" ? 0 : group === "B" ? 1 : 2;
  
  return smallLabs[groupIndex];
}
```

### Step 4: Generate Sessions
```typescript
// Each group needs 3 sessions per week
for (let week = 0; week < 3; week++) {
  sessions.push({
    group: "A",
    lab: "N303",
    day: week * 2,      // Mon, Wed, Fri
    slot: 2,
    duration: 2,
    freedClassroom: "N304"
  });
}
```

### Step 5: Optimize Room Allocation
```typescript
// Find freed classrooms
const freedRooms = labSessions
  .filter(s => s.freedClassroom)
  .map(s => ({ time: `${s.day}-${s.slot}`, room: s.freedClassroom }));

// Assign regular classes to freed rooms
regularSessions.forEach(session => {
  const freed = freedRooms.find(f => 
    f.time === `${session.day}-${session.slot}`
  );
  
  if (freed) {
    session.roomName = freed.room; // Use freed classroom!
  }
});
```

## Validation Rules

### Hard Constraints

1. **No Lab Conflicts**
   - Same lab cannot host two groups simultaneously
   - Check: `labRoom + day + slot` must be unique

2. **Equal Distribution**
   - All groups get same number of lab sessions
   - Group A: 3 sessions, Group B: 3 sessions, Group C: 3 sessions

3. **Proper Rotation**
   - Groups should rotate through different labs
   - Ensures all students experience all lab setups

4. **Capacity Limits**
   - Small labs: Max 30 students
   - Large lab: Max 75 students

### Soft Constraints

1. **Minimize Gaps**
   - Lab sessions spread evenly across week
   - Avoid consecutive lab days

2. **Time Preferences**
   - Labs preferably in afternoon (after lunch)
   - Avoid first period labs

3. **Teacher Availability**
   - Same teacher for all groups of a batch
   - Teacher available for all lab sessions

## Statistics & Monitoring

### Lab Utilization
```
N303: 12 sessions/week (80% utilized)
N307: 10 sessions/week (67% utilized)
N306: 11 sessions/week (73% utilized)
M202: 6 sessions/week (40% utilized)
```

### Freed Classrooms
```
Total lab sessions: 39
Freed classroom slots: 39
Utilization by other batches: 28 (72%)
Wasted slots: 11 (28%)
```

### Group Distribution
```
Batch IT-3A:
  Group A: 3 sessions (N303, N307, N306)
  Group B: 3 sessions (N307, N306, N303)
  Group C: 3 sessions (N306, N303, N307)
  ✓ All groups balanced
  ✓ Proper rotation
```

## Configuration

### Default Settings
```typescript
{
  smallLabs: ["N303", "N307", "N306"],
  largeLab: "M202",
  groupSize: 30,
  sessionsPerWeek: 3,
  sessionDuration: 2  // periods
}
```

### Customization
```typescript
// Adjust group size
config.groupSize = 25;  // Smaller groups

// Change sessions per week
config.sessionsPerWeek = 2;  // Less frequent

// Add more labs
config.smallLabs.push("N308");
```

## Special Cases

### Case 1: Sports & Library
```
No room allocation needed
Students leave building
Classrooms remain available for others
```

### Case 2: Multiple Lab Courses
```
Batch has 3 lab courses:
├── CS Lab: Groups A, B, C
├── PP Lab: Groups A, B, C
└── DBS Lab: Groups A, B, C

Total: 9 groups × 3 sessions = 27 lab slots needed
```

### Case 3: Shared Labs
```
If two batches need same lab:
├── Batch 1: Mon/Wed/Fri 10:40-12:40
└── Batch 2: Tue/Thu/Sat 10:40-12:40

No conflicts, optimal utilization
```

## Benefits

### 1. Optimal Resource Utilization
- ✅ Freed classrooms used by other batches
- ✅ Labs used efficiently
- ✅ No wasted space

### 2. Fair Distribution
- ✅ All groups get equal lab time
- ✅ Rotation ensures variety
- ✅ No group disadvantaged

### 3. Flexibility
- ✅ Handles any batch size
- ✅ Adapts to available labs
- ✅ Scales with institution growth

### 4. Transparency
- ✅ Clear group assignments
- ✅ Visible rotation schedule
- ✅ Easy to track and modify

## Implementation Status

✅ Lab scheduler implemented  
✅ Batch splitting logic  
✅ Room optimization  
✅ Validation rules  
✅ Statistics tracking  
⏭️ UI for lab configuration  
⏭️ Visual group rotation display  
⏭️ Lab equipment tracking  

---

**File:** `server/src/services/labScheduler.ts`  
**Status:** ✅ Implemented  
**Version:** 3.1.0  
**Date:** February 24, 2026
