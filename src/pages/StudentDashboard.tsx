import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, Exam, ExamResult } from '../services/api.ts';
import { useAuth } from '../context/AuthContext.tsx';
import {
  BookOpen,
  CheckCircle,
  TrendingUp,
  Clock,
  ArrowRight,
  AlertCircle,
  Award,
  Sparkles,
  Calendar,
  CheckCircle2,
  Play,
  FileText,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [exams, setExams] = useState<Exam[]>([]);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [examsRes, resultsRes] = await Promise.all([
          api.getExams(),
          api.getMyResults(),
        ]);
        setExams(examsRes.exams || []);
        setResults(resultsRes.results || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const upcomingExams = exams.filter(
    (e) => e.studentAttemptStatus !== 'completed' && e.status !== 'ended'
  );
  const completedExams = results;

  const avgScore =
    completedExams.length > 0
      ? Math.round(
          (completedExams.reduce((sum, r) => sum + r.percentage, 0) /
            completedExams.length) *
            10
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <div className="w-10 h-10 border-3 border-indigo-500/20 border-t-cyan-400 rounded-full animate-spin" />
        <p className="text-sm text-slate-400">Loading student portal...</p>
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

      {/* Top 3 Metric Cards matching mockup */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Metric 1 */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/90 relative overflow-hidden group hover:border-cyan-500/40 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Upcoming Exams</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">{upcomingExams.length}</div>
          <p className="text-xs text-slate-500 mt-1">Pending student action</p>
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-cyan-500/5 rounded-full blur-xl" />
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/90 relative overflow-hidden group hover:border-indigo-500/40 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Completed Exams</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-950/80 border border-indigo-800/60 flex items-center justify-center text-indigo-400">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">{completedExams.length}</div>
          <p className="text-xs text-slate-500 mt-1">Evaluated submissions</p>
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-indigo-500/5 rounded-full blur-xl" />
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/90 relative overflow-hidden group hover:border-amber-500/40 transition">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400">Average Score</span>
            <div className="w-9 h-9 rounded-xl bg-amber-950/80 border border-amber-800/60 flex items-center justify-center text-amber-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">
            {completedExams.length > 0 ? `${avgScore}%` : 'N/A'}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {completedExams.length > 0 ? 'Across completed exams' : 'Take exams to view score'}
          </p>
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-amber-500/5 rounded-full blur-xl" />
        </div>
      </div>

      {/* Upcoming Examinations Section */}
      <div className="rounded-3xl bg-slate-900/70 border border-slate-800/90 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Upcoming Examinations</h2>
            <p className="text-xs text-slate-400">Scheduled tests and ongoing objective assessments</p>
          </div>
          <Link
            to="/student/exams"
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {upcomingExams.length === 0 ? (
          <div className="p-8 text-center text-slate-400 border border-dashed border-slate-800 rounded-2xl">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            <p className="text-sm font-medium text-slate-300">No active or upcoming examinations scheduled.</p>
            <p className="text-xs text-slate-500 mt-0.5">Check back later or contact your professor.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingExams.slice(0, 4).map((exam) => {
              const isLive = exam.status === 'live';
              const isStarted = exam.studentAttemptStatus === 'in_progress';

              return (
                <div
                  key={exam.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80 transition gap-4"
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600/20 to-indigo-600/30 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
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

                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 shrink-0">
                    <div className="text-right">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                          isLive
                            ? 'bg-emerald-950/70 border-emerald-800/60 text-emerald-400'
                            : 'bg-indigo-950/70 border-indigo-800/60 text-indigo-300'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isLive ? 'bg-emerald-400 animate-ping' : 'bg-indigo-400'
                          }`}
                        />
                        <span>{isLive ? 'Live Now' : 'Upcoming'}</span>
                      </span>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {formatDate(exam.startDate)}
                      </p>
                    </div>

                    {isLive ? (
                      <button
                        onClick={() => navigate(`/exam/${exam.id}`)}
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-indigo-600/20 flex items-center gap-1.5 transition active:scale-95"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{isStarted ? 'Resume Exam' : 'Start Exam'}</span>
                      </button>
                    ) : (
                      <button
                        disabled
                        className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 bg-slate-900 border border-slate-800 cursor-not-allowed opacity-75"
                      >
                        Not Yet Active
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Results Section */}
      <div className="rounded-3xl bg-slate-900/70 border border-slate-800/90 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Recent Examination Results</h2>
            <p className="text-xs text-slate-400">Scores, performance breakdown, and answer keys</p>
          </div>
          <Link
            to="/student/results"
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
          >
            <span>View all results</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {results.length === 0 ? (
          <div className="p-8 text-center text-slate-400 border border-dashed border-slate-800 rounded-2xl">
            <Award className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            <p className="text-sm font-medium text-slate-300">No examination results available yet.</p>
            <p className="text-xs text-slate-500 mt-0.5">Your scores will appear here immediately upon submission.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.slice(0, 2).map((res) => (
              <div
                key={res.id}
                className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-cyan-400">{res.subject}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        res.passed
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50'
                          : 'bg-rose-950/80 text-rose-400 border border-rose-800/50'
                      }`}
                    >
                      {res.passed ? 'Passed' : 'Failed'}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">{res.examTitle}</h4>
                  <p className="text-xs text-slate-500">Submitted: {formatDate(res.submittedAt)}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 block">Marks Scored</span>
                    <span className="text-lg font-extrabold text-white">
                      {res.marksObtained} <span className="text-xs text-slate-500 font-normal">/ {res.totalMarks}</span>
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Percentage</span>
                    <span className="text-lg font-extrabold text-cyan-400">{res.percentage}%</span>
                  </div>

                  <Link
                    to={`/student/results/${res.id}`}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition flex items-center gap-1"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Review</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
