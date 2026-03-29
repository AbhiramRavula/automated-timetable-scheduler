import { useState } from "react";
import { Dashboard } from "./pages/Dashboard";
import { FacultyPage } from "./pages/FacultyPage";
import { RoomsPage } from "./pages/RoomsPage";
import { BatchesPage } from "./pages/BatchesPage";
import { TimetablesPage } from "./pages/TimetablesPage";
import { AIChatPage } from "./pages/AIChatPage";
import { GeneratePage } from "./pages/GeneratePage";
import { SubjectsPage } from "./pages/SubjectsPage";
import { ProfilesPage } from "./pages/ProfilesPage";
import { InstitutionProvider, useInstitution } from "./context/InstitutionContext";

type Page = "dashboard" | "faculty" | "subjects" | "rooms" | "batches" | "timetables" | "ai-assistant" | "generate" | "profiles";

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const { activeInstitution, institutions, setActiveInstitution } = useInstitution();

  const navItems = [
    { id: "dashboard" as Page, label: "Dashboard", icon: "🏠" },
    { id: "generate" as Page, label: "Generate", icon: "🚀" },
    { id: "ai-assistant" as Page, label: "AI Assistant", icon: "🤖" },
    { id: "timetables" as Page, label: "Timetables", icon: "📅" },
    { id: "batches" as Page, label: "Batches", icon: "🎓" },
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
      case "ai-assistant":
        return <AIChatPage />;
      case "faculty":
        return <FacultyPage />;
      case "subjects":
        return <SubjectsPage />;
      case "rooms":
        return <RoomsPage />;
      case "batches":
        return <BatchesPage />;
      case "timetables":
        return <TimetablesPage />;
      case "profiles":
        return <ProfilesPage />;
      default:
        return <Dashboard onNavigate={(page: Page) => setCurrentPage(page)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <nav className="bg-slate-900 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📚</span>
              <div>
                <h1 className="text-lg font-bold leading-tight">AI Scheduler</h1>
                {activeInstitution && (
                  <p className="text-xs text-blue-400 font-medium">{activeInstitution.name}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Institution Selector */}
              <div className="hidden lg:block">
                <select 
                  className="bg-slate-800 border border-slate-700 text-sm rounded-md px-2 py-1 focus:ring-blue-500 focus:border-blue-500"
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
              </div>

              <div className="flex gap-1 overflow-x-auto">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setCurrentPage(item.id)}
                    className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2 text-sm ${
                      currentPage === item.id
                        ? "bg-blue-600 text-white"
                        : "text-slate-300 hover:bg-slate-800"
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span className="hidden xl:inline">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
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
