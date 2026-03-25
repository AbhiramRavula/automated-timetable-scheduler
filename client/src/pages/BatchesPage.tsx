import { useState, useEffect } from "react";
import { getBatches, createBatch, updateBatch, deleteBatch } from "../api";

interface Batch {
  _id?: string;
  id?: string;
  name: string;
  room: string;
  classTeacher: string;
  effectiveDate: string;
  semester?: string;
  year?: number;
}

export function BatchesPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Batch | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [currentSemester, setCurrentSemester] = useState<"Odd" | "Even">("Odd");
  const [previousBatches, setPreviousBatches] = useState<Batch[] | null>(null);
  const [previousSemester, setPreviousSemester] = useState<"Odd" | "Even" | null>(null);

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const data = await getBatches();
      setBatches(data);
    } catch (error) {
      console.error("Failed to fetch batches:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (batch: Batch) => {
    setEditingId(batch._id || batch.id || null);
    setEditForm({ ...batch });
  };

  const handleSave = async () => {
    if (editForm && editingId) {
      try {
        const updated = await updateBatch(editingId, editForm);
        setBatches(batches.map(b => (b._id === editingId || b.id === editingId) ? updated : b));
        setEditingId(null);
        setEditForm(null);
      } catch (error) {
        alert("Failed to update batch");
      }
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this batch?")) {
      try {
        await deleteBatch(id);
        setBatches(batches.filter(b => b._id !== id && b.id !== id));
      } catch (error) {
        alert("Failed to delete batch");
      }
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
      year: 1
    });
  };

  const handleSaveNew = async () => {
    if (editForm && editForm.name.trim()) {
      try {
        const created = await createBatch(editForm);
        setBatches([...batches, created]);
        setIsAdding(false);
        setEditForm(null);
      } catch (error) {
        alert("Failed to create batch");
      }
    }
  };

  const handlePromoteAll = async () => {
    // Check for VIII semester batches
    const eighthSemBatches = batches.filter(b => 
      b.name.includes("VIII SEM") || b.semester === "VIII"
    );
    
    if (eighthSemBatches.length > 0) {
      const confirmGraduation = confirm(
        `Found ${eighthSemBatches.length} batch(es) in VIII semester:\n` +
        eighthSemBatches.map(b => `- ${b.name}`).join('\n') +
        `\n\nThese batches will be GRADUATED (deleted). Continue?`
      );
      
      if (!confirmGraduation) return;
    }
    
    if (confirm("This will promote all batches to the next semester. Continue?")) {
      setPreviousBatches([...batches]);
      setPreviousSemester(currentSemester);

      const semesterMap: { [key: string]: string } = {
        "I": "II", "II": "III", "III": "IV", "IV": "V",
        "V": "VI", "VI": "VII", "VII": "VIII"
      };

      // Filter out VIII semester batches (they graduate)
      const promotedBatches: Batch[] = (batches
        .map(b => {
          const currentSem = b.semester || "I";
          if (currentSem === "VIII") return null; // Graduate
          const newSem = semesterMap[currentSem] || currentSem;
          const newName = b.name.replace(/\b(I|II|III|IV|V|VI|VII)\s+SEM\b/, `${newSem} SEM`);
          return { ...b, semester: newSem, name: newName };
        }) as (Batch | null)[]
      ).filter((b): b is Batch => b !== null);

      try {
        // Update promoted batches
        await Promise.all(promotedBatches.map(b => {
          const bid = b._id || b.id;
          if (!bid) return Promise.resolve();
          return updateBatch(bid, b);
        }));
        
        // Delete graduated batches (VIII semester)
        const graduatedIds = batches
          .filter(b => b.semester === "VIII" || b.name.includes("VIII SEM"))
          .map(b => b._id || b.id)
          .filter((id): id is string => typeof id === "string");
          
        await Promise.all(graduatedIds.map(id => deleteBatch(id)));
        
        setBatches(promotedBatches);
        setCurrentSemester(currentSemester === "Odd" ? "Even" : "Odd");
        
        alert(`Promotion complete! ${graduatedIds.length} batch(es) graduated.`);
      } catch (error) {
        alert("Partial failure during promotion. Some batches might not have updated.");
      }
    }
  };

  const handleSemesterToggle = () => {
    const newSemester = currentSemester === "Odd" ? "Even" : "Odd";
    
    // Update all batch names to reflect new semester
    const updatedBatches = batches.map(b => {
      const currentSem = b.semester || "I";
      // Toggle between odd and even semesters
      const semesterMap: { [key: string]: string } = {
        "I": "II", "II": "I", 
        "III": "IV", "IV": "III",
        "V": "VI", "VI": "V", 
        "VII": "VIII", "VIII": "VII"
      };
      const newSem = semesterMap[currentSem] || currentSem;
      const newName = b.name.replace(/\b(I|II|III|IV|V|VI|VII|VIII)\s+SEM\b/, `${newSem} SEM`);
      return { ...b, semester: newSem, name: newName };
    });
    
    // Update in backend
    Promise.all(updatedBatches.map(b => {
      const bid = b._id || b.id;
      if (!bid) return Promise.resolve();
      return updateBatch(bid, b);
    })).then(() => {
      setBatches(updatedBatches);
      setCurrentSemester(newSemester);
    }).catch(() => {
      alert("Failed to update semester toggle");
    });
  };

  const handleUndo = async () => {
    if (previousBatches && previousSemester) {
      try {
        await Promise.all(previousBatches.map(async (b) => {
          const bid = b._id || b.id;
          if (bid) {
             try {
                await updateBatch(bid, b);
             } catch {
                await createBatch(b);
             }
          }
        }));
        setBatches(previousBatches);
        setCurrentSemester(previousSemester);
        setPreviousBatches(null);
        setPreviousSemester(null);
      } catch (err) {
        alert("Failed to undo promotion sync.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-50 mb-2">
            Batch Management
          </h1>
          <p className="text-slate-400">
            Manage class sections and semester transitions
          </p>
        </div>
        <div className="flex gap-3">
          {previousBatches && (
            <button
              onClick={handleUndo}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors flex items-center gap-2 border border-slate-600"
            >
              <span>↩️</span>
              Undo Promotion
            </button>
          )}
          <button
            onClick={handlePromoteAll}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors flex items-center gap-2"
          >
            <span>🔄</span>
            Promote to Next Semester
          </button>
          <button
            onClick={handleAddNew}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
          >
            <span>➕</span>
            Add Batch
          </button>
        </div>
      </div>

      {/* Current Semester Indicator */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-blue-100">Current Academic Period</p>
            <p className="text-2xl font-bold text-white">
              {currentSemester} Semester 2025-2026
            </p>
          </div>
          <button
            onClick={handleSemesterToggle}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-white"
          >
            Switch to {currentSemester === "Odd" ? "Even" : "Odd"}
          </button>
        </div>
      </div>

      {/* Add New Batch Form */}
      {isAdding && editForm && (
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
          <h2 className="text-xl font-bold text-slate-50 mb-4">
            Add New Batch
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Batch Name
              </label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100"
                placeholder="B.E III SEM - IT SEC-A"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Room Number
              </label>
              <input
                type="text"
                value={editForm.room}
                onChange={(e) =>
                  setEditForm({ ...editForm, room: e.target.value })
                }
                className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100"
                placeholder="N 305"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Class Teacher
              </label>
              <input
                type="text"
                value={editForm.classTeacher}
                onChange={(e) =>
                  setEditForm({ ...editForm, classTeacher: e.target.value })
                }
                className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100"
                placeholder="Dr. John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Effective Date
              </label>
              <input
                type="text"
                value={editForm.effectiveDate}
                onChange={(e) =>
                  setEditForm({ ...editForm, effectiveDate: e.target.value })
                }
                className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100"
                placeholder="22/09/2025"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleSaveNew}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => {
                setIsAdding(false);
                setEditForm(null);
              }}
              className="px-4 py-2 bg-slate-600 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Batches Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {batches.map((batch) => (
        <div
            key={batch._id || batch.id}
            className="bg-slate-800 p-6 rounded-lg border border-slate-700 hover:border-blue-500 transition-colors"
          >
            {(editingId === (batch._id || batch.id)) && editForm ? (
              // Edit Mode
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Batch Name
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded text-slate-100 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Class Teacher
                  </label>
                  <input
                    type="text"
                    value={editForm.classTeacher}
                    onChange={(e) =>
                      setEditForm({ ...editForm, classTeacher: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded text-slate-100 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Room Number
                  </label>
                  <input
                    type="text"
                    value={editForm.room}
                    onChange={(e) =>
                      setEditForm({ ...editForm, room: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded text-slate-100 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Semester</label>
                  <input
                    type="text"
                    value={editForm.semester || ""}
                    onChange={(e) => setEditForm({ ...editForm, semester: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded text-slate-100 text-sm"
                    placeholder="VII"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Year</label>
                  <input
                    type="text"
                    value={editForm.year || ""}
                    onChange={(e) => setEditForm({ ...editForm, year: parseInt(e.target.value) || undefined })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded text-slate-100 text-sm"
                    placeholder="2025"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Effective Date</label>
                  <input
                    type="text"
                    value={editForm.effectiveDate}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        effectiveDate: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded text-slate-100 text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded transition-colors text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-700 rounded transition-colors text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // View Mode
              <>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-50 mb-1">
                      {batch.name}
                    </h3>
                    <p className="text-sm text-slate-400">
                      Effective from: {batch.effectiveDate}
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full">
                    Active
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-slate-900 rounded">
                    <span className="text-2xl">👨‍🏫</span>
                    <div>
                      <p className="text-xs text-slate-400">Class Teacher</p>
                      <p className="text-sm font-medium text-slate-200">
                        {batch.classTeacher}
                      </p>
                    </div>
                  </div>

                  {batch.room && (
                    <div className="flex items-center gap-3 p-3 bg-slate-900 rounded">
                      <span className="text-2xl">🏫</span>
                      <div>
                        <p className="text-xs text-slate-400">Room Number</p>
                        <p className="text-sm font-medium text-slate-200">
                          {batch.room}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleEdit(batch)}
                      className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors text-sm"
                    >
                      Edit Details
                    </button>
                    <button
                      onClick={() => handleDelete(batch._id || batch.id || "")}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <h2 className="text-lg font-bold text-slate-50 mb-3">Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-slate-400">Total Batches</p>
            <p className="text-2xl font-bold text-blue-400">{batches.length}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400">III Semester</p>
            <p className="text-2xl font-bold text-green-400">
              {batches.filter((b) => b.name.includes("III SEM")).length}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-400">V Semester</p>
            <p className="text-2xl font-bold text-purple-400">
              {batches.filter((b) => b.name.includes("V SEM")).length}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-400">VII Semester</p>
            <p className="text-2xl font-bold text-orange-400">
              {batches.filter((b) => b.name.includes("VII SEM")).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
