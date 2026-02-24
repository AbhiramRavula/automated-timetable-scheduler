import React from "react";

export type Teacher = {
  code: string;
  name: string;
};

interface Props {
  teachers: Teacher[];
  setTeachers: React.Dispatch<React.SetStateAction<Teacher[]>>;
}

export function TeachersEditor({ teachers, setTeachers }: Props) {
  const update = (index: number, field: keyof Teacher, value: string) => {
    const next = [...teachers];
    next[index][field] = value;
    setTeachers(next);
  };

  const addTeacher = () => {
    setTeachers((prev) => [...prev, { code: "", name: "" }]);
  };

  const removeTeacher = (index: number) => {
    setTeachers((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Teachers</h3>
        <button
          type="button"
          onClick={addTeacher}
          className="px-3 py-1 text-sm rounded bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          + Add Teacher
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border border-slate-700">
          <thead className="bg-slate-800">
            <tr>
              <th className="px-2 py-2 border border-slate-700 text-left">Code</th>
              <th className="px-2 py-2 border border-slate-700 text-left">Name</th>
              <th className="px-2 py-2 border border-slate-700"></th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((t, i) => (
              <tr key={i}>
                <td className="border border-slate-800 px-1 py-1">
                  <input
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100"
                    value={t.code}
                    onChange={(e) => update(i, "code", e.target.value)}
                    placeholder="T1"
                  />
                </td>
                <td className="border border-slate-800 px-1 py-1">
                  <input
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100"
                    value={t.name}
                    onChange={(e) => update(i, "name", e.target.value)}
                    placeholder="Dr. Smith"
                  />
                </td>
                <td className="border border-slate-800 px-1 py-1 text-center">
                  <button
                    type="button"
                    onClick={() => removeTeacher(i)}
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
