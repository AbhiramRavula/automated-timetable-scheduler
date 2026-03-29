import { useState, useEffect } from "react";
import { getFaculty, createFaculty, updateFaculty, deleteFaculty, getTimetables, getDepartments } from "../api";
import { useInstitution } from "../context/InstitutionContext";

interface Faculty {
  _id?: string;
  id: string; // for compatibility with older code if needed
  name: string;
  code: string;
  department: string;
  designation: string;
  email?: string;
  phone?: string;
}

export function FacultyPage() {
  const { activeInstitution } = useInstitution();
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Faculty | null>(null);
  const [workloadMap, setWorkloadMap] = useState<Record<string, number>>({});

  useEffect(() => {
    if (activeInstitution) {
      loadData();
    }
  }, [activeInstitution]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [facData, schedules, deptData] = await Promise.all([
        getFaculty(),
        getTimetables(),
        getDepartments()
      ]);
      setFaculty(facData);
      setDepartments(deptData);
      
      if (schedules && schedules.length > 0) {
        const latest = schedules[0];
        const map: Record<string, number> = {};
        (latest.workload || []).forEach((w: any) => {
          map[w.teacherCode.toUpperCase()] = w.totalHours;
        });
        setWorkloadMap(map);
      }
    } catch (err) {
      console.error("Failed to load faculty", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredFaculty = faculty.filter(f =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (f: Faculty) => {
    setEditingId(f._id!);
    setEditForm({ ...f });
  };

  const handleSave = async () => {
    if (editForm && editingId) {
      try {
        await updateFaculty(editingId, editForm);
        setEditingId(null);
        setEditForm(null);
        loadData();
      } catch (err) {
        alert("Failed to update faculty member");
      }
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleAddNew = () => {
    setIsAdding(true);
    setEditForm({
      id: "", 
      code: "",
      name: "",
      department: departments.length > 0 ? departments[0].name : "General",
      designation: "Assistant Professor",
      email: "",
      phone: ""
    });
  };

  const handleSaveNew = async () => {
    if (editForm && editForm.name.trim() && editForm.code.trim()) {
      try {
        await createFaculty(editForm);
        setIsAdding(false);
        setEditForm(null);
        loadData();
      } catch (err) {
        alert("Failed to add faculty member");
      }
    } else {
      alert("Name and Code are required");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this faculty member?")) {
      try {
        await deleteFaculty(id);
        loadData();
      } catch (err) {
        alert("Failed to delete faculty member");
      }
    }
  };

  const handleBulkImport = async () => {
    const csvInput = prompt("Paste CSV data (Name, Code, Department, Designation, Email):");
    if (csvInput) {
      const lines = csvInput.split('\n');
      let successCount = 0;
      for (const line of lines) {
        const [name, code, department, designation, email] = line.split(',').map(s => s?.trim());
        if (name && code) {
          try {
            await createFaculty({
              name,
              code,
              department: department || (departments.length > 0 ? departments[0].name : "General"),
              designation: designation || "Assistant Professor",
              email: email || "",
              phone: ""
            });
            successCount++;
          } catch (e) {}
        }
      }
      loadData();
      alert(`Imported ${successCount} faculty members`);
    }
  };

  if (!activeInstitution) return <div className="p-8 text-center text-slate-400 font-medium">Please select an institution profile.</div>;
  if (loading) return <div className="p-8 text-center text-slate-400 font-medium">Loading faculty...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-50 mb-2">Faculty Management ({activeInstitution.name})</h1>
          <p className="text-slate-400">Manage teaching staff and their primary departments</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleBulkImport}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center gap-2"
          >
            <span>📥</span>
            Bulk Import
          </button>
          <button
            onClick={handleAddNew}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
          >
            <span>➕</span>
            Add Faculty
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
        <input
          type="text"
          placeholder="Search faculty by name, department or code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Add Faculty Form */}
      {isAdding && editForm && (
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
          <h2 className="text-xl font-bold text-slate-50 mb-4">Add New Faculty</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Name *</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100"
                placeholder="Dr. John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Primary Department</label>
              <select
                value={editForm.department}
                onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100"
              >
                {departments.length > 0 ? (
                  departments.map(d => <option key={d._id} value={d.name}>{d.name}</option>)
                ) : (
                  <option value="General">General</option>
                )}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Code *</label>
              <input
                type="text"
                value={editForm.code}
                onChange={(e) => setEditForm({ ...editForm, code: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100"
                placeholder="PROF01"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Designation</label>
              <select
                value={editForm.designation}
                onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100"
              >
                <option value="Professor">Professor</option>
                <option value="Associate Professor">Associate Professor</option>
                <option value="Assistant Professor">Assistant Professor</option>
                <option value="Lecturer">Lecturer</option>
                <option value="Lab Assistant">Lab Assistant</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100"
                placeholder="john.doe@college.edu"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSaveNew}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-medium"
            >
              Add Faculty
            </button>
            <button
              onClick={() => { setIsAdding(false); setEditForm(null); }}
              className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Faculty List */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-700">
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Code</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Dept</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Designation</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Load</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredFaculty.map((f) => (
                <tr key={f._id} className="hover:bg-slate-750/50 transition-colors group">
                  {editingId === f._id && editForm ? (
                    <td colSpan={6} className="px-6 py-4 bg-slate-900/30">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-2">
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="bg-slate-800 border border-slate-700 rounded px-3 py-1 text-sm"
                          placeholder="Name"
                        />
                        <select
                          value={editForm.department}
                          onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                          className="bg-slate-800 border border-slate-700 rounded px-3 py-1 text-sm"
                        >
                          {departments.map(d => <option key={d._id} value={d.name}>{d.name}</option>)}
                          {departments.length === 0 && <option value={f.department}>{f.department}</option>}
                        </select>
                        <select
                          value={editForm.designation}
                          onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                          className="bg-slate-800 border border-slate-700 rounded px-3 py-1 text-sm"
                        >
                          <option value="Professor">Professor</option>
                          <option value="Associate Professor">Associate Professor</option>
                          <option value="Assistant Professor">Assistant Professor</option>
                          <option value="Lecturer">Lecturer</option>
                        </select>
                        <div className="flex gap-2">
                          <button onClick={handleSave} className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-sm font-bold">Save</button>
                          <button onClick={handleCancel} className="bg-slate-700 hover:bg-slate-600 px-3 py-1 rounded text-sm">Cancel</button>
                        </div>
                      </div>
                    </td>
                  ) : (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-400">{f.code}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-slate-100">{f.name}</div>
                        {f.email && <div className="text-[10px] text-slate-500">{f.email}</div>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-300 uppercase tracking-tighter">{f.department}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">{f.designation}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                          (workloadMap[f.code.toUpperCase()] || 0) > 18 ? 'bg-red-500/10 text-red-500' : 
                          (workloadMap[f.code.toUpperCase()] || 0) > 0 ? 'bg-green-500/10 text-green-500' :
                          'bg-slate-700/50 text-slate-500'
                        }`}>
                          {workloadMap[f.code.toUpperCase()] ? `${workloadMap[f.code.toUpperCase()].toFixed(1)} HRS` : '0 HRS'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button onClick={() => handleEdit(f)} className="text-slate-500 hover:text-blue-400 transition-colors mr-4">✏️</button>
                        <button onClick={() => handleDelete(f._id!)} className="text-slate-500 hover:text-red-400 transition-colors">🗑️</button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
              {filteredFaculty.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 italic">No faculty members found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
