import { useState, useRef } from "react";

interface TimetableProps {
  timetable: {
    id: string;
    class: string;
    room: string;
    date: string;
    wef: string;
    classTeacher: string;
    schedule: Record<string, (string | null)[]>;
  };
  subjects: Record<string, { name: string; faculty: string; code?: string }>;
  timeSlots: { name: string; startTime: string; endTime: string }[];
  onCellEdit?: (day: string, period: number, value: string) => void;
}

function InlineEdit({ value, bold = false, onChange }: { value: string; bold?: boolean; onChange?: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);

  const save = () => { setEditing(false); onChange?.(val); };

  return editing ? (
    <input
      autoFocus
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onBlur={save}
      onKeyDown={(e) => e.key === "Enter" && save()}
      style={{ width: `${Math.max(val.length + 2, 10)}ch`, fontSize: "inherit" }}
      className={`border border-yellow-400 bg-yellow-50 rounded px-0.5 outline-none ${bold ? "font-bold" : ""}`}
    />
  ) : (
    <span
      onClick={() => setEditing(true)}
      title="Click to edit"
      className={`cursor-text hover:bg-yellow-50 hover:ring-1 hover:ring-yellow-300 rounded px-0.5 transition-all ${bold ? "font-bold" : ""}`}
    >
      {val || <span className="italic text-gray-400">—</span>}
    </span>
  );
}

/** Inline editable table cell — same size when editing */
function CellEdit({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);

  const save = () => { setEditing(false); onChange(val); };

  return editing ? (
    <input
      autoFocus
      value={val}
      onChange={(e) => setVal(e.target.value)}
      onBlur={save}
      onKeyDown={(e) => e.key === "Enter" && save()}
      className="w-full border border-yellow-400 bg-yellow-50 text-center text-xs outline-none px-0.5 rounded"
    />
  ) : (
    <span
      onClick={() => setEditing(true)}
      title="Click to edit"
      className="block w-full min-h-[1rem] cursor-text hover:bg-yellow-50 hover:ring-1 hover:ring-yellow-300 rounded transition-all px-0.5 text-xs font-semibold"
    >
      {val}
    </span>
  );
}

/** Merge consecutive identical cells in a day row → returns [{value, span}] */
function mergeRow(cells: (any | null)[]): { value: any; span: number; index: number }[] {
  const merged: { value: any; span: number; index: number }[] = [];
  let i = 0;
  while (i < cells.length) {
    const cell = cells[i];
    
    // Skip LUNCH handled separately (index 4)
    if (i === 4) { i++; continue; }
    
    // Skip OCCUPIED slots — they were handled by the preceding cell's span
    if (cell === "OCCUPIED") { i++; continue; }

    const val = typeof cell === "string" ? cell : (cell?.subject ?? "");
    let span = (typeof cell === "object" && cell?.span) ? cell.span : 1;
    
    // If no backend span, check for manual merging (backward compatibility or user edits)
    if (span === 1 && val !== "") {
      while (
        i + span < cells.length &&
        i + span !== 4 &&
        (typeof cells[i + span] === "string" ? cells[i + span] : cells[i + span]?.subject ?? "") === val &&
        span < 2
      ) {
        span++;
      }
    }
    
    merged.push({ value: cell, span, index: i });
    i += span;
  }
  return merged;
}

const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT"];

