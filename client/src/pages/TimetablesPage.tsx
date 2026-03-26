import { useState, useEffect } from "react";
import { realMockData } from "../realMockData";
import { TimetableDisplay } from "../components/TimetableDisplay";
import { getTimetables, deleteTimetable } from "../api";
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

/** Build faculty_mapping from doc-level courses + teachers arrays (fallback for older generated docs) */
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

/** Normalise a raw MongoDB Timetable document into a flat array of class timetables */
function normaliseDoc(doc: any): any[] {
  const grid = doc.grid || {};

  // Seeded format: grid.timetables = [{class, schedule, ...}]
  if (Array.isArray(grid.timetables) && grid.timetables.length > 0) {
    return grid.timetables;
  }

  // Generated format: grid = { batchName: {class, schedule, faculty_mapping?, ...} }
  const fallbackMapping = buildFacultyMapping(doc.courses || [], doc.teachers || []);

  const fromGrid = (Object.values(grid) as any[]).filter(
    (v: any) => v && typeof v === "object" && !Array.isArray(v) && v.schedule
  );

  return fromGrid.map((tt: any) => ({
    ...tt,
    // Flatten OCCUPIED placeholders — replace them with empty string so they don't appear as text
    schedule: Object.fromEntries(
      Object.entries(tt.schedule || {}).map(([day, cells]) => [
        day,
        (cells as any[]).map((c: any) => {
          if (c === "OCCUPIED") return null;
          if (c && typeof c === "object") return c; // preserve { subject, room, span } so room numbers render
          return c;
        }),
      ])
    ),
    // Use per-batch faculty_mapping if present, else fall back to doc-level
    faculty_mapping:
      Array.isArray(tt.faculty_mapping) && tt.faculty_mapping.length > 0
        ? tt.faculty_mapping
        : fallbackMapping,
    // Normalise field names from generated format → seeded format
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
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  // per‑generation active batch tab
  const [activeTabs, setActiveTabs] = useState<Record<string, number>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [showStatsId, setShowStatsId] = useState<string | null>(null);
  const [labelDraft, setLabelDraft] = useState("");

  useEffect(() => { fetchAll(); }, []);

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
            label: isSeeded ? "📋 Current Department Timetables" : `🤖 AI Generation #${data.length - idx}`,
            createdAt: doc.createdAt
              ? new Date(doc.createdAt).toLocaleString("en-IN")
              : "Date unknown",
            isSeeded,
            timetables: tts.length > 0 ? tts : realMockData.timetables,
            workload: doc.workload || [],
            department: doc.grid?.department,
            academic_year: doc.grid?.academic_year,
          };
        });
        setGenerations(gens);
      } else {
        // Fallback: show the local mock data as the first generation
        setGenerations([{
          id: "local",
          label: "📋 Current Department Timetables",
          createdAt: "Loaded from local data",
          isSeeded: true,
          timetables: realMockData.timetables,
          department: realMockData.department,
          academic_year: realMockData.academic_year,
        }]);
      }
    } catch (err) {
      console.error("Failed to fetch timetables:", err);
      setGenerations([{
        id: "local",
        label: "📋 Current Department Timetables",
        createdAt: "Loaded from local data",
        isSeeded: true,
        timetables: realMockData.timetables,
        department: realMockData.department,
        academic_year: realMockData.academic_year,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const getTab = (genId: string) => activeTabs[genId] ?? 0;
  const setTab = (genId: string, idx: number) =>
    setActiveTabs((prev) => ({ ...prev, [genId]: idx }));

  const handleDelete = async (gen: Generation) => {
    if (!window.confirm(`Delete "${gen.label}"? This cannot be undone.`)) return;
    // Local-only fallback generations have no real DB id
    if (gen.id === "local") {
      setGenerations((prev) => prev.filter((g) => g.id !== gen.id));
      return;
    }
    try {
      setDeletingId(gen.id);
      await deleteTimetable(gen.id);
      setGenerations((prev) => prev.filter((g) => g.id !== gen.id));
    } catch (err) {
      alert("Failed to delete. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleRenameStart = (gen: Generation) => {
    setEditingLabelId(gen.id);
    setLabelDraft(gen.label.replace(/^[📋🤖]\s/, ""));
  };

  const handleRenameSave = (genId: string) => {
    setGenerations((prev) =>
      prev.map((g) => (g.id === genId ? { ...g, label: labelDraft } : g))
    );
    setEditingLabelId(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 animate-pulse">Fetching timetables from cloud...</p>
      </div>
    );
  }

  if (generations.length === 0) {
    return (
      <div className="bg-slate-800 p-12 rounded-xl border border-slate-700 text-center">
        <h2 className="text-2xl font-bold text-slate-50 mb-4">No Timetables Yet</h2>
        <p className="text-slate-400">Go to the Generate page to create your first schedule.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-50 mb-1">Timetables</h1>
          <p className="text-slate-400 text-sm">{generations.length} generation{generations.length !== 1 ? "s" : ""} available</p>
        </div>
      </div>

      {/* One card per generation — newest first */}
      {generations.map((gen) => {
        const activeIdx = getTab(gen.id);
        const activeTT = gen.timetables[activeIdx];

        return (
          <div key={gen.id} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            {/* Generation header */}
            <div className={`flex items-center justify-between px-5 py-3 ${gen.isSeeded ? "bg-slate-700" : "bg-blue-900/40"}`}>
              {/* Label (or rename input) */}
              <div className="flex flex-col gap-0.5">
                {editingLabelId === gen.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      autoFocus
                      value={labelDraft}
                      onChange={(e) => setLabelDraft(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleRenameSave(gen.id)}
                      className="bg-slate-600 border border-blue-400 text-white text-sm rounded px-2 py-0.5 outline-none"
                    />
                    <button onClick={() => handleRenameSave(gen.id)} className="text-green-400 text-xs hover:text-green-300">✓ Save</button>
                    <button onClick={() => setEditingLabelId(null)} className="text-slate-400 text-xs hover:text-slate-300">✕</button>
                  </div>
                ) : (
                  <span className="font-semibold text-slate-100">{gen.label}</span>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">{gen.createdAt}</span>
                  {gen.department && (
                    <span className="text-xs text-slate-500">{gen.department} • {gen.academic_year}</span>
                  )}
                </div>
              </div>
              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRenameStart(gen)}
                  title="Rename this generation"
                  className="px-2.5 py-1.5 bg-slate-600 hover:bg-slate-500 text-white text-xs rounded-lg transition-colors"
                >
                  ✏️ Rename
                </button>
                <button
                  onClick={() => handleDelete(gen)}
                  disabled={deletingId === gen.id}
                  title="Delete this generation"
                  className="px-2.5 py-1.5 bg-red-700 hover:bg-red-600 disabled:opacity-50 text-white text-xs rounded-lg transition-colors"
                >
                  {deletingId === gen.id ? "Deleting…" : "🗑️ Delete"}
                </button>
                <button
                  onClick={() => setShowStatsId(showStatsId === gen.id ? null : gen.id)}
                  className={`px-2.5 py-1.5 text-xs rounded-lg transition-colors ${
                    showStatsId === gen.id 
                      ? "bg-indigo-600 text-white" 
                      : "bg-slate-600 hover:bg-slate-500 text-white"
                  }`}
                >
                  {showStatsId === gen.id ? "📊 Hide Stats" : "📊 View Stats"}
                </button>
              </div>
            </div>

            {/* Batch tabs */}
            <div className="flex gap-2 overflow-x-auto px-4 py-2 border-b border-slate-700">
              {gen.timetables.map((tt: any, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setTab(gen.id, idx)}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap ${
                    activeIdx === idx
                      ? "bg-blue-600 text-white"
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  {tt.class || tt.name || `Batch ${idx + 1}`}
                </button>
              ))}
            </div>

            {/* Timetable/Stats display */}
            <div className="p-4" id={`gen-${gen.id}`}>
              {showStatsId === gen.id ? (
                <div className="bg-slate-900 rounded-lg p-4">
                  <FacultyWorkloadTable data={gen.workload || []} />
                </div>
              ) : activeTT ? (
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
                  onCellEdit={() => {}}
                />
              ) : (
                <p className="text-slate-400 text-center py-8">No timetable data for this batch.</p>
              )}
            </div>
          </div>
        );
      })}

      <style>{`
        @media print {
          body { background: white; }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
}
