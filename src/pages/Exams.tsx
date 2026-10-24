import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, Exam } from '../services/api.ts';
import {
  BookOpen,
  Clock,
  Award,
  Search,
  CheckCircle,
  AlertCircle,
  Play,
  Calendar,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';

export const Exams: React.FC = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState<Exam[]>([]);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'all' | 'live' | 'upcoming' | 'completed'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadExams() {
      try {
        setLoading(true);
        const res = await api.getExams();
        setExams(res.exams || []);
      } catch (err: any) {
        setError(err.message || 'Failed to load examinations');
      } finally {
        setLoading(false);
      }
    }
    loadExams();
  }, []);

  const filteredExams = exams.filter((exam) => {
    const matchesSearch =
      exam.title.toLowerCase().includes(search.toLowerCase()) ||
      exam.subject.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (tab === 'live') {
      return exam.status === 'live' && exam.studentAttemptStatus !== 'completed';
    }
    if (tab === 'upcoming') {
      return exam.status === 'upcoming';
    }
    if (tab === 'completed') {
      return exam.studentAttemptStatus === 'completed';
    }
    return true;
  });

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
      {/* Page Title & Search Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Examination Portal
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Select an active examination to begin your timed test session.
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
            placeholder="Search exam or subject..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto text-xs sm:text-sm">
        {[
          { id: 'all', label: 'All Examinations' },
          { id: 'live', label: 'Live Now' },
          { id: 'upcoming', label: 'Upcoming' },
          { id: 'completed', label: 'Completed' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition whitespace-nowrap ${
              tab === t.id
                ? 'bg-gradient-to-r from-blue-600/30 to-indigo-600/30 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-850'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-3">
          <div className="w-8 h-8 border-3 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
          <p className="text-xs text-slate-400">Loading examinations...</p>
        </div>
      ) : filteredExams.length === 0 ? (
        <div className="p-12 text-center text-slate-400 border border-dashed border-slate-800 rounded-3xl bg-slate-950/40">
          <BookOpen className="w-10 h-10 mx-auto mb-3 text-slate-600" />
          <p className="text-base font-medium text-slate-300">No examinations found matching your criteria.</p>
          <p className="text-xs text-slate-500 mt-1">Try resetting your search or switching filter tabs.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredExams.map((exam) => {
            const isLive = exam.status === 'live';
            const isCompleted = exam.studentAttemptStatus === 'completed';
            const isInProgress = exam.studentAttemptStatus === 'in_progress';

            return (
              <div
                key={exam.id}
                className="rounded-3xl bg-slate-900/70 border border-slate-800/90 p-6 flex flex-col justify-between hover:border-slate-700/80 transition relative overflow-hidden group shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-xs font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-2.5 py-1 rounded-lg">
                      {exam.subject}
                    </span>

                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-950/80 text-indigo-300 border border-indigo-800/50">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Completed</span>
                      </span>
                    ) : isLive ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Available Now</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                        <Calendar className="w-3 h-3" />
                        <span>Upcoming</span>
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition">
                    {exam.title}
                  </h3>

                  <p className="text-xs text-slate-400 mb-4 line-clamp-2 leading-relaxed">
                    {exam.description || 'Institutional objective examination.'}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 mb-5">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Duration: <strong className="text-white">{exam.durationMinutes} Mins</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Questions: <strong className="text-white">{exam.questionCount || 10}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-3.5 h-3.5 text-purple-400" />
                      <span>Total Marks: <strong className="text-white">{exam.totalMarks}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                      <span>Negative Marking: <strong className="text-white">{exam.negativeMarking ? 'Yes (-0.5)' : 'No'}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="text-[11px] text-slate-500 font-mono">
                    Window: {formatDate(exam.startDate)}
                  </div>

                  {isCompleted ? (
                    <button
                      onClick={() => navigate(`/student/results/${exam.resultId}`)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 transition flex items-center gap-1.5"
                    >
                      <Award className="w-3.5 h-3.5 text-cyan-400" />
                      <span>View Result</span>
                    </button>
                  ) : isLive ? (
                    <button
                      onClick={() => navigate(`/exam/${exam.id}`)}
                      className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-md shadow-indigo-600/30 transition flex items-center gap-2 active:scale-95"
                    >
                      <Play className="w-3.5 h-3.5 fill-current text-cyan-300" />
                      <span>{isInProgress ? 'Resume Examination' : 'Start Examination'}</span>
                    </button>
                  ) : (
                    <button
                      disabled
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 bg-slate-900 border border-slate-800 cursor-not-allowed"
                    >
                      Available Soon
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
