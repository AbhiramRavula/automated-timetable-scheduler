import { useState, useEffect } from "react";
import { getFaculty, getRooms, getSubjects, getBatches } from "../api";
import { realMockData } from "../realMockData";

export function Dashboard({ onNavigate }: { onNavigate: (page: any) => void }) {
  const [data, setData] = useState<{
    faculty: any[];
    rooms: any[];
    subjects: any[];
    batches: any[];
  }>({
    faculty: [],
    rooms: [],
    subjects: [],
    batches: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [f, r, s, b] = await Promise.all([
        getFaculty(),
        getRooms(),
        getSubjects(),
        getBatches()
      ]);
      setData({ faculty: f, rooms: r, subjects: s, batches: b });
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  const { faculty, rooms, subjects, batches } = data;

  if (loading) return <div className="p-8 text-center text-slate-400 font-medium">Loading dashboard stats...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-50 mb-2">Dashboard</h1>
        <p className="text-slate-400">
          Academic Overview • Academic Year {realMockData.academic_year}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-400">Total Batches</h3>
            <span className="text-2xl">🎓</span>
          </div>
          <p className="text-3xl font-bold text-blue-400">{batches.length}</p>
          <p className="text-xs text-slate-500 mt-1">Active classes</p>
        </div>

        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-400">Faculty Members</h3>
            <span className="text-2xl">👨‍🏫</span>
          </div>
          <p className="text-3xl font-bold text-green-400">{faculty.length}</p>
          <p className="text-xs text-slate-500 mt-1">Teaching staff</p>
        </div>

        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-400">Subjects</h3>
            <span className="text-2xl">📚</span>
          </div>
          <p className="text-3xl font-bold text-purple-400">{subjects.length}</p>
          <p className="text-xs text-slate-500 mt-1">Courses offered</p>
        </div>

        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-slate-400">Classrooms</h3>
            <span className="text-2xl">🏫</span>
          </div>
          <p className="text-3xl font-bold text-orange-400">{rooms.length}</p>
          <p className="text-xs text-slate-500 mt-1">Available rooms</p>
        </div>
      </div>

      {/* Quick Info */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Batches */}
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
          <h2 className="text-xl font-bold text-slate-50 mb-4">Active Batches</h2>
          <div className="space-y-3">
            {batches.length > 0 ? batches.map((batch: any) => (
              <div key={batch._id} className="flex items-center justify-between p-3 bg-slate-900 rounded">
                <div>
                  <p className="font-medium text-slate-200">{batch.name}</p>
                  <p className="text-sm text-slate-400">Class Teacher: {batch.classTeacher || "Not assigned"}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">{batch.room || "No room assigned"}</p>
                  <p className="text-xs text-slate-500">WEF: {batch.effectiveDate || "N/A"}</p>
                </div>
              </div>
            )) : (
              <p className="text-slate-500 italic text-sm py-4 text-center">No batches found. Go to the Batches page to add one.</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
          <h2 className="text-xl font-bold text-slate-50 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button 
              onClick={() => onNavigate("timetables")}
              className="w-full p-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-left transition-colors"
            >
              <div className="flex items-center">
                <span className="text-2xl mr-3">📅</span>
                <div>
                  <p className="font-medium">View Timetables</p>
                  <p className="text-sm text-blue-200">See all class schedules</p>
                </div>
              </div>
            </button>

            <button 
              onClick={() => onNavigate("generate")}
              className="w-full p-4 bg-green-600 hover:bg-green-700 rounded-lg text-left transition-colors"
            >
              <div className="flex items-center">
                <span className="text-2xl mr-3">🚀</span>
                <div>
                  <p className="font-medium">Generate New Timetable</p>
                  <p className="text-sm text-green-200">Create optimized schedules</p>
                </div>
              </div>
            </button>

            <button 
              onClick={() => onNavigate("ai-assistant")}
              className="w-full p-4 bg-purple-600 hover:bg-purple-700 rounded-lg text-left transition-colors"
            >
              <div className="flex items-center">
                <span className="text-2xl mr-3">🤖</span>
                <div>
                  <p className="font-medium">AI Insights</p>
                  <p className="text-sm text-purple-200">Analytics and suggestions</p>
                </div>
              </div>
            </button>

            <button 
              onClick={() => onNavigate("subjects")}
              className="w-full p-4 bg-orange-600 hover:bg-orange-700 rounded-lg text-left transition-colors"
            >
              <div className="flex items-center">
                <span className="text-2xl mr-3">📖</span>
                <div>
                  <p className="font-medium">Manage Subjects</p>
                  <p className="text-sm text-orange-200">Add or edit courses</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <h2 className="text-xl font-bold text-slate-50 mb-4">System Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-slate-400">Environment</p>
            <p className="text-lg font-medium text-slate-200">Production Ready</p>
          </div>
          <div>
            <p className="text-sm text-slate-400">Academic Year</p>
            <p className="text-lg font-medium text-slate-200">{realMockData.academic_year}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400">Database Status</p>
            <p className="text-lg font-bold text-green-500">Connected</p>
          </div>
        </div>
      </div>
    </div>
  );
}

