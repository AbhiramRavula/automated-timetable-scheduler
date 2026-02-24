# Quick Start Guide

## 🚀 Get Up and Running in 5 Minutes

### 1. Get MongoDB URI

**Easiest Option - MongoDB Atlas (Free Cloud Database):**
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up → Create free cluster (M0)
3. Create database user (username + password)
4. Whitelist your IP (or allow all: 0.0.0.0/0)
5. Get connection string from "Connect" button
6. It looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/timetable-scheduler`

**OR Local MongoDB:**
- Install from https://www.mongodb.com/try/download/community
- Use: `mongodb://localhost:27017/timetable-scheduler`

### 2. Setup Backend

```bash
# In automated-timetable-scheduler folder:
cd server

# Install dependencies (or double-click setup-backend.bat)
npm install express mongoose cors dotenv
npm install -D typescript ts-node-dev @types/node @types/express @types/cors

# Create .env file
copy .env.example .env

# Edit .env and add your MongoDB URI:
# MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/timetable-scheduler
```

### 3. Setup Frontend

```bash
# In automated-timetable-scheduler folder:
cd client

# Install dependencies (or double-click setup-frontend.bat)
npm install react react-dom
npm install -D @vitejs/plugin-react vite typescript @types/react @types/react-dom
npm install -D tailwindcss postcss autoprefixer
```

### 4. Run Both Servers

**Terminal 1 - Backend:**
```bash
cd automated-timetable-scheduler/server
npm run dev
```
Or double-click `server/run-backend.bat`

**Terminal 2 - Frontend:**
```bash
cd automated-timetable-scheduler/client
npm run dev
```
Or double-click `client/run-frontend.bat`

### 5. Test It

- Backend: http://localhost:4000/api/health
- Frontend: http://localhost:5173

You should see:
- Backend: `{"status":"ok","message":"Server running"}`
- Frontend: "AI Timetable Scheduler – Frontend OK ✅"

---

## 📁 Project Structure

```
automated-timetable-scheduler/
├── server/              # Backend (Express + MongoDB)
│   ├── src/
│   │   ├── models/      # Mongoose models
│   │   ├── routes/      # API routes
│   │   ├── services/    # LLM + Validator
│   │   └── index.ts     # Entry point
│   ├── .env             # Your config (create this!)
│   ├── run-backend.bat  # Quick start script
│   └── package.json
│
└── client/              # Frontend (React + Vite)
    ├── src/
    │   ├── App.tsx      # Main component
    │   └── main.tsx     # Entry point
    ├── run-frontend.bat # Quick start script
    └── package.json
```

---

## ❓ Need Help?

See `RUNNING_GUIDE.md` for detailed instructions and troubleshooting.
