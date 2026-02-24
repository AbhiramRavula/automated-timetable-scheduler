import { useState } from "react";
import { extractRooms } from "../realMockData";

interface Room {
  name: string;
  capacity: number;
  type: "Lecture Hall" | "Lab" | "Seminar Hall";
  building?: string;
  floor?: string;
  facilities?: string[];
}

export function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>(extractRooms().map(r => ({
    ...r,
    building: "Main Block",
    floor: "3rd Floor",
    facilities: ["Projector", "Whiteboard"]
  })));
  const [isAdding, setIsAdding] = useState(false);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Room | null>(null);

  const handleEdit = (room: Room) => {
    setEditingName(room.name);
    setEditForm({ ...room });
  };

  const handleSave = () => {
    if (editForm && editingName) {
      setRooms(rooms.map(r => r.name === editingName ? editForm : r));
      setEditingName(null);
      setEditForm(null);
    }
  };

  const handleCancel = () => {
    setEditingName(null);
    setEditForm(null);
  };

  const handleAddNew = () => {
    setIsAdding(true);
    setEditForm({
      name: "",
      capacity: 60,
      type: "Lecture Hall",
      building: "Main Block",
      floor: "3rd Floor",
      facilities: []
    });
  };

  const handleSaveNew = () => {
    if (editForm && editForm.name.trim()) {
      setRooms([...rooms, editForm]);
      setIsAdding(false);
      setEditForm(null);
    }
  };

  const handleDelete = (name: string) => {
    if (confirm(`Are you sure you want to delete room ${name}?`)) {
      setRooms(rooms.filter(r => r.name !== name));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-50 mb-2">Classroom Management</h1>
          <p className="text-slate-400">Manage rooms, capacities, and facilities</p>
        </div>
        <button
          onClick={handleAddNew}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
        >
          <span>➕</span>
          Add Room
        </button>
      </div>

      {/* Add Room Form */}
      {isAdding && editForm && (
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
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
                <option value="Lecture Hall">Lecture Hall</option>
                <option value="Lab">Lab</option>
                <option value="Seminar Hall">Seminar Hall</option>
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
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleSaveNew}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => { setIsAdding(false); setEditForm(null); }}
              className="px-4 py-2 bg-slate-600 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rooms.map((room) => (
          <div key={room.name} className="bg-slate-800 p-6 rounded-lg border border-slate-700 hover:border-blue-500 transition-colors">
            {editingName === room.name && editForm ? (
              // Edit Mode
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Room Number</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded text-slate-100 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Capacity</label>
                  <input
                    type="number"
                    value={editForm.capacity}
                    onChange={(e) => setEditForm({ ...editForm, capacity: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded text-slate-100 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Type</label>
                  <select
                    value={editForm.type}
                    onChange={(e) => setEditForm({ ...editForm, type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded text-slate-100 text-sm"
                  >
                    <option value="Lecture Hall">Lecture Hall</option>
                    <option value="Lab">Lab</option>
                    <option value="Seminar Hall">Seminar Hall</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 rounded transition-colors text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 px-3 py-2 bg-slate-600 hover:bg-slate-700 rounded transition-colors text-sm"
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
                    <h3 className="text-xl font-bold text-slate-50">{room.name}</h3>
                    <p className="text-sm text-slate-400">{room.type}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(room.name)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Capacity</span>
                    <span className="text-lg font-bold text-blue-400">{room.capacity}</span>
                  </div>
                  {room.building && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">Building</span>
                      <span className="text-sm text-slate-300">{room.building}</span>
                    </div>
                  )}
                  {room.floor && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-400">Floor</span>
                      <span className="text-sm text-slate-300">{room.floor}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Status</span>
                    <span className="text-sm text-green-400">Available</span>
                  </div>
                </div>
                <button
                  onClick={() => handleEdit(room)}
                  className="w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors text-sm"
                >
                  Edit Details
                </button>
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
            <p className="text-sm text-slate-400">Total Rooms</p>
            <p className="text-2xl font-bold text-blue-400">{rooms.length}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400">Total Capacity</p>
            <p className="text-2xl font-bold text-green-400">
              {rooms.reduce((sum, r) => sum + r.capacity, 0)}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-400">Avg Capacity</p>
            <p className="text-2xl font-bold text-purple-400">
              {Math.round(rooms.reduce((sum, r) => sum + r.capacity, 0) / rooms.length)}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-400">Lecture Halls</p>
            <p className="text-2xl font-bold text-orange-400">
              {rooms.filter(r => r.type === "Lecture Hall").length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
