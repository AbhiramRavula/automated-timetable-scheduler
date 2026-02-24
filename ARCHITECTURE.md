# 🏗️ System Architecture

## High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                             │
│                     http://localhost:5173                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/JSON
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                            │
│                                                                  │
│  ┌────────────────────┐         ┌──────────────────────┐       │
│  │   Setup View       │         │  Timetables View     │       │
│  │                    │         │                      │       │
│  │  • Metadata        │◄───────►│  • Tab Navigation    │       │
│  │  • Batches         │         │  • Timetable Display │       │
│  │  • Courses         │         │  • Cell Editing      │       │
│  │  • Teachers        │         │  • Export PDF        │       │
│  │  • Rooms           │         │                      │       │
│  │  • Constraints     │         │                      │       │
│  └────────────────────┘         └──────────────────────┘       │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              API Helper (api.ts)                         │  │
│  │  • generateTimetables()                                  │  │
│  │  • validateTimetable()                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ POST /api/timetables/generate
                              │ { courses, teachers, rooms, batches, ... }
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Express)                             │
│                  http://localhost:4000                           │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           Routes (routes/timetables.ts)                  │  │
│  │                                                          │  │
│  │  POST /api/timetables/generate                          │  │
│  │  POST /api/timetables/validate                          │  │
│  │  GET  /api/timetables/:id                               │  │
│  │  GET  /api/timetables/:id/metrics                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Services (services/)                             │  │
│  │                                                          │  │
│  │  ┌────────────────────┐    ┌──────────────────────┐    │  │
│  │  │  llmService.ts     │    │  validator.ts        │    │  │
│  │  │                    │    │                      │    │  │
│  │  │  • parseConstraints│    │  • validateAndScore  │    │  │
│  │  │  • proposeSchedule │    │  • checkConflicts    │    │  │
│  │  │  • simpleScheduler │    │  • calculateMetrics  │    │  │
│  │  └────────────────────┘    └──────────────────────┘    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           Models (models/)                               │  │
│  │                                                          │  │
│  │  • Teacher.ts                                           │  │
│  │  • Course.ts                                            │  │
│  │  • Room.ts                                              │  │
│  │  • Batch.ts                                             │  │
│  │  • TimeSettings.ts                                      │  │
│  │  • Timetable.ts                                         │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Mongoose ODM
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE (MongoDB)                            │
│                mongodb://localhost:27017                         │
│                                                                  │
│  Collections:                                                    │
│  • teachers                                                      │
│  • courses                                                       │
│  • rooms                                                         │
│  • batches                                                       │
│  • timeSettings                                                  │
│  • timetables                                                    │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow - Timetable Generation

```
┌──────────────┐
│   User       │
│   Clicks     │
│  "Generate"  │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│  Frontend: App.tsx                                        │
│  • Collects: courses, teachers, rooms, batches, metadata │
│  • Calls: generateTimetables(data)                       │
└──────┬───────────────────────────────────────────────────┘
       │
       │ HTTP POST
       │ /api/timetables/generate
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│  Backend: routes/timetables.ts                            │
│  • Receives request body                                 │
│  • Extracts: courses, teachers, rooms, batches           │
└──────┬───────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│  Step 1: Parse Constraints                               │
│  • llmService.parseConstraints(constraintsText)          │
│  • Returns: [{ type: "hard", name: "NO_CONFLICT" }, ...] │
└──────┬───────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│  Step 2: Propose Schedule                                │
│  • llmService.proposeSchedule({ courses, teachers, ... })│
│  • Groups courses by batch                               │
│  • Schedules each batch separately                       │
│  • Returns: [{ courseCode, teacherCode, day, slot, ... }]│
└──────┬───────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│  Step 3: Validate & Score                                │
│  • validator.validateAndScore(events)                    │
│  • Checks conflicts                                      │
│  • Calculates metrics                                    │
│  • Returns: { events, metrics, hardViolations }          │
└──────┬───────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│  Step 4: Transform to Display Format                     │
│  • Group events by batch                                 │
│  • Create schedule grid (MON-SAT × 7 periods)            │
│  • Handle multi-slot events (labs)                       │
│  • Returns: timetables array                             │
└──────┬───────────────────────────────────────────────────┘
       │
       │ HTTP Response
       │ { timetable, timetables, metrics, hardViolations }
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│  Frontend: App.tsx                                        │
│  • Stores timetables in state                            │
│  • Switches to timetables view                           │
└──────┬───────────────────────────────────────────────────┘
       │
       ▼
┌──────────────────────────────────────────────────────────┐
│  Frontend: AllTimetablesView.tsx                         │
│  • Displays tabs for each batch                          │
│  • Renders timetable grids                               │
│  • Enables editing                                       │
└──────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
App.tsx
├── Setup View
│   ├── MetadataEditor
│   │   └── Form inputs for institution settings
│   ├── BatchesEditor
│   │   └── Table with add/remove rows
│   ├── CoursesEditor
│   │   └── Table with course details
│   ├── TeachersEditor
│   │   └── Table with teacher info
│   ├── RoomsEditor
│   │   └── Table with room details
│   ├── Constraints Editor
│   │   └── Textarea for natural language rules
│   └── Metrics Dashboard
│       └── Cards showing conflicts, scores
│
└── Timetables View
    └── AllTimetablesView
        ├── Tab Navigation
        │   └── Buttons for each batch
        ├── TimetableDisplay (active tab)
        │   ├── Header (class, room, date, teacher)
        │   ├── TimetableGrid
        │   │   ├── Day columns (MON-SAT)
        │   │   ├── Period rows (1-6 + lunch)
        │   │   └── Editable cells
        │   ├── Subject Legend
        │   │   └── Table with codes and faculty
        │   └── Footer (signatures)
        └── Summary Stats
            └── Cards with totals
```

