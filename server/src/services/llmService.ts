import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("⚠️ GEMINI_API_KEY not set. LLM calls will fail.");
}

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const model = genAI?.getGenerativeModel({ model: "gemini-pro" });

export interface ParsedConstraint {
  type: "hard" | "soft";
  name: string;
  weight?: number;
  params?: any;
}

export interface GeneratedEvent {
  courseCode: string;
  teacherCode: string;
  roomName: string;
  day: number;   // 0-5 (Mon-Sat)
  slot: number;  // 0-6 (7 periods including lunch)
  duration: number;
  batch?: string;
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
  } catch (error) {
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

Given:
COURSES: ${JSON.stringify(input.courses, null, 2)}

TEACHERS: ${JSON.stringify(input.teachers, null, 2)}

ROOMS: ${JSON.stringify(input.rooms, null, 2)}

BATCHES: ${JSON.stringify(input.batches || [], null, 2)}

CONSTRAINTS: ${JSON.stringify(input.constraints, null, 2)}

Task:
1. Generate a feasible timetable as a JSON array of events.
2. Satisfy all hard constraints (no teacher or room conflicts if possible).
3. Try to satisfy soft constraints but it's ok if some are violated.
4. Schedule courses for their assigned batches.

Output ONLY JSON in this shape:
[
  {"courseCode":"CS101","teacherCode":"T1","roomName":"R101","day":0,"slot":2,"duration":1,"batch":"IT-3A"}
]
`;
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const start = responseText.indexOf("[");
    const end = responseText.lastIndexOf("]") + 1;
    return JSON.parse(responseText.slice(start, end));
  } catch (error) {
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
      teacherCode: event.teacherCode,
      roomName: event.roomName,
      day: event.day,
      slot: event.slot,
      duration: event.duration,
      batch: event.batch
    }));
  } catch (error) {
    console.error("❌ Advanced scheduler failed, using basic fallback:", error);
    return basicScheduler(input);
  }
}

// Basic fallback scheduler (simple greedy approach)
function basicScheduler(input: {
  courses: any[];
  teachers: any[];
  rooms: any[];
  batches?: any[];
}): GeneratedEvent[] {
  const events: GeneratedEvent[] = [];
  const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT"];
  
  // Group courses by batch
  const coursesByBatch: { [batch: string]: any[] } = {};
  for (const course of input.courses) {
    const batch = course.batch || "DEFAULT";
    if (!coursesByBatch[batch]) coursesByBatch[batch] = [];
    coursesByBatch[batch].push(course);
  }
  
  // Schedule each batch separately
  for (const [batch, batchCourses] of Object.entries(coursesByBatch)) {
    let currentDay = 0;
    let currentSlot = 0;
    
    for (const course of batchCourses) {
      // Skip lunch slot (slot 4)
      if (currentSlot === 4) currentSlot = 5;
      
      const room = input.rooms[Math.floor(Math.random() * input.rooms.length)];
      
      events.push({
        courseCode: course.code,
        teacherCode: course.teacherCode,
        roomName: room.name,
        day: currentDay,
        slot: currentSlot,
        duration: course.durationSlots || 1,
        batch: batch
      });
      
      // Move to next slot
      currentSlot += (course.durationSlots || 1);
      if (currentSlot >= 7) { // 7 slots per day (0-6, with 4 being lunch)
        currentSlot = 0;
        currentDay++;
        if (currentDay >= 6) currentDay = 0; // Wrap to Monday
      }
    }
  }
  
  return events;
}
