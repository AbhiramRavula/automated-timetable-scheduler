import React from "react";

export type Batch = {
  _id?: string;
  name: string;
  year: number;
  department: string;
  section: string;
  studentCount: number;
  unavailableSlots: { dayIndex: number; slotIndex: number }[];
};

interface Props {
  batches: Batch[];
  setBatches: React.Dispatch<React.SetStateAction<Batch[]>>;
}

export function BatchesEditor({ batches, setBatches }: Props) {
  const update = (index: number, field: keyof Batch, value: any) => {
    const next = [...batches];
    if (field === "year" || field === "studentCount") {
      // @ts-ignore
      next[index][field] = Number(value);
    } else {
      // @ts-ignore
      next[index][field] = value;
    }
    setBatches(next);
  };

  const addBatch = () => {
    setBatches((prev) => [
      ...prev,
      {
        name: "",
        year: 1,
        department: "",
        section: "A",
        studentCount: 60,
        unavailableSlots: [],
      },
    ]);
  };

  const removeBatch = (index: number) => {
    setBatches((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Batches / Sections</h3>
        <button
          type="button"
          onClick={addBatch}
          className="px-3 py-1 text-sm rounded bg-indigo-600 hover:bg-indigo-700 transition-colors"
        >
          + Add Batch
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs border border-slate-700">
          <thead className="bg-slate-800">
            <tr>
              <th className="px-2 py-2 border border-slate-700 text-left">Name</th>
              <th className="px-2 py-2 border border-slate-700 text-left">Year</th>
              <th className="px-2 py-2 border border-slate-700 text-left">Department</th>
              <th className="px-2 py-2 border border-slate-700 text-left">Section</th>
              <th className="px-2 py-2 border border-slate-700 text-left">Students</th>
              <th className="px-2 py-2 border border-slate-700"></th>
            </tr>
          </thead>
          <tbody>
            {batches.map((b, i) => (
              <tr key={i}>
                <td className="border border-slate-800 px-1 py-1">
                  <input
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100"
                    value={b.name}
                    onChange={(e) => update(i, "name", e.target.value)}
                    placeholder="IT-2A"
                  />
                </td>
                <td className="border border-slate-800 px-1 py-1">
                  <select
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100"
                    value={b.year}
                    onChange={(e) => update(i, "year", e.target.value)}
                  >
                    <option value={1}>1st Year</option>
                    <option value={2}>2nd Year</option>
                    <option value={3}>3rd Year</option>
                    <option value={4}>4th Year</option>
                  </select>
                </td>
                <td className="border border-slate-800 px-1 py-1">
                  <input
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100"
                    value={b.department}
                    onChange={(e) => update(i, "department", e.target.value)}
                    placeholder="IT"
                  />
                </td>
                <td className="border border-slate-800 px-1 py-1">
                  <input
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100"
                    value={b.section}
                    onChange={(e) => update(i, "section", e.target.value)}
                    placeholder="A"
                  />
                </td>
                <td className="border border-slate-800 px-1 py-1">
                  <input
                    type="number"
                    min={1}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-100"
                    value={b.studentCount}
                    onChange={(e) => update(i, "studentCount", e.target.value)}
                  />
                </td>
                <td className="border border-slate-800 px-1 py-1 text-center">
                  <button
                    type="button"
                    onClick={() => removeBatch(i)}
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
