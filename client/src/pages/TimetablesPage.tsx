import { useState, useEffect } from "react";
import { realMockData } from "../realMockData";
import { TimetableDisplay } from "../components/TimetableDisplay";
import { getTimetables, deleteTimetable } from "../api";
import { useInstitution } from "../context/InstitutionContext";
import FacultyWorkloadTable from "../components/FacultyWorkloadTable";

const timeSlots = [
  { name: "Period 1", startTime: "9.40am",  endTime: "10.40am" },
  { name: "Period 2", startTime: "10:40am", endTime: "11:40am" },
  { name: "Period 3", startTime: "11:40am", endTime: "12:40pm" },
  { name: "Period 4", startTime: "12:40pm", endTime: "1:40pm"  },
  { name: "LUNCH",   startTime: "1:40pm",   endTime: "2:10pm"  },
  { name: "Period 6", startTime: "2:10pm",  endTime: "3:10pm"  },
  { name: "Period 7", startTime: "3:10pm",  endTime: "4:10pm"  },
];

function buildFacultyMapping(
  courses: any[],
  teachers: any[]
): { code: string; subject: string; abbr: string; faculty: string }[] {
  const teacherLookup: Record<string, string> = {};
  (teachers || []).forEach((t: any) => {
    teacherLookup[t.code || t.id || t.name] = t.name;
  });
  return (courses || []).map((c: any) => ({
    code: c.code || "",
    subject: c.name || c.subject || c.code,
    abbr: c.code || c.id || c.name,
    faculty: teacherLookup[c.teacherCode] || c.teacherCode || "TBA",
  }));
}

function normaliseDoc(doc: any): any[] {
  const grid = doc.grid || {};
  if (Array.isArray(grid.timetables) && grid.timetables.length > 0) {
    return grid.timetables;
  }
  const fallbackMapping = buildFacultyMapping(doc.courses || [], doc.teachers || []);
  const fromGrid = (Object.values(grid) as any[]).filter(
    (v: any) => v && typeof v === "object" && !Array.isArray(v) && v.schedule
  );
  return fromGrid.map((tt: any) => ({
    ...tt,
    schedule: Object.fromEntries(
      Object.entries(tt.schedule || {}).map(([day, cells]) => [
        day,
        (cells as any[]).map((c: any) => {
          if (c === "OCCUPIED") return null;
          if (c && typeof c === "object") return c;
          return c;
        }),
      ])
    ),
    faculty_mapping: Array.isArray(tt.faculty_mapping) && tt.faculty_mapping.length > 0 ? tt.faculty_mapping : fallbackMapping,
    class: tt.class || tt.name || "Unknown Batch",
    room_no: tt.room_no || tt.room || "",
    effective_date: tt.effective_date || tt.wef || tt.date || new Date().toLocaleDateString("en-GB"),
    class_teacher: tt.class_teacher || tt.classTeacher || "",
  }));
}

function getSubjects(facultyMapping: any[]): Record<string, { name: string; faculty: string; code?: string }> {
  const map: Record<string, { name: string; faculty: string; code?: string }> = {
    LIB: { name: "Library", faculty: "-" },
    SPORTS: { name: "Sports", faculty: "-" },
    CRT: { name: "Critical Reasoning & Thinking", faculty: "Various" },
    LUNCH: { name: "Lunch Break", faculty: "-" },
  };
  (facultyMapping || []).forEach((fm: any) => {
    if (fm.abbr) {
      map[fm.abbr] = { name: fm.subject, faculty: fm.faculty, code: fm.code };
    }
  });
  return map;
}

interface Generation {
  id: string;
  label: string;
  createdAt: string;
  isSeeded: boolean;
  timetables: any[];
  workload?: any[];
  department?: string;
  academic_year?: string;
}

