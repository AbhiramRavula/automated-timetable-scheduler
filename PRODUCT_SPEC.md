# PRODUCT_SPEC.md – Automated Timetable Scheduler (Engineering College)

## 1. Target Context

**Primary target:** Engineering college (single campus), also adaptable to schools.

**Scale (v1 realistic):**
- 7–10 departments
- 100+ faculty (including lab assistants)
- 80+ rooms (lecture halls + labs)
- Mostly 2 sections per year: A & B
- Single campus

**First real user:** Timetable in-charge for IT department in my college.

---

## 2. Time Model (Configurable by User)

### Working days:
- **Default:** Monday–Saturday (6 days)
- Admin can configure which days are active (e.g., unselect Saturday)

### Periods per day:
- **Default:** 6 periods
- Admin can configure:
  - Number of periods
  - Named slots with times, e.g.:
    - Period 1: 9:00–10:00
    - Period 2: 10:00–11:00
    - …

### Configuration UI:
"Time & Calendar Settings" form:
- Select active days (checkboxes)
- Number of periods
- For each period, name + start/end time

---

## 3. Core Entities and Fields (Frontend Forms + Backend Models)

### 3.1 Teacher

**Fields:**
- `name`: string
- `code`: string (short, unique, e.g., "IT01")
- `department`: string (e.g., "IT", "CSE")
- `designation`: enum/string (Professor, Assoc Prof, Asst Prof, Lab Assistant, etc.)
- `labOnly`: boolean (true if can only take labs/practicals)
- `canTeachMultipleCourses`: boolean (default true)
- `unavailableSlots`: list of `{ dayIndex, slotIndex }`
  - Used to model "forbidden slots per teacher"

**UI:**
A Teachers management screen:
- Table with add/edit/remove rows for all the above fields
- Simple UI for unavailable slots:
  - e.g., clickable grid (days × periods) to mark unavailable times

### 3.2 Course / Subject

**Fields:**
- `code`: string (unique, e.g., "IT201")
- `name`: string
- `type`: "lecture" | "lab" | "tutorial"
- `sessionsPerWeek`: number (how many times per week)
- `durationSlots`: number (1 for lecture, 2 for labs, etc.)
- `assignedTeacherCode`: string (link to Teacher.code)
- `batch`: string (e.g., "IT-2A", "IT-2B")
- `preferredRoomTypes`: array of "lecture" | "lab" | "seminar"
- `priority`: "core" | "elective"
- `mustNotClashWith`: array of course codes (for same batch – e.g., "this elective must not clash with core subject X")

**UI:**
Courses screen:
- Add/edit/remove courses
- Select teacher from dropdown of existing teachers
- Select batch from a list of defined batches/sections
- Select type and preferredRoomTypes via multi-select
- Optional "must not clash with" selector (multi-select of other courses)

### 3.3 Room

**Fields:**
- `name`: string (unique)
- `capacity`: number
- `type`: "lecture" | "lab" | "seminar"
- `building`: string
- `floor`: string or number
- `availableDays`: array of day indices (often all)
- `availableSlots`: array of slot indices (if some rooms only specific periods)

**UI:**
Rooms screen:
- Add/edit/remove rooms
- Building + floor as free text
- Select type
- Optional per-room availability matrix (like teachers)

### 3.4 Batch / Section (for clarity)

Even if not in DB at first, conceptually:
- `name`: string (e.g., "IT-3A", "IT-3B")
- `year`: number (e.g., 2nd year)
- `department`: string
- `studentCount`: number
- `unavailableSlots`: list of `{ dayIndex, slotIndex }` (e.g., "no classes after 4pm for FY")

**Used for:**
- Room capacity checks
- "Forbidden slots per batch"

---

## 4. Constraints

### 4.1 Hard Constraints (must never be violated)

The scheduler must ensure:
1. A teacher cannot be in two classes at the same time
2. A batch/section cannot have two classes at the same time
3. A room cannot have two classes at the same time
4. Room capacity must be ≥ enrolled students for the batch in that class
5. Labs must be scheduled only in rooms of type `lab`
6. No classes outside configured working days and periods
7. Respect forbidden slots per teacher (`unavailableSlots`)
8. Respect forbidden slots per batch (e.g., no classes after certain period)
9. Course `sessionsPerWeek` and `durationSlots` must be satisfied

**If LLM proposes something that breaks these, the validator must fix or reject.**

### 4.2 Soft Constraints (optimize but can violate with penalty)

The scheduler should try to:
1. Minimize free gaps in a teacher's day
2. Minimize free gaps in a batch's day
3. Balance teacher load across the week (avoid very heavy vs very light days)
4. Avoid scheduling heavy subjects consecutively (e.g., multiple core/theory sessions back-to-back)
5. Keep labs in continuous blocks (e.g., 2-period lab should be contiguous)

