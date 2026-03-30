import { useState, useEffect } from "react";
import { getBatches, createBatch, updateBatch, deleteBatch } from "../api";
import { useInstitution } from "../context/InstitutionContext";
import ClassDetailsModal from "../components/ClassDetailsModal";

export interface Class {
  _id?: string;
  id?: string;
  name: string;
  room: string;
  classTeacher: string;
  effectiveDate: string;
  semester?: string;
  year?: number;
}

export function ClassesPage() {
  const { activeInstitution } = useInstitution();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Class | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [showDetails, setShowDetails] = useState<Class | null>(null);

  useEffect(() => {
    if (activeInstitution) loadData();
  }, [activeInstitution]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getBatches();
      setClasses(data);
    } catch (err) {
      console.error("Failed to fetch classes", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (cls: Class) => {
    setEditingId(cls._id || cls.id || null);
    setEditForm({ ...cls });
  };

  const handleSave = async () => {
    if (editForm && editingId) {
      try {
        const updated = await updateBatch(editingId, editForm);
        setClasses(classes.map(c => (c._id === editingId || c.id === editingId) ? updated : c));
        setEditingId(null);
        setEditForm(null);
      } catch {
        alert("Failed to update class");
      }
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this class?")) {
      try {
        await deleteBatch(id);
        setClasses(classes.filter(c => c._id !== id && c.id !== id));
      } catch { alert("Failed to delete"); }
    }
  };

  const handleAddNew = () => {
    setIsAdding(true);
    setEditForm({
      name: "",
      room: "",
      classTeacher: "",
      effectiveDate: new Date().toLocaleDateString("en-GB"),
      semester: "I",
      year: 1,
    });
  };

  const handleSaveNew = async () => {
    if (editForm && editForm.name.trim()) {
      try {
        const created = await createBatch(editForm);
        setClasses([...classes, created]);
        setIsAdding(false);
        setEditForm(null);
      } catch { alert("Failed to create"); }
    }
  };

  if (!activeInstitution) return <div className="p-8 text-center text-slate-400 font-medium">Please select an institution profile.</div>;
  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-50 mb-2">Class Management ({activeInstitution.name})</h1>
          <p className="text-slate-400">Manage class sections and semester transitions.</p>
        </div>
        <button onClick={handleAddNew} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2">
          <span>➕</span> Add Class
        </button>
      </div>

      {isAdding && editForm && (
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 shadow-xl">
          <h2 className="text-xl font-bold text-slate-50 mb-4">Add New Class</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Class Name</label>
              <input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100" placeholder="B.E III SEM - IT SEC-A" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Room</label>
              <input type="text" value={editForm.room} onChange={e => setEditForm({ ...editForm, room: e.target.value })}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100" placeholder="N 305" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Class Teacher</label>
              <input type="text" value={editForm.classTeacher} onChange={e => setEditForm({ ...editForm, classTeacher: e.target.value })}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100" placeholder="Teacher Name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Effective Date</label>
              <input type="text" value={editForm.effectiveDate} onChange={e => setEditForm({ ...editForm, effectiveDate: e.target.value })}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100" placeholder="22/09/2025" />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={handleSaveNew} className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-bold">Create</button>
            <button onClick={() => { setIsAdding(false); setEditForm(null); }} className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {classes.map(cls => (
          <div key={cls._id || cls.id} className="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-blue-500/50 transition-all shadow-lg group">
            {(editingId === (cls._id || cls.id) && editForm) ? (
              <div className="space-y-4">
                <input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded p-2" />
                <input type="text" value={editForm.classTeacher} onChange={e => setEditForm({ ...editForm, classTeacher: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded p-2" />
                <div className="flex gap-2">
                  <button onClick={handleSave} className="flex-1 bg-blue-600 py-1 rounded font-bold">Save</button>
                  <button onClick={handleCancel} className="flex-1 bg-slate-700 py-1 rounded">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-50 mb-1">{cls.name}</h3>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">FROM: {cls.effectiveDate}</p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setShowDetails(cls)} className="text-indigo-400 hover:underline">Details</button>
                    <button onClick={() => handleEdit(cls)} className="text-blue-400 hover:underline">✏️</button>
                    <button onClick={() => handleDelete(cls._id || cls.id || "")} className="text-red-400 hover:underline">🗑️</button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                    <p className="text-[10px] text-slate-500 uppercase mb-1">Teacher</p>
                    <p className="text-sm font-bold text-slate-200 truncate">{cls.classTeacher}</p>
                  </div>
                  <div className="p-3 bg-slate-900/50 rounded-lg border border-slate-700/50">
                    <p className="text-[10px] text-slate-500 uppercase mb-1">Room</p>
                    <p className="text-sm font-bold text-slate-200">{cls.room || 'TBA'}</p>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
        {classes.length === 0 && (
          <div className="col-span-full py-12 bg-slate-900/30 border border-dashed border-slate-700 rounded-xl text-center text-slate-500 italic">No classes found.</div>
        )}
      </div>

      {showDetails && <ClassDetailsModal classInfo={showDetails} onClose={() => setShowDetails(null)} />}
    </div>
  );
}
