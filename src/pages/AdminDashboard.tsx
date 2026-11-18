import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, Exam, AdminStats, ProctorAlert } from '../services/api.ts';
import {
  subscribeToFirestoreProctorLogs,
  markFirestoreProctorLogRead,
  markAllFirestoreProctorLogsRead,
} from '../services/firebase.ts';
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
  Plus,
  ShieldAlert,
  CheckCheck,
} from 'lucide-react';

function mergeAlerts(expressAlerts: ProctorAlert[], firestoreAlerts: ProctorAlert[]): ProctorAlert[] {
  const byId = new Map<string, ProctorAlert>();
  for (const a of firestoreAlerts) {
    if (a?.id) byId.set(a.id, a);
  }
  for (const a of expressAlerts) {
    if (a?.id) {
      const existing = byId.get(a.id);
      byId.set(a.id, existing ? { ...existing, ...a, isRead: Boolean(a.isRead || existing.isRead) } : a);
    }
  }
  return Array.from(byId.values()).sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [proctorAlerts, setProctorAlerts] = useState<ProctorAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seedingSample, setSeedingSample] = useState(false);
  const expressAlertsRef = useRef<ProctorAlert[]>([]);
  const firestoreAlertsRef = useRef<ProctorAlert[]>([]);

  useEffect(() => {
    let active = true;

    const applyMerged = () => {
      if (!active) return;
      setProctorAlerts(mergeAlerts(expressAlertsRef.current, firestoreAlertsRef.current));
    };

    const refreshAlerts = () => {
      api
        .getAdminProctorAlerts()
        .then((res) => {
          expressAlertsRef.current = res.alerts || [];
          applyMerged();
        })
        .catch(() => {});
    };

    loadAdminData();
    const timer = setInterval(refreshAlerts, 4000);

    const unsubscribeFirestore = subscribeToFirestoreProctorLogs((fsAlerts) => {
      firestoreAlertsRef.current = fsAlerts as ProctorAlert[];
      applyMerged();
    });

    let channel: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        channel = new BroadcastChannel('orbit_proctor_channel');
        channel.onmessage = (event) => {
          if (event.data?.type === 'NEW_VIOLATION') {
            if (event.data.alert) {
              expressAlertsRef.current = [
                event.data.alert,
                ...expressAlertsRef.current.filter((a) => a.id !== event.data.alert.id),
              ];
              applyMerged();
            }
            refreshAlerts();
          }
        };
      }
    } catch {}

    const handleStoragePing = (e: StorageEvent) => {
      if (e.key === 'orbit_last_violation_ping') refreshAlerts();
    };
    const handleFocusOrVisible = () => {
      if (!document.hidden) refreshAlerts();
    };

    window.addEventListener('storage', handleStoragePing);
    window.addEventListener('focus', handleFocusOrVisible);
    document.addEventListener('visibilitychange', handleFocusOrVisible);

    return () => {
      active = false;
      clearInterval(timer);
      unsubscribeFirestore();
      window.removeEventListener('storage', handleStoragePing);
      window.removeEventListener('focus', handleFocusOrVisible);
      document.removeEventListener('visibilitychange', handleFocusOrVisible);
      try {
        channel?.close();
      } catch {}
    };
  }, []);

  async function loadAdminData() {
    try {
      setLoading(true);
      const [statsRes, examsRes, alertsRes] = await Promise.all([
        api.getAdminStats(),
        api.getExams(),
        api.getAdminProctorAlerts().catch(() => ({ alerts: [] as ProctorAlert[], unreadCount: 0 })),
      ]);
      setStats(statsRes.stats);
      setExams(examsRes.exams || []);
      expressAlertsRef.current = alertsRes.alerts || [];
      setProctorAlerts(mergeAlerts(expressAlertsRef.current, firestoreAlertsRef.current));
    } catch (err: any) {
      setError(err.message || 'Failed to load administrator metrics.');
    } finally {
      setLoading(false);
    }
  }

  const handleMarkAlertRead = async (id: string) => {
    setProctorAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, isRead: true } : a)));
    expressAlertsRef.current = expressAlertsRef.current.map((a) =>
      a.id === id ? { ...a, isRead: true } : a
    );
    firestoreAlertsRef.current = firestoreAlertsRef.current.map((a) =>
      a.id === id ? { ...a, isRead: true } : a
    );
    await Promise.allSettled([
      api.markProctorAlertRead(id),
      markFirestoreProctorLogRead(id),
    ]);
  };

  const handleMarkAllAlertsRead = async () => {
    const unreadIds = proctorAlerts.filter((a) => !a.isRead).map((a) => a.id);
    setProctorAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
    expressAlertsRef.current = expressAlertsRef.current.map((a) => ({ ...a, isRead: true }));
    firestoreAlertsRef.current = firestoreAlertsRef.current.map((a) => ({ ...a, isRead: true }));
    await Promise.allSettled([
      api.markAllProctorAlertsRead(),
      markAllFirestoreProctorLogsRead(unreadIds),
    ]);
  };

  const handleCreateSampleExam = async () => {
    try {
      setSeedingSample(true);
      await api.createSampleExam();
      await loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to generate sample assessment.');
    } finally {
      setSeedingSample(false);
    }
  };

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

      {/* Top 4 Stat Cards showing exact, genuine metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Exams */}
        <div className="p-5 rounded-2xl bg-theme-surface border border-theme relative overflow-hidden group hover:border-purple-500/40 transition shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-theme-secondary">Total Exams</span>
            <div className="w-10 h-10 rounded-xl bg-purple-950/70 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-sm">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">{stats?.totalExams ?? 0}</div>
          <p className="text-xs text-theme-muted mt-1">Configured assessments</p>
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-purple-500/5 rounded-full blur-xl" />
        </div>

        {/* Total Students */}
        <div className="p-5 rounded-2xl bg-theme-surface border border-theme relative overflow-hidden group hover:border-indigo-500/40 transition shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-theme-secondary">Total Students</span>
            <div className="w-10 h-10 rounded-xl bg-indigo-950/70 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-sm">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">{stats?.totalStudents ?? 0}</div>
          <p className="text-xs text-theme-muted mt-1">Enrolled candidate profiles</p>
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-indigo-500/5 rounded-full blur-xl" />
        </div>

        {/* Total Results */}
        <div className="p-5 rounded-2xl bg-theme-surface border border-theme relative overflow-hidden group hover:border-blue-500/40 transition shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-theme-secondary">Total Results</span>
            <div className="w-10 h-10 rounded-xl bg-blue-950/70 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-sm">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white">{stats?.totalResults ?? 0}</div>
          <p className="text-xs text-theme-muted mt-1">Completed exam submissions</p>
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-blue-500/5 rounded-full blur-xl" />
        </div>

        {/* Average Pass Rate */}
        <div className="p-5 rounded-2xl bg-theme-surface border border-theme relative overflow-hidden group hover:border-emerald-500/40 transition shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-theme-secondary">Avg Pass Rate</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-950/70 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-emerald-400">
            {stats ? `${stats.avgPassRate}%` : '0%'}
          </div>
          <p className="text-xs text-theme-muted mt-1">Passing criteria achievement</p>
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

      {/* Live Proctoring & Cheating Alerts */}
      {proctorAlerts.length > 0 && (
        <div className="rounded-3xl bg-rose-950/20 border border-rose-500/40 p-6 space-y-4 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                <ShieldAlert className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Live Cheating & Tab-Switch Alerts</span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-600 text-white">
                    {proctorAlerts.filter((a) => !a.isRead).length} Unread
                  </span>
                </h2>
                <p className="text-xs text-rose-200/80">
                  Real-time alerts triggered when a student switches tabs during an active exam
                </p>
              </div>
            </div>

            {proctorAlerts.some((a) => !a.isRead) && (
              <button
                type="button"
                onClick={handleMarkAllAlertsRead}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-600/20 border border-rose-500/40 text-rose-200 hover:bg-rose-600/30 transition flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark All Reviewed</span>
              </button>
            )}
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {proctorAlerts.slice(0, 10).map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                  !alert.isRead
                    ? 'bg-rose-950/50 border-rose-500/60'
                    : 'bg-slate-950/60 border-slate-800/80 opacity-80'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-white">{alert.studentName}</span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                      {alert.studentCodeId}
                    </span>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40">
                      Warning #{alert.violationCount}
                    </span>
                  </div>
                  <p className="text-xs text-rose-200">{alert.message}</p>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Exam: {alert.examTitle} • {new Date(alert.timestamp).toLocaleString()}
                  </p>
                </div>

                {!alert.isRead ? (
                  <button
                    type="button"
                    onClick={() => handleMarkAlertRead(alert.id)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition shrink-0 cursor-pointer"
                  >
                    Mark Reviewed
                  </button>
                ) : (
                  <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1 shrink-0">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Reviewed
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Examinations Section */}
      <div className="rounded-3xl bg-slate-900/70 border border-slate-800/90 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">Recent Examinations</h2>
            <p className="text-xs text-slate-400">Examinations currently managed by Academic Affairs</p>
          </div>
          <div className="flex items-center gap-3">
            {exams.length === 0 && (
              <button
                type="button"
                onClick={handleCreateSampleExam}
                disabled={seedingSample}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-950/70 border border-purple-800/60 text-purple-300 hover:bg-purple-900/70 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>{seedingSample ? 'Creating...' : '+ Load Sample Exam'}</span>
              </button>
            )}
            <Link
              to="/admin/exams"
              className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {exams.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-2xl bg-slate-950/40 border border-dashed border-slate-800">
            <FileSpreadsheet className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white mb-1">0 Configured Examinations</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mb-5 leading-relaxed">
              No assessments are currently active. Click below to create your genuine examination, or generate a sample assessment from the Question Bank.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link
                to="/admin/exams?create=1"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-600/30 transition"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create Examination</span>
              </Link>
              <button
                type="button"
                onClick={handleCreateSampleExam}
                disabled={seedingSample}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>Quick Sample Assessment</span>
              </button>
            </div>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
};
