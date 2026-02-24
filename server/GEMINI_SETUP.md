# Gemini API Setup

## Get Your API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the API key

## Add to .env File

Open `server/.env` and add your key:

```
PORT=4000
MONGODB_URI=mongodb://localhost:27017/timetable-scheduler
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

Replace `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` with your actual API key.

## Install the SDK

Run in the server folder:
```bash
npm install @google/generative-ai
```

Or double-click `INSTALL_GEMINI.bat`

## Test the Integration

1. Make sure your `.env` has the GEMINI_API_KEY
2. Start the server: `npm run dev`
3. Use the test file `test-generate.http` or send a POST request:

```bash
curl -X POST http://localhost:4000/api/timetables/generate \
  -H "Content-Type: application/json" \
  -d '{
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
  }'
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

## Troubleshooting

### "GEMINI_API_KEY not set" warning
- Check your `.env` file exists in the `server/` folder
- Make sure the key is on a line like: `GEMINI_API_KEY=your_key_here`
- Restart the server after adding the key

### API Key Invalid
- Verify the key is correct from Google AI Studio
- Make sure there are no extra spaces or quotes around the key

### Rate Limits
- Free tier has rate limits
- If you hit limits, wait a minute and try again
- Consider upgrading for production use
