import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Shield,
  GraduationCap,
  Mail,
  Hash,
} from 'lucide-react';

export const AdminStudents: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    loadStudents();
  }, []);

  async function loadStudents() {
    try {
      setLoading(true);
      const res = await api.getStudents();
      setStudents(res.students || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load student directory');
    } finally {
      setLoading(false);
    }
  }

  const handleToggleStatus = async (student: any) => {
    const nextStatus = student.status === 'active' ? 'inactive' : 'active';
    const actionWord = nextStatus === 'active' ? 'activate' : 'deactivate';
    if (!confirm(`Are you sure you want to ${actionWord} the account for ${student.name}?`)) return;

    try {
      await api.updateStudentStatus(student.id, nextStatus);
      loadStudents();
    } catch (err: any) {
      alert(err.message || 'Failed to update student status');
    }
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.codeId.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.department && s.department.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;
    if (statusFilter === 'active') return s.status === 'active';
    if (statusFilter === 'inactive') return s.status === 'inactive';
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Manage Candidates & Students
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Audit registered student accounts, track assessment attendance, and control portal access.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs">
          {[
            { id: 'all', label: 'All Students' },
            { id: 'active', label: 'Active Access' },
            { id: 'inactive', label: 'Deactivated' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition ${
                statusFilter === tab.id
                  ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, ID, or email..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-3">
          <div className="w-8 h-8 border-3 border-purple-500/20 border-t-purple-400 rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Loading student directory...</p>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="p-12 text-center text-slate-400 border border-dashed border-slate-800 rounded-3xl bg-slate-950/40">
          <Users className="w-10 h-10 mx-auto mb-3 text-slate-600" />
          <p className="text-base font-medium text-slate-300">No student records found.</p>
          <p className="text-xs text-slate-500 mt-1">Try another search or filter.</p>
        </div>
      ) : (
        <div className="rounded-3xl bg-slate-900/70 border border-slate-800/90 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Student ID & Name</th>
                  <th className="py-4 px-6">Department & Year</th>
                  <th className="py-4 px-6 text-center">Exams Completed</th>
                  <th className="py-4 px-6 text-center">Avg Performance</th>
                  <th className="py-4 px-6 text-center">Portal Status</th>
                  <th className="py-4 px-6 text-right">Access Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-sm">
                {filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-850/50 transition">
                    <td className="py-4 px-6">
                      <div className="font-bold text-white flex items-center gap-2">
                        <span>{s.name}</span>
                      </div>
                      <div className="text-xs text-cyan-400 font-mono font-semibold">{s.codeId}</div>
                      <div className="text-[11px] text-slate-500">{s.email}</div>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-300">
                      <div className="font-medium text-white">{s.department}</div>
                      <div className="text-slate-500">
                        {s.year} • {s.division}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center text-xs font-bold text-white">
                      {s.examsCompleted}
                    </td>
                    <td className="py-4 px-6 text-center text-xs font-extrabold text-cyan-400">
                      {s.averageScore > 0 ? `${s.averageScore}%` : 'N/A'}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                          s.status === 'active'
                            ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60'
                            : 'bg-rose-950/80 text-rose-400 border-rose-800/60'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            s.status === 'active' ? 'bg-emerald-400' : 'bg-rose-400'
                          }`}
                        />
                        <span>{s.status === 'active' ? 'Active' : 'Deactivated'}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleToggleStatus(s)}
                        className={`px-3 py-1 rounded-xl text-xs font-semibold border transition ${
                          s.status === 'active'
                            ? 'text-rose-400 border-rose-900/50 hover:bg-rose-500/10'
                            : 'text-emerald-400 border-emerald-900/50 hover:bg-emerald-500/10'
                        }`}
                      >
                        {s.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
