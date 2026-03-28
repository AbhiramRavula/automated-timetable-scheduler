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
    <div className="mt-8 overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <div className="bg-white px-4 py-5 border-b border-gray-200 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Faculty Workload Dashboard</h3>
        <p className="mt-1 text-sm text-gray-500">Summary of Theory and Lab sessions per teacher per week.</p>
      </div>
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
              S No
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Name of the Faculty
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Designation
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Theory (Periods)
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Lab (Periods)
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Weekly Load (Hrs)
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {data.map((faculty, idx) => (
            <tr key={faculty.teacherCode}>
              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                {idx + 1}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                <div className="font-medium text-gray-900">{faculty.teacherName}</div>
                <div className="text-xs text-gray-400">{faculty.teacherCode}</div>
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {faculty.teacherDesignation}
              </td>
              <td className="px-3 py-4 text-sm text-gray-500">
                {faculty.theoryCourses.map((c, i) => (
                  <div key={i} className="mb-1">
                    <span className="font-semibold text-indigo-600">{c.code}</span>
                    <span className="text-xs ml-1">({c.periods} per.) {c.batch}</span>
                  </div>
                ))}
              </td>
              <td className="px-3 py-4 text-sm text-gray-500">
                {faculty.labCourses.map((c, i) => (
                  <div key={i} className="mb-1">
                    <span className="font-semibold text-green-600">{c.code}</span>
                    <span className="text-xs ml-1">({c.periods} per.) {c.batch}</span>
                  </div>
                ))}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm font-bold text-gray-900">
                {faculty.totalHours.toFixed(1)} Hrs
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FacultyWorkloadTable;
