# 🚀 Quick Reference Card

## Start the Application

```bash
# Terminal 1 - Backend
cd automated-timetable-scheduler/server
npm run dev

# Terminal 2 - Frontend  
cd automated-timetable-scheduler/client
npm run dev

# Browser
http://localhost:5173
```

## Generate Timetables

1. Open http://localhost:5173
2. Review pre-filled data (or modify)
3. Click "🚀 Generate Timetable"
4. Wait 2-5 seconds
5. View switches to timetables automatically

## View Timetables

- **Tabs**: IT-3A, IT-3B, IT-5A, IT-5B
- **Click tab**: Switch between timetables
- **Click cell**: Edit course code
- **Export PDF**: Print or save
- **Regenerate**: Generate new timetables
- **Back to Setup**: Return to configuration

## Sample Data Included

- **4 Batches**: IT-3A, IT-3B, IT-5A, IT-5B
- **24 Courses**: PP, DBS, AI, OS, SE, FSD, etc.
- **10 Teachers**: Real faculty names
- **6 Rooms**: N304, N314, N305, N313, Lab1, Lab2

## API Endpoints

```bash
# Generate timetables
POST http://localhost:4000/api/timetables/generate

# Validate timetable
POST http://localhost:4000/api/timetables/validate

# Get timetable by ID
GET http://localhost:4000/api/timetables/:id

# Get metrics
GET http://localhost:4000/api/timetables/:id/metrics
```

## Key Features

✅ Multi-timetable generation  
✅ Batch-aware scheduling  
✅ No teacher conflicts  
✅ Multi-slot labs  
✅ Real-time editing  
✅ PDF export  
✅ Mock data fallback  
✅ Metrics dashboard

## File Structure

```
automated-timetable-scheduler/
├── client/                 # Frontend (React)
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── App.tsx        # Main app
│   │   ├── api.ts         # API helpers
│   │   └── mockData.ts    # Sample data
│   └── package.json
│
├── server/                 # Backend (Express)
│   ├── src/
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   └── index.ts       # Server entry
│   └── package.json
│
└── Documentation/
    ├── INTEGRATION_COMPLETE.md
    ├── TEST_INTEGRATION.md
    ├── CURRENT_STATUS.md
    ├── WHATS_NEW.md
    └── QUICK_REFERENCE.md (this file)
```

## Common Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests (if available)
npm test
```

## Troubleshooting

### Backend not starting
```bash
cd server
npm install
npm run dev
```

### Frontend not starting
```bash
cd client
npm install
npm run dev
```

### Port already in use
```bash
# Kill process on port 4000 (backend)
npx kill-port 4000

# Kill process on port 5173 (frontend)
npx kill-port 5173
```

### MongoDB connection error
- MongoDB is optional for basic functionality
- Comment out MongoDB connection in server/src/index.ts if needed

## Documentation

- `README.md` - Project overview
- `PRODUCT_SPEC.md` - Requirements
- `INTEGRATION_COMPLETE.md` - Technical details
- `TEST_INTEGRATION.md` - Testing guide
- `CURRENT_STATUS.md` - Project status
- `WHATS_NEW.md` - Recent changes
- `QUICK_REFERENCE.md` - This file

## Support

Check these in order:
1. Backend logs (Terminal 1)
2. Browser console (F12)
3. Network tab (F12 → Network)
4. `TEST_INTEGRATION.md` troubleshooting

## Next Steps

1. ✅ Test the integration
2. ⏭️ Add subject mapping
3. ⏭️ Implement room assignment
4. ⏭️ Add persistence (MongoDB)
5. ⏭️ Enhanced scheduling algorithm

---

**Quick Start**: `cd server && npm run dev` + `cd client && npm run dev` + Open http://localhost:5173
