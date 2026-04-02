import { useState } from "react"; // File touched to refresh TS resolution
import { Dashboard } from "./pages/Dashboard";
import { FacultyPage } from "./pages/FacultyPage";
import { RoomsPage } from "./pages/RoomsPage";
import { ClassesPage } from "./pages/ClassesPage";
import { TimetablesPage } from "./pages/TimetablesPage";
// import { AIChatPage } from "./pages/AIChatPage";
import { GeneratePage } from "./pages/GeneratePage";
import { SubjectsPage } from "./pages/SubjectsPage";
import { ProfilesPage } from "./pages/ProfilesPage";
import { AboutPage } from "./pages/AboutPage";
import { InstitutionProvider, useInstitution } from "./context/InstitutionContext";

type Page = "dashboard" | "faculty" | "subjects" | "rooms" | "classes" | "timetables" | "ai-assistant" | "generate" | "profiles" | "about";

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const { activeInstitution, institutions, setActiveInstitution } = useInstitution();

  const navItems = [
    { id: "dashboard" as Page, label: "Dashboard", icon: "🏠" },
    { id: "generate" as Page, label: "Generate", icon: "🚀" },
    // { id: "ai-assistant" as Page, label: "AI Assistant", icon: "🤖" },
    { id: "timetables" as Page, label: "Timetables", icon: "📅" },
    { id: "classes" as Page, label: "Classes", icon: "🎓" },
    { id: "subjects" as Page, label: "Subjects", icon: "📖" },
    { id: "faculty" as Page, label: "Faculty", icon: "👨‍🏫" },
    { id: "rooms" as Page, label: "Rooms", icon: "🏫" },
    { id: "profiles" as Page, label: "Profiles", icon: "🏢" },
  ];

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard onNavigate={(page: Page) => setCurrentPage(page)} />;
      case "generate":
        return <GeneratePage />;
      // case "ai-assistant":
      //   return <AIChatPage />;
      case "faculty":
        return <FacultyPage />;
      case "subjects":
        return <SubjectsPage />;
      case "rooms":
        return <RoomsPage />;
      case "classes":
        return <ClassesPage />;
      case "timetables":
        return <TimetablesPage />;
      case "profiles":
        return <ProfilesPage />;
      case "about":
        return <AboutPage />;
      default:
        return <Dashboard onNavigate={(page: Page) => setCurrentPage(page)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <nav className="sticky top-0 z-50 bg-gradient-to-r from-slate-800 to-slate-900/80 backdrop-blur-xl border-b border-slate-700/30 shadow-xl rounded-b-xl">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            <div className="flex-shrink-0 flex items-center gap-3 group cursor-pointer" onClick={() => setCurrentPage("dashboard")}>
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                📚
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-black tracking-tight text-white uppercase italic">Timetable </h1>
                <h1>Scheduler</h1>
                {activeInstitution && (
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                    <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">{activeInstitution.name}</p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Institution Selector */}
              <div className="hidden lg:block relative group">
                <select 
                  className="bg-slate-800/50 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer appearance-none min-w-[160px]"
                  value={activeInstitution?._id || ""}
                  onChange={(e) => {
                    const found = institutions.find(i => i._id === e.target.value);
                    if (found) setActiveInstitution(found);
                  }}
                >
                  {institutions.map(inst => (
                    <option key={inst._id} value={inst._id}>{inst.name}</option>
                  ))}
                  {institutions.length === 0 && <option disabled>No profiles</option>}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[10px] text-slate-500">▼</div>
              </div>

              <div className="flex gap-1 items-center bg-slate-800/30 p-1 rounded-xl border border-slate-700/30">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    title={item.label}
                    onClick={() => setCurrentPage(item.id)}
                    className={`px-3 py-2 rounded-lg transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-wide group ${
                      currentPage === item.id
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                        : "text-slate-400 hover:text-slate-100 hover:bg-slate-700/50"
                    }`}
                  >
                    <span className="text-base group-hover:scale-125 transition-transform">{item.icon}</span>
                    <span className="hidden 2xl:inline">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {!activeInstitution && currentPage !== 'profiles' ? (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-900/50 border border-dashed border-slate-700 rounded-2xl">
            <span className="text-6xl mb-6">🏢</span>
            <h2 className="text-2xl font-bold mb-2">No Institution Selected</h2>
            <p className="text-slate-400 mb-8 max-w-md text-center">
              Please create or select an institution profile to begin managing schedules.
            </p>
            <button 
              onClick={() => setCurrentPage('profiles')}
              className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Manage Profiles
            </button>
          </div>
        ) : renderPage()}
      </main>
    </div>
  );
}

function App() {
  return (
    <InstitutionProvider>
      <AppContent />
    </InstitutionProvider>
  );
}

export default App;
