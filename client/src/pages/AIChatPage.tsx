import { useState, useEffect, useRef } from "react";
import { getBatches } from "../api";

interface Message {
  role: "user" | "bot";
  content: string;
}

export function AIChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", content: "Hello! I'm your AI Timetable Assistant. I've analyzed your current schedules. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<string[]>([]);
  const [data, setData] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const batches = await getBatches();
      setData({ batches });
      fetchInsights({ batches });
    } catch (err) {
      console.error("Failed to load data for AI", err);
    }
  };

  const fetchInsights = async (timetableData: any) => {
    try {
      const response = await fetch("http://localhost:4000/api/chat/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ timetableData })
      });
      const data = await response.json();
      setInsights(data.insights);
    } catch (err) {
      console.error("Failed to fetch insights", err);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch("http://localhost:4000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          timetableData: data
        })
      });
      const dataRes = await response.json();
      setMessages(prev => [...prev, { role: "bot", content: dataRes.message }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "bot", content: "Sorry, I'm having trouble connecting to my brain right now." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
      {/* Sidebar: Insights */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 h-full overflow-y-auto">
          <h2 className="text-xl font-bold text-slate-50 mb-4 flex items-center gap-2">
            <span>✨</span> AI Insights
          </h2>
          <div className="space-y-4">
            {insights.length > 0 ? (
              insights.map((insight, idx) => (
                <div key={idx} className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/50 text-sm text-slate-300 leading-relaxed">
                  {insight}
                </div>
              ))
            ) : (
              <div className="animate-pulse space-y-3">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-slate-700/50 rounded-lg"></div>)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main: Chat Window */}
      <div className="lg:col-span-2 flex flex-col bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        {/* Chat Header */}
        <div className="p-4 bg-slate-900 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-xl">
              🤖
            </div>
            <div>
              <h3 className="font-bold text-slate-50">Schedule Assistant</h3>
              <p className="text-xs text-green-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-400"></span> Online
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] p-4 rounded-2xl ${
                msg.role === "user" 
                  ? "bg-blue-600 text-white rounded-tr-none" 
                  : "bg-slate-900 text-slate-200 rounded-tl-none border border-slate-700"
              }`}>
                <p className="text-sm leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-900 p-4 rounded-2xl rounded-tl-none border border-slate-700 flex gap-1">
                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="p-4 bg-slate-900 border-t border-slate-700">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Ask about rooms, teachers, or conflicts..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button
              onClick={handleSend}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
