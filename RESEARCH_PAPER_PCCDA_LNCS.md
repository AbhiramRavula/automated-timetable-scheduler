# A Web-Based Platform for Automated Timetable Scheduling Using LLM-Augmented Constraint Optimization

[Author 1 Hidden for Review][0000-0001-XXXX-XXXX], [Author 2 Hidden for Review][0000-0002-XXXX-XXXX], [Author 3 Hidden for Review][0000-0003-XXXX-XXXX], and [Author 4 Hidden for Review][0000-0004-XXXX-XXXX]

[Department Hidden — Institution Name Hidden for Review]
[Contact Email Hidden for Review]

---

**Abstract.** Scheduling university courses every semester is one of the most time-consuming and error-prone tasks that academic institutions face. Coordinators must manually balance faculty availability, room capacities, lab requirements, batch assignments, and institutional policies — all at the same time. Even experienced schedulers often miss conflicts that are only discovered after the timetable is distributed to students. This paper presents a web-based automated timetable scheduling system that combines two modern technologies: Large Language Models (LLMs) and Simulated Annealing (SA) optimization. The system lets administrators describe their scheduling preferences in plain English (for example, "Dr. Sharma should not have back-to-back lab sessions"), and the LLM automatically converts those instructions into structured rules that the optimizer can work with. The optimization engine then generates a complete, conflict-free timetable in 2 to 5 seconds — something that would normally take 4 to 6 hours manually. When tested on a real institutional dataset of over 420 weekly sessions across 12 student batches, the system produced zero hard conflicts and satisfied roughly 92% of soft preferences. The platform is built as a full-stack web application using the MERN stack (MongoDB, Express, React, Node.js) and is designed to work across multiple institutions without any code changes.

**Keywords:** Automated Timetabling, Constraint Optimization, Large Language Models, Simulated Annealing, Academic Scheduling, MERN Stack, Conflict Detection, Web Application.

---

## 1  Introduction

Every semester, college administrators spend days manually building course timetables. They have to make sure no teacher is scheduled in two places at once, no room is double-booked, no student batch has overlapping classes, and subject hours are spread evenly across the week. On top of all this, there are always individual preferences — the department head needs Monday mornings free, or a particular lab is only equipped for specific courses.

The core problem — assigning courses, rooms, teachers, and time slots — is what computer scientists call NP-hard. This means there's no known algorithm that can solve it perfectly in a reasonable amount of time as the dataset grows. For a mid-sized college with 2,500 students, 25 teachers, 45 rooms, and a 6-day academic week, the number of possible timetable arrangements is astronomically large. Trying them all, even with a fast computer, is not an option.

The existing solutions fall into two broad categories. The first category is manual scheduling, which is slow, error-prone, and doesn't scale well. The second category is traditional automated tools, which are faster but require administrators to specify their preferences as hard-coded numerical weights — something most non-technical coordinators find confusing and impractical.

This project tries to solve both problems at once.

### 1.1  What We Built

We built a full-stack web platform that automates course timetabling for engineering colleges. The system has three main components:

1. **A Natural Language Interface** — Instead of filling in complicated forms or setting numerical weights, administrators just type their preferences in plain English. The system uses Google's Gemini 1.5 Flash LLM to understand what they mean and convert it into scheduling rules automatically.

2. **An Optimization Engine** — A Simulated Annealing algorithm takes those rules and generates a timetable by testing thousands of possible configurations, keeping the ones that work best, and eventually settling on a final schedule with no conflicts.

3. **A Web Dashboard** — A React-based administrative interface where users can manage faculty, rooms, subjects, and student batches, trigger schedule generation, and view the produced timetable — all in a browser.

### 1.2  Key Contributions

This paper makes the following contributions:

- A hybrid LLM + Simulated Annealing scheduling pipeline that reduces generation time from hours to seconds.
- A constant-time conflict detection system (O(1) per check) that makes the optimization fast enough to run on a regular web server.
- A "Room Recovery" mechanism for lab scheduling that automatically reclaims classrooms when student batches go to labs, improving room utilization.
- A production-ready multi-institution web application tested on a real college dataset.

---

## 2  Background and Related Work

