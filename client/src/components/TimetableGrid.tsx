import React from "react";

type Event = {
  courseCode: string;
  teacherCode: string;
  roomName: string;
  day: number;
  slot: number;
  duration: number;
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const SLOTS = ["8-9", "9-10", "10-11", "11-12", "2-3", "3-4"];

interface Props {
  events: Event[];
}

export const TimetableGrid: React.FC<Props> = ({ events }) => {
  // map by day-slot
  const cellMap = new Map<string, Event[]>();
  for (const e of events) {
    const key = `${e.day}-${e.slot}`;
    if (!cellMap.has(key)) cellMap.set(key, []);
    cellMap.get(key)!.push(e);
  }

  return (
    <div className="mt-4 overflow-x-auto">
      <table className="border-collapse min-w-full text-xs">
        <thead>
          <tr>
            <th className="border border-slate-700 px-2 py-1 bg-slate-900">Slot</th>
            {DAYS.map((d) => (
              <th key={d} className="border border-slate-700 px-2 py-1 bg-slate-900">
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {SLOTS.map((slotLabel, slotIdx) => (
            <tr key={slotIdx}>
              <td className="border border-slate-800 px-2 py-1 bg-slate-900 font-medium">
                {slotLabel}
              </td>
              {DAYS.map((_, dayIdx) => {
                const key = `${dayIdx}-${slotIdx}`;
                const cellEvents = cellMap.get(key) || [];
                return (
                  <td
                    key={key}
                    className="border border-slate-800 px-1 py-1 align-top min-w-[120px]"
                  >
                    {cellEvents.length === 0 ? (
                      <span className="text-slate-500">—</span>
                    ) : (
                      cellEvents.map((e, i) => (
                        <div
                          key={i}
                          className="mb-1 rounded bg-emerald-600/20 border border-emerald-500/40 px-2 py-1"
                        >
                          <div className="font-semibold">{e.courseCode}</div>
                          <div className="text-[10px] text-slate-300">
                            {e.teacherCode} · {e.roomName}
                          </div>
                        </div>
                      ))
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
