import { useState, useEffect } from "react";
import { generateTimetables, getBatches, getFaculty, getRooms, getSubjects } from "../api";
import { TimetableDisplay } from "../components/TimetableDisplay";
import FacultyWorkloadTable, { FacultyWorkload } from "../components/FacultyWorkloadTable";
import { useInstitution } from "../context/InstitutionContext";

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
  const { activeInstitution } = useInstitution();
  const [loading, setLoading] = useState(false);
  const [constraints, setConstraints] = useState("");
  const [batches, setBatches] = useState<any[]>([]);
  const [faculty, setFaculty] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [workload, setWorkload] = useState<FacultyWorkload[]>([]);
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    if (activeInstitution) {
      fetchData();
    }
  }, [activeInstitution]);

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
    if (!activeInstitution) return;
    setLoading(true);
    setStatus("Parsing constraints...");
    
    // In a real app, these would come from state/form
    const request = {
      courses: subjects,
      teachers: faculty,
      rooms: rooms,
      batches: batches,
      constraintsText: constraints,
      metadata: { 
        generatedAt: new Date().toISOString(),
        institutionId: activeInstitution._id
      }
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
      setWorkload(result.workload || []);
    } catch (err: any) {
      setStatus(`Error: ${err.message}`);
      alert("Generation failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!activeInstitution) return <div className="p-8 text-center text-slate-400 font-medium font-bold uppercase tracking-widest">Select an institution profile to begin generation.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-50 mb-2">Build Timetables ({activeInstitution.name})</h1>
        <p className="text-slate-400">Deploy AI logic to coordinate {batches.length} batches and {faculty.length} faculty members.</p>
      </div>

      <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 space-y-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
           <span className="text-9xl font-black">AI</span>
        </div>

        <div>
          <label className="block text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-3">
            Operational Constraints
          </label>
          <textarea
            value={constraints}
            onChange={(e) => setConstraints(e.target.value)}
            placeholder="e.g. Avoid scheduling core subjects in late afternoon. Enforce faculty workload caps. Group lab sessions into 3-slot blocks."
            className="w-full h-44 bg-slate-900 border border-slate-700 rounded-xl px-5 py-4 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-all font-mono text-sm leading-relaxed"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
            <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Grid Size</p>
            <p className="text-xl font-bold text-blue-400">{batches.length} BATCHES</p>
          </div>
          <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
            <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Human Resource</p>
            <p className="text-xl font-bold text-green-400">{faculty.length} STAFF</p>
          </div>
          <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
            <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Curriculum</p>
            <p className="text-xl font-bold text-purple-400">{subjects.length} COURSES</p>
          </div>
          <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
            <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Available RM</p>
            <p className="text-xl font-bold text-orange-400">{rooms.length} UNITS</p>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || batches.length === 0}
          className={`w-full py-5 rounded-xl font-black text-xl tracking-[0.1em] transition-all flex items-center justify-center gap-4 border-2 uppercase ${
            loading 
              ? "bg-slate-700 border-slate-600 text-slate-400 cursor-not-allowed" 
              : "bg-gradient-to-br from-blue-600 to-indigo-700 border-blue-400/30 hover:border-blue-400 text-white shadow-2xl hover:scale-[1.01] active:scale-[0.99]"
          }`}
        >
          {loading ? (
            <>
              <div className="w-6 h-6 border-4 border-slate-400 border-t-white rounded-full animate-spin"></div>
              <span className="animate-pulse">{status}</span>
            </>
          ) : (
            <>
              <span>⚡</span>
              Initiate AI Logic
            </>
          )}
        </button>
        
        {status && !loading && (
          <p className={`text-center text-xs font-black uppercase tracking-widest ${status.startsWith("Error") ? "text-red-500" : "text-green-500"}`}>
            {status}
          </p>
        )}
      </div>

      {results.length > 0 && (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="flex items-center justify-between border-b border-slate-700 pb-4">
            <h2 className="text-2xl font-black text-slate-50 uppercase tracking-widest">Optimized Schedules</h2>
            <p className="text-xs font-bold text-slate-500 uppercase">{results.length} Class Matrices Resolved</p>
          </div>

          {workload.length > 0 && (
            <div className="bg-slate-800 p-2 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl">
               <FacultyWorkloadTable data={workload} />
            </div>
          )}
          
          <div className="grid grid-cols-1 gap-16">
            {results.map((tt, idx) => (
              <div key={idx} className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-2xl relative">
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-blue-400 uppercase tracking-tight mb-1">{tt.class}</h3>
                    <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold">Class ID: TT-{idx+100}</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="px-3 py-1 bg-slate-900 border border-slate-700 rounded-lg text-[10px] font-bold text-slate-400 uppercase tracking-tighter">RM: {tt.room || tt.room_no || 'TBA'}</span>
                    <span className="px-3 py-1 bg-slate-900 border border-slate-700 rounded-lg text-[10px] font-bold text-slate-400 uppercase tracking-tighter">CT: {tt.classTeacher || tt.class_teacher || 'TBA'}</span>
                  </div>
                </div>
                <div className="bg-white rounded-xl overflow-hidden shadow-inner">
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

      <div className="bg-indigo-950/30 border border-indigo-500/20 p-8 rounded-2xl shadow-xl">
        <h3 className="text-indigo-400 font-black text-xs uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
          <span>🛡️</span> Security & Logic
        </h3>
        <p className="text-slate-400 text-sm leading-relaxed font-medium">
          Scheduling logic is isolated to the <span className="text-indigo-300 font-bold">{activeInstitution.name}</span> context. AI considers department overlap for faculty shared across this institution profile while maintaining batch isolation.
        </p>
      </div>
    </div>
  );
}
