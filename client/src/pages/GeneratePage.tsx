import { useState, useEffect } from "react";
import { generateTimetables, getBatches } from "../api";
import { extractRooms, extractFaculty, extractSubjects } from "../realMockData";

export function GeneratePage() {
  const [loading, setLoading] = useState(false);
  const [constraints, setConstraints] = useState("");
  const [batches, setBatches] = useState<any[]>([]);
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const b = await getBatches();
      setBatches(b);
    } catch (err) {
      console.error("Failed to fetch batches");
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setStatus("Parsing constraints...");
    
    // In a real app, these would come from state/form
    const request = {
      courses: extractSubjects(),
      teachers: extractFaculty(),
      rooms: extractRooms(),
      batches: batches,
      constraintsText: constraints,
      metadata: { generatedAt: new Date().toISOString() }
    };

    try {
      setStatus("Generating optimized schedule with AI...");
      await generateTimetables(request);
      setStatus("Success! Timetables saved to cloud.");
      alert("Timetables generated and saved successfully!");
    } catch (err: any) {
      setStatus(`Error: ${err.message}`);
      alert("Generation failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-50 mb-2">Generate Timetables</h1>
        <p className="text-slate-400">Use AI to create optimized schedules based on your requirements.</p>
      </div>

      <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Specific Constraints (Optional)
          </label>
          <textarea
            value={constraints}
            onChange={(e) => setConstraints(e.target.value)}
            placeholder="Example: Prof. Rajesh cannot teach on Tuesdays. Don't schedule NLP in the last period. Ensure B.E VII SEM has at least 2 lab sessions."
            className="w-full h-40 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-100 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Batches</p>
            <p className="text-xl font-bold text-blue-400">{batches.length}</p>
          </div>
          <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Faculty</p>
            <p className="text-xl font-bold text-green-400">{extractFaculty().length}</p>
          </div>
          <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Rooms</p>
            <p className="text-xl font-bold text-purple-400">{extractRooms().length}</p>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || batches.length === 0}
          className={`w-full py-4 rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-3 ${
            loading 
              ? "bg-slate-700 text-slate-400 cursor-not-allowed" 
              : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-50 to-purple-500 text-white shadow-lg shadow-blue-900/20"
          }`}
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-slate-400 border-t-white rounded-full animate-spin"></div>
              {status}
            </>
          ) : (
            <>
              <span>🚀</span>
              Generate Schedules
            </>
          )}
        </button>
        
        {status && !loading && (
          <p className={`text-center text-sm font-medium ${status.startsWith("Error") ? "text-red-400" : "text-green-400"}`}>
            {status}
          </p>
        )}
      </div>

      <div className="bg-blue-900/20 border border-blue-800/50 p-6 rounded-xl">
        <h3 className="text-blue-400 font-bold mb-2 flex items-center gap-2">
          <span>💡</span> AI Suggestion
        </h3>
        <p className="text-slate-300 text-sm leading-relaxed">
          The AI works best when you are specific about your constraints. Mention teacher availability, room preferences, or specific subject combinations you want to avoid.
        </p>
      </div>
    </div>
  );
}
