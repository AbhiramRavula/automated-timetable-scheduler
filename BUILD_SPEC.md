# Build Specification: Automated Timetable Scheduler

## Overview

You are an expert full-stack engineer + AI systems designer.

Use the PROJECT_CONTEXT above as the problem statement and literature background.

## TASK

Design and implement a full-stack web application:

**"A WEB-BASED PLATFORM FOR AUTOMATED TIMETABLE SCHEDULER"**

The app should implement an LLM-augmented timetable generation pipeline with a MERN-style stack.

---

## 1. ARCHITECTURE

### Frontend
- React (Vite) + TypeScript
- Tailwind CSS + shadcn/ui for polished components
- 3 main views:
  1. Data & Constraints Input
  2. Generated Timetable (interactive)
  3. Metrics & Exports

### Backend
- Node.js + Express (TypeScript)
- MongoDB + Mongoose
- Routes:
  - `POST /api/timetables/generate`
  - `POST /api/timetables/validate`
  - `GET /api/timetables/:id`
  - `GET /api/timetables/:id/metrics`

### AI Integration (LLM "brain")
- Use Gemini Pro via REST API (configurable API key via env)
- LLM responsibilities:
  - Parse natural language constraints into a structured JSON constraint model
  - Propose an initial timetable assignment as JSON array
  - Optionally explain decisions (reasoning string)

### Deterministic Validator
- Pure Node/TS module that:
  - Checks all **hard** constraints:
    - no teacher double-booking
    - no room double-booking
    - room capacity constraints
    - only allowed time windows
  - Calculates **soft** scores:
    - per-teacher gaps
    - per-batch gaps
    - load balance across days
  - Repairs simple violations using greedy/local search:
    - swap two events
    - move an event to another slot/room if legal

---

## 2. DATA MODEL

Create Mongoose models:

### Teacher
```typescript
{
  name: string
  code: string
  availability: boolean[][] // day/slot matrix
  maxLoadPerDay: number
}
```

### Room
```typescript
{
  name: string
  capacity: number
  type: string
  allowedDays: number[]
  allowedSlots: number[]
}
```

### Course
```typescript
{
  code: string
  name: string
  type: 'lecture' | 'lab'
  durationSlots: number
  preferredRooms: string[]
  preferredSlots: number[]
  teacherIds: ObjectId[]
  batch: string
  group: string
}
```

### Timetable
```typescript
{
  userId?: string
  courses: Course[]
  teachers: Teacher[]
  rooms: Room[]
  grid: any[][][] // 3D structure: day x slot x roomIndex → course instance
  constraintsSnapshot: object // JSON of parsed constraints at generation time
  metrics: {
    conflicts: number
    gapScore: number
    balanceScore: number
    softScore: number
    generatedAt: Date
  }
}
```

---

## 3. BACKEND IMPLEMENTATION

### 1. LLM Client Module (Gemini Pro)
- Reads `GEMINI_API_KEY` from env
- Functions:
  - `parseConstraints(freeText: string) → ConstraintModel`
  - `proposeSchedule(inputData, constraintModel) → rawSchedule[]`

#### Prompt Design
Provide:
- Courses (JSON)
- Teachers (JSON)
- Rooms (JSON)
- Parsed constraint model or raw text

Ask for:
- A JSON array of events:
  ```typescript
  {
    courseCode: string
    teacherCode: string
    roomName: string
    day: number
    slot: number
    duration: number
  }
  ```

### 2. Validator Module
```typescript
validateSchedule(events, teachers, rooms, courses, constraints)
```

Returns:
```typescript
{
  repairedEvents: Event[]
  hardConstraintViolations: Violation[]
  softMetrics: {
    gaps: number
    balance: number
    preferenceScore: number
  }
}
```

Guarantee: no remaining `hardConstraintViolations` after repair (or clearly report if impossible).

### 3. `/api/timetables/generate` Route
Request:
```typescript
{
  courses: Course[]
  teachers: Teacher[]
  rooms: Room[]
  constraintsText: string
}
```

Steps:
1. `parseConstraints` via LLM
2. `proposeSchedule` via LLM
3. Run `validateSchedule`
4. Store Timetable in Mongo
5. Return `{ timetableId, timetable, metrics, reasoning? }`

### 4. `/api/timetables/validate` Route
- Accepts a timetable JSON from frontend (e.g., after drag-drop edits)
- Runs validator + metrics
- Returns updated metrics and repaired schedule if needed

---

## 4. FRONTEND IMPLEMENTATION

Use React + TypeScript + Tailwind + shadcn/ui.

### 1. InputPage
- Upload or manually define:
  - `courses.json`
  - `teachers.json`
  - `rooms.json`
- Textarea: "Describe your rules and preferences in plain English"
  - Example: "No labs on Friday, CS faculty prefer mornings, first-years no 8am classes"
- Button: "Generate Timetable"
- On click:
  - POST to `/api/timetables/generate`
  - Show loading state

### 2. TimetablePage
- Display returned timetable as:
  - Grid view: days (columns) x time slots (rows), color-coded by course
  - View toggles: by room, by batch, by teacher
- Allow drag-and-drop:
  - Moving an event to another slot/room
  - On each change:
    - Call `/api/timetables/validate` (debounced) to:
      - Highlight conflicts
      - Show new metrics

### 3. MetricsPage
- Show KPIs:
  - Conflicts (should be 0)
  - Average gaps per teacher
  - Gap score, balance score, overall soft score
- Show "LLM reasoning" if backend returns it (why certain placements were chosen)
- Buttons:
  - Export as PDF/HTML
  - Save timetable

### General UI
- Clean, modern dashboard layout
- Dark/light theme
- Mobile responsive

---

## 5. NON-FUNCTIONAL REQUIREMENTS

- Code in TypeScript on both frontend and backend
- Separate layers clearly:
  - routes/controllers
  - services (LLM, validator)
  - models (Mongoose)
- Add minimal unit tests for:
  - validator
  - scoring functions
- Add `.env.example` with `GEMINI_API_KEY` and Mongo connection string
- Prepare for deployment:
  - Frontend: Vercel-ready
  - Backend: Render/Railway-ready

---

## 6. IMPLEMENTATION STEPS

1. Scaffold the project structure (monorepo or `/client` + `/server` folders)
2. Generate initial boilerplate (Express app, Mongoose connection, Vite React app)
3. Implement the LLM client with a stub, then actual Gemini integration
4. Implement the validator and metrics calculation
5. Wire up frontend pages and connect to backend APIs
6. Add sample JSON data + example constraints so it runs end-to-end locally

### Focus Areas

Clean, extensible code and clear separation between:
- LLM reasoning
- Hard constraint enforcement
- Web UI

---

## Project Structure

```
timetable-scheduler/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── types/
│   ├── package.json
│   └── vite.config.ts
├── server/                 # Express backend
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   │   ├── llm/
│   │   │   └── validator/
│   │   └── types/
│   ├── package.json
│   └── tsconfig.json
├── .env.example
└── README.md
```
