import React from "react";

export type Metadata = {
  institutionName: string;
  totalStudents: number;
  totalClasses: number;
  totalSections: number;
  totalSubjects: number;
  totalLabs: number;
  workingDaysPerWeek: number;
  periodsPerDay: number;
  periodDuration: number; // in minutes
  startTime: string; // e.g., "08:00"
  endTime: string; // e.g., "16:00"
  lunchBreakStart: string; // e.g., "12:00"
  lunchBreakEnd: string; // e.g., "13:00"
  academicYear: string;
  semester: string;
};

interface Props {
  metadata: Metadata;
  setMetadata: React.Dispatch<React.SetStateAction<Metadata>>;
}

export function MetadataEditor({ metadata, setMetadata }: Props) {
  const update = (field: keyof Metadata, value: any) => {
    setMetadata((prev) => ({
      ...prev,
      [field]: typeof prev[field] === "number" ? Number(value) : value,
    }));
  };

  return (
    <div className="bg-slate-900 p-6 rounded-lg border border-slate-700">
      <h2 className="text-2xl font-bold mb-4">📋 Institution Metadata</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Basic Info */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">Institution Name</label>
          <input
            type="text"
            className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-slate-100"
            value={metadata.institutionName}
            onChange={(e) => update("institutionName", e.target.value)}
            placeholder="e.g., ABC College of Engineering"
          />
        </div>

        {/* Student & Class Info */}
        <div>
          <label className="block text-sm font-medium mb-2">Total Students</label>
          <input
            type="number"
            min={1}
            className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-slate-100"
            value={metadata.totalStudents}
            onChange={(e) => update("totalStudents", e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Total Classes/Years</label>
          <input
            type="number"
            min={1}
            className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-slate-100"
            value={metadata.totalClasses}
            onChange={(e) => update("totalClasses", e.target.value)}
          />
          <p className="text-xs text-slate-400 mt-1">e.g., 4 (for 1st year to 4th year)</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Sections per Class</label>
          <input
            type="number"
            min={1}
            className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-slate-100"
            value={metadata.totalSections}
            onChange={(e) => update("totalSections", e.target.value)}
          />
          <p className="text-xs text-slate-400 mt-1">e.g., 3 (Section A, B, C)</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Total Subjects</label>
          <input
            type="number"
            min={1}
            className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-slate-100"
            value={metadata.totalSubjects}
            onChange={(e) => update("totalSubjects", e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Total Labs</label>
          <input
            type="number"
            min={0}
            className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-slate-100"
            value={metadata.totalLabs}
            onChange={(e) => update("totalLabs", e.target.value)}
          />
        </div>

        {/* Working Hours */}
        <div>
          <label className="block text-sm font-medium mb-2">Working Days per Week</label>
          <input
            type="number"
            min={1}
            max={7}
            className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-slate-100"
            value={metadata.workingDaysPerWeek}
            onChange={(e) => update("workingDaysPerWeek", e.target.value)}
          />
          <p className="text-xs text-slate-400 mt-1">Usually 5 or 6 days</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Periods per Day</label>
          <input
            type="number"
            min={1}
            className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-slate-100"
            value={metadata.periodsPerDay}
            onChange={(e) => update("periodsPerDay", e.target.value)}
          />
          <p className="text-xs text-slate-400 mt-1">e.g., 6 or 7 periods</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Period Duration (minutes)</label>
          <input
            type="number"
            min={30}
            max={120}
            step={5}
            className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-slate-100"
            value={metadata.periodDuration}
            onChange={(e) => update("periodDuration", e.target.value)}
          />
          <p className="text-xs text-slate-400 mt-1">Usually 45-60 minutes</p>
        </div>

        {/* Time Schedule */}
        <div>
          <label className="block text-sm font-medium mb-2">Start Time</label>
          <input
            type="time"
            className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-slate-100"
            value={metadata.startTime}
            onChange={(e) => update("startTime", e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">End Time</label>
          <input
            type="time"
            className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-slate-100"
            value={metadata.endTime}
            onChange={(e) => update("endTime", e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Lunch Break Start</label>
          <input
            type="time"
            className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-slate-100"
            value={metadata.lunchBreakStart}
            onChange={(e) => update("lunchBreakStart", e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Lunch Break End</label>
          <input
            type="time"
            className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-slate-100"
            value={metadata.lunchBreakEnd}
            onChange={(e) => update("lunchBreakEnd", e.target.value)}
          />
        </div>

        {/* Academic Info */}
        <div>
          <label className="block text-sm font-medium mb-2">Academic Year</label>
          <input
            type="text"
            className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-slate-100"
            value={metadata.academicYear}
            onChange={(e) => update("academicYear", e.target.value)}
            placeholder="e.g., 2024-2025"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Semester</label>
          <select
            className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-slate-100"
            value={metadata.semester}
            onChange={(e) => update("semester", e.target.value)}
          >
            <option value="Odd">Odd Semester</option>
            <option value="Even">Even Semester</option>
            <option value="Summer">Summer Term</option>
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 p-4 bg-slate-800 rounded border border-slate-700">
        <h3 className="text-sm font-semibold mb-3 text-slate-300">Quick Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-slate-400">Total Capacity:</span>
            <div className="font-bold text-blue-400">{metadata.totalStudents} students</div>
          </div>
          <div>
            <span className="text-slate-400">Total Batches:</span>
            <div className="font-bold text-green-400">
              {metadata.totalClasses * metadata.totalSections} batches
            </div>
          </div>
          <div>
            <span className="text-slate-400">Weekly Periods:</span>
            <div className="font-bold text-purple-400">
              {metadata.workingDaysPerWeek * metadata.periodsPerDay} periods
            </div>
          </div>
          <div>
            <span className="text-slate-400">Daily Hours:</span>
            <div className="font-bold text-orange-400">
              {((metadata.periodsPerDay * metadata.periodDuration) / 60).toFixed(1)} hours
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
