import React, { useState } from "react";

interface TimetableProps {
  timetable: {
    id: string;
    class: string;
    room: string;
    date: string;
    wef: string;
    classTeacher: string;
    schedule: {
      [day: string]: (string | { subject: string; span: number } | null)[];
    };
  };
  subjects: { [key: string]: { name: string; faculty: string } };
  timeSlots: { name: string; startTime: string; endTime: string }[];
  onCellEdit?: (day: string, period: number, value: string) => void;
}

export function TimetableDisplay({ timetable, subjects, timeSlots, onCellEdit }: TimetableProps) {
  const [editingCell, setEditingCell] = useState<{ day: string; period: number } | null>(null);
  const [editValue, setEditValue] = useState("");

  const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT"];
  
  const handleCellClick = (day: string, period: number, currentValue: string) => {
    setEditingCell({ day, period });
    setEditValue(currentValue || "");
  };

  const handleCellSave = () => {
    if (editingCell && onCellEdit) {
      onCellEdit(editingCell.day, editingCell.period, editValue);
    }
    setEditingCell(null);
  };

  const renderCell = (day: string, periodIndex: number) => {
    const daySchedule = timetable.schedule[day] || [];
    const cell = daySchedule[periodIndex];

    // Check if this cell is part of a span from previous period
    for (let i = 0; i < periodIndex; i++) {
      const prevCell = daySchedule[i];
      if (prevCell && typeof prevCell === "object" && prevCell.span) {
        if (i + prevCell.span > periodIndex) {
          return null; // This cell is spanned, don't render
        }
      }
    }

    const isLunch = periodIndex === 4;
    const isEditing = editingCell?.day === day && editingCell?.period === periodIndex;

    if (isLunch) {
      return (
        <td
          key={`${day}-${periodIndex}`}
          rowSpan={days.length}
          className="border border-slate-800 bg-slate-900 text-center align-middle font-bold"
        >
          <div className="writing-mode-vertical text-sm">L U N C H</div>
        </td>
      );
    }

    let content = "";
    let colSpan = 1;

    if (cell === null || cell === undefined) {
      content = "";
    } else if (typeof cell === "string") {
      content = cell;
    } else {
      content = cell.subject;
      colSpan = cell.span;
    }

    return (
      <td
        key={`${day}-${periodIndex}`}
        colSpan={colSpan}
        className="border border-slate-800 px-2 py-3 text-center cursor-pointer hover:bg-slate-800 transition-colors"
        onClick={() => !isEditing && handleCellClick(day, periodIndex, content)}
      >
        {isEditing ? (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleCellSave}
            onKeyDown={(e) => e.key === "Enter" && handleCellSave()}
            className="w-full bg-slate-700 border border-blue-500 rounded px-1 py-1 text-center"
            autoFocus
          />
        ) : (
          <span className="font-medium text-sm">{content}</span>
        )}
      </td>
    );
  };

  // Get unique subjects from schedule
  const usedSubjects = new Set<string>();
  if (timetable.schedule) {
    Object.values(timetable.schedule).forEach((daySchedule) => {
      if (Array.isArray(daySchedule)) {
        daySchedule.forEach((cell) => {
          if (cell) {
            if (typeof cell === "string") {
              usedSubjects.add(cell);
            } else {
              // Handle multi-subject labs or objects
              const subjectStr = typeof cell === "object" ? (cell as any).subject : "";
              if (subjectStr) {
                subjectStr.split("/").forEach((s: string) => usedSubjects.add(s.trim()));
              }
            }
          }
        });
      }
    });
  }

  const subjectList = Array.from(usedSubjects)
    .filter((s) => subjects[s])
    .sort();

  return (
    <div className="bg-white text-black p-6 rounded-lg">
      {/* Header */}
      <div className="flex justify-between items-start mb-4 text-sm">
        <div>
          <div className="font-bold">CLASS: {timetable.class}</div>
          <div>ROOM NO: {timetable.room}</div>
        </div>
        <div className="text-center">
          <div>W. E. F: {timetable.wef}</div>
        </div>
        <div className="text-right">
          <div>Date: {timetable.date}</div>
          <div className="font-bold">CLASS TEACHER: {timetable.classTeacher}</div>
        </div>
      </div>

      {/* Timetable Grid */}
      <table className="w-full border-collapse border-2 border-black mb-6">
        <thead>
          <tr className="bg-gray-200">
            <th className="border-2 border-black px-2 py-2 text-sm">TIME<br/>DAY</th>
            {timeSlots.map((slot, idx) => (
              <th key={idx} className="border-2 border-black px-2 py-2 text-xs">
                {slot.name}<br/>
                {slot.startTime}<br/>to<br/>{slot.endTime}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {days.map((day, dayIdx) => {
            const daySchedule = timetable.schedule[day];
            if (!daySchedule || daySchedule.length === 0) return null;

            return (
              <tr key={day}>
                <td className="border-2 border-black px-2 py-2 font-bold text-center bg-gray-100">
                  {day}
                </td>
                {timeSlots.map((_, periodIdx) => {
                  // Only render lunch cell once
                  if (periodIdx === 4 && dayIdx !== 0) return null;
                  return renderCell(day, periodIdx);
                })}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Subject Legend */}
      <table className="w-full border-collapse border-2 border-black text-xs">
        <thead>
          <tr className="bg-gray-200">
            <th className="border-2 border-black px-2 py-1 w-12">S.NO</th>
            <th className="border-2 border-black px-2 py-1 w-32">SUB.CODE</th>
            <th className="border-2 border-black px-2 py-1">SUBJECT NAME</th>
            <th className="border-2 border-black px-2 py-1 w-24">ABBREVIATION</th>
            <th className="border-2 border-black px-2 py-1">FACULTY NAME</th>
          </tr>
        </thead>
        <tbody>
          {subjectList.map((abbr, idx) => {
            const subject = subjects[abbr];
            return (
              <tr key={abbr}>
                <td className="border-2 border-black px-2 py-1 text-center">{idx + 1}</td>
                <td className="border-2 border-black px-2 py-1">-</td>
                <td className="border-2 border-black px-2 py-1">{subject.name}</td>
                <td className="border-2 border-black px-2 py-1 text-center font-bold">{abbr}</td>
                <td className="border-2 border-black px-2 py-1">{subject.faculty}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Footer */}
      <div className="flex justify-between mt-4 text-xs">
        <div>Timetable in-charge</div>
        <div>HOD</div>
        <div>Principal</div>
      </div>

      <style>{`
        .writing-mode-vertical {
          writing-mode: vertical-rl;
          text-orientation: mixed;
        }
      `}</style>
    </div>
  );
}
