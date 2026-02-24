import { realMockData, extractFaculty, extractRooms, extractSubjects, extractBatches } from "../realMockData";

export function Dashboard({ onNavigate }: { onNavigate: (page: any) => void }) {
  const faculty = extractFaculty();
  const rooms = extractRooms();
  const subjects = extractSubjects();
  const batches = extractBatches();

  return (
    <div className="space-y-6">
      {/* ... existing content ... */}
      {/* Rest of the file remains similar but buttons call onNavigate */}
      <div>
        <h1 className="text-3xl font-bold text-slate-50 mb-2">Dashboard</h1>
        <p className="text-slate-400">
          {realMockData.department} • Academic Year {realMockData.academic_year}
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
            {batches.map((batch) => (
              <div key={batch.id} className="flex items-center justify-between p-3 bg-slate-900 rounded">
                <div>
                  <p className="font-medium text-slate-200">{batch.name}</p>
                  <p className="text-sm text-slate-400">Class Teacher: {batch.classTeacher}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">{batch.room || "No room"}</p>
                  <p className="text-xs text-slate-500">WEF: {batch.effectiveDate}</p>
                </div>
              </div>
            ))}
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
                <span className="text-2xl mr-3">🔄</span>
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
                <span className="text-2xl mr-3">📊</span>
                <div>
                  <p className="font-medium">AI Insights</p>
                  <p className="text-sm text-purple-200">Analytics and suggestions</p>
                </div>
              </div>
            </button>

            <button 
              onClick={() => window.print()}
              className="w-full p-4 bg-orange-600 hover:bg-orange-700 rounded-lg text-left transition-colors"
            >
              <div className="flex items-center">
                <span className="text-2xl mr-3">📄</span>
                <div>
                  <p className="font-medium">Export Data</p>
                  <p className="text-sm text-orange-200">Download as PDF</p>
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
            <p className="text-sm text-slate-400">Department</p>
            <p className="text-lg font-medium text-slate-200">{realMockData.department}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400">Academic Year</p>
            <p className="text-lg font-medium text-slate-200">{realMockData.academic_year}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400">Last Updated</p>
            <p className="text-lg font-medium text-slate-200">Today</p>
          </div>
        </div>
      </div>
    </div>
  );
}