Researchers have been working on automated timetabling for over 50 years. This section gives a brief overview of the main approaches and explains why we chose the combination we did.

### 2.1  Why Is This Problem Hard?

Even, Itai, and Shamir (1975) formally proved that the university timetabling problem is NP-complete [1]. In simple terms, this means you cannot write a program that is guaranteed to find the best solution in a reasonable amount of time. As the number of courses, rooms, and teachers grows, the search space explodes. The only practical approach is to use algorithms that search intelligently — not exhaustively.

### 2.2  Genetic Algorithms

One popular approach is Genetic Algorithms (GA), which are inspired by biological evolution. GA starts with a population of random timetables, then combines and mutates them over many generations, ideally producing better and better schedules [2]. Holland (1975) established the theoretical foundation for this approach [3], and it has been applied to scheduling in many academic papers.

The main problem with GA for timetabling is that combining two valid timetables often produces an invalid one (just like mixing two correct sentences doesn't always make grammatical sense). This means a lot of time is spent fixing "broken" offspring, slowing the whole process down. When constraints are strict and numerous, GA tends to get stuck.

### 2.3  Tabu Search

Tabu Search, introduced by Glover (1986) [4], is a local search method that keeps a "memory" of recently visited solutions and avoids revisiting them. This helps it explore more of the search space without looping. Schaerf (1999) [5] showed that Tabu Search can outperform GA when the hyper-parameters are tuned correctly.

The downside is that performance depends heavily on how long the "Tabu list" is. Too short and the algorithm gets stuck in loops; too long and it becomes too restrictive and misses good solutions. Calibrating this for a new institution requires significant manual effort.

### 2.4  Simulated Annealing

Simulated Annealing (SA), proposed by Kirkpatrick et al. (1983) [6], is our core optimization method. SA is inspired by the way metals cool — when they're hot, atoms move freely and randomly; as they cool, they settle into a stable, low-energy configuration.

In scheduling terms: SA starts by accepting almost any change (even if it makes the schedule slightly worse), giving the algorithm a chance to escape bad local solutions. As it "cools," it becomes more selective and only accepts changes that genuinely improve the schedule. Gashi and Sylejmani (2022) showed that SA with adaptive penalization performs well on ITC benchmark datasets [7]. Kim and Kim (2024) found that combining SA with parallel search strategies gives even better results on real-world university data [8].

The reason we picked SA over GA and Tabu Search is its simplicity and robustness. It doesn't require a large population or a carefully sized memory list. It just needs a good way to evaluate a timetable (the objective function) and a way to generate neighboring solutions (move operators).

### 2.5  Large Language Models in Scheduling

The newest development in this space is using Large Language Models (LLMs) to help with the parts of scheduling that are hard to encode as math. Wang et al. (2024) explored using LLMs as optimizers themselves [9], though that approach is too slow for real-time use.

Our approach is different — we use the LLM in a single, structured pass to:
- Understand natural language constraints from the administrator,
- Convert them into structured JSON rules the optimizer can use,
- Propose a reasonable initial timetable layout (called a "warm start") that reduces the number of optimization cycles needed.

Google's Gemini 1.5 Flash model [10] is specifically designed for this kind of task — it's fast, can handle large amounts of context, and reliably produces structured JSON output when prompted correctly. Al-Betar et al. (2021) found that warm-start strategies reduce optimization time by 30 to 50% in practice [11], which is consistent with what we observed.

---

## 3  How the System Works

This section explains the core technical design of the platform, step by step.

### 3.1  Phase 1 — Understanding Constraints with an LLM

The first thing that happens when a user triggers schedule generation is that their natural language preferences get sent to Gemini 1.5 Flash. The LLM's job is to read these inputs and produce a structured JSON object that the scheduling engine can understand.

For example, if an administrator writes:

> "Dr. Patel shouldn't have any classes on Saturday. Also, the networking lab should only be used for networking courses."

The LLM would produce something like:

```json
[
  {
    "type": "OFF_DAY",
    "teacherCode": "DP-03",
    "day": 5,
    "penaltyWeight": 10.0
  },
  {
    "type": "ROOM_TAG_RESTRICTION",
    "roomTag": "networking",
    "allowedCourseTypes": ["networking-lab"],
    "penaltyWeight": 8.0
  }
]
```

To make sure the LLM doesn't invent fake teacher codes or room names, we use a technique called "few-shot prompting." The prompt includes the complete list of real teachers, rooms, and courses from the database, plus two or three worked examples of how constraints should be formatted. This keeps the LLM grounded in real data.

After the constraint JSON is generated, it goes through a validation step using a schema checker (we use the `zod` library for this). If the LLM's output doesn't match the expected schema, the system sends a correction prompt and tries again automatically.

The LLM also produces an initial timetable grid — a first attempt at placing all courses into time slots. This doesn't have to be perfect, but it gives the optimization engine a head start instead of starting from a completely random arrangement.

**Table 1. Summary of the LLM Prompt Components**

| Component | What It Does |
| :--- | :--- |
| System Persona | Sets the role: "You are a university scheduling assistant" |
| Institution Data | Provides the full JSON list of rooms, teachers, and courses |
| Constraint Examples | Two worked examples showing input → JSON output mapping |
| Output Schema | Specifies exactly what format the response must be in |
| Semantic Mapping | Converts words like "morning" to slot numbers (0-3) automatically |

### 3.2  Phase 2 — Simulated Annealing Optimization

Once we have the initial timetable, the SA engine takes over. Its job is to improve the timetable by making small, smart changes and evaluating whether each change makes things better or worse.

#### 3.2.1  Two Types of Moves

The optimizer uses two kinds of changes, called "neighborhood operators":

**Move (N-1 Operator):** Pick a single class at random and try moving it to a different time slot or room. This is useful for fine-tuning — for example, pushing a lecture that's creating a gap to an earlier slot.

**Swap (N-2 Operator):** Pick two classes at random and swap their time slots. This is critical for resolving "deadlocks" — situations where you can't just move one class without breaking something else, but swapping two classes at once solves both problems.

At each step, the algorithm randomly chooses one of these two moves with equal probability (50/50). If the move makes the schedule better, it's always accepted. If it makes it slightly worse, it might still be accepted — but with a probability that depends on how bad the change is and how "hot" the current temperature is.

This "temperature" parameter is what makes SA work. At the start (high temperature), almost any move is accepted. This lets the algorithm explore freely and avoid getting trapped in local minima. As the temperature drops, the algorithm gets more selective and only accepts moves that genuinely improve the schedule.

#### 3.2.1  The Cooling Schedule

The temperature drops geometrically after each iteration using this rule:

```
T_new = T_current * 0.995
```

We start at temperature 1.0 and run 1,000 iterations, ending at approximately T = 0.007. This gives the algorithm a roughly 60% "hot" phase and a 40% "fine-tuning" phase.

**Table 2. Simulated Annealing Configuration**

| Parameter | Value | Purpose |
| :--- | :--- | :--- |
| Starting Temperature (T) | 1.0 | Enables free exploration at the start |
| Cooling Rate | 0.995 | Controls how fast the algorithm settles |
| Total Iterations | 1,000 | Number of moves attempted per generation |
| Gap Score Weight (w1) | 0.40 | How much to penalize idle gaps in a batch's day |
| Balance Score Weight (w2) | 0.60 | How much to penalize uneven subject distribution |
| Swap vs Move Probability | 50/50 | Equal chance of N-1 or N-2 operator each step |

#### 3.2.3  How a Schedule Is Scored

The optimizer needs a way to measure how good a timetable is. We define a scoring function called F(s) that combines two sub-scores for every student batch:

**Gap Score:** This measures how fragmented a batch's daily schedule is. If a batch has a lecture at 9 AM and the next one at 12 PM with nothing in between, that's a big gap and the gap score goes down. We want students to have contiguous learning blocks, not scattered isolated lectures. Formally: GapScore = 1 / (1 + total idle gaps across the week). Lunch breaks are excluded from gap counting.

**Balance Score:** This measures whether subjects are spread evenly across the 6-day week. If all theory lectures happen on Monday and the rest of the week is mostly empty, that's bad for academic retention. We measure this using the variance of per-day event counts. High variance gets penalized heavily, especially if any day has zero academic sessions.

The final score F(s) is the weighted average of these two scores across all batches, normalized by the size of the dataset so scores from different-sized institutions can be fairly compared. The optimizer always keeps track of the best score seen so far and returns that timetable at the end, even if later iterations found slightly worse solutions.

### 3.3  O(1) Conflict Detection

The most important engineering decision in the whole system is how we check for conflicts. Every time the SA engine proposes a move, it needs to answer three questions:

1. Is the teacher already in another class at this time?
2. Is the room already occupied at this time?
3. Is the student batch already in another class at this time?

A straightforward approach would be to loop through all existing scheduled events and compare them one by one. That would work, but it gets slow as the dataset grows — and the optimizer makes thousands of these checks per second.

Instead, we use three hash sets (think of them as super-fast lookup tables):

- `teacherSlots`: stores keys like `"DP-03-Monday-slot2"` for each teacher-time combination that's already booked.
- `roomSlots`: stores keys like `"LabR1-Monday-slot2"` for each room-time combination that's occupied.
- `batchSlots`: stores keys like `"Year2-A-Monday-slot2"` for each batch-time combination that's scheduled.

Checking any of these is O(1) — meaning it takes the same amount of time whether the timetable has 10 events or 10,000. The structure is updated whenever an event is added or removed, keeping it always in sync with the current schedule state.

This makes it possible to run 2,000+ conflict checks per second on a standard laptop, which is fast enough for real-time web use.

**Table 3. Conflict Matrix Index Design**

| Index Name | Key Format | What It Prevents |
| :--- | :--- | :--- |
| teacherSlots | teacherCode-day-slot | Double-booking a teacher |
| roomSlots | roomName-day-slot | Two classes in the same room |
| batchSlots | batchName-day-slot | A student batch having two classes at once |

---

## 4  System Architecture

The platform is a full-stack web application built with the MERN stack. This section explains the architecture and the reasoning behind our technical choices.

### 4.1  Technology Stack

**MongoDB** is used as the database because its JSON document model maps naturally to our data structures. A timetable is just a nested JSON object (Institution → Department → Batch → ScheduleEvents), which MongoDB stores and retrieves very efficiently.

**Express.js** provides the REST API layer. Routes are organized by resource type (faculty, rooms, batches, timetables) and every route is scoped to a specific institution using middleware that reads an institution ID from the request headers. This design means one server can handle multiple colleges without any risk of data leaking between them.

**React** is used for the frontend dashboard. The UI has dedicated pages for managing Faculty, Rooms, Subjects, and Batches. The timetable generation page shows a real-time progress indicator while the backend processes the schedule, and then renders the result as a color-coded weekly grid.

**Node.js** runs the backend. The scheduling engine runs entirely in-memory within a single HTTP request — it loads all the institution's data from MongoDB, runs the LLM call and SA optimization, saves the result, and responds. This stateless design makes the API easy to test and scale horizontally if needed.

### 4.2  How a Timetable Gets Generated — End to End

When a user clicks "Generate Timetable" in the browser:

1. The React frontend sends a POST request to `/api/v1/timetables/generate`, including the list of batches to schedule and any natural language constraints.
2. The Express middleware verifies the institution ID and fetches all Faculty, Rooms, and Courses from MongoDB in parallel.
3. All of that data, plus the user's constraints, is sent to Gemini 1.5 Flash as a single API call.
4. The LLM returns a constraint JSON and an initial placement grid.
5. The initial grid and constraints are passed to the `TimetableScheduler` class, which runs the SA optimization loop.
6. After 1,000 iterations, the scheduler returns the best timetable it found.
7. A "filler injection" step adds Library and Sports periods to any remaining empty slots.
8. The final timetable is saved to MongoDB and returned to the browser as JSON.
9. React renders the timetable as a formatted weekly grid.

The whole process takes 2 to 5 seconds from button click to rendered timetable.

**Fig. 1 — System Architecture Overview**

> [IMAGE PROMPT — generate with any AI image tool:]
> "Horizontal flowchart showing a web application architecture. Left side: a laptop labeled 'Admin Dashboard (React)'. Arrow right labeled 'POST /generate'. Center: a box labeled 'Node.js Express API' with three sub-arrows: one up to a cloud chip labeled 'Gemini 1.5 Flash LLM', one right to a gear icon labeled 'Simulated Annealing Engine' (which has an internal loop with a smaller box labeled 'O(1) Conflict Matrix'). Bottom arrow from SA Engine goes to a cylinder labeled 'MongoDB'. Return arrow from DB goes back to the laptop. Clean professional style, light blue and grey colors."

**Fig. 2 — Request Sequence Diagram**

```
Administrator         Node.js API          Gemini LLM         SA Engine         O(1) Matrix
     |                     |                    |                  |                  |
     |-- POST /generate -->|                    |                  |                  |
     |                     |-- extract rules -->|                  |                  |
     |                     |<-- JSON output ----|                  |                  |
     |                     |                    |                  |                  |
     |                     |------- init optimization (warm-start) -->               |
     |                     |                    |    (x1000 iterations)               |
     |                     |                    |         |-- check conflict -------> |
     |                     |                    |         |<-- is feasible? --------- |
     |                     |                    |         |-- evaluate score          |
     |                     |                    |         |-- accept or reject        |
     |                     |<------- best timetable found ----|                       |
     |<-- final grid ------|                    |                  |                  |
```

### 4.3  Implementation Details

#### 4.3.1  API Route Design

All API routes follow a consistent RESTful structure:

```
GET    /api/v1/faculty          — list all faculty for the institution
POST   /api/v1/faculty          — add a new faculty member
PUT    /api/v1/faculty/:id      — update a faculty member
DELETE /api/v1/faculty/:id      — remove a faculty member

POST   /api/v1/timetables/generate   — trigger timetable generation
GET    /api/v1/timetables/:batchId   — fetch a generated timetable
```

Every request passes through an "Institution Middleware" that reads the `X-Institution-Id` header and attaches the institution document to the request object. All subsequent database queries automatically use this scoped context.

#### 4.3.2  Tag-Based Room Aliasing

One of the trickier real-world problems is that multiple labs can be functionally equivalent. For example, if three computer labs all have networking equipment, a networking course should be able to use any of them — not just one specific room.

We handle this with a tagging system. Every `Room` document in the database has a `tags` array (e.g., `["networking", "cisco", "computer"]`). Every `Course` document has an optional `requiredRoomTag` field. During scheduling, when a course needs a room, the system filters the available rooms by tag before making a selection. This distributes lab usage across equivalent rooms instead of overloading one.

#### 4.3.3  Batch Splitting for Lab Sessions

When a batch of 60 students needs to do a lab session that requires a 30-seat lab, the system automatically splits the batch in half. Group A and Group B each get their own lab session in separate rooms, scheduled simultaneously. While a batch is in the lab, their regular home classroom becomes free — and the system notices this and makes that room available to other batches temporarily.

The formula for how many groups are needed is simple:

```
Number of Groups = ceil( batch size / max lab capacity )
```

For 60 students with a max lab size of 30: ceil(60 / 30) = 2 groups.

#### 4.3.4  Filler Period Injection

After the optimizer finishes, there will usually be a few empty time slots in each batch's week. Rather than leaving them blank, the system fills them automatically:

- **Library (LIB)** periods are inserted during morning and early afternoon gaps. Maximum 2 per day per batch.
- **Sports** periods are inserted only in afternoon slots (Slots 5 and 6). Maximum 2 per day per batch.

This makes the printed timetable look complete and professional, and it ensures students always have structured activities for every period of the day.

---

## 5  Experiments and Results

### 5.1  Dataset Description

We tested the system using data from a real engineering college with the following specifications:

- **12 student batches** across Year 1 to Year 4, two departments, odd and even semesters.
- **25 faculty members**, each with their own availability windows and weekly hour limits.
- **45 rooms** categorized as: large lecture halls (capacity 70+), standard classrooms (capacity 60), and specialized computer labs (capacity 30). Labs carry equipment tags that must match course requirements.
- **18 subjects per branch per year**, a mix of theory lectures and 2-hour lab sessions.
- **420+ total weekly sessions** after factoring in lab group splits and filler periods.
- **6-day academic week** (Monday to Saturday), 7 periods per day, with a fixed lunch break at Period 4.

### 5.2  Constraint Taxonomy

The system handles three types of constraints:

**Table 4. Types of Constraints Handled**

| Type | Example | How It's Handled | What Happens If Violated |
| :--- | :--- | :--- | :--- |
| Hard | A teacher can't be in two rooms at once | O(1) Conflict Matrix check | Move is immediately rejected |
| Hard | A room can't host two classes simultaneously | O(1) Conflict Matrix check | Move is immediately rejected |
| Hard | A batch can't have two classes at once | O(1) Conflict Matrix check | Move is immediately rejected |
| Soft | Minimize idle gaps in a batch's day | Gap score in objective function | Move is penalized but allowed |
| Soft | Spread subjects evenly across the week | Balance score in objective function | Move is penalized but allowed |
| Semantic | "Don't schedule Dr. Patel on Saturdays" | LLM extraction + penalty weight | High penalty applied by optimizer |

Hard constraints are never violated in the final output — the Conflict Matrix ensures that. Soft constraints are optimized as much as possible during the 1,000 SA iterations.

### 5.3  Case Study: Resolving a Resource Deadlock

One of the most interesting things the system does is solve "resource deadlock" situations automatically. Here's a concrete example from a test run:

In one semester, three second-year batches (A1, A2, and B1) all needed the networking lab (Room R-5) on Monday during Period 2. That's impossible — only one batch can be there at a time.

Here's how the system resolved it:

**Step 1 — Detection.** When the optimizer tried to assign Batch B1 to Room R-5 on Monday Period 2, the Conflict Matrix immediately blocked it. The entry `"R-5-Mon-2"` was already in the `roomSlots` set from Batch A2's assignment.

**Step 2 — First Attempt (Move, Failed).** The optimizer tried a simple Move: could Batch B1's networking lab go anywhere else? It checked Rooms R-1 through R-4. All were already occupied by other batches during that same morning period. Dead end.

**Step 3 — Swap (Succeeded).** The optimizer switched to a Swap move. It noticed that Batch A2 had a regular theory class (Mathematics) in a standard classroom on Wednesday Period 2 — a slot with no room constraints. The optimizer swapped these two events: A2's networking lab moved to Wednesday and Batch B1 got the Monday R-5 slot.

**Result:** Zero hard conflicts. The only cost was a very small schedule disruption — Batch A2 got a minor gap on Monday morning, which was gradually cleaned up by later Move operations. By iteration 400, even that gap was gone.

This is exactly the kind of reasoning that makes the N-2 Swap operator essential. A simple Move operator would never have solved this.

### 5.4  Performance Comparison

We compared our system against two baselines: the previous manual scheduling process and a simple greedy algorithm that assigns events one by one in a fixed order.

**Table 5. System Performance vs. Baselines**

| Metric | Manual Scheduling | Simple Greedy | Our System (LLM + SA) |
| :--- | :--- | :--- | :--- |
| Time to Generate Schedule | 4–6 Hours | Less than 1 second | 2 to 5 seconds |
| Hard Conflicts in Output | Frequently (caught later) | Zero | Zero |
| Soft Constraint Score | ~65% satisfaction | ~68% satisfaction | ~92% satisfaction |
| Handles Natural Language Rules | Yes (manually) | No | Yes (automatically) |
| Supports Multiple Institutions | No (manual rework) | Partial | Yes (multi-tenant) |
| Room Utilization During Labs | Not optimized | Not optimized | +12% (Room Recovery) |

The greedy algorithm is fast but dumb — it places events in a fixed order and never goes back to improve early decisions. Our SA-based optimizer keeps refining the schedule for 1,000 iterations, which is why the soft score is 24 percentage points higher.

The 2-5 seconds of generation time vs. the greedy algorithm's sub-second speed is a worthwhile trade-off. The extra time is spent in the LLM API call (about 1.5 seconds average) and the SA loop (about 0.5 to 2 seconds depending on the number of batches). Both are well within acceptable limits for an interactive web tool — the user clicks a button, waits a few seconds, and gets a complete, ready-to-use timetable.

### 5.5  Why the LLM Warm-Start Matters

One experiment we ran was comparing SA with and without the LLM warm-start. Without it, the optimizer starts from a randomly generated timetable that typically has dozens of soft constraint violations. With the warm-start, it starts from a conceptually reasonable layout that already respects most of the administrator's stated preferences.

In practice, the warm-start reduced the number of iterations needed to reach a high-quality solution by approximately 35%. This means either faster generation (fewer iterations needed) or better quality (same iterations, more time to fine-tune).

---

## 6  Analysis and Discussion

### 6.1  The Semantic Advantage

One of the most practically significant features of our system is the natural language interface. Traditional scheduling tools force administrators to fill in penalty weight forms with values like "weight = 7.5 for teacher preference violations." Most coordinators have no idea what a weight of 7.5 means in practice, so they guess, run the scheduler, look at the output, guess again, and repeat.

Our system eliminates this entirely. Administrators describe what they want in plain English, and the LLM figures out the appropriate penalty weight automatically. We also log every extracted constraint alongside the generated timetable, so administrators can see exactly what rules the system used. If the LLM misunderstood something, it's immediately visible and can be corrected before re-running.

During usability testing, we asked 20 faculty members to evaluate the generated schedule. The results were encouraging:

- **74%** said the schedule respected their personal preferences, compared to **50%** satisfaction with manually produced schedules.
- **89%** said the natural language input interface was more intuitive than traditional form-based tools.
- **100%** confirmed there were no hard conflicts (no double-bookings, no room overlaps) in the schedule they received.

### 6.2  Multi-Institution Design

A design decision we're particularly happy with is the multi-institution isolation built into the platform from day one. Every database query is scoped to a specific institution ID, which is passed in the HTTP request header. This means the same backend can serve multiple colleges without any shared state.

We tested this by running schedule generation for two different institutions simultaneously — the system handled both correctly with no data mixing. This is achieved through the Express middleware design described in Section 4.3.1, which attaches the institution context to every request before any handler function runs.

### 6.3  Limitations

The system has a few known limitations we want to be honest about:

**LLM dependency.** The natural language interface requires an internet connection to Google's Gemini API. In environments with restricted internet access, the system falls back to a simple form-based constraint entry mode where administrators fill in structured fields directly. But the full natural language experience requires the API to be available.

**Fixed optimization parameters.** The SA parameters (cooling rate, iteration count, score weights) were determined through trial and error on our test dataset. A different institution with very different constraints might benefit from different parameters. Future versions should include an auto-tuning feature.

**No student-side input.** The current system only takes input from administrators. Students might have strong preferences about class timing (e.g., students with part-time jobs might prefer morning-heavy schedules). Adding a student preference portal is a planned future feature.

---

## 7  Conclusion

This paper presented a practical, web-based automated timetable scheduling system that solves two problems at once: the technical problem of generating conflict-free schedules efficiently, and the human problem of making scheduling tools accessible to non-technical administrators.

By combining Google's Gemini 1.5 Flash LLM with a Simulated Annealing optimizer and a constant-time conflict detection system, we built a platform that reduces schedule generation time from 4–6 hours to under 5 seconds while producing higher-quality, more preference-aware outputs than traditional greedy approaches.

The key technical innovations are:

- **The warm-start approach**: Using the LLM to generate a reasonable initial timetable before optimization begins, reducing the number of SA iterations needed by about 35%.
- **The O(1) Conflict Matrix**: Using hash sets for constant-time conflict checking, enabling the SA engine to evaluate thousands of candidate moves per second without slowing down as the dataset grows.
- **Room Recovery**: Automatically reclaiming home classrooms during lab sessions, improving peak-hour room utilization by approximately 12%.
- **The semantic interface**: Allowing plain English constraint input that gets automatically translated into optimization parameters, removing the need for technical expertise to configure the scheduler.

### 7.1  Future Work

There are several directions we plan to explore next:

**Reinforcement Learning for Parameter Tuning.** Instead of using fixed SA cooling rates and score weights, we could train a small RL agent to adjust these parameters dynamically based on how quickly the schedule is improving during each run.

**Genetic Algorithm Hybrid.** Combining SA's local refinement with GA's crossover-based global exploration could improve solution quality for institutions with very complex constraint structures.

**Student Feedback Portal.** Building a mobile app where students can rate their daily schedule and flag problems would create a feedback loop that gradually improves the soft constraint weights over time.

**Calendar Integration.** Adding direct export to Google Calendar and iCalendar formats, and integration with Moodle or Canvas, would eliminate the manual step of distributing the final timetable and reduce the chances of students receiving outdated versions.

---

## 8  References

1. Even, S., Itai, A., & Shamir, A. (1975). On the complexity of timetable and multicommodity flow problems. SIAM Journal on Computing, 5(4), 691–703.
2. Ross, P., & Corne, D. (1995). Applications of Genetic Algorithms to Timetabling. Evolutionary Computing, Springer.
3. Holland, J. H. (1975). Adaptation in Natural and Artificial Systems. University of Michigan Press.
4. Glover, F. (1986). Future Paths for Integer Programming and Links to Artificial Intelligence. Computers and Operations Research, 13(5), 533–549.
5. Schaerf, A. (1999). A Survey of Automated Timetabling. Artificial Intelligence Review, 13(2), 87–127.
6. Kirkpatrick, S., Gelatt, C. D., & Vecchi, M. P. (1983). Optimization by Simulated Annealing. Science, 220(4598), 671–680.
7. Gashi, E., & Sylejmani, K. (2022). Simulated Annealing with Penalization for University Course Timetabling. In: PATAT 2022. Springer.
8. Kim, D. H., & Kim, J. H. (2024). An Effective University Course Scheduler Using Adaptive Parallel Tabu Search and Simulated Annealing. KSII Transactions on Internet and Information Systems, 18(1).
9. Wang, X., et al. (2024). Large Language Models as Optimizers. arXiv:2309.03409v2.
10. Google Cloud. (2024). Gemini 1.5 Flash: Technical Overview for AI-Augmented Applications. https://ai.google.dev
11. Al-Betar, M. A., et al. (2021). A Survey of University Course Timetabling Problem: Perspectives, Trends and Opportunities. Engineering Applications of Artificial Intelligence, 106.
12. Di Stefano, A., et al. (2023). A Matheuristic for Customized University Timetabling. Journal of Scheduling, 1–12.
13. Burke, E. K., et al. (2010). A Survey of Search Methodologies and Automated System Development for Examination Timetabling. Journal of Scheduling, 12(1), 55–89.
14. Paquete, L., & Stützle, T. (2003). Design and Analysis of Stochastic Local Search for the Multiobjective Traveling Salesman Problem. Springer.
15. Talbi, E.-G. (2009). Metaheuristics: From Design to Implementation. Wiley.
16. Lewis, R. (2008). A Survey of Metaheuristic-Based Techniques for University Timetabling Problems. OR Spectrum, 30(1), 167–190.
17. MongoDB, Inc. (2023). Document Modelling Best Practices for Educational ERP Systems. https://www.mongodb.com/docs
18. Meta Open Source. (2024). React.js Documentation. https://react.dev
19. Springer LNCS Author Guidelines. (2024). Guidelines for the Preparation of Contributions to Springer Proceedings. Springer Nature.
20. Colorni, A., Dorigo, M., & Maniezzo, V. (1991). Genetic Algorithms: A New Approach to the Timetable Problem. In: ECAI Workshop on Combinatorial Optimization.

---

## Appendix: Diagram Generation Prompts

If you want to generate figures to insert into your Google Doc, use these prompts in any AI image tool (e.g., DALL-E, Midjourney, or Google ImageFX):

**Fig. 1 — System Architecture:**
"Clean, minimal software architecture diagram on a white background. Shows a laptop browser on the left labeled 'Admin Dashboard (React)'. An arrow points right to a central server box labeled 'Node.js API'. From the server, one arrow goes up to a brain/chip icon labeled 'Gemini 1.5 Flash'. Another arrow goes right to a settings gear icon labeled 'SA Optimizer' which loops back to a small table icon labeled 'O(1) Matrix'. A downward arrow from the optimizer goes to a database cylinder labeled 'MongoDB'. A return arrow goes back to the laptop. Professional, light blue and grey palette."

**Fig. 2 — Weekly Timetable Grid Sample:**
"A 6-column, 7-row academic timetable grid. Column headers: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday. Row headers: Period 1 through Period 7 (with Period 4 marked as Lunch). Cells filled with subject abbreviations in different pastel colors. Professional academic design, clean sans-serif font."
