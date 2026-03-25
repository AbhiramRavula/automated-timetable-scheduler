import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("⚠️ GEMINI_API_KEY not set. LLM calls will fail.");
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const model = genAI?.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

export class LLMLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LLMLimitError";
  }
}

export interface ParsedConstraint {
  type: "hard" | "soft";
  name: string;
  weight?: number;
  params?: any;
}

export interface GeneratedEvent {
  courseCode: string;
  teacherCodes: string[];
  roomName: string;
  day: number;   // 0-5 (Mon-Sat)
  slot: number;  // 0-6 (7 periods including lunch)
  duration: number;
  batch?: string;
  isProject?: boolean;
}

export async function parseConstraints(text: string): Promise<ParsedConstraint[]> {
  if (!model) {
    console.warn("⚠️ No Gemini model available, using mock constraints");
    return [
      { type: "hard", name: "NO_TEACHER_CONFLICT" },
      { type: "hard", name: "NO_ROOM_CONFLICT" },
      { type: "soft", name: "PREFER_MIDDAY", weight: 3 }
    ];
  }
  
  try {
    const prompt = `
You are a university timetabling expert. Parse the following natural language rules into a JSON array of constraints.

Output ONLY JSON, no comments.

Example output:
[
  {"type":"hard","name":"NO_TEACHER_CONFLICT"},
  {"type":"soft","name":"AVOID_FRIDAY_AFTERNOON","weight":3}
]

Rules: ${text}
`;
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const start = responseText.indexOf("[");
    const end = responseText.lastIndexOf("]") + 1;
    return JSON.parse(responseText.slice(start, end));
  } catch (error: any) {
    if (error?.status === 429 || error?.message?.includes("429") || error?.message?.includes("RESOURCE_EXHAUSTED")) {
      throw new LLMLimitError("Gemini API limit reached");
    }
    console.warn("⚠️ LLM call failed, using mock constraints:", error);
    return [
      { type: "hard", name: "NO_TEACHER_CONFLICT" },
      { type: "hard", name: "NO_ROOM_CONFLICT" },
      { type: "soft", name: "PREFER_MIDDAY", weight: 3 }
    ];
  }
}

export async function proposeSchedule(input: {
  courses: any[];
  teachers: any[];
  rooms: any[];
  constraints: ParsedConstraint[];
  batches?: any[];
}): Promise<GeneratedEvent[]> {
  if (!model) {
    console.warn("⚠️ No Gemini model available, using simple scheduling algorithm");
    return simpleScheduler(input);
  }
  
  try {
    const prompt = `
You are a timetabling algorithm. 

CRITICAL RULES:
1. Use EXACTLY the courseCodes and teacherCodes provided in the JSON below. DO NOT hallucinate or change them.
2. Every course in the COURSES list MUST be scheduled exactly as many times as sessionsPerWeek indicates.

Data:
COURSES: ${JSON.stringify(input.courses.map(c => ({ code: c.code, name: c.name, batch: c.batch })), null, 2)}
TEACHERS: ${JSON.stringify(input.teachers.map(t => ({ code: t.code, name: t.name })), null, 2)}
ROOMS: ${JSON.stringify(input.rooms.map(r => ({ name: r.name })), null, 2)}
BATCHES: ${JSON.stringify(input.batches || [], null, 2)}
CONSTRAINTS: ${JSON.stringify(input.constraints, null, 2)}

Task:
1. Generate a feasible timetable as a JSON array of events.
2. Satisfy all hard constraints (no teacher or room conflicts).
3. If a subject has multiple teachers, ONE of them from the list can be assigned to a specific session.
4. Output ONLY JSON in this shape:
[
  {"courseCode":"EXACT_CODE_FROM_LIST","teacherCodes":["TEACHER_CODE_1"],"roomName":"ROOM_NAME","day":0,"slot":0,"duration":1,"batch":"BATCH_NAME"}
]

CRITICAL: 
1. Use slots 0, 1, 2, 3 (before lunch at slot 4) and 5, 6 (after lunch). 
2. A filled timetable should have about 5-6 periods per day. 
3. Do NOT leave too many empty spaces.
4. If a Course has sessionsPerWeek=3, it MUST appear 3 times in the schedule for that batch.
5. Project subjects (type: project) should be scheduled even if the teacher is busy with another lecture.
6. Labs (type: lab) MUST be scheduled as exactly 2 continuous periods (duration: 2). DO NOT split them into single periods.
7. Theory/Lectures are 1 period (duration: 1).
8. FILL ALL REMAINING GAPS with "LIB" (Library) or "SPORTS".
9. CRITICAL CONSTRAINTS FOR GAPS:
   - "SPORTS" MUST ONLY be scheduled in the afternoon (slots 5 or 6).
   - "LIB" and "SPORTS" combined MUST NOT exceed 4 periods a day.
   - "LIB" alone MUST NOT exceed 2 periods a day.
   - "SPORTS" alone MUST NOT exceed 2 periods a day.
10. AT LEAST TWO (2) core academic subjects MUST be scheduled every day from Monday to Saturday. DO NOT leave Saturday or any other day entirely empty of core academic sessions.
11. DO NOT exceed 2 periods per day for "LIB" and 2 periods per day for "SPORTS".
`;
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const start = responseText.indexOf("[");
    const end = responseText.lastIndexOf("]") + 1;
    return JSON.parse(responseText.slice(start, end));
  } catch (error: any) {
    if (error?.status === 429 || error?.message?.includes("429") || error?.message?.includes("RESOURCE_EXHAUSTED")) {
      throw new LLMLimitError("Gemini API limit reached");
    }
    console.warn("⚠️ LLM call failed, using simple scheduling algorithm:", error);
    return simpleScheduler(input);
  }
}

