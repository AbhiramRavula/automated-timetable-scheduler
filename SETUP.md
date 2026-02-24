# Setup Instructions

## Quick Setup (Windows)

### Option 1: Run Setup Scripts

1. Open the `automated-timetable-scheduler` folder
2. Double-click `setup-backend.bat` to install backend dependencies
3. Double-click `setup-frontend.bat` to install frontend dependencies

### Option 2: Manual Setup

#### Backend Setup

```bash
cd automated-timetable-scheduler/server
npm install express mongoose cors dotenv
npm install -D typescript ts-node-dev @types/node @types/express @types/cors
```

#### Frontend Setup

```bash
cd automated-timetable-scheduler/client
npm install react react-dom
npm install -D @vitejs/plugin-react vite typescript @types/react @types/react-dom
npm install -D tailwindcss postcss autoprefixer
```

## Environment Configuration

1. Copy `server/.env.example` to `server/.env`
2. Update the values:
   ```
   PORT=4000
   MONGODB_URI=mongodb://localhost:27017/timetable-scheduler
   GEMINI_API_KEY=your_actual_gemini_api_key
   ```

## Running the Application

### Start Backend (Terminal 1)

```bash
cd automated-timetable-scheduler/server
npm run dev
```

Server will run on http://localhost:4000
Test: http://localhost:4000/api/health

### Start Frontend (Terminal 2)

```bash
cd automated-timetable-scheduler/client
npm run dev
```

Frontend will run on http://localhost:5173

## Verify Setup

1. Backend health check: http://localhost:4000/api/health
   - Should return: `{"status":"ok","message":"Server running"}`

2. Frontend: http://localhost:5173
   - Should display: "AI Timetable Scheduler – Frontend OK ✅"

## Next Steps

Once both are running successfully:
- Implement Mongoose models
- Create API routes for timetable generation
- Integrate Gemini Pro LLM
- Build validator module
- Connect frontend to backend APIs
