# Step 4: LLM + Validator Implementation ✅

## What Was Implemented

### 1. LLM Service (`services/llmService.ts`)
- ✅ Gemini 2.0 Flash integration
- ✅ `parseConstraints()` - Converts natural language to structured constraints
- ✅ `proposeSchedule()` - Generates initial timetable using AI
- ✅ Proper error handling for missing API key

### 2. Validator (`services/validator.ts`)
- ✅ `validateAndScore()` - Validates generated schedules
- ✅ Teacher conflict detection
- ✅ Room conflict detection
- ✅ Metrics calculation (conflicts, gaps, balance, soft score)
- ✅ Returns violations list

### 3. Generate Route (`routes/timetables.ts`)
- ✅ Wired LLM service into `/generate` endpoint
- ✅ Calls `parseConstraints()` → `proposeSchedule()` → `validateAndScore()`
- ✅ Returns timetable + metrics + violations

## Next Steps to Run

### 1. Install Gemini SDK
```bash
cd server
npm install @google/generative-ai
```
Or run `INSTALL_GEMINI.bat`

### 2. Get Gemini API Key
1. Visit https://aistudio.google.com/app/apikey
2. Create API key
3. Add to `server/.env`:
   ```
   GEMINI_API_KEY=your_key_here
   ```

### 3. Restart Backend
```bash
npm run dev
```

### 4. Test the API

Use `test-generate.http` file or:

```bash
POST http://localhost:4000/api/timetables/generate
Content-Type: application/json

{
  "courses": [
    { "code": "CS101", "name": "Intro", "durationSlots": 1, "teacherCode": "T1", "batch": "B1" }
  ],
  "teachers": [
    { "code": "T1", "name": "Dr. Smith" }
  ],
  "rooms": [
    { "name": "R101", "capacity": 40 }
  ],
  "constraintsText": "No teacher conflicts, no room conflicts, prefer mid-day."
}
```

## Expected Response

```json
{
  "timetable": [
    {
      "courseCode": "CS101",
      "teacherCode": "T1",
      "roomName": "R101",
      "day": 1,
      "slot": 3,
      "duration": 1
    }
  ],
  "metrics": {
    "conflicts": 0,
    "gapScore": 0.2,
    "balanceScore": 0.8,
    "softScore": 0.8
  },
  "hardViolations": []
}
```

## Files Created/Modified

- ✅ `services/llmService.ts` - Full Gemini integration
- ✅ `services/validator.ts` - Conflict detection + scoring
- ✅ `routes/timetables.ts` - Wired services into generate endpoint
- ✅ `test-generate.http` - Easy API testing
- ✅ `GEMINI_SETUP.md` - Setup instructions
- ✅ `INSTALL_GEMINI.bat` - Quick install script
- ✅ `setup-backend.bat` - Updated with Gemini SDK

## What's Next?

Once backend is responding with timetables, the next step is:

**Frontend Integration** - Create React components to:
1. Input form for courses, teachers, rooms, constraints
2. Call `/api/timetables/generate`
3. Display timetable grid
4. Show metrics and violations
