# Technical Specifications: Automated Timetable Scheduler

This document provides a comprehensive technical breakdown of the `automated-timetable-scheduler` project, covering architecture, folder structure, API reference, and database schema.

## 1. Project Structure

### Root Directory
- `client/`: React-based frontend application (Vite-powered).
- `server/`: Node.js/Express backend with MongoDB/Mongoose.
- `RESEARCH_THESIS.md`: Academic documentation for research purposes.
- `ARCHITECTURE.md`: High-level system design overview.
- `ALGORITHM_SUMMARY.md`: Detailed breakdown of scheduling logic.
- `LAB_SCHEDULING_GUIDE.md`: Guidelines for managing shared laboratory resources.
- `SETUP.md`: Installation and configuration instructions.

### Server Directory (`server/src/`)
- `models/`: Mongoose schemas for Institutions, Departments, Batches, Courses, Teachers, Rooms, and Timetables.
- `routes/`: API endpoint definitions (e.g., `/timetables`, `/faculty`, `/rooms`).
- `services/`: Core logic:
    - `scheduler.ts`: Simulated Annealing optimization with N-1/N-2 operators.
    - `llmService.ts`: Gemini 1.5 Flash integration.
    - `validator.ts`: Conflict matrix and gap score calculations.
    - `labScheduler.ts`: Specialized logic for handling lab-tagged rooms.
- `seed.ts`: Comprehensive dataset for Matrusri Engineering College.
- `index.ts`: Application entry point and database connection logic.

### Client Directory (`client/src/`)
- `components/`: Reusable UI components (Modals, Timetable Grids, Navbars).
- `pages/`: Application views (Dashboard, Faculty, Classes, Generate).
- `context/`: `InstitutionContext` for managing multi-profile state.
- `App.tsx`: Main routing and layout wrapper.

---

## 2. API Reference

### Timetables
- **GET** `/api/timetables`: Fetch all generated timetables for the active institution.
- **POST** `/api/timetables/generate`: Trigger the AI-augmented generation workflow.
- **DELETE** `/api/timetables`: Clear all generated timetables.

### Management Entities
- **GET/POST** `/api/faculty`: Manage faculty members and their departments.
- **GET/POST** `/api/subjects`: Manage course definitions, credits, and teacher mappings.
- **GET/POST** `/api/rooms`: Manage physical rooms and their associated tags (e.g., "lab").
- **GET/POST** `/api/batches`: Manage student batches/classes and their year/semester.
- **GET/POST** `/api/institutions`: Manage multi-institution profiles.

---

## 3. Data Models (Database Schema)

### Institution
- `name`: String
- `address`: String
- `code`: String (Unique ID)

### Batch (Class)
- `name`: String
- `semester`: String
- `year`: Number
- `room`: String (Referenced by Room name)
- `classTeacher`: String
- `effectiveDate`: String

### Course (Subject)
- `code`: String
- `name`: String
- `batch`: String (Referenced by Batch name)
- `type`: "lecture" | "lab" | "project"
- `teacherCodes`: String[]
- `sessionsPerWeek`: Number
- `durationSlots`: Number
- `requiredRoomTag`: String (Optional tag for room matching)

### Timetable
- `grid`: Object (Mapped by Batch Name, containing a 6x7 day/slot matrix)
- `metrics`:
    - `conflicts`: Number
    - `gapScore`: Number
    - `balanceScore`: Number
- `institutionId`: ObjectId

---

## 4. Key Logic: Simulated Annealing Configuration
- **Initial Temperature**: 1.0
- **Cooling Rate**: 0.995
- **Minimum Temperature**: 0.01
- **Max Iterations per Cycle**: 1000
- **Operators**: 
    - **N-1**: Single-event relocation.
    - **N-2**: Dual-event swap.

---

## 5. Development Workflow
1.  **Backend Development**: Use `npm run dev` in `server/` (powered by `ts-node-dev`).
2.  **Frontend Development**: Use `npm run dev` in `client/` (powered by `Vite`).
3.  **Seeding**: Run `npx ts-node src/seed.ts` in `server/` to refresh Matrusri data.
