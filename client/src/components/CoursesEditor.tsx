import React from "react";

export type Course = {
  code: string;
  name: string;
  durationSlots: number;
  teacherCode: string;
  batch: string;
};

interface Props {
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
}

export function CoursesEditor({ courses, setCourses }: Props) {
  const update = (index: number, field: keyof Course, value: any) => {
    const next = [...courses];
    // @ts-ignore
    next[index][field] = field === "durationSlots" ? Number(value) : value;
    setCourses(next);
  };

  const addCourse = () => {
    setCourses((prev) => [
      ...prev,
      { code: "", name: "", durationSlots: 1, teacherCode: "", batch: "" },
    ]);
  };

  const removeCourse = (index: number) => {
    setCourses((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Courses</h3>
        <button
          type="button"
          onClick={addCourse}
          className="px-3 py-1 text-sm rounded bg-emerald-600 hover:bg-emerald-700 transition-colors"
        >
          + Add Course
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border border-slate-700">
          <thead className="bg-slate-800">
            <tr>
              <th className="px-2 py-2 border border-slate-700 text-left">Code</th>
              <th className="px-2 py-2 border border-slate-700 text-left">Name</th>
              <th className="px-2 py-2 border border-slate-700 text-left">Duration</th>
              <th className="px-2 py-2 border border-slate-700 text-left">Teacher</th>
              <th className="px-2 py-2 border border-slate-700 text-left">Batch</th>
              <th className="px-2 py-2 border border-slate-700"></th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c, i) => (
              <tr key={i}>
                <td className="border border-slate-800 px-1 py-1">
                  <input
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100"
                    value={c.code}
                    onChange={(e) => update(i, "code", e.target.value)}
                    placeholder="CS101"
                  />
                </td>
                <td className="border border-slate-800 px-1 py-1">
                  <input
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100"
                    value={c.name}
                    onChange={(e) => update(i, "name", e.target.value)}
                    placeholder="Intro to CS"
                  />
                </td>
                <td className="border border-slate-800 px-1 py-1">
                  <input
                    type="number"
                    min={1}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100"
                    value={c.durationSlots}
                    onChange={(e) => update(i, "durationSlots", e.target.value)}
                  />
                </td>
                <td className="border border-slate-800 px-1 py-1">
                  <input
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100"
                    value={c.teacherCode}
                    onChange={(e) => update(i, "teacherCode", e.target.value)}
                    placeholder="T1"
                  />
                </td>
                <td className="border border-slate-800 px-1 py-1">
                  <input
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100"
                    value={c.batch}
                    onChange={(e) => update(i, "batch", e.target.value)}
                    placeholder="B1"
                  />
                </td>
                <td className="border border-slate-800 px-1 py-1 text-center">
                  <button
                    type="button"
                    onClick={() => removeCourse(i)}
                    className="text-red-400 hover:text-red-300 text-sm px-2"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
