import { useState, useEffect } from "react";
import { getSubjects, createSubject, updateSubject, deleteSubject, getFaculty, getBatches } from "../api";
import { useInstitution } from "../context/InstitutionContext";

interface Subject {
  _id?: string;
  code: string;
  name: string;
  type: "lecture" | "lab" | "tutorial" | "project";
  sessionsPerWeek: number;
  durationSlots: number;
  teacherCodes: string[];
  batch: string;
  preferredRoomTypes: string[];
  priority: "core" | "elective";
  requiredRoomTag?: string;
}

export function SubjectsPage() {
  const { activeInstitution } = useInstitution();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [faculty, setFaculty] = useState<any[]>([]);
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Subject | null>(null);

  useEffect(() => {
    if (activeInstitution) {
      loadData();
    }
  }, [activeInstitution]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sData, fData, bData] = await Promise.all([
        getSubjects(),
        getFaculty(),
        getBatches()
      ]);
      setSubjects(sData);
      setFaculty(fData);
      setBatches(bData);
    } catch (err) {
      console.error("Failed to load data", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredSubjects = subjects.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.batch.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (s: Subject) => {
    setEditingId(s._id!);
    setEditForm({ ...s });
  };

  const handleSave = async () => {
    if (editForm && editingId) {
      try {
        await updateSubject(editingId, editForm);
        setEditingId(null);
        setEditForm(null);
        loadData();
      } catch (err) {
        alert("Failed to update subject");
      }
    }
  };

  const handleAddNew = () => {
    setIsAdding(true);
    setEditForm({
      code: "",
      name: "",
      type: "lecture",
      sessionsPerWeek: 3,
      durationSlots: 1,
      teacherCodes: [],
      batch: batches[0]?.name || "Default",
      preferredRoomTypes: ["lecture"],
      priority: "core",
      requiredRoomTag: ""
    });
  };

  const handleSaveNew = async () => {
    if (editForm && editForm.code && editForm.name) {
      try {
        await createSubject(editForm);
        setIsAdding(false);
        setEditForm(null);
        loadData();
      } catch (err) {
        alert("Failed to create subject");
      }
    } else {
      alert("Please fill in Code and Name");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this subject?")) {
      try {
        await deleteSubject(id);
        loadData();
      } catch (err) {
        alert("Failed to delete subject");
      }
    }
  };

  const toggleTeacher = (teacherCode: string) => {
    if (!editForm) return;
    const newCodes = editForm.teacherCodes.includes(teacherCode)
      ? editForm.teacherCodes.filter(tc => tc !== teacherCode)
      : [...editForm.teacherCodes, teacherCode];
    setEditForm({ ...editForm, teacherCodes: newCodes });
  };

  if (!activeInstitution) return <div className="p-8 text-center text-slate-400 font-medium">Please select an institution profile.</div>;
  if (loading) return <div className="p-8 text-center text-slate-400 font-medium">Loading subjects...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-50 mb-2">Subject Management ({activeInstitution.name})</h1>
          <p className="text-slate-400">Define courses, weekly sessions, and assign faculty</p>
        </div>
        <button
          onClick={handleAddNew}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
        >
          <span>➕</span>
          Add Subject
        </button>
      </div>

      <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
        <input
          type="text"
          placeholder="Search by code, subject name, or batch..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
        />
      </div>

      {(isAdding || editingId) && editForm && (
        <div className="bg-slate-800 p-6 rounded-lg border border-blue-500/50 shadow-xl shadow-blue-500/10">
          <h2 className="text-xl font-bold text-slate-50 mb-4">
            {isAdding ? "Add New Subject" : `Edit Subject: ${editForm.code}`}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Subject Code *</label>
              <input
                type="text"
                value={editForm.code}
                onChange={(e) => setEditForm({ ...editForm, code: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 px-4 py-2"
                placeholder="CS101"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Subject Name *</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 px-4 py-2"
                placeholder="Data Structures"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Batch / Class</label>
              <select
                value={editForm.batch}
                onChange={(e) => setEditForm({ ...editForm, batch: e.target.value })}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
              >
                {batches.map(b => <option key={b._id} value={b.name}>{b.name}</option>)}
                {batches.length === 0 && <option value="Default">Default</option>}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Type</label>
              <select
                value={editForm.type}
                onChange={(e) => setEditForm({ ...editForm, type: e.target.value as any })}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
              >
                <option value="lecture">Lecture</option>
                <option value="lab">Lab / Practical</option>
                <option value="tutorial">Tutorial</option>
                <option value="project">Project / Independent Study</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Sessions / Week</label>
              <input
                type="number"
                value={editForm.sessionsPerWeek}
                onChange={(e) => setEditForm({ ...editForm, sessionsPerWeek: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Slots Per Session (Duration)</label>
              <input
                type="number"
                value={editForm.durationSlots}
                onChange={(e) => setEditForm({ ...editForm, durationSlots: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Required Room Tag (Optional)</label>
              <input
                type="text"
                value={editForm.requiredRoomTag || ""}
                onChange={(e) => setEditForm({ ...editForm, requiredRoomTag: e.target.value })}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                placeholder="coding-lab, seminar-hall"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-slate-400 mb-3">Assign Faculty (Cross-department supported)</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-3 bg-slate-900 rounded-lg border border-slate-700">
              {faculty.map(f => (
                <button
                  key={f._id}
                  onClick={() => toggleTeacher(f.code)}
                  className={`px-3 py-1.5 rounded text-[10px] text-left transition-colors border ${
                    editForm.teacherCodes.includes(f.code)
                      ? "bg-blue-600 border-blue-400 text-white"
                      : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500"
                  }`}
                >
                  <p className="font-bold truncate">{f.name}</p>
                  <p className="opacity-60">{f.code} • {f.department}</p>
                </button>
              ))}
              {faculty.length === 0 && (
                <p className="col-span-full text-center py-4 text-slate-500 text-sm italic">No faculty members found in this institution.</p>
              )}
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button
              onClick={isAdding ? handleSaveNew : handleSave}
              className="px-8 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition-colors"
            >
              {isAdding ? "Add Subject" : "Save Changes"}
            </button>
            <button
              onClick={() => { setIsAdding(false); setEditingId(null); setEditForm(null); }}
              className="px-8 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-900/80 border-b border-slate-700">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Batch</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Faculty Assigned</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredSubjects.map(s => (
                <tr key={s._id} className="hover:bg-slate-750/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                       <span className={`w-2 h-8 rounded-full ${
                        s.type === 'lecture' ? 'bg-blue-500' :
                        s.type === 'lab' ? 'bg-orange-500' :
                        s.type === 'project' ? 'bg-purple-500' :
                        'bg-green-500'
                      }`}></span>
                      <div>
                        <div className="font-bold text-slate-100">{s.code}</div>
                        <div className="text-xs text-slate-500 truncate max-w-[200px]">{s.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-2 py-0.5 bg-slate-900/50 rounded border border-slate-700 text-blue-300 font-mono text-xs">{s.batch}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-slate-300">
                      <p className="font-bold">{s.sessionsPerWeek} SESSIONS</p>
                      <p className="text-[10px] text-slate-500">{s.durationSlots} {s.durationSlots > 1 ? 'slots each' : 'slot'}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {s.teacherCodes.length > 0 ? (
                        s.teacherCodes.map(tc => {
                          const t = faculty.find(f => f.code === tc);
                          return (
                            <span key={tc} className="text-[9px] px-2 py-0.5 bg-slate-700/50 text-slate-300 rounded border border-slate-600 font-medium">
                              {t ? t.name : tc}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-[10px] text-red-500/70 italic font-medium tracking-tight">PENDING ASSIGNMENT</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEdit(s)} className="p-2 hover:bg-blue-500/10 text-blue-400 rounded-lg">✏️</button>
                      <button onClick={() => handleDelete(s._id!)} className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredSubjects.length === 0 && (
                <tr>
                   <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">No subjects found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
