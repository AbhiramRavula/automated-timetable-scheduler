# Running the Application

## Step 1: MongoDB Setup

### Option A: MongoDB Atlas (Cloud - Easiest)

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up for a free account
3. Create a new project (e.g., "Timetable Scheduler")
4. Click "Build a Database" → Choose "M0 Free" tier
5. Choose a cloud provider and region (any will work)
6. Create cluster (takes 1-3 minutes)
7. Set up database access:
   - Click "Database Access" in left sidebar
   - Add new database user
   - Choose "Password" authentication
   - Username: `admin` (or your choice)
   - Password: Generate or create a secure password
   - User Privileges: "Atlas admin" or "Read and write to any database"
   - Click "Add User"
8. Set up network access:
   - Click "Network Access" in left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - Click "Confirm"
9. Get connection string:
   - Go back to "Database" (left sidebar)
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like):
     ```
     mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - Replace `<password>` with your actual password
   - Add database name: `mongodb+srv://admin:yourpassword@cluster0.xxxxx.mongodb.net/timetable-scheduler?retryWrites=true&w=majority`

### Option B: Local MongoDB (Requires Installation)

1. Download MongoDB Community Server:
   - Windows: https://www.mongodb.com/try/download/community
   - Choose "Windows" and "msi" package
2. Install MongoDB:
   - Run the installer
   - Choose "Complete" installation
   - Install as a Windows Service (recommended)
   - Install MongoDB Compass (GUI tool - optional but helpful)
3. MongoDB will automatically start on: `mongodb://localhost:27017`
4. Your connection string: `mongodb://localhost:27017/timetable-scheduler`

## Step 2: Configure Environment Variables

1. Navigate to `automated-timetable-scheduler/server/`
2. Copy `.env.example` to `.env`:
   ```bash
   copy .env.example .env
   ```
3. Open `.env` and update:
   ```
   PORT=4000
   MONGODB_URI=your_mongodb_uri_here
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

Example `.env` file:
```
PORT=4000
MONGODB_URI=mongodb+srv://admin:mypassword@cluster0.xxxxx.mongodb.net/timetable-scheduler?retryWrites=true&w=majority
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

## Step 3: Install Dependencies

### Backend
Open a terminal in `automated-timetable-scheduler/`:
```bash
cd server
npm install express mongoose cors dotenv
npm install -D typescript ts-node-dev @types/node @types/express @types/cors
```

Or simply double-click `setup-backend.bat`

### Frontend
Open another terminal in `automated-timetable-scheduler/`:
```bash
cd client
npm install react react-dom
npm install -D @vitejs/plugin-react vite typescript @types/react @types/react-dom
npm install -D tailwindcss postcss autoprefixer
```

Or simply double-click `setup-frontend.bat`

## Step 4: Run Backend and Frontend Separately

### Terminal 1: Run Backend Server

```bash
# Navigate to server folder
cd automated-timetable-scheduler/server

# Start the backend
npm run dev
```

You should see:
```
Server on 4000
MongoDB connected
```

Test it: Open browser to http://localhost:4000/api/health

### Terminal 2: Run Frontend Client

Open a NEW terminal (keep the first one running):

```bash
# Navigate to client folder
cd automated-timetable-scheduler/client

# Start the frontend
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

Open browser to http://localhost:5173

## Quick Start Scripts (Windows)

I'll create batch files to make this easier...

### Run Backend
Double-click `run-backend.bat` in the server folder

### Run Frontend
Double-click `run-frontend.bat` in the client folder

## Troubleshooting

### MongoDB Connection Error
- Check your `.env` file has correct MONGODB_URI
- If using Atlas, verify IP whitelist includes your IP
- If using local MongoDB, ensure MongoDB service is running

### Port Already in Use
- Backend (4000): Change PORT in `.env`
- Frontend (5173): Change port in `client/vite.config.ts`

### Module Not Found Errors
- Run `npm install` in the respective folder (server or client)
- Delete `node_modules` and `package-lock.json`, then run `npm install` again

## Verify Everything Works

1. Backend health check: http://localhost:4000/api/health
   - Should return: `{"status":"ok","message":"Server running"}`

2. Frontend: http://localhost:5173
   - Should display: "AI Timetable Scheduler – Frontend OK ✅"

3. Check MongoDB connection in backend terminal:
   - Should see: "MongoDB connected"
