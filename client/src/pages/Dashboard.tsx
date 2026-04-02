import { useState, useEffect } from "react";
import { getFaculty, getRooms, getSubjects, getBatches } from "../api";
import { realMockData } from "../realMockData";
import { useInstitution } from "../context/InstitutionContext";

export function Dashboard({ onNavigate }: { onNavigate: (page: any) => void }) {
  const { activeInstitution } = useInstitution();
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
    if (activeInstitution) {
      loadData();
    }
  }, [activeInstitution]);

  const loadData = async () => {
    setLoading(true);
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

  if (!activeInstitution) return <div className="p-8 text-center text-slate-400 font-medium">Please select an institution profile to view dashboard.</div>;
  if (loading) return <div className="p-8 text-center text-slate-400 font-medium tracking-widest animate-pulse uppercase">Syncing Dashboard...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-50 mb-2">Dashboard Overview</h1>
          <p className="text-slate-400 flex items-center gap-2">
            <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded text-xs font-bold uppercase tracking-wider">{activeInstitution.name}</span>
            • Academic Year {realMockData.academic_year}
          </p>
        </div>
        <div className="text-right">
           <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Last Data Sync</p>
           <p className="text-xs font-mono text-slate-300">{new Date().toLocaleTimeString()}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg hover:border-blue-500/50 transition-all cursor-pointer" onClick={() => onNavigate("batches")}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Batches</h3>
            <span className="text-xl">🎓</span>
          </div>
          <p className="text-4xl font-black text-blue-400 mb-1">{batches.length}</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Manage class sections</p>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg hover:border-green-500/50 transition-all cursor-pointer" onClick={() => onNavigate("faculty")}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Staff Strength</h3>
            <span className="text-xl">👨‍🏫</span>
          </div>
          <p className="text-4xl font-black text-green-400 mb-1">{faculty.length}</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Teaching experts listed</p>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg hover:border-purple-500/50 transition-all cursor-pointer" onClick={() => onNavigate("subjects")}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Course Catalog</h3>
            <span className="text-xl">📚</span>
          </div>
          <p className="text-4xl font-black text-purple-400 mb-1">{subjects.length}</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Unique subjects defined</p>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg hover:border-orange-500/50 transition-all cursor-pointer" onClick={() => onNavigate("rooms")}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Room Capacity</h3>
            <span className="text-xl">🏫</span>
          </div>
          <p className="text-4xl font-black text-orange-400 mb-1">{rooms.length}</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-tighter">Allocated physical space</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl overflow-hidden relative">
          <h2 className="text-xl font-bold text-slate-50 mb-6">Profile Resources</h2>
          <div className="space-y-3 relative z-10">
            {batches.length > 0 ? batches.slice(0, 5).map((batch: any) => (
              <div key={batch._id} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-xl border border-slate-700/50 hover:bg-slate-900 transition-colors group">
                <div>
                  <p className="font-bold text-slate-200 group-hover:text-blue-400 transition-colors">{batch.name}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">{batch.classTeacher || "NO TEACHER"}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono text-slate-400 uppercase tracking-tighter">{batch.room || "WEB-RM"}</p>
                </div>
              </div>
            )) : (
              <div className="py-12 text-center">
                 <p className="text-slate-500 text-sm italic mb-4">Empty profile resources.</p>
                 <button onClick={() => onNavigate("batches")} className="px-4 py-2 bg-blue-600/10 text-blue-400 border border-blue-600/30 rounded-lg text-sm font-bold uppercase">Initialize Batches</button>
              </div>
            )}
            {batches.length > 5 && (
               <button onClick={() => onNavigate("batches")} className="w-full py-2 text-xs text-slate-500 hover:text-slate-300 font-bold uppercase tracking-widest transition-colors">View All {batches.length} Batches</button>
            )}
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
          <h2 className="text-xl font-bold text-slate-50 mb-6">Platform Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button 
              onClick={() => onNavigate("timetables")}
              className="p-6 bg-blue-600/10 hover:bg-blue-600/20 rounded-xl text-left transition-all border border-blue-500/20 group"
            >
              <span className="text-3xl block mb-4 group-hover:scale-110 transition-transform origin-left">🔗</span>
              <p className="font-bold text-blue-400 mb-1">View Schedules</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">Active timetables</p>
            </button>

            <button 
              onClick={() => onNavigate("generate")}
              className="p-6 bg-green-600/10 hover:bg-green-600/20 rounded-xl text-left transition-all border border-green-500/20 group"
            >
              <span className="text-3xl block mb-4 group-hover:scale-110 transition-transform origin-left">⚡</span>
              <p className="font-bold text-green-400 mb-1">AI Generator</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">Build new schedules</p>
            </button>

            <button 
              onClick={() => onNavigate("subjects")}
              className="p-6 bg-orange-600/10 hover:bg-orange-600/20 rounded-xl text-left transition-all border border-orange-500/20 group"
            >
              <span className="text-3xl block mb-4 group-hover:scale-110 transition-transform origin-left">📝</span>
              <p className="font-bold text-orange-400 mb-1">Quick Add</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest">Submit resources</p>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl border-l-4 border-l-blue-500">
        <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] mb-6">Profile Integrity Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-center gap-4">
             <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold border-2 ${faculty.length > 0 ? 'bg-green-500/10 border-green-500/50 text-green-500' : 'bg-red-500/10 border-red-500/50 text-red-500'}`}>
                {faculty.length > 0 ? '✓' : '!'}
             </div>
             <div>
                <p className="text-sm font-bold text-slate-200">Faculty Readiness</p>
                <p className="text-[10px] text-slate-500 uppercase">{faculty.length > 0 ? 'CALIBRATED' : 'NOT INITIALIZED'}</p>
             </div>
          </div>
          <div className="flex items-center gap-4">
             <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold border-2 ${batches.length > 0 ? 'bg-blue-500/10 border-blue-500/50 text-blue-500' : 'bg-red-500/10 border-red-500/50 text-red-500'}`}>
                {batches.length > 0 ? '✓' : '!'}
             </div>
             <div>
                <p className="text-sm font-bold text-slate-200">Class Matrix</p>
                <p className="text-[10px] text-slate-500 uppercase">{batches.length > 0 ? 'MAP COMPLETE' : 'PENDING GRID'}</p>
             </div>
          </div>
          <div className="flex items-center gap-4">
             <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold border-2 ${subjects.length > 0 ? 'bg-purple-500/10 border-purple-500/50 text-purple-500' : 'bg-red-500/10 border-red-500/50 text-red-500'}`}>
                {subjects.length > 0 ? '✓' : '!'}
             </div>
             <div>
                <p className="text-sm font-bold text-slate-200">Syllabus Logic</p>
                <p className="text-[10px] text-slate-500 uppercase">{subjects.length > 0 ? 'VERIFIED' : 'UNMAPPED'}</p>
             </div>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-slate-800 text-center">
        <button 
          onClick={() => onNavigate("about")}
          className="group inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-widest"
        >
          <span>🤔 How does this work?</span>
          <span className="opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-blue-400">→</span>
        </button>
      </div>
    </div>
  );
}

