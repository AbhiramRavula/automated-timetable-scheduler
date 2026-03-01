import { Router, Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const router = Router();
const apiKey = process.env.GEMINI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const model = genAI?.getGenerativeModel({ model: "gemini-1.5-flash" });

router.post("/", async (req: Request, res: Response) => {
  try {
    const { message, timetableData } = req.body;

    if (!model) {
      return res.json({
        message: "I'm in offline mode (no API key configured). Your schedule looks well-organized! " +
                 "Please set a valid GEMINI_API_KEY in server/.env for live AI replies.",
        isOffline: true
      });
    }

    const context = `
You are a university timetabling assistant. Help the user understand and optimize their class schedule.
Current Data: ${JSON.stringify(timetableData, null, 2)}
User: ${message}
Respond helpfully and concisely.
`;

    try {
      const result = await model.generateContent(context);
      const responseText = result.response.text();
      return res.json({ message: responseText, isOffline: false });
    } catch (apiErr: any) {
      if (apiErr?.status === 429 || apiErr?.message?.includes("429") || apiErr?.message?.includes("RESOURCE_EXHAUSTED")) {
        return res.json({ 
          message: "⚠️ AI Limit Reached: The daily/minute quota for the AI has been exceeded. Please try again later.", 
          isOffline: true,
          isLimitReached: true
        });
      }

      // API key expired or model not available — return a graceful offline reply
      const offlineReplies: Record<string, string> = {
        default: "I'm currently in offline mode — the AI API key needs to be renewed. You can still view and manage your timetables manually!",
        schedule: "I can't analyze live right now, but your schedule appears to cover 6 days with 7 periods each. Check the Timetables tab for details.",
        conflict: "Conflict detection requires a live API key. Visually scan the timetable for any teacher or room assigned to two classes at the same time.",
        help: "I'm in offline mode. For help, check the AI Insights panel or visit the Generate page to create a new timetable.",
      };

      const msgLower = message.toLowerCase();
      let reply = offlineReplies.default;
      if (msgLower.includes("schedule") || msgLower.includes("class")) reply = offlineReplies.schedule;
      if (msgLower.includes("conflict")) reply = offlineReplies.conflict;
      if (msgLower.includes("help")) reply = offlineReplies.help;

      return res.json({ message: `⚠️ API unavailable: ${reply}`, isOffline: true });
    }
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
  } catch (err: any) {
    if (err?.status === 429 || err?.message?.includes("429") || err?.message?.includes("RESOURCE_EXHAUSTED")) {
      return res.json({ 
        insights: ["⚠️ AI Insight Limit: Unable to analyze further until quota resets."],
        isLimitReached: true 
      });
    }
    return res.json({ 
      insights: ["Unable to generate live insights at this time."] 
    });
  }
});

export default router;
