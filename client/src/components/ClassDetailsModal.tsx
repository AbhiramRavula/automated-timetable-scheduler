// import { useState, useEffect } from "react";
import { Class } from "../pages/ClassesPage";

interface Props {
  classInfo: Class;
  onClose: () => void;
}

export default function ClassDetailsModal({ classInfo, onClose }: Props) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
      <div className="bg-slate-800/90 backdrop-blur-xl rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl border border-slate-600">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-slate-50">Class Details</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 text-2xl">✖️</button>
        </div>
        <div className="space-y-3">
          <p><span className="font-medium text-slate-300">Name:</span> {classInfo.name}</p>
          <p><span className="font-medium text-slate-300">Room:</span> {classInfo.room || "TBA"}</p>
          <p><span className="font-medium text-slate-300">Teacher:</span> {classInfo.classTeacher}</p>
          <p><span className="font-medium text-slate-300">Effective Date:</span> {classInfo.effectiveDate}</p>
          {classInfo.semester && (
            <p><span className="font-medium text-slate-300">Semester:</span> {classInfo.semester}</p>
          )}
          {classInfo.year && (
            <p><span className="font-medium text-slate-300">Year:</span> {classInfo.year}</p>
          )}
        </div>
        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-slate-50 font-medium">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
