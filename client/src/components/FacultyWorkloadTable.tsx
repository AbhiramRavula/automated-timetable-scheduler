import React from 'react';

export interface FacultyWorkload {
  teacherCode: string;
  teacherName: string;
  teacherDesignation?: string;
  theoryCourses: { code: string; name: string; batch: string; periods: number }[];
  labCourses: { code: string; name: string; batch: string; periods: number }[];
  totalPeriods: number;
  totalHours: number;
}

interface Props {
  data: FacultyWorkload[];
}

const FacultyWorkloadTable: React.FC<Props> = ({ data }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="mt-12 overflow-hidden bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl">
      <div className="px-8 py-8 border-b border-slate-700/50 bg-gradient-to-r from-blue-600/10 to-transparent">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-xl shadow-lg shadow-blue-600/20">
            📊
          </div>
          <h3 className="text-2xl font-black text-slate-100 uppercase tracking-tight italic">
            Faculty Workload Dashboard
          </h3>
        </div>
        <p className="text-slate-400 text-sm font-medium tracking-wide">
          Aggregated weekly teaching load distribution across all institutional batches.
        </p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-800">
          <thead>
            <tr className="bg-slate-900/80">
              <th scope="col" className="py-5 pl-8 pr-3 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                S.No
              </th>
              <th scope="col" className="px-4 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                Faculty Profile
              </th>
              <th scope="col" className="px-4 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                Theory Load
              </th>
              <th scope="col" className="px-4 py-5 text-left text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                Lab Load
              </th>
              <th scope="col" className="px-8 py-5 text-right text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                Total Weekly Hrs
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 bg-transparent">
            {data.map((faculty, idx) => (
              <tr key={faculty.teacherCode} className="hover:bg-slate-800/30 transition-colors group">
                <td className="whitespace-nowrap py-6 pl-8 pr-3 text-sm font-bold text-slate-600">
                  {String(idx + 1).padStart(2, '0')}
                </td>
                <td className="whitespace-nowrap px-4 py-6">
                  <p className="text-sm font-extrabold text-slate-200 group-hover:text-blue-400 transition-colors">
                    {faculty.teacherName}
                  </p>
                  <p className="text-[10px] font-mono text-slate-500 uppercase tracking-tighter">
                    {faculty.teacherCode} • {faculty.teacherDesignation}
                  </p>
                </td>
                <td className="px-4 py-6">
                  <div className="space-y-2">
                    {faculty.theoryCourses.map((c, i) => (
                      <div key={i} className="flex items-center gap-2 bg-blue-500/5 border border-blue-500/10 rounded-md px-2 py-1">
                        <span className="text-[10px] font-bold text-blue-400 w-16 truncate">{c.code}</span>
                        <span className="text-[9px] text-slate-500 uppercase font-black">{c.batch}</span>
                        <span className="ml-auto text-[10px] font-mono text-blue-300 bg-blue-500/10 px-1.5 rounded">{c.periods}P</span>
                      </div>
                    ))}
                    {faculty.theoryCourses.length === 0 && <span className="text-[10px] text-slate-600 italic">No theory sessions</span>}
                  </div>
                </td>
                <td className="px-4 py-6">
                  <div className="space-y-2">
                    {faculty.labCourses.map((c, i) => (
                      <div key={i} className="flex items-center gap-2 bg-green-500/5 border border-green-500/10 rounded-md px-2 py-1">
                        <span className="text-[10px] font-bold text-green-400 w-16 truncate">{c.code}</span>
                        <span className="text-[9px] text-slate-500 uppercase font-black">{c.batch}</span>
                        <span className="ml-auto text-[10px] font-mono text-green-300 bg-green-500/10 px-1.5 rounded">{c.periods}P</span>
                      </div>
                    ))}
                    {faculty.labCourses.length === 0 && <span className="text-[10px] text-slate-600 italic">No lab sessions</span>}
                  </div>
                </td>
                <td className="whitespace-nowrap px-8 py-6 text-right">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-black bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                    {faculty.totalHours.toFixed(1)} <span className="text-[10px] ml-1 opacity-70 uppercase tracking-tighter">HRS</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default FacultyWorkloadTable;
