import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, Exam, AdminStats } from '../services/api.ts';
import {
  FileSpreadsheet,
  Users,
  Award,
  TrendingUp,
  PlusCircle,
  HelpCircle,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  BookOpen,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAdminData() {
      try {
        setLoading(true);
        const [statsRes, examsRes] = await Promise.all([
          api.getAdminStats(),
          api.getExams(),
        ]);
        setStats(statsRes.stats);
        setExams(examsRes.exams || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load administrator metrics.');
      } finally {
        setLoading(false);
      }
    }
    loadAdminData();
  }, []);

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return isoStr;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <div className="w-10 h-10 border-3 border-purple-500/20 border-t-purple-400 rounded-full animate-spin" />
        <p className="text-sm text-slate-400">Loading administrator control room...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Top 4 Stat Cards matching mockup */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Exams */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/90 relative overflow-hidden group hover:border-purple-500/40 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Total Exams</span>
            <div className="w-9 h-9 rounded-xl bg-purple-950/80 border border-purple-800/60 flex items-center justify-center text-purple-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">{stats?.totalExams || exams.length}</div>
          <p className="text-xs text-slate-500 mt-1">Configured assessments</p>
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-purple-500/5 rounded-full blur-xl" />
        </div>

        {/* Total Students */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/90 relative overflow-hidden group hover:border-cyan-500/40 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Total Students</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">{stats?.totalStudents || 4}</div>
          <p className="text-xs text-slate-500 mt-1">Enrolled candidate profiles</p>
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-cyan-500/5 rounded-full blur-xl" />
        </div>

        {/* Total Results */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/90 relative overflow-hidden group hover:border-indigo-500/40 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Total Results</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-950/80 border border-indigo-800/60 flex items-center justify-center text-indigo-400">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">{stats?.totalResults || 0}</div>
          <p className="text-xs text-slate-500 mt-1">Completed exam submissions</p>
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-indigo-500/5 rounded-full blur-xl" />
        </div>

        {/* Average Pass Rate */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/90 relative overflow-hidden group hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Avg Pass Rate</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">
            {stats ? `${stats.avgPassRate}%` : '85%'}
          </div>
          <p className="text-xs text-slate-500 mt-1">Passing criteria achievement</p>
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl" />
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/admin/exams?create=1"
          className="p-4 rounded-2xl bg-gradient-to-r from-purple-900/40 to-indigo-900/30 border border-purple-500/30 hover:border-purple-400/60 transition flex items-center gap-3.5 group shadow-md"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-sm font-bold text-white block">Create Examination</span>
            <span className="text-xs text-slate-400">Define schedule & add questions</span>
          </div>
        </Link>

        <Link
          to="/admin/questions"
          className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition flex items-center gap-3.5 group"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-cyan-400 shrink-0 group-hover:scale-105 transition">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-sm font-bold text-white block">Question Bank</span>
            <span className="text-xs text-slate-400">Manage multi-subject questions</span>
          </div>
        </Link>

        <Link
          to="/admin/reports"
          className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition flex items-center gap-3.5 group"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-purple-400 shrink-0 group-hover:scale-105 transition">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-sm font-bold text-white block">Results & Reports</span>
            <span className="text-xs text-slate-400">Export student grade rosters</span>
          </div>
        </Link>
      </div>

      {/* Recent Examinations Section matching mockup */}
      <div className="rounded-3xl bg-slate-900/70 border border-slate-800/90 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Recent Examinations</h2>
            <p className="text-xs text-slate-400">Examinations currently managed by Academic Affairs</p>
          </div>
          <Link
            to="/admin/exams"
            className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-3">
          {exams.slice(0, 5).map((exam) => {
            const isOngoing = exam.status === 'live';
            const isUpcoming = exam.status === 'upcoming';

            return (
              <div
                key={exam.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80 transition gap-4"
              >
                <div className="flex items-start sm:items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-800/60 flex items-center justify-center text-purple-400 shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{exam.title}</h4>
                    <p className="text-xs text-slate-400">
                      {exam.subject} • {exam.durationMinutes} Mins • {exam.questionCount || 10} Questions •{' '}
                      {exam.totalMarks} Marks
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                  <div className="text-right">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                        isOngoing
                          ? 'bg-emerald-950/70 border-emerald-800/60 text-emerald-400'
                          : isUpcoming
                          ? 'bg-indigo-950/70 border-indigo-800/60 text-indigo-300'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isOngoing ? 'bg-emerald-400 animate-pulse' : 'bg-indigo-400'
                        }`}
                      />
                      <span>{isOngoing ? 'Ongoing' : isUpcoming ? 'Upcoming' : 'Concluded'}</span>
                    </span>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {formatDate(exam.startDate)}
                    </p>
                  </div>

                  <Link
                    to="/admin/exams"
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-white border border-slate-700 transition"
                  >
                    Manage
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