## API Request/Response Flow

### Request
```json
POST /api/timetables/generate
Content-Type: application/json

{
  "courses": [
    {
      "code": "PP",
      "name": "Python Programming",
      "durationSlots": 1,
      "teacherCode": "T1",
      "batch": "IT-3A"
    }
  ],
  "teachers": [
    {
      "code": "T1",
      "name": "Ms. T. Vijaya Laxmi"
    }
  ],
  "rooms": [
    {
      "name": "N304",
      "capacity": 60
    }
  ],
  "batches": [
    {
      "name": "IT-3A",
      "year": 3,
      "department": "IT",
      "section": "A",
      "studentCount": 60
    }
  ],
  "constraintsText": "No teacher conflicts, no room conflicts",
  "metadata": {
    "institutionName": "ABC College",
    "periodsPerDay": 6,
    ...
  }
}
```

### Response
```json
{
  "timetable": [
    {
      "courseCode": "PP",
      "teacherCode": "T1",
      "roomName": "N304",
      "day": 0,
      "slot": 0,
      "duration": 1,
      "batch": "IT-3A"
    }
  ],
  "timetables": [
    {
      "id": "it-3a",
      "class": "IT-3A",
      "room": "N304",
      "date": "24/02/2026",
      "wef": "24/02/2026",
      "classTeacher": "",
      "schedule": {
        "MON": ["PP", "DBS", "FA", "BE", null, "DM", "LIB"],
        "TUE": ["BE", "FA", "ETCE", "PP", null, "CRT", "DE"],
        "WED": ["PP", "DBS", { "subject": "PP LAB", "span": 2 }, null, "FA", "SPORTS"],
        "THU": ["CRT", "FA", "DM", "DE", null, "DBS", "LIB"],
        "FRI": ["DE", "DM", "BE", "DBS", null, { "subject": "DBS LAB", "span": 2 }],
        "SAT": ["PP", "ETCE", { "subject": "BE LAB", "span": 2 }, null, "DM", "SPORTS"]
      }
    }
  ],
  "metrics": {
    "conflicts": 0,
    "gapScore": 0.8,
    "balanceScore": 0.7,
    "softScore": 0.75
  },
  "hardViolations": []
}
```

## Scheduling Algorithm

```
simpleScheduler(input):
  1. Group courses by batch
     coursesByBatch = {
       "IT-3A": [PP, DBS, FA, ...],
       "IT-3B": [PP, DBS, FA, ...],
       ...
     }
  
  2. For each batch:
     a. Initialize: day = 0, slot = 0
     b. For each course in batch:
        - Skip lunch slot (slot 4)
        - Assign: day, slot, duration
        - Add to events array
        - Move to next slot
        - If slot >= 7: next day
        - If day >= 6: wrap to Monday
  
  3. Return all events
```

## State Management

### Frontend State (App.tsx)
```typescript
// View state
currentView: "setup" | "timetables"

// Input data
metadata: Metadata
batches: Batch[]
courses: Course[]
teachers: Teacher[]
rooms: Room[]
constraintsText: string

// Generated data
events: Event[]
generatedTimetables: Timetable[]
metrics: Metrics
error: string | null
loading: boolean
```

### Backend Processing
```typescript
// Input
{ courses, teachers, rooms, batches, constraintsText, metadata }

// Intermediate
constraints: ParsedConstraint[]
rawSchedule: GeneratedEvent[]
validationResult: { events, metrics, hardViolations }

// Output
{
  timetable: Event[],
  timetables: Timetable[],
  metrics: Metrics,
  hardViolations: string[]
}
```

## Technology Stack

### Frontend
- **Framework**: React 18
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State**: React Hooks (useState)
- **HTTP**: Fetch API

### Backend
- **Runtime**: Node.js
- **Framework**: Express
- **Language**: TypeScript
- **Database**: MongoDB
- **ODM**: Mongoose
- **AI**: Google Gemini API

### Development
- **Package Manager**: npm
- **Version Control**: Git
- **Code Editor**: VS Code
- **API Testing**: curl, Postman

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Production                            │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Frontend (Vercel)                                       │
│  • Static files from client/dist/                       │
│  • CDN distribution                                      │
│  • HTTPS enabled                                         │
│                                                          │
│  Backend (Render/Railway)                                │
│  • Node.js server                                        │
│  • Environment variables                                 │
│  • Auto-scaling                                          │
│                                                          │
│  Database (MongoDB Atlas)                                │
│  • Cloud-hosted MongoDB                                  │
│  • Automatic backups                                     │
│  • Free tier available                                   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Security Considerations

### Frontend
- Input validation
- XSS prevention (React escaping)
- CORS configuration
- Environment variables

### Backend
- Request validation
- Rate limiting (to be added)
- Authentication (to be added)
- MongoDB injection prevention (Mongoose)

### Database
- Connection string in .env
- Access control (to be added)
- Data encryption at rest (MongoDB Atlas)

## Performance Optimization

### Frontend
- Code splitting (Vite)
- Lazy loading components
- Memoization (React.memo)
- Efficient re-renders

### Backend
- Async/await for I/O
- Connection pooling (MongoDB)
- Response caching (to be added)
- Batch processing

### Database
- Indexes on frequently queried fields
- Aggregation pipelines
- Lean queries (Mongoose)

---

**Last Updated**: February 24, 2026  
**Version**: 1.0.0