export function TimetableDisplay({ timetable, subjects, timeSlots, onCellEdit }: TimetableProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const [schedule, setSchedule] = useState<Record<string, (any | null)[]>>(() => {
    const flat: Record<string, (any | null)[]> = {};
    Object.entries(timetable.schedule || {}).forEach(([day, cells]) => {
      flat[day] = (cells as any[]).map((c) =>
        c == null ? null : c
      );
    });
    return flat;
  });

  const [hClass, setHClass] = useState(timetable.class);
  const [hRoom, setHRoom] = useState(timetable.room);
  const [hWef, setHWef] = useState(timetable.wef);
  const [hDate, setHDate] = useState(timetable.date);
  const [hTeacher, setHTeacher] = useState(timetable.classTeacher);

  const activeDays = DAYS.filter((d) => schedule[d]?.length > 0);

  const handleCellChange = (day: string, idx: number, val: string) => {
    setSchedule((prev) => {
      const row = [...(prev[day] || [])];
      row[idx] = val;
      return { ...prev, [day]: row };
    });
    onCellEdit?.(day, idx, val);
  };

  // ── Subject legend ──────────────────────────────────────────────────────────
  const usedAbbrs = new Set<string>();
  Object.values(schedule).forEach((row) => {
    (row || []).forEach((cell) => {
      if (!cell || cell === "LUNCH" || cell === "OCCUPIED") return;
      const cellText = typeof cell === "string" ? cell : (cell.subject ?? "");
      if (!cellText || cellText === "LUNCH" || cellText === "OCCUPIED") return;
      
      cellText.split("/").forEach((part: string) => {
        const abbr = part.trim().split(/\s|\(/)[0];
        if (abbr) usedAbbrs.add(abbr);
      });
    });
  });
  // Remove system words
  ["LUNCH", "SPORTS", "LIB", "CRT", "OCCUPIED"].forEach((k) => usedAbbrs.delete(k));
  const legendAbbrs = Array.from(usedAbbrs).filter((a) => subjects[a]).sort();

  // ── PDF Export ──────────────────────────────────────────────────────────────
  const handlePrint = () => {
    if (!printRef.current) return;
    const content = printRef.current.outerHTML;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head>
      <title>${hClass} - Timetable</title>
      <style>
        * { box-sizing: border-box; font-family: Arial, sans-serif; }
        body { margin: 20px; background: white; color: black; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 2px solid black; padding: 4px 6px; text-align: center; font-size: 12px; }
        th { background: #e5e7eb; font-weight: bold; }
        .day-cell { background: #f3f4f6; font-weight: bold; }
        .lunch-cell { font-weight: bold; font-size: 11px; }
        .header-row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 12px; }
        .legend-table { margin-top: 12px; }
        .footer { display: flex; justify-content: space-between; margin-top: 16px; font-size: 12px; }
      </style>
    </head><body>${content}</body></html>`);
    w.document.close();
    setTimeout(() => w.print(), 300);
  };

  return (
    <div>
      {/* Print button (hidden during actual print) */}
      <div className="flex justify-end mb-2 no-print">
        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-700 hover:bg-green-600 text-white text-xs rounded-lg transition-colors"
        >
          📄 Download PDF
        </button>
      </div>

      {/* Printable content */}
      <div ref={printRef} className="bg-white text-black text-xs overflow-x-auto">
        {/* Header */}
        <div className="header-row flex justify-between items-start mb-2 text-xs">
          <div>
            <div><strong>CLASS: </strong><InlineEdit value={hClass} onChange={setHClass} bold /></div>
            <div><strong>ROOM NO: </strong><InlineEdit value={hRoom} onChange={setHRoom} /></div>
          </div>
          <div className="text-center">
            <div><strong>W. E. F: </strong><InlineEdit value={hWef} onChange={setHWef} /></div>
          </div>
          <div className="text-right">
            <div><strong>Date: </strong><InlineEdit value={hDate} onChange={setHDate} /></div>
            <div><strong>CLASS TEACHER: </strong><InlineEdit value={hTeacher} onChange={setHTeacher} bold /></div>
          </div>
        </div>

        {/* Main timetable grid */}
        <table className="w-full border-collapse border-2 border-black mb-3">
          <thead>
            <tr className="bg-gray-200">
              <th className="border-2 border-black px-2 py-1.5 text-xs">TIME<br />DAY</th>
              {timeSlots.map((slot, idx) => (
                <th key={idx} className="border-2 border-black px-1 py-1 text-xs leading-tight">
                  {slot.startTime}<br />to<br />{slot.endTime}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {activeDays.map((day, dayIdx) => {
              const row = schedule[day] || [];
              const merged = mergeRow(row);
              // Before LUNCH
              const beforeLunch = merged.filter((m) => m.index < 4);
              // After LUNCH (index 5, 6)
              const afterLunch = merged.filter((m) => m.index >= 5);

              return (
                <tr key={day}>
                  <td className="day-cell border-2 border-black px-2 py-1 font-bold text-center bg-gray-100">
                    {day}
                  </td>
                  {/* Periods before lunch */}
                  {beforeLunch.map((cell) => (
                    <td
                      key={cell.index}
                      colSpan={cell.span}
                      className="border-2 border-black px-1 py-1 text-center font-semibold text-xs"
                    >
                      <CellEdit
                        value={
                          typeof cell.value === "string" 
                            ? cell.value 
                            : `${cell.value?.subject || ""}${
                                (cell.value?.room && cell.value.subject !== "SPORTS" && cell.value.subject !== "LIB") 
                                  ? ` (${cell.value.room})` 
                                  : ""
                              }`
                        }
                        onChange={(v) => handleCellChange(day, cell.index, v)}
                      />
                    </td>
                  ))}
                  {/* LUNCH — only first row gets rowspan */}
                  {dayIdx === 0 ? (
                    <td
                      rowSpan={activeDays.length}
                      className="lunch-cell border-2 border-black text-center font-bold align-middle"
                      style={{ writingMode: "vertical-rl", letterSpacing: 3 }}
                    >
                      LUNCH
                    </td>
                  ) : null}
                  {/* Periods after lunch */}
                  {afterLunch.map((cell) => (
                    <td
                      key={cell.index}
                      colSpan={cell.span}
                      className="border-2 border-black px-1 py-1 text-center font-semibold text-xs"
                    >
                      <CellEdit
                        value={
                          typeof cell.value === "string" 
                            ? cell.value 
                            : `${cell.value?.subject || ""}${
                                (cell.value?.room && cell.value.subject !== "SPORTS" && cell.value.subject !== "LIB") 
                                  ? ` (${cell.value.room})` 
                                  : ""
                              }`
                        }
                        onChange={(v) => handleCellChange(day, cell.index, v)}
                      />
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Subject Legend */}
        {legendAbbrs.length > 0 && (
          <table className="legend-table w-full border-collapse border-2 border-black text-xs">
            <thead>
              <tr className="bg-gray-200">
                <th className="border-2 border-black px-2 py-1 w-10">S.NO</th>
                <th className="border-2 border-black px-2 py-1 w-24">SUB.CODE</th>
                <th className="border-2 border-black px-2 py-1">SUBJECT NAME</th>
                <th className="border-2 border-black px-2 py-1 w-20">ABBREVIATION</th>
                <th className="border-2 border-black px-2 py-1">FACULTY NAME</th>
              </tr>
            </thead>
            <tbody>
              {legendAbbrs.map((abbr, idx) => {
                const sub = subjects[abbr];
                return (
                  <tr key={abbr}>
                    <td className="border-2 border-black px-2 py-0.5 text-center">{idx + 1}</td>
                    <td className="border-2 border-black px-2 py-0.5 text-center">
                      {sub.code || "-"}
                    </td>
                    <td className="border-2 border-black px-2 py-0.5">{sub.name}</td>
                    <td className="border-2 border-black px-2 py-0.5 text-center font-bold">{abbr}</td>
                    <td className="border-2 border-black px-2 py-0.5 uppercase">{sub.faculty}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Signature Footer */}
        <div className="footer flex justify-between mt-4 text-xs">
          <span>Timetable In-charge</span>
          <span>HOD</span>
          <span>Principal</span>
        </div>
      </div>
    </div>
  );
}
