# 🧪 Testing the Backend-Frontend Integration

## Quick Test Guide

Follow these steps to test the newly integrated multi-timetable generation system.

## Prerequisites

- Backend running on http://localhost:4000
- Frontend running on http://localhost:5173
- MongoDB running (optional, not required for basic testing)

## Test Scenario 1: Generate Multiple Timetables

### Step 1: Start the Servers

**Terminal 1 - Backend:**
```bash
cd automated-timetable-scheduler/server
npm run dev
```

Wait for: `✅ Server running on http://localhost:4000`

**Terminal 2 - Frontend:**
```bash
cd automated-timetable-scheduler/client
npm run dev
```

Wait for: `Local: http://localhost:5173/`

### Step 2: Open the Application

1. Open browser: http://localhost:5173
2. You should see the Setup view with pre-filled data

### Step 3: Review Pre-filled Data

The app comes with realistic sample data:

**Metadata:**
- Institution: ABC College of Engineering
- 500 students, 4 classes, 3 sections
- 25 subjects, 8 labs
- 5 working days, 6 periods per day

**Batches (4):**
- IT-3A (60 students)
- IT-3B (60 students)
- IT-5A (55 students)
- IT-5B (55 students)

**Courses (24):**
- III SEM courses: PP, DBS, FA, BE, DM, DE + Labs
- V SEM courses: AI, OS, SE, FSD + Labs

**Teachers (10):**
- Real faculty names from your timetable images

**Rooms (6):**
- N304, N314, N305, N313, Lab1, Lab2

### Step 4: Generate Timetables

1. Scroll down to "Scheduling Constraints"
2. Review the constraint text (or modify it)
3. Click **"🚀 Generate Timetable"** button
4. Wait 2-5 seconds for generation

**Expected Backend Logs:**
```
📝 Received request to generate timetable
Courses: 24
Teachers: 10
Rooms: 6
Batches: 4
🤖 Parsing constraints...
✅ Constraints parsed: [...]
🤖 Proposing schedule...
⚠️ No Gemini model available, using simple scheduling algorithm
✅ Schedule proposed: 24 events
✅ Validating and scoring...
```

### Step 5: View Generated Timetables

After generation completes:

1. **View automatically switches to Timetables view**
2. **You should see 4 tabs:**
   - IT-3A
   - IT-3B
   - IT-5A
   - IT-5B

3. **Each tab shows a complete timetable:**
   - Monday through Saturday
   - 7 periods (including lunch)
   - Course codes in cells
   - Multi-slot labs with merged cells

### Step 6: Test Tab Navigation

1. Click on different tabs (IT-3A, IT-3B, etc.)
2. Each should show a different timetable
3. Verify courses are different for each batch

### Step 7: Test Cell Editing

1. Click on any cell with a course code
2. Type a new value (e.g., "TEST")
3. Press Enter or click outside
4. Cell should update immediately
5. Changes are saved in local state

### Step 8: Test Export

1. Click **"📄 Export All as PDF"** button
2. Print dialog should open
3. Preview should show all timetables
4. You can save as PDF or print

### Step 9: Test Regeneration

1. Click **"🔄 Regenerate All"** button
2. Should trigger generation again
3. New timetables should replace old ones

### Step 10: Return to Setup

1. Click **"← Back to Setup"** in navigation
2. Should return to setup view
3. All your data should still be there
4. Metrics should still be visible in sidebar

## Test Scenario 2: Mock Data Fallback

### Step 1: View Timetables Without Generating

1. Open http://localhost:5173
2. Click **"📅 View All Timetables"** button (top right)
3. Should see timetables view with mock data
4. Warning message: "⚠️ Showing mock data..."

### Step 2: Verify Mock Data

1. Should see 5 tabs (from mockData.ts):
   - B.E III SEM - IT SEC-A
   - B.E III SEM - IT SEC-B
   - B.E VII SEM - IT
   - B.E V SEM - IT SEC-B
   - B.E V SEM - IT SEC-A

2. These are the real timetables from your images
3. All subjects should have full names in legend
4. Faculty names should be visible

### Step 3: Generate Real Data

