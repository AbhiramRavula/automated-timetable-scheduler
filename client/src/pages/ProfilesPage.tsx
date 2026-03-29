import React, { useState, useEffect } from 'react';
import { useInstitution } from '../context/InstitutionContext';
import { createInstitution, deleteInstitution, getDepartments, createDepartment } from '../api';

export const ProfilesPage: React.FC = () => {
  const { institutions, activeInstitution, setActiveInstitution, refreshInstitutions } = useInstitution();
  
  // Institution Form State
  const [newInstName, setNewInstName] = useState('');
  const [newInstCode, setNewInstCode] = useState('');
  
  // Department State
  const [departments, setDepartments] = useState<any[]>([]);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptCode, setNewDeptCode] = useState('');
  const [isDeptLoading, setIsDeptLoading] = useState(false);

  useEffect(() => {
    if (activeInstitution) {
      fetchDepartments();
    } else {
      setDepartments([]);
    }
  }, [activeInstitution]);

  const fetchDepartments = async () => {
    setIsDeptLoading(true);
    try {
      const data = await getDepartments();
      setDepartments(data);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    } finally {
      setIsDeptLoading(false);
    }
  };

  const handleAddInstitution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInstName || !newInstCode) return;
    try {
      const resp = await createInstitution({ name: newInstName, code: newInstCode });
      await refreshInstitutions();
      setActiveInstitution(resp);
      setNewInstName('');
      setNewInstCode('');
    } catch (error) {
      alert('Failed to create institution');
    }
  };

  const handleDeleteInstitution = async (id: string) => {
    if (!confirm('Are you sure? This will hide all data associated with this profile.')) return;
    try {
      await deleteInstitution(id);
      await refreshInstitutions();
    } catch (error) {
      alert('Failed to delete institution');
    }
  };

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName || !newDeptCode || !activeInstitution) return;
    try {
      await createDepartment({ name: newDeptName, code: newDeptCode });
      fetchDepartments();
      setNewDeptName('');
      setNewDeptCode('');
    } catch (error) {
      alert('Failed to create department');
    }
  };

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-3xl font-bold mb-2">Institution Profiles</h2>
        <p className="text-slate-400">Create and manage independent institution setups.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Institution Management */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-fit">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <span>🏢</span> Manage Institutions
          </h3>
          
          <form onSubmit={handleAddInstitution} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <input 
              type="text" 
              placeholder="Institution Name (e.g. MECS)" 
              className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              value={newInstName}
              onChange={(e) => setNewInstName(e.target.value)}
            />
            <input 
              type="text" 
              placeholder="Short Code (e.g. MECS01)" 
              className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
              value={newInstCode}
              onChange={(e) => setNewInstCode(e.target.value)}
            />
            <button 
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 sm:col-span-2 py-2 rounded-lg font-medium transition-colors"
            >
              Add New Profile
            </button>
          </form>

          <div className="space-y-3">
            {institutions.map((inst) => (
              <div 
                key={inst._id}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                  activeInstitution?._id === inst._id 
                    ? 'bg-blue-600/10 border-blue-500/50 ring-1 ring-blue-500/20' 
                    : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                }`}
              >
                <div 
                  className="flex-1 cursor-pointer"
                  onClick={() => setActiveInstitution(inst)}
                >
                  <p className="font-bold">{inst.name}</p>
                  <p className="text-xs text-slate-400">{inst.code}</p>
                </div>
                <div className="flex items-center gap-2">
                  {activeInstitution?._id === inst._id && (
                    <span className="text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">Active</span>
                  )}
                  <button 
                    onClick={() => handleDeleteInstitution(inst._id)}
                    className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Department Management (Only if an institution is active) */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-fit min-h-[400px]">
          <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <span>🎓</span> Departments in {activeInstitution?.name || '...'}
          </h3>

          {!activeInstitution ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500 italic">
              <p>Select an institution profile to manage departments</p>
            </div>
          ) : (
            <>
              <form onSubmit={handleAddDepartment} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <input 
                  type="text" 
                  placeholder="Department Name (e.g. CSE)" 
                  className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                />
                <input 
                  type="text" 
                  placeholder="Dept Code (e.g. CS)" 
                  className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  value={newDeptCode}
                  onChange={(e) => setNewDeptCode(e.target.value)}
                />
                <button 
                  type="submit"
                  className="bg-slate-700 hover:bg-slate-600 sm:col-span-2 py-2 rounded-lg font-medium transition-colors"
                >
                  Add Department
                </button>
              </form>

              {isDeptLoading ? (
                <div className="text-center py-10 text-slate-500">Loading departments...</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {departments.map((dept) => (
                    <div key={dept._id} className="bg-slate-800 p-3 rounded-lg border border-slate-700 flex justify-between items-center">
                      <div>
                        <p className="font-medium">{dept.name}</p>
                        <p className="text-[10px] text-slate-500 uppercase">{dept.code}</p>
                      </div>
                    </div>
                  ))}
                  {departments.length === 0 && (
                    <div className="sm:col-span-2 text-center py-10 text-slate-500 italic">
                      No departments defined yet.
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
};
