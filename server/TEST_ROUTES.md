# Testing Timetable Routes

## Prerequisites

1. Install dependencies (run `setup-backend.bat` or manual npm install)
2. Start MongoDB locally or use MongoDB Atlas
3. Create `.env` file from `.env.example` and configure MongoDB URI
4. Start server: `npm run dev`

## Available Routes

### 1. Health Check
```
GET http://localhost:4000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "Server running"
}
```

### 2. Generate Timetable (Placeholder)
```
POST http://localhost:4000/api/timetables/generate
Content-Type: application/json

{
  "courses": [],
  "teachers": [],
  "rooms": [],
  "constraintsText": "No labs on Friday"
}
```

Expected response:
```json
{
  "message": "generate placeholder"
}
```

### 3. Validate Timetable (Placeholder)
```
POST http://localhost:4000/api/timetables/validate
Content-Type: application/json

{
  "timetable": {}
}
```

Expected response:
```json
{
  "message": "validate placeholder"
}
```

### 4. Get Timetable by ID
```
GET http://localhost:4000/api/timetables/:id
```

Replace `:id` with actual MongoDB ObjectId.

### 5. Get Timetable Metrics
```
GET http://localhost:4000/api/timetables/:id/metrics
```

Replace `:id` with actual MongoDB ObjectId.

## Testing with cURL

```bash
# Health check
curl http://localhost:4000/api/health

# Generate (placeholder)
curl -X POST http://localhost:4000/api/timetables/generate \
  -H "Content-Type: application/json" \
  -d '{"courses":[],"teachers":[],"rooms":[],"constraintsText":"test"}'

# Validate (placeholder)
curl -X POST http://localhost:4000/api/timetables/validate \
  -H "Content-Type: application/json" \
  -d '{"timetable":{}}'
```

## Next Steps

Once LLM service and validator are implemented:
- `/generate` will call Gemini API and return actual timetable
- `/validate` will check constraints and return metrics
- Both routes will store/retrieve from MongoDB
