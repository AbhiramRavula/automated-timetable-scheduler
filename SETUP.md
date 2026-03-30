# 🛠️ Setup & Installation (v4.0.0)

Follow these steps for a complete local environment setup of the Automated Timetable Scheduler.

## 1. Prerequisites
- **Node.js** (v20 or higher)
- **MongoDB** (Local instance or Atlas connection)
- **Gemini API Key** (Required for LLM Optimization)

---

## 2. Backend Setup (`server/`)

### 2.1 Install Dependencies
```bash
cd server
npm install
```

### 2.2 Environment Configuration
Create a `.env` file in the `server/` root:
```ini
PORT=4000
MONGODB_URI=mongodb://localhost:27017/timetable-scheduler
GEMINI_API_KEY=your_gemini_api_key_here
CORS_ORIGIN=http://localhost:5173
```

### 2.3 Run Database Seeding
To populate the system with the **Matrusri Engineering College** dataset and a matching institutional profile:
```bash
npx ts-node src/seed.ts
```

### 2.4 Start Development Server
```bash
npm run dev
```
Test with: `http://localhost:4000/api/health`

---

## 3. Frontend Setup (`client/`)

### 3.1 Install Dependencies
```bash
cd client
npm install
```

### 3.2 Start Development Server (Vite)
```bash
npm run dev
```
Preview at: `http://localhost:5173`

---

## 🏁 Verification Checklist

- [ ] **Health Check**: `http://localhost:4000/api/health` returns `status: ok`.
- [ ] **Seeding**: MongoDB contains collections for `institutions`, `faculty`, and `batches`.
- [ ] **LLM Integration**: Check server logs after clicking "Generate" to ensure Gemini API is receiving prompts.
- [ ] **UI Rendering**: Classes page correctly displays seeded batches with "View Details" modals functional.

## 🚀 Troubleshooting
- **LLM Fails**: Ensure your `GEMINI_API_KEY` is active and billed if necessary.
- **CORS Errors**: Verify that `CORS_ORIGIN` in `.env` matches your browser URL.
- **Port Conflicts**: If port 4000 is busy, change `PORT` in `.env`.

---
**Version:** 4.0.0 (Research Edition)  
**Date:** March 30, 2026
