import { useState } from "react";
import { realMockData } from "../realMockData";
import { TimetableDisplay } from "../components/TimetableDisplay";

const timeSlots = [
  { name: "Period 1", startTime: "09:40", endTime: "10:40" },
  { name: "Period 2", startTime: "10:40", endTime: "11:40" },
  { name: "Period 3", startTime: "11:40", endTime: "12:40" },
  { name: "Period 4", startTime: "12:40", endTime: "13:40" },
  { name: "Lunch", startTime: "13:40", endTime: "14:10" },
  { name: "Period 5", startTime: "14:10", endTime: "15:10" },
  { name: "Period 6", startTime: "15:10", endTime: "16:10" },
];

export function TimetablesPage() {
  const [activeTab, setActiveTab] = useState(0);
  const timetables = realMockData.timetables;

  // Convert faculty_mapping to subjects format
  const getSubjects = (facultyMapping: any[]) => {
    const subjects: any = {};
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-50 mb-2">Timetables</h1>
          <p className="text-slate-400">
            {realMockData.department} • Academic Year {realMockData.academic_year}
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
              {tt.class}
            </button>
          ))}
        </div>
      </div>

      {/* Active Timetable */}
      <div className="bg-white p-6 rounded-lg">
        <TimetableDisplay
          timetable={{
            id: `tt-${activeTab}`,
            class: timetables[activeTab].class,
            room: timetables[activeTab].room_no || "",
            date: new Date().toLocaleDateString("en-GB"),
            wef: timetables[activeTab].effective_date,
            classTeacher: timetables[activeTab].class_teacher,
            schedule: timetables[activeTab].schedule
          }}
          subjects={getSubjects(timetables[activeTab].faculty_mapping)}
          timeSlots={timeSlots}
          onCellEdit={() => {}}
        />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
          <div className="text-sm text-slate-400 mb-1">Total Timetables</div>
          <div className="text-3xl font-bold text-blue-500">{timetables.length}</div>
        </div>
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
          <div className="text-sm text-slate-400 mb-1">Working Days</div>
          <div className="text-3xl font-bold text-green-500">
            {Object.keys(timetables[activeTab].schedule).length}
          </div>
        </div>
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
          <div className="text-sm text-slate-400 mb-1">Periods per Day</div>
          <div className="text-3xl font-bold text-purple-500">6</div>
        </div>
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
          <div className="text-sm text-slate-400 mb-1">Subjects</div>
          <div className="text-3xl font-bold text-orange-500">
            {timetables[activeTab].faculty_mapping.length}
          </div>
        </div>
      </div>

      {/* Print Styles */}
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
