import { useState, useEffect } from "react";
import { getRooms, createRoom, updateRoom, deleteRoom } from "../api";
import { useInstitution } from "../context/InstitutionContext";

interface Room {
  _id?: string;
  name: string;
  capacity: number;
  type: "lecture" | "lab" | "seminar";
  building?: string;
  floor?: string;
  facilities?: string[];
  tags?: string[];
}

export function RoomsPage() {
  const { activeInstitution } = useInstitution();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Room | null>(null);

  useEffect(() => {
    if (activeInstitution) {
      loadData();
    }
  }, [activeInstitution]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getRooms();
      const enriched = data.map((room) =>
        room.type === 'lab' && (!room.tags || room.tags.length === 0)
          ? { ...room, tags: ['Shared-Lab'] }
          : room
      );
      setRooms(enriched);
    } catch (err) {
      console.error("Failed to load rooms", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (room: Room) => {
    setEditingId(room._id!);
    setEditForm({ ...room });
  };

  const handleSave = async () => {
    if (editForm && editingId) {
      try {
        await updateRoom(editingId, editForm);
        setEditingId(null);
        setEditForm(null);
        loadData();
      } catch (err) {
        alert("Failed to update room");
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
      name: "",
      capacity: 60,
      type: "lecture",
      building: "Main Block",
      floor: "3rd Floor",
      facilities: [],
      tags: []
    });
  };

  const handleSaveNew = async () => {
    if (editForm && editForm.name.trim()) {
      try {
        await createRoom(editForm);
        setIsAdding(false);
        setEditForm(null);
        loadData();
      } catch (err) {
        alert("Failed to create room");
      }
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete room ${name}?`)) {
      try {
        await deleteRoom(id);
        loadData();
      } catch (err) {
        alert("Failed to delete room");
      }
    }
  };

  if (!activeInstitution) return <div className="p-8 text-center text-slate-400 font-medium">Please select an institution profile.</div>;
  if (loading) return <div className="p-8 text-center text-slate-400 font-medium">Loading rooms...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-50 mb-2">Classroom Management ({activeInstitution.name})</h1>
          <p className="text-slate-400">Manage rooms, capacities, and facilities for this profile</p>
        </div>
        <button
          onClick={handleAddNew}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
        >
          <span>➕</span>
          Add Room
        </button>
      </div>

      {isAdding && editForm && (
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 shadow-xl">
          <h2 className="text-xl font-bold text-slate-50 mb-4">Add New Room</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Room Number *</label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100"
                placeholder="N 305"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Capacity</label>
              <input
                type="number"
                value={editForm.capacity}
                onChange={(e) => setEditForm({ ...editForm, capacity: parseInt(e.target.value) })}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Type</label>
              <select
                value={editForm.type}
                onChange={(e) => setEditForm({ ...editForm, type: e.target.value as any })}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100"
              >
                <option value="lecture">Lecture Hall</option>
                <option value="lab">Lab</option>
                <option value="seminar">Seminar Hall</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Building</label>
              <input
                type="text"
                value={editForm.building}
                onChange={(e) => setEditForm({ ...editForm, building: e.target.value })}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100"
                placeholder="Main Block"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Floor</label>
              <input
                type="text"
                value={editForm.floor}
                onChange={(e) => setEditForm({ ...editForm, floor: e.target.value })}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100"
                placeholder="3rd Floor"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Room Tags (Comma separated)</label>
              <input
                type="text"
                value={editForm.tags?.join(", ") || ""}
                onChange={(e) => setEditForm({ ...editForm, tags: e.target.value.split(",").map(s => s.trim()).filter(s => s) })}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-500"
                placeholder="AI-LAB, CSE"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleSaveNew}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-bold"
            >
              Add Room
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((room) => (
          <div key={room._id} className="bg-slate-800 p-6 rounded-xl border border-slate-700 hover:border-blue-500/50 transition-all shadow-lg group">
            {editingId === room._id && editForm ? (
              <div className="space-y-3">
                <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm" />
                <div className="flex gap-2">
                   <button onClick={handleSave} className="flex-1 bg-blue-600 py-1 rounded text-sm font-bold">Save</button>
                   <button onClick={handleCancel} className="flex-1 bg-slate-700 py-1 rounded text-sm">Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-50">{room.name}</h3>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">{room.type}</p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(room)} className="text-blue-400 hover:text-blue-300">✏️</button>
                    <button onClick={() => handleDelete(room._id!, room.name)} className="text-red-400 hover:text-red-300">🗑️</button>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-2 bg-slate-900/50 rounded">
                    <span className="text-xs text-slate-400 uppercase">Capacity</span>
                    <span className="text-sm font-bold text-blue-400">{room.capacity}</span>
                  </div>
                  {room.building && (
                    <div className="flex items-center justify-between p-2">
                      <span className="text-[10px] text-slate-500 uppercase">Location</span>
                      <span className="text-xs text-slate-300">{room.building}, {room.floor}</span>
                    </div>
                  )}
                  {room.tags && room.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                       {room.tags.map(tag => (
                         <span key={tag} className="px-1.5 py-0.5 bg-blue-900/10 text-blue-400 text-[9px] rounded border border-blue-900/30 uppercase font-bold">
                           {tag}
                         </span>
                       ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
        {rooms.length === 0 && (
          <div className="col-span-full py-12 text-center text-slate-500 italic border border-dashed border-slate-700 rounded-xl">
            No rooms found for this profile.
          </div>
        )}
      </div>
    </div>
  );
}
