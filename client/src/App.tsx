import { useState } from "react";
import { Dashboard } from "./pages/Dashboard";
import { FacultyPage } from "./pages/FacultyPage";
import { RoomsPage } from "./pages/RoomsPage";
import { BatchesPage } from "./pages/BatchesPage";
import { TimetablesPage } from "./pages/TimetablesPage";
import { AIChatPage } from "./pages/AIChatPage";

type Page = "dashboard" | "faculty" | "rooms" | "batches" | "timetables" | "ai-assistant";

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");

  const navItems = [
    { id: "dashboard" as Page, label: "Dashboard", icon: "🏠" },
    { id: "ai-assistant" as Page, label: "AI Assistant", icon: "🤖" },
    { id: "timetables" as Page, label: "Timetables", icon: "📅" },
    { id: "batches" as Page, label: "Batches", icon: "🎓" },
    { id: "faculty" as Page, label: "Faculty", icon: "👨‍🏫" },
    { id: "rooms" as Page, label: "Rooms", icon: "🏫" },
  ];

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;
      case "ai-assistant":
        return <AIChatPage />;
      case "faculty":
        return <FacultyPage />;
      case "rooms":
        return <RoomsPage />;
      case "batches":
        return <BatchesPage />;
      case "timetables":
        return <TimetablesPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      {/* Navigation Bar */}
      <nav className="bg-slate-900 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📚</span>
              <h1 className="text-xl font-bold">AI Timetable Scheduler</h1>
            </div>
            <div className="flex gap-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    currentPage === item.id
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  <span>{item.icon}</span>
                  <span className="hidden md:inline">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