**Soft constraint priority (highest first):**
1. Keep labs in continuous blocks
2. Minimize gaps (teacher and batch)
3. Balance teacher load across the week
4. Avoid consecutive heavy subjects

**The metrics object returned by backend should expose at least:**
- `conflicts` (hard conflicts = 0 in final schedule)
- `gapScore` (0–1, lower is better)
- `balanceScore` (0–1, higher is better)
- `labBlockScore` (0–1, higher is better)
- `overallSoftScore` (weighted combination)

---

## 5. User Roles and Flow (v1)

### Roles:
- **Admin / Timetable In-Charge** only for v1

### Typical flow:

1. **Admin configures Time & Calendar:**
   - Select working days (Mon–Sat)
   - Define number of periods and named slots with times

2. **Admin sets up Rooms**

3. **Admin sets up Teachers and their unavailable slots**

4. **Admin sets up Batches/Sections and their forbidden slots (if any)**

5. **Admin sets up Courses:**
   - Links each course to teacher, batch, type, sessions/week

6. **Admin writes natural-language rules in a text area:**
   - e.g., "No labs on Saturday. 1st year not after 4pm. Core subjects in morning."

7. **Admin clicks "Generate Timetable":**
   - Backend calls LLM (Gemini) to:
     - Parse natural-language rules into structured constraints
     - Propose initial schedule (events list)
   - Validator applies hard constraints, repairs or reports conflicts
   - Backend stores timetable + metrics in Mongo

8. **Admin sees the timetable grid:**
   - By batch, by teacher, by room (toggle views)
   - Can manually move classes (drag-and-drop in later iteration)

9. **Admin clicks "Validate/Update Metrics" after manual changes:**
   - Sends updated events to backend
   - Validator recomputes metrics and ensures no hard conflicts

10. **Admin saves & exports:**
    - Export as PDF/HTML (future: CSV or ICS)

---

## 6. Technical Expectations

### Frontend:
React (Vite), TypeScript, Tailwind, modular components for:
- `TimeSettingsForm`
- `TeachersEditor`
- `RoomsEditor`
- `CoursesEditor`
- `ConstraintsEditor`
- `TimetableGrid` + future drag-drop

### Backend:
Node.js + Express + TypeScript + MongoDB (Mongoose)

### AI:
Gemini Pro API client with:
- `parseConstraints(text)` → structured constraints
- `proposeSchedule(data, constraints)` → events[]

### Validation layer:
Independent of LLM:
- Applies all hard constraints listed above
- Computes soft metrics

### Deployment:
Ready for:
- Frontend → Vercel
- Backend → Render/Railway
- DB → MongoDB Atlas free tier

---

## How to use this with Kiro

Create a file `PRODUCT_SPEC.md` in your repo with this content.

In Kiro, run something like:

> "Read PRODUCT_SPEC.md. Scaffold backend (Express+TS+Mongoose) and frontend (React+Vite+TS+Tailwind). Implement data models, forms, and API endpoints according to the spec, focusing on:
> - Time & Calendar settings form
> - Teachers/Rooms/Courses editors
> - /api/timetables/generate pipeline with LLM stub + validator stub
> 
> Produce working code and wire a minimal end-to-end flow for a single IT department."

Next, if you want, the focus can be on one slice: for example, a very precise Kiro prompt just for the "Time & Calendar Settings" UI + backend model, so you build feature-by-feature in small, safe chunks.

---

## Current Implementation Status

### ✅ Completed:
- Basic project structure (client + server)
- MongoDB connection
- Gemini API integration with fallback
- Basic models (Teacher, Room, Course, Timetable)
- Form-based editors (Courses, Teachers, Rooms)
- Institution metadata configuration
- Timetable grid visualization
- Metrics dashboard
- Basic constraint validation

### 🚧 In Progress / Next Steps:
- Enhanced Teacher model with unavailableSlots
- Enhanced Course model with sessionsPerWeek, priority, mustNotClashWith
- Enhanced Room model with building, floor, availableSlots
- Batch/Section entity and management
- Time & Calendar Settings form
- Advanced constraint validation (all hard constraints)
- Improved soft constraint scoring
- Multiple view toggles (by batch, by teacher, by room)
- Drag-and-drop timetable editing
- Export functionality (PDF/HTML)

### 📋 Future Enhancements:
- Multi-user authentication
- Department-wise access control
- Historical timetable versions
- Conflict resolution suggestions
- Mobile responsive improvements
- Bulk import/export (CSV, Excel)
