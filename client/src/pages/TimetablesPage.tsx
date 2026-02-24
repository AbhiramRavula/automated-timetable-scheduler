import { useState, useEffect } from "react";
import { realMockData } from "../realMockData";
import { TimetableDisplay } from "../components/TimetableDisplay";
import { getTimetables } from "../api";

const timeSlots = [
  { name: "Period 1", startTime: "09:40", endTime: "10:40" },
  { name: "Period 2", startTime: "10:40", endTime: "11:40" },
  { name: "Period 3", startTime: "11:40", endTime: "12:40" },
  { name: "Period 4", startTime: "12:40", endTime: "01:40" },
  { name: "Period 5", startTime: "01:40", endTime: "02:40" },
  { name: "Period 6", startTime: "02:40", endTime: "03:40" },
  { name: "Period 7", startTime: "03:40", endTime: "04:40" },
];

export function TimetablesPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [timetables, setTimetables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [department, setDepartment] = useState(realMockData.department);
  const [academicYear, setAcademicYear] = useState(realMockData.academic_year);

  useEffect(() => {
    fetchTimetables();
  }, []);

  const fetchTimetables = async () => {
    try {
      setLoading(true);
      const data = await getTimetables();

      if (data && data.length > 0) {
        // The latest document from MongoDB — could be seeded or generated
        const latest = data[0];
        const grid = latest.grid || {};

        // Seeded data stores timetables in grid.timetables
        // Generated data stores timetables as grid[batchName] objects
        const seededArray: any[] = grid.timetables || [];
        const generatedArray: any[] = Object.values(grid).filter(
          (v: any) => typeof v === "object" && !Array.isArray(v) && v?.schedule
        );

        const resolved = seededArray.length > 0 ? seededArray : generatedArray;
        setTimetables(resolved.length > 0 ? resolved : realMockData.timetables);

        // Use seeded metadata if available
        if (grid.department) setDepartment(grid.department);
        if (grid.academic_year) setAcademicYear(grid.academic_year);
      } else {
        setTimetables(realMockData.timetables);
      }
    } catch (err) {
      console.error("Failed to fetch timetables:", err);
      setTimetables(realMockData.timetables);
    } finally {
      setLoading(false);
    }
  };

  // Convert faculty_mapping to subjects format
  const getSubjects = (facultyMapping: any[]) => {
    const subjects: any = {};
    if (!facultyMapping) return subjects;
    
    facultyMapping.forEach(fm => {
      subjects[fm.abbr] = {
        name: fm.subject,
        faculty: fm.faculty
      };
    });
    // Add common entries
    subjects["LIB"] = { name: "Library", faculty: "-" };
    subjects["SPORTS"] = { name: "Sports", faculty: "-" };
    subjects["CRT"] = { name: "Critical Thinking", faculty: "Various" };
    return subjects;
  };

  const handleExportPDF = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 animate-pulse">Fetching latest timetables from cloud...</p>
      </div>
    );
  }

  if (timetables.length === 0) {
    return (
      <div className="bg-slate-800 p-12 rounded-xl border border-slate-700 text-center">
        <h2 className="text-2xl font-bold text-slate-50 mb-4">No Timetables Generated</h2>
        <p className="text-slate-400 mb-6">Go to the Generate page to create your first set of schedules.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-50 mb-2">Timetables</h1>
          <p className="text-slate-400">
            {department} • Academic Year {academicYear}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportPDF}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors flex items-center gap-2"
          >
            <span>📄</span>
            Export PDF
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-slate-800 p-2 rounded-lg border border-slate-700">
        <div className="flex gap-2 overflow-x-auto">
          {timetables.map((tt, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`px-4 py-2 rounded transition-colors whitespace-nowrap ${
                activeTab === idx
                  ? "bg-blue-600 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              {tt.class || tt.name}
            </button>
          ))}
        </div>
      </div>

      {/* Active Timetable */}
      {timetables[activeTab] ? (
        <div className="bg-white p-6 rounded-lg">
          <TimetableDisplay
            timetable={{
              id: timetables[activeTab]._id || `tt-${activeTab}`,
              class: timetables[activeTab].class || timetables[activeTab].name || "Unnamed Batch",
              room: timetables[activeTab].room_no || timetables[activeTab].room || "",
              date: new Date().toLocaleDateString("en-GB"),
              wef: timetables[activeTab].effective_date || timetables[activeTab].effectiveDate || "Date TBD",
              classTeacher: timetables[activeTab].class_teacher || timetables[activeTab].classTeacher || "TBD",
              schedule: timetables[activeTab].schedule || {}
            }}
            subjects={getSubjects(timetables[activeTab].faculty_mapping || [])}
            timeSlots={timeSlots}
            onCellEdit={() => {}}
          />
        </div>
      ) : (
        <div className="p-12 text-center text-slate-500 bg-slate-800 rounded-xl border border-slate-700">
          Selected timetable is unavailable.
        </div>
      )}

      {/* Summary Stats */}
      {timetables[activeTab] && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
            <div className="text-sm text-slate-400 mb-1">Total Timetables</div>
            <div className="text-3xl font-bold text-blue-500">{timetables.length}</div>
          </div>
          <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
            <div className="text-sm text-slate-400 mb-1">Working Days</div>
            <div className="text-3xl font-bold text-green-500">
              {Object.keys(timetables[activeTab].schedule || {}).length}
            </div>
          </div>
          <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
            <div className="text-sm text-slate-400 mb-1">Periods per Day</div>
            <div className="text-3xl font-bold text-purple-500">
              {timeSlots.length}
            </div>
          </div>
          <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
            <div className="text-sm text-slate-400 mb-1">Subjects</div>
            <div className="text-3xl font-bold text-orange-500">
              {(timetables[activeTab].faculty_mapping || []).length || 
               Object.values(timetables[activeTab].schedule || {}).flat().filter(e => e && e !== "OCCUPIED").length}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media print {
          body {
            background: white;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
