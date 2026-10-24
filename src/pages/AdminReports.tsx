import React, { useState, useEffect } from 'react';
import { api, ExamResult, Exam } from '../services/api.ts';
import {
  BarChart3,
  Download,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  Award,
  AlertCircle,
  Calendar,
} from 'lucide-react';

export const AdminReports: React.FC = () => {
  const [results, setResults] = useState<ExamResult[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedExamId, setSelectedExamId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'passed' | 'failed'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [resResults, resExams] = await Promise.all([
          api.getAdminResults(),
          api.getExams(),
        ]);
        setResults(resResults.results || []);
        setExams(resExams.exams || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load report data');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredResults = results.filter((r) => {
    const matchesExam = selectedExamId === 'all' || r.examId === selectedExamId;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'passed' && r.passed) ||
      (statusFilter === 'failed' && !r.passed);
    const matchesSearch =
      r.studentName.toLowerCase().includes(search.toLowerCase()) ||
      r.studentCodeId.toLowerCase().includes(search.toLowerCase()) ||
      r.examTitle.toLowerCase().includes(search.toLowerCase());

    return matchesExam && matchesStatus && matchesSearch;
  });

  const exportToCSV = () => {
    if (filteredResults.length === 0) {
      alert('No results to export.');
      return;
    }

    const headers = [
      'Result ID',
      'Student ID',
      'Student Name',
      'Examination Title',
      'Subject',
      'Marks Obtained',
      'Total Marks',
      'Percentage',
      'Status',
      'Submission Date',
    ];

    const rows = filteredResults.map((r) => [
      `"${r.id}"`,
      `"${r.studentCodeId}"`,
      `"${r.studentName.replace(/"/g, '""')}"`,
      `"${r.examTitle.replace(/"/g, '""')}"`,
      `"${r.subject.replace(/"/g, '""')}"`,
      r.marksObtained,
      r.totalMarks,
      `${r.percentage}%`,
      r.passed ? 'PASSED' : 'FAILED',
      `"${new Date(r.submittedAt).toLocaleString()}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `exampulse_exam_results_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Results & Academic Reports
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Comprehensive audit rosters, student performance analytics, and report export.
          </p>
        </div>

        <button
          onClick={exportToCSV}
          disabled={filteredResults.length === 0}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/30 transition text-xs sm:text-sm shrink-0 disabled:opacity-40"
        >
          <Download className="w-4 h-4" />
          <span>Export to CSV Roster</span>
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Exam Select */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Filter by Exam</label>
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Examinations ({exams.length})</option>
            {exams.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.title}
              </option>
            ))}
          </select>
        </div>

        {/* Status Select */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Pass / Fail Filter</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Candidates</option>
            <option value="passed">Passed Only</option>
            <option value="failed">Failed Only</option>
          </select>
        </div>

        {/* Search */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Search Candidate</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Candidate name or ID..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Reports Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-3">
          <div className="w-8 h-8 border-3 border-purple-500/20 border-t-purple-400 rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Loading student results...</p>
        </div>
      ) : filteredResults.length === 0 ? (
        <div className="p-12 text-center text-slate-400 border border-dashed border-slate-800 rounded-3xl bg-slate-950/40">
          <BarChart3 className="w-10 h-10 mx-auto mb-3 text-slate-600" />
          <p className="text-base font-medium text-slate-300">No results found for current filters.</p>
          <p className="text-xs text-slate-500 mt-1">Try resetting filters to view all completed assessments.</p>
        </div>
      ) : (
        <div className="rounded-3xl bg-slate-900/70 border border-slate-800/90 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Candidate</th>
                  <th className="py-4 px-6">Examination</th>
                  <th className="py-4 px-6 text-center">Marks</th>
                  <th className="py-4 px-6 text-center">Percentage</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Submitted At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-sm">
                {filteredResults.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-850/50 transition">
                    <td className="py-4 px-6">
                      <div className="font-bold text-white">{r.studentName}</div>
                      <div className="text-xs text-cyan-400 font-mono">{r.studentCodeId}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-white">{r.examTitle}</div>
                      <div className="text-xs text-purple-400">{r.subject}</div>
                    </td>
                    <td className="py-4 px-6 text-center text-xs">
                      <strong className="text-white text-sm">{r.marksObtained}</strong>
                      <span className="text-slate-500"> / {r.totalMarks}</span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="font-extrabold text-cyan-400">{r.percentage}%</span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${
                          r.passed
                            ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60'
                            : 'bg-rose-950/80 text-rose-400 border-rose-800/60'
                        }`}
                      >
                        {r.passed ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Passed</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" />
                            <span>Failed</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right text-xs text-slate-400 font-mono">
                      {formatDate(r.submittedAt)}
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
