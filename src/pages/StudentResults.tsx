import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, ExamResult } from '../services/api.ts';
import { formatDuration } from '../utils/examScoring.ts';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  Search,
  BookOpen,
  Calendar,
  AlertCircle,
  FileText,
} from 'lucide-react';

export const StudentResults: React.FC = () => {
  const [results, setResults] = useState<ExamResult[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadResults() {
      try {
        setLoading(true);
        const res = await api.getMyResults();
        setResults(res.results || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load results.');
      } finally {
        setLoading(false);
      }
    }
    loadResults();
  }, []);

  const filteredResults = results.filter(
    (r) =>
      r.examTitle.toLowerCase().includes(search.toLowerCase()) ||
      r.subject.toLowerCase().includes(search.toLowerCase())
  );

  const totalExams = results.length;
  const passedCount = results.filter((r) => r.passed).length;
  const avgScore =
    totalExams > 0
      ? Math.round(
          (results.reduce((sum, r) => sum + r.percentage, 0) / totalExams) * 10
        ) / 10
      : 0;

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            My Examination Results
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Historical assessment transcript and detailed performance analytics.
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by exam or subject..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block">Evaluated Tests</span>
          <div className="text-3xl font-extrabold text-white mt-1">{totalExams}</div>
          <span className="text-xs text-slate-500 mt-0.5 block">Total completed sessions</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block">Pass Rate</span>
          <div className="text-3xl font-extrabold text-emerald-400 mt-1">
            {totalExams > 0 ? `${Math.round((passedCount / totalExams) * 100)}%` : 'N/A'}
          </div>
          <span className="text-xs text-slate-500 mt-0.5 block">
            {passedCount} of {totalExams} examinations passed
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800">
          <span className="text-xs text-slate-400 font-semibold block">Cumulative Average</span>
          <div className="text-3xl font-extrabold text-cyan-400 mt-1">
            {totalExams > 0 ? `${avgScore}%` : 'N/A'}
          </div>
          <span className="text-xs text-slate-500 mt-0.5 block">Overall academic percentage</span>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Results Table / Cards */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-3">
          <div className="w-8 h-8 border-3 border-indigo-500/20 border-t-cyan-400 rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Loading exam records...</p>
        </div>
      ) : filteredResults.length === 0 ? (
        <div className="p-12 text-center text-slate-400 border border-dashed border-slate-800 rounded-3xl bg-slate-950/40">
          <Award className="w-10 h-10 mx-auto mb-3 text-slate-600" />
          <p className="text-base font-medium text-slate-300">No examination results recorded yet.</p>
          <p className="text-xs text-slate-500 mt-1">Take an available examination from the portal to view your grade.</p>
        </div>
      ) : (
        <div className="rounded-3xl bg-slate-900/70 border border-slate-800/90 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Examination & Subject</th>
                  <th className="py-4 px-6">Date Attempted</th>
                  <th className="py-4 px-6 text-center">Marks Obtained</th>
                  <th className="py-4 px-6 text-center">Percentage</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-sm">
                {filteredResults.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-850/50 transition">
                    <td className="py-4 px-6">
                      <div className="font-bold text-white">{r.examTitle}</div>
                      <div className="text-xs text-cyan-400 font-medium">{r.subject}</div>
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-400 font-mono">
                      {formatDate(r.submittedAt)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="font-bold text-white">{r.marksObtained}</span>
                      <span className="text-xs text-slate-500 font-normal"> / {r.totalMarks}</span>
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
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Passed</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Failed</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        to={`/student/results/${r.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>View Review</span>
                      </Link>
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
