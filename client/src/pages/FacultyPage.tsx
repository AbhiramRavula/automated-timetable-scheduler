import { useState } from "react";
import { extractFaculty } from "../realMockData";

interface Faculty {
  id: string;
  name: string;
  department: string;
  designation?: string;
  email?: string;
  phone?: string;
}

export function FacultyPage() {
  const [faculty, setFaculty] = useState<Faculty[]>(extractFaculty().map(f => ({
    ...f,
    designation: "Assistant Professor",
    email: "",
    phone: ""
  })));
  const [searchTerm, setSearchTerm] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Faculty | null>(null);

  const filteredFaculty = faculty.filter(f =>
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (f: Faculty) => {
    setEditingId(f.id);
    setEditForm({ ...f });
  };

  const handleSave = () => {
    if (editForm) {
      setFaculty(faculty.map(f => f.id === editingId ? editForm : f));
      setEditingId(null);
      setEditForm(null);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleAddNew = () => {
    setIsAdding(true);
    setEditForm({
      id: `F${faculty.length + 1}`,
      name: "",
      department: "Information Technology",
      designation: "Assistant Professor",
      email: "",
      phone: ""
    });
  };

  const handleSaveNew = () => {
    if (editForm && editForm.name.trim()) {
      setFaculty([...faculty, editForm]);
      setIsAdding(false);
      setEditForm(null);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this faculty member?")) {
      setFaculty(faculty.filter(f => f.id !== id));
    }
  };

  const handleBulkImport = () => {
    const csvInput = prompt("Paste CSV data (Name, Department, Designation, Email, Phone):");
    if (csvInput) {
      const lines = csvInput.split('\n');
      const newFaculty = lines.map((line, idx) => {
        const [name, department, designation, email, phone] = line.split(',').map(s => s.trim());
        return {
          id: `F${faculty.length + idx + 1}`,
          name: name || "",
          department: department || "Information Technology",
          designation: designation || "Assistant Professor",
          email: email || "",
          phone: phone || ""
        };
      }).filter(f => f.name);
      
      setFaculty([...faculty, ...newFaculty]);
      alert(`Imported ${newFaculty.length} faculty members`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-50 mb-2">Faculty Management</h1>
          <p className="text-slate-400">Manage teaching staff and their details</p>
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
          placeholder="Search faculty by name or department..."
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
              <label className="block text-sm font-medium text-slate-300 mb-2">Department</label>
              <input
                type="text"
                value={editForm.department}
                onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100"
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
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Phone</label>
              <input
                type="tel"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-slate-100"
                placeholder="+91 1234567890"
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

      {/* Faculty List */}
      <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Designation
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredFaculty.map((f) => (
                <tr key={f.id} className="hover:bg-slate-750 transition-colors">
                  {editingId === f.id && editForm ? (
                    // Edit Mode
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        {f.id}
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full px-2 py-1 bg-slate-900 border border-slate-600 rounded text-slate-100 text-sm"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={editForm.department}
                          onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                          className="w-full px-2 py-1 bg-slate-900 border border-slate-600 rounded text-slate-100 text-sm"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={editForm.designation}
                          onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                          className="w-full px-2 py-1 bg-slate-900 border border-slate-600 rounded text-slate-100 text-sm"
                        >
                          <option value="Professor">Professor</option>
                          <option value="Associate Professor">Associate Professor</option>
                          <option value="Assistant Professor">Assistant Professor</option>
                          <option value="Lecturer">Lecturer</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={handleSave}
                          className="text-green-400 hover:text-green-300 mr-3"
                        >
                          Save
                        </button>
                        <button
                          onClick={handleCancel}
                          className="text-slate-400 hover:text-slate-300"
                        >
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    // View Mode
                    <>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        {f.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-200">{f.name}</div>
                        {f.email && <div className="text-xs text-slate-400">{f.email}</div>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        {f.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                        {f.designation}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(f)}
                          className="text-blue-400 hover:text-blue-300 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(f.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Delete
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <h2 className="text-lg font-bold text-slate-50 mb-3">Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-slate-400">Total Faculty</p>
            <p className="text-2xl font-bold text-blue-400">{faculty.length}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400">Filtered Results</p>
            <p className="text-2xl font-bold text-green-400">{filteredFaculty.length}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400">Department</p>
            <p className="text-2xl font-bold text-purple-400">IT</p>
          </div>
        </div>
      </div>
    </div>
  );
}
