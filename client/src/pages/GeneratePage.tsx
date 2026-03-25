import { useState, useEffect } from "react";
import { generateTimetables, getBatches, getFaculty, getRooms, getSubjects } from "../api";
import { TimetableDisplay } from "../components/TimetableDisplay";
const timeSlots = [
  { name: "Period 1", startTime: "9.40am",  endTime: "10.40am" },
  { name: "Period 2", startTime: "10:40am", endTime: "11:40am" },
  { name: "Period 3", startTime: "11:40am", endTime: "12:40pm" },
  { name: "Period 4", startTime: "12:40pm", endTime: "1:40pm"  },
  { name: "LUNCH",   startTime: "1:40pm",   endTime: "2:10pm"  },
  { name: "Period 6", startTime: "2:10pm",  endTime: "3:10pm"  },
  { name: "Period 7", startTime: "3:10pm",  endTime: "4:10pm"  },
];

function getSubjectsLookup(facultyMapping: any[]): Record<string, { name: string; faculty: string; code?: string }> {
  const map: Record<string, { name: string; faculty: string; code?: string }> = {
    LIB: { name: "Library", faculty: "-" },
    SPORTS: { name: "Sports", faculty: "-" },
    CRT: { name: "Critical Reasoning & Thinking", faculty: "Various" },
    LUNCH: { name: "Lunch Break", faculty: "-" },
  };
  (facultyMapping || []).forEach((fm: any) => {
    if (fm.abbr || fm.code) {
      map[fm.abbr || fm.code] = { name: fm.subject, faculty: fm.faculty, code: fm.code };
    }
  });
  return map;
}

export function GeneratePage() {
  const [loading, setLoading] = useState(false);
  const [constraints, setConstraints] = useState("");
  const [batches, setBatches] = useState<any[]>([]);
  const [faculty, setFaculty] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [b, f, r, s] = await Promise.all([
        getBatches(),
        getFaculty(),
        getRooms(),
        getSubjects()
      ]);
      setBatches(b);
      setFaculty(f);
      setRooms(r);
      setSubjects(s);
    } catch (err) {
      console.error("Failed to fetch data", err);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setStatus("Parsing constraints...");
    
    // In a real app, these would come from state/form
    const request = {
      courses: subjects,
      teachers: faculty,
      rooms: rooms,
      batches: batches,
      constraintsText: constraints,
      metadata: { generatedAt: new Date().toISOString() }
    };

    try {
      setStatus("Generating optimized schedule with AI...");
      const result = await generateTimetables(request);
      
      if (result.limitReached) {
        setStatus("⚠️ API Limit Reached: Offline fallback used.");
      } else {
        setStatus("Success! Timetables generated.");
      }
      setResults(result.timetables || []);
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
            <p className="text-xl font-bold text-green-400">{faculty.length}</p>
          </div>
          <div className="p-4 bg-slate-900 rounded-lg border border-slate-700">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Rooms</p>
            <p className="text-xl font-bold text-purple-400">{rooms.length}</p>
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

      {results.length > 0 && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-50">Generated Results</h2>
            <p className="text-slate-400 text-sm">{results.length} batches processed</p>
          </div>
          
          <div className="grid grid-cols-1 gap-12">
            {results.map((tt, idx) => (
              <div key={idx} className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-2xl">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-blue-400">{tt.class}</h3>
                  <div className="flex gap-2">
                    <span className="px-2 py-1 bg-slate-900 rounded text-xs text-slate-400">Room: {tt.room || tt.room_no || 'TBA'}</span>
                    <span className="px-2 py-1 bg-slate-900 rounded text-xs text-slate-400">Teacher: {tt.classTeacher || tt.class_teacher || 'TBA'}</span>
                  </div>
                </div>
                <div className="bg-white rounded-lg overflow-hidden">
                  <TimetableDisplay
                    key={`new-${idx}-${results.length}`} // Force reset on new results
                    timetable={{
                      ...tt,
                      id: `new-${idx}`,
                      schedule: tt.schedule || {}
                    }}
                    subjects={getSubjectsLookup(tt.faculty_mapping || [])}
                    timeSlots={timeSlots}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
