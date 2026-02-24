import { useState } from 'react';
import { Course, Teacher, Room } from '../types';

interface InputFormProps {
  onGenerate: (courses: Course[], teachers: Teacher[], rooms: Room[], constraints: string) => void;
  loading: boolean;
}

export default function InputForm({ onGenerate, loading }: InputFormProps) {
  const [constraintsText, setConstraintsText] = useState('No teacher conflicts, no room conflicts, prefer mid-day slots.');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Sample data for demo
    const courses: Course[] = [
      { code: 'CS101', name: 'Intro to CS', durationSlots: 1, teacherCode: 'T1', batch: 'B1' },
      { code: 'CS102', name: 'Data Structures', durationSlots: 1, teacherCode: 'T2', batch: 'B1' },
      { code: 'CS103', name: 'Algorithms', durationSlots: 1, teacherCode: 'T1', batch: 'B2' },
    ];

    const teachers: Teacher[] = [
      { code: 'T1', name: 'Dr. Smith' },
      { code: 'T2', name: 'Dr. Jones' },
    ];

    const rooms: Room[] = [
      { name: 'R101', capacity: 40 },
      { name: 'R102', capacity: 50 },
    ];

    onGenerate(courses, teachers, rooms, constraintsText);
  };

  return (
    <div className="bg-slate-900 p-6 rounded-lg border border-slate-700">
      <h2 className="text-2xl font-bold mb-4">Generate Timetable</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Constraints (Natural Language)
          </label>
          <textarea
            value={constraintsText}
            onChange={(e) => setConstraintsText(e.target.value)}
            className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-slate-100 min-h-[100px]"
            placeholder="e.g., No labs on Friday, CS faculty prefer mornings..."
          />
        </div>

        <div className="text-sm text-slate-400">
          <p>Using sample data:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>3 Courses (CS101, CS102, CS103)</li>
            <li>2 Teachers (Dr. Smith, Dr. Jones)</li>
            <li>2 Rooms (R101, R102)</li>
          </ul>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-700 text-white font-medium py-3 px-4 rounded transition-colors"
        >
          {loading ? 'Generating...' : 'Generate Timetable'}
        </button>
      </form>
    </div>
  );
}