// Advanced scheduler using N-1 and N-2 operators for optimization
function simpleScheduler(input: {
  courses: any[];
  teachers: any[];
  rooms: any[];
  batches?: any[];
}): GeneratedEvent[] {
  // Import the advanced scheduler
  const { TimetableScheduler } = require('./scheduler');
  
  console.log("🎯 Using advanced scheduler with N-1 and N-2 optimization operators");
  
  try {
    // Create scheduler instance
    const scheduler = new TimetableScheduler(
      input.courses,
      input.teachers,
      input.rooms,
      500 // Max iterations for optimization
    );
    
    // Run scheduling algorithm
    const schedule = scheduler.schedule();
    
    // Convert to GeneratedEvent format
    return schedule.map((event: any) => ({
      courseCode: event.courseCode,
      teacherCodes: event.teacherCodes,
      roomName: event.roomName,
      day: event.day,
      slot: event.slot,
      duration: event.duration,
      batch: event.batch,
      isProject: event.isProject
    }));
  } catch (error) {
    console.error("❌ Advanced scheduler failed, using basic fallback:", error);
    return basicScheduler(input);
  }
}

// Basic fallback scheduler (randomized greedy approach for variety)
function basicScheduler(input: {
  courses: any[];
  teachers: any[];
  rooms: any[];
  batches?: any[];
}): GeneratedEvent[] {
  const events: GeneratedEvent[] = [];
  
  // Group courses by batch
  const coursesByBatch: { [batch: string]: any[] } = {};
  for (const course of input.courses) {
    const batch = course.batch || "DEFAULT";
    if (!coursesByBatch[batch]) coursesByBatch[batch] = [];
    coursesByBatch[batch].push(course);
  }
  
  // Schedule each batch separately
  for (const [batch, batchCourses] of Object.entries(coursesByBatch)) {
    // Create session pool
    let sessionPool: any[] = [];
    batchCourses.forEach(course => {
      const sessions = course.sessionsPerWeek || 3;
      for (let i = 0; i < sessions; i++) sessionPool.push(course);
    });

    // Shuffle sessions for variety
    sessionPool = sessionPool.sort(() => Math.random() - 0.5);

    let currentDay = 0;
    let currentSlot = 0;
    
    for (const course of sessionPool) {
      if (currentSlot === 4) currentSlot = 5; // Lunch
      
      const room = input.rooms[Math.floor(Math.random() * input.rooms.length)];
      
      events.push({
        courseCode: course.code,
        teacherCodes: course.teacherCodes,
        roomName: room.name,
        day: currentDay,
        slot: currentSlot,
        duration: course.durationSlots || 1,
        batch: batch
      });
      
      currentSlot += (course.durationSlots || 1);
      if (currentSlot >= 7) {
        currentSlot = 0;
        currentDay++;
        if (currentDay >= 6) currentDay = 0;
      }
    }
  }
  
  return events;
}
