import React, { useState } from "react";
import { TimetableDisplay } from "./TimetableDisplay";
import { timetables as mockTimetables, subjects, timeSlots } from "../mockData";

interface AllTimetablesViewProps {
  initialTimetables?: any[];
  onRegenerate?: () => void;
}

export function AllTimetablesView({ initialTimetables, onRegenerate }: AllTimetablesViewProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [localTimetables, setLocalTimetables] = useState(initialTimetables || mockTimetables);
  const useMockData = !initialTimetables || initialTimetables.length === 0;

  const handleCellEdit = (timetableId: string, day: string, period: number, value: string) => {
    setLocalTimetables((prev) =>
      prev.map((tt) => {
        if (tt.id === timetableId) {
          const newSchedule = { ...tt.schedule };
          const daySchedule = [...(newSchedule[day] || [])];
          daySchedule[period] = value;
          newSchedule[day] = daySchedule;
          return { ...tt, schedule: newSchedule };
        }
        return tt;
      })
    );
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handleGenerateAll = () => {
    if (onRegenerate) {
      onRegenerate();
    } else {
      alert("Please go back to Setup and click Generate Timetable");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">All Timetables</h1>
            {useMockData && (
              <p className="text-sm text-yellow-400 mt-1">
                ⚠️ Showing mock data. Generate timetables from Setup to see real data.
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleGenerateAll}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
            >
              🔄 Regenerate All
            </button>
            <button
              onClick={handleExportPDF}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded transition-colors"
            >
              📄 Export All as PDF
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {localTimetables.map((tt, idx) => (
            <button
              key={tt.id}
              onClick={() => setActiveTab(idx)}
              className={`px-4 py-2 rounded-t transition-colors whitespace-nowrap ${
                activeTab === idx
                  ? "bg-slate-800 text-white border-b-2 border-blue-500"
                  : "bg-slate-900 text-slate-400 hover:bg-slate-800"
              }`}
            >
              {tt.class}
            </button>
          ))}
        </div>

        {/* Active Timetable */}
        <div className="bg-slate-900 p-6 rounded-lg">
          <div className="mb-4 text-sm text-slate-400">
            💡 Click any cell to edit. Changes are saved automatically.
          </div>
          <TimetableDisplay
            timetable={localTimetables[activeTab]}
            subjects={subjects}
            timeSlots={timeSlots}
            onCellEdit={(day, period, value) =>
              handleCellEdit(localTimetables[activeTab].id, day, period, value)
            }
          />
        </div>

        {/* Summary Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
            <div className="text-sm text-slate-400 mb-1">Total Timetables</div>
            <div className="text-3xl font-bold text-blue-500">{localTimetables.length}</div>
          </div>
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
            <div className="text-sm text-slate-400 mb-1">Total Subjects</div>
            <div className="text-3xl font-bold text-green-500">{Object.keys(subjects).length}</div>
          </div>
          <div className="bg-slate-900 p-4 rounded-lg border border-slate-700">
            <div className="text-sm text-slate-400 mb-1">Periods per Day</div>
            <div className="text-3xl font-bold text-purple-500">{timeSlots.length - 1}</div>
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
            .bg-slate-950,
            .bg-slate-900,
            .bg-slate-800 {
              background: white !important;
              color: black !important;
            }
            .text-slate-50,
            .text-slate-100,
            .text-slate-400 {
              color: black !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