export function TimetablesPage() {
  const { activeInstitution } = useInstitution();
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTabs, setActiveTabs] = useState<Record<string, number>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [showStatsId, setShowStatsId] = useState<string | null>(null);
  const [labelDraft, setLabelDraft] = useState("");

  useEffect(() => { 
    if (activeInstitution) {
      fetchAll(); 
    }
  }, [activeInstitution]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const data = await getTimetables();
      if (data && data.length > 0) {
        const gens: Generation[] = data.map((doc: any, idx: number) => {
          const tts = normaliseDoc(doc);
          const isSeeded = doc.grid?.source === "seed";
          return {
            id: doc._id || String(idx),
            label: doc.label || (isSeeded ? "📋 Current Production Schedule" : `🤖 AI Synthesis #${data.length - idx}`),
            createdAt: doc.createdAt ? new Date(doc.createdAt).toLocaleString("en-IN") : "Date unknown",
            isSeeded,
            timetables: tts,
            workload: doc.workload || [],
            department: doc.grid?.department,
            academic_year: doc.grid?.academic_year,
          };
        });
        setGenerations(gens);
      } else {
        setGenerations([]);
      }
    } catch (err) {
      console.error("Failed to fetch timetables:", err);
      setGenerations([]);
    } finally {
      setLoading(false);
    }
  };

  const getTab = (genId: string) => activeTabs[genId] ?? 0;
  const setTab = (genId: string, idx: number) => setActiveTabs((prev) => ({ ...prev, [genId]: idx }));

  const handleDelete = async (gen: Generation) => {
    if (!window.confirm(`Permanently wipe "${gen.label}" from this profile?`)) return;
    try {
      setDeletingId(gen.id);
      await deleteTimetable(gen.id);
      setGenerations((prev) => prev.filter((g) => g.id !== gen.id));
    } catch (err) {
      alert("System failed to purge record.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleRenameStart = (gen: Generation) => {
    setEditingLabelId(gen.id);
    setLabelDraft(gen.label.replace(/^[📋🤖]\s/, ""));
  };

  const handleRenameSave = (genId: string) => {
    setGenerations((prev) => prev.map((g) => (g.id === genId ? { ...g, label: labelDraft } : g)));
    setEditingLabelId(null);
  };

  if (!activeInstitution) return <div className="p-8 text-center text-slate-400 font-black uppercase tracking-[0.2em]">Select Profile to view archives</div>;

  if (loading) {
     return (
       <div className="flex flex-col items-center justify-center py-24 space-y-6">
         <div className="w-16 h-16 border-8 border-blue-600/20 border-t-blue-500 rounded-full animate-spin"></div>
         <p className="text-xs font-black text-slate-500 uppercase tracking-widest animate-pulse">Synchronizing Schedules...</p>
       </div>
     );
  }

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-4xl font-black text-slate-50 mb-1 uppercase tracking-tight">Timeline Archives</h1>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            <span className="text-blue-400">{activeInstitution.name}</span> • {generations.length} Active Records
          </p>
        </div>
      </div>

      {generations.length === 0 ? (
        <div className="bg-slate-900 border border-dashed border-slate-800 p-24 rounded-3xl text-center">
          <span className="text-6xl mb-6 block opacity-20">🗄️</span>
          <h2 className="text-xl font-bold text-slate-400 mb-2 uppercase">No records found</h2>
          <p className="text-sm text-slate-600 mb-8 lowercase tracking-tighter">no synthesis history detected for this profile context</p>
          <button className="bg-blue-600/10 text-blue-400 border border-blue-600/30 px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">Initialize Generation</button>
        </div>
      ) : (
        <div className="space-y-12">
          {generations.map((gen) => {
            const activeIdx = getTab(gen.id);
            const activeTT = gen.timetables[activeIdx];

            return (
              <div key={gen.id} className="bg-slate-900/50 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl transition-all hover:border-slate-700">
                <div className={`flex items-center justify-between px-8 py-4 ${gen.isSeeded ? "bg-slate-800/80" : "bg-blue-950/20"}`}>
                  <div>
                    {editingLabelId === gen.id ? (
                      <div className="flex items-center gap-3">
                        <input
                          autoFocus
                          value={labelDraft}
                          onChange={(e) => setLabelDraft(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleRenameSave(gen.id)}
                          className="bg-slate-950 border border-blue-500/50 text-white text-sm rounded-lg px-4 py-1 outline-none font-bold"
                        />
                        <button onClick={() => handleRenameSave(gen.id)} className="text-green-400 font-black text-[10px] uppercase">Save</button>
                      </div>
                    ) : (
                      <h3 className="font-black text-slate-200 uppercase tracking-wide flex items-center gap-3">
                         <span className="text-xl">{gen.isSeeded ? '📋' : '🤖'}</span>
                         {gen.label}
                      </h3>
                    )}
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">{gen.createdAt}</span>
                      {gen.department && (
                        <span className="text-[10px] font-black text-blue-500/50 uppercase tracking-tighter px-2 border-l border-slate-800">{gen.department}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => handleRenameStart(gen)} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs transition-all shadow-lg border border-slate-700">✏️</button>
                    <button onClick={() => setShowStatsId(showStatsId === gen.id ? null : gen.id)} className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${showStatsId === gen.id ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/40" : "bg-slate-800 text-slate-400 border border-slate-700"}`}>Analysis</button>
                    <button onClick={() => handleDelete(gen)} disabled={deletingId === gen.id} className="p-2 bg-red-900/20 hover:bg-red-900 text-red-500 hover:text-white rounded-xl text-xs transition-all border border-red-900/30">🗑️</button>
                  </div>
                </div>

                <div className="flex gap-2 overflow-x-auto px-8 py-4 bg-slate-950/30 border-b border-slate-800 shadow-inner">
                  {gen.timetables.map((tt: any, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setTab(gen.id, idx)}
                      className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all whitespace-nowrap shadow-lg ${
                        activeIdx === idx ? "bg-blue-600 text-white scale-105" : "bg-slate-800 text-slate-500 hover:text-slate-300 border border-slate-700/50"
                      }`}
                    >
                      {tt.class || tt.name || `Batch ${idx + 1}`}
                    </button>
                  ))}
                </div>

                <div className="p-8">
                  {showStatsId === gen.id ? (
                    <div className="bg-slate-950/50 rounded-2xl p-6 border border-slate-800">
                      <FacultyWorkloadTable data={gen.workload || []} />
                    </div>
                  ) : activeTT ? (
                    <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">
                      <TimetableDisplay
                        key={`${gen.id}-${activeIdx}`} 
                        timetable={{
                          id: `${gen.id}-${activeIdx}`,
                          class: activeTT.class || activeTT.name || "Unknown",
                          room: activeTT.room_no || activeTT.room || "",
                          date: new Date().toLocaleDateString("en-GB"),
                          wef: activeTT.effective_date || activeTT.effectiveDate || "",
                          classTeacher: activeTT.class_teacher || activeTT.classTeacher || "",
                          schedule: activeTT.schedule || {},
                        }}
                        subjects={getSubjects(activeTT.faculty_mapping || [])}
                        timeSlots={timeSlots}
                      />
                    </div>
                  ) : (
                    <div className="text-center py-20 text-slate-600 italic font-mono text-sm uppercase tracking-tighter">Logical Grid Uninitialized</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