1. Click **"← Back to Setup"**
2. Click **"🚀 Generate Timetable"**
3. View switches to timetables
4. Warning message should disappear
5. Should now show 4 tabs (IT-3A, IT-3B, IT-5A, IT-5B)

## Test Scenario 3: API Testing

### Test with curl

```bash
curl -X POST http://localhost:4000/api/timetables/generate \
  -H "Content-Type: application/json" \
  -d '{
    "courses": [
      {"code":"CS101","name":"Intro","durationSlots":1,"teacherCode":"T1","batch":"IT-3A"}
    ],
    "teachers": [
      {"code":"T1","name":"Dr. Smith"}
    ],
    "rooms": [
      {"name":"R101","capacity":40}
    ],
    "batches": [
      {"name":"IT-3A","year":3,"department":"IT","section":"A","studentCount":60}
    ],
    "constraintsText": "No conflicts"
  }'
```

**Expected Response:**
```json
{
  "timetable": [
    {
      "courseCode": "CS101",
      "teacherCode": "T1",
      "roomName": "R101",
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
      "room": "",
      "date": "24/02/2026",
      "wef": "24/02/2026",
      "classTeacher": "",
      "schedule": {
        "MON": ["CS101", null, null, null, null, null, null],
        "TUE": [null, null, null, null, null, null, null],
        "WED": [null, null, null, null, null, null, null],
        "THU": [null, null, null, null, null, null, null],
        "FRI": [null, null, null, null, null, null, null],
        "SAT": [null, null, null, null, null, null, null]
      }
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

## Verification Checklist

### Backend
- [ ] Server starts without errors
- [ ] Accepts batches parameter
- [ ] Groups events by batch
- [ ] Returns timetables array
- [ ] No teacher conflicts across batches
- [ ] Handles multi-slot events (labs)
- [ ] Skips lunch slot (slot 4)

### Frontend
- [ ] Setup view loads with sample data
- [ ] Generate button works
- [ ] Switches to timetables view after generation
- [ ] Shows correct number of tabs
- [ ] Each tab shows different timetable
- [ ] Cell editing works
- [ ] Export button opens print dialog
- [ ] Regenerate button works
- [ ] Back to setup button works
- [ ] Mock data fallback works
- [ ] Warning shows when using mock data

### Data Flow
- [ ] Batches sent to backend
- [ ] Backend returns timetables array
- [ ] Frontend stores timetables in state
- [ ] AllTimetablesView receives timetables
- [ ] Timetables display correctly
- [ ] Metrics show in sidebar

## Common Issues

### Issue: "Failed to generate timetable"

**Cause:** Backend not running or wrong port

**Solution:**
```bash
cd automated-timetable-scheduler/server
npm run dev
```

### Issue: No timetables showing after generation

**Cause:** Response format mismatch

**Solution:**
1. Check browser console for errors
2. Check network tab for API response
3. Verify backend logs

### Issue: Mock data showing instead of real data

**Cause:** This is expected behavior

**Solution:**
- Click "Generate Timetable" in Setup view
- System will switch to real data automatically

### Issue: Timetables look empty

**Cause:** Not enough courses or scheduling failed

**Solution:**
1. Add more courses in Setup view
2. Ensure courses have valid batch assignments
3. Check backend logs for errors

## Success Indicators

✅ **Backend:**
- Logs show "Schedule proposed: X events"
- No errors in console
- Returns timetables array

✅ **Frontend:**
- Switches to timetables view
- Shows tabs for each batch
- Timetables display with course codes
- No console errors

✅ **Integration:**
- Data flows from setup to backend
- Backend returns formatted timetables
- Frontend displays timetables correctly
- Editing works
- Export works

## Next Steps After Testing

If all tests pass:

1. **Add Subject Mapping:**
   - Create subjects database
   - Map course codes to full names
   - Display in legend

2. **Enhance Scheduling:**
   - Better slot placement algorithm
   - Respect unavailable slots
   - Optimize for soft constraints

3. **Add Persistence:**
   - Save to MongoDB
   - Load previous timetables
   - Version history

4. **Advanced Features:**
   - Drag-and-drop editing
   - Real-time conflict detection
   - Multiple view toggles

---

**Happy Testing! 🎉**

If you encounter any issues, check:
1. Backend logs
2. Browser console
3. Network tab
4. This guide's troubleshooting section
