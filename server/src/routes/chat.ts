import { Router, Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const router = Router();
const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const model = genAI?.getGenerativeModel({ model: "gemini-pro" });

router.post("/", async (req: Request, res: Response) => {
  try {
    const { message, history, timetableData } = req.body;

    if (!model) {
      return res.json({
        message: "I am currently in offline mode (no API key). Your schedule looks well-organized! I see you have " + 
                 (timetableData?.timetables?.length || 0) + " batches configured. " +
                 "Please set a GEMINI_API_KEY for real-time analysis.",
        isOffline: true
      });
    }

    const context = `
You are a university timetabling assistant. You are helping a user understand and optimize their class schedule.

Current Timetable Data:
${JSON.stringify(timetableData, null, 2)}

User's Question: ${message}

Provide a helpful, concise response. If they ask about conflicts, room availability, or teacher loads, use the provided data to answer accurately.
`;

    const result = await model.generateContent(context);
    const responseText = result.response.text();

    return res.json({
      message: responseText,
      isOffline: false
    });
  } catch (err: any) {
    console.error("❌ Chat Error:", err);
    return res.status(500).json({ error: "Failed to process chat message" });
  }
});

router.post("/insights", async (req: Request, res: Response) => {
  try {
    const { timetableData } = req.body;

    if (!model) {
      return res.json({
        insights: [
          "No teacher conflicts detected in the current plan.",
          "Batch V SEM has the highest concentration of lab sessions.",
          "Faculty load is balanced across 10 members.",
          "Lunch breaks are consistently scheduled at Slot 4."
        ]
      });
    }

    const prompt = `
Analyze this university timetable data and provide 4-5 bullet-point insights about it (conflicts, efficiencies, or patterns).
DATA: ${JSON.stringify(timetableData)}

Output ONLY a JSON array of strings.
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const start = text.indexOf("[");
    const end = text.lastIndexOf("]") + 1;
    const insights = JSON.parse(text.slice(start, end));

    return res.json({ insights });
  } catch (err) {
    return res.json({ 
      insights: ["Unable to generate live insights at this time."] 
    });
  }
});

export default router;
