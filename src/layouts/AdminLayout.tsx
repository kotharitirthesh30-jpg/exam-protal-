import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { OrbitLogo } from '../components/OrbitLogo.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { ThemeSelector } from '../components/ThemeSelector.tsx';
import { api, ProctorAlert } from '../services/api.ts';
import {
  subscribeToFirestoreProctorLogs,
  markFirestoreProctorLogRead,
  markAllFirestoreProctorLogsRead,
} from '../services/firebase.ts';
import {
  LayoutDashboard,
  FileSpreadsheet,
  HelpCircle,
  Users,
  BarChart3,
  User as UserIcon,
  LogOut,
  ShieldCheck,
  ShieldAlert,
  Menu,
  X,
  Bell,
  CheckCheck,
  Clock,
} from 'lucide-react';

function mergeProctorAlerts(expressAlerts: ProctorAlert[], firestoreAlerts: ProctorAlert[]): ProctorAlert[] {
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

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [alerts, setAlerts] = useState<ProctorAlert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [liveToast, setLiveToast] = useState<ProctorAlert | null>(null);
  const seenAlertIdsRef = useRef<Set<string>>(new Set());
  const initialLoadDoneRef = useRef(false);
  const notifDropdownRef = useRef<HTMLDivElement | null>(null);
  const expressAlertsRef = useRef<ProctorAlert[]>([]);
  const firestoreAlertsRef = useRef<ProctorAlert[]>([]);

  useEffect(() => {
    let active = true;

    const applyMergedAlerts = () => {
      if (!active) return;
      const merged = mergeProctorAlerts(expressAlertsRef.current, firestoreAlertsRef.current);
      setAlerts(merged);
      setUnreadCount(merged.filter((a) => !a.isRead).length);

      if (!initialLoadDoneRef.current) {
        merged.forEach((a) => seenAlertIdsRef.current.add(a.id));
        initialLoadDoneRef.current = true;
        const latestUnread = merged.find((a) => !a.isRead);
        if (latestUnread) {
          setLiveToast(latestUnread);
        }
      } else {
        const newestUnseen = merged.find(
          (a) => !a.isRead && !seenAlertIdsRef.current.has(a.id)
        );
        merged.forEach((a) => seenAlertIdsRef.current.add(a.id));
        if (newestUnseen) {
          setLiveToast(newestUnseen);
        }
      }
    };

    const fetchAlerts = async () => {
      try {
        const res = await api.getAdminProctorAlerts();
        if (!active) return;
        expressAlertsRef.current = res.alerts || [];
        applyMergedAlerts();
      } catch {
        // Ignore transient polling failures
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 3000);

    const unsubscribeFirestore = subscribeToFirestoreProctorLogs((fsAlerts) => {
      firestoreAlertsRef.current = fsAlerts as ProctorAlert[];
      applyMergedAlerts();
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
              applyMergedAlerts();
            }
            fetchAlerts();
          }
        };
      }
    } catch {}

    const handleStoragePing = (e: StorageEvent) => {
      if (e.key === 'orbit_last_violation_ping') {
        fetchAlerts();
      }
    };

    const handleFocusOrVisible = () => {
      if (!document.hidden) {
        fetchAlerts();
      }
    };

    window.addEventListener('storage', handleStoragePing);
    window.addEventListener('focus', handleFocusOrVisible);
    document.addEventListener('visibilitychange', handleFocusOrVisible);

    return () => {
      active = false;
      clearInterval(interval);
      unsubscribeFirestore();
      window.removeEventListener('storage', handleStoragePing);
      window.removeEventListener('focus', handleFocusOrVisible);
      document.removeEventListener('visibilitychange', handleFocusOrVisible);
      try {
        channel?.close();
      } catch {}
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        notifDropdownRef.current &&
        !notifDropdownRef.current.contains(e.target as Node)
      ) {
        setShowNotifMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkRead = async (id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, isRead: true } : a)));
    expressAlertsRef.current = expressAlertsRef.current.map((a) =>
      a.id === id ? { ...a, isRead: true } : a
    );
    firestoreAlertsRef.current = firestoreAlertsRef.current.map((a) =>
      a.id === id ? { ...a, isRead: true } : a
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    if (liveToast?.id === id) setLiveToast(null);
    await Promise.allSettled([
      api.markProctorAlertRead(id),
      markFirestoreProctorLogRead(id),
    ]);
  };

  const handleMarkAllRead = async () => {
    const unreadIds = alerts.filter((a) => !a.isRead).map((a) => a.id);
    setAlerts((prev) => prev.map((a) => ({ ...a, isRead: true })));
    expressAlertsRef.current = expressAlertsRef.current.map((a) => ({ ...a, isRead: true }));
    firestoreAlertsRef.current = firestoreAlertsRef.current.map((a) => ({ ...a, isRead: true }));
    setUnreadCount(0);
    setLiveToast(null);
    await Promise.allSettled([
      api.markAllProctorAlertsRead(),
      markAllFirestoreProctorLogsRead(unreadIds),
    ]);
  };

  const formatAlertTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return iso;
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Manage Exams', path: '/admin/exams', icon: FileSpreadsheet },
    { name: 'Question Bank', path: '/admin/questions', icon: HelpCircle },
    { name: 'Students', path: '/admin/students', icon: Users },
    { name: 'Reports', path: '/admin/reports', icon: BarChart3 },
    { name: 'Profile', path: '/admin/profile', icon: UserIcon },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-theme-main text-theme-primary flex flex-col md:flex-row transition-colors">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-theme bg-theme-surface shrink-0 select-none p-5 transition-colors">
        <Link to="/admin/dashboard" className="mb-8 px-2">
          <OrbitLogo size="md" />
        </Link>

        {/* Navigation items */}
        <nav className="flex-1 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'btn-theme-primary'
                    : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-elevated/60'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-theme-secondary'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Controller Badge */}
        <div className="p-3.5 mb-4 rounded-xl bg-theme-elevated border border-theme text-xs text-theme-secondary space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-theme-accent">
            <ShieldCheck className="w-4 h-4 text-theme-accent" />
            <span>Admin Control Panel</span>
          </div>
          <p className="text-[11px] text-theme-muted">ID: {user?.codeId || 'ADM-1001'}</p>
        </div>

        {/* Logout */}
        <div className="pt-4 border-t border-theme">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-theme-secondary hover:text-rose-400 hover:bg-rose-500/10 transition"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-20 border-b border-theme bg-theme-glass backdrop-blur-md px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 transition-colors">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg text-theme-secondary hover:text-theme-primary hover:bg-theme-surface"
              aria-label="Open navigation sidebar"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div>
              <h1 className="text-lg sm:text-xl font-bold text-theme-primary flex items-center gap-2">
                <span>Welcome, {user?.name || 'Administrator'}</span>
              </h1>
              <p className="text-xs sm:text-sm text-theme-accent font-medium">
                {user?.title || 'Exam Controller'} • Exam-Pulse Academic Administration
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Theme Selector for Admin */}
            <ThemeSelector />

            {/* Live Cheat Notification Bell & Dropdown */}
            <div className="relative" ref={notifDropdownRef}>
              <button
                type="button"
                onClick={() => setShowNotifMenu((prev) => !prev)}
                className={`relative p-2.5 rounded-xl border transition shadow-sm cursor-pointer ${
                  unreadCount > 0
                    ? 'bg-rose-950/60 border-rose-500/60 text-rose-300 hover:bg-rose-900/60'
                    : 'bg-theme-surface border-theme text-theme-secondary hover:text-theme-primary hover:bg-theme-elevated'
                }`}
                aria-label="Notifications"
                title="Proctoring & Cheat Alerts"
              >
                <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'animate-bounce' : ''}`} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center shadow-md shadow-rose-600/50">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#0e1326] border border-slate-700/90 shadow-2xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-[#0a0e1d]">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-rose-400" />
                      <span className="text-xs font-bold text-white">
                        Anti-Cheat Alerts ({unreadCount} unread)
                      </span>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={handleMarkAllRead}
                        className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Mark all read</span>
                      </button>
                    )}
                  </div>

                  <div className="max-h-96 overflow-y-auto divide-y divide-slate-800/80">
                    {alerts.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        No tab-switch or cheating notifications recorded yet.
                      </div>
                    ) : (
                      alerts.slice(0, 20).map((alert) => (
                        <div
                          key={alert.id}
                          className={`p-3.5 transition flex flex-col gap-1.5 ${
                            !alert.isRead ? 'bg-rose-950/30 border-l-2 border-l-rose-500' : 'hover:bg-slate-900/40'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-bold text-white">{alert.studentName}</span>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                                {alert.studentCodeId}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 shrink-0">
                              Warning #{alert.violationCount}
                            </span>
                          </div>

                          <p className="text-xs text-rose-200 leading-snug">{alert.message}</p>

                          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                            <span className="flex items-center gap-1 font-mono">
                              <Clock className="w-3 h-3" />
                              {formatAlertTime(alert.timestamp)} • {alert.examTitle}
                            </span>
                            {!alert.isRead && (
                              <button
                                type="button"
                                onClick={() => handleMarkRead(alert.id)}
                                className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                              >
                                Mark read
                              </button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <Link
              to="/admin/profile"
              className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-2 rounded-xl bg-theme-surface border border-theme hover:border-theme-strong transition shadow-sm"
            >
              <div className="w-8 h-8 rounded-lg btn-theme-primary flex items-center justify-center font-bold text-sm text-white shadow-sm">
                {user?.name ? user.name[0].toUpperCase() : 'A'}
              </div>
              <span className="hidden sm:inline text-xs font-semibold text-theme-primary">
                {user?.name}
              </span>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>

      {/* Mobile Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="relative w-72 bg-theme-surface border-r border-theme p-5 flex flex-col z-10">
            <div className="flex items-center justify-between mb-8">
              <OrbitLogo size="md" />
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1.5 rounded-lg text-theme-secondary hover:text-theme-primary"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex-1 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
                      isActive
                        ? 'btn-theme-primary'
                        : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-elevated'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <button
              onClick={() => {
                handleLogout();
                setMobileSidebarOpen(false);
              }}
              className="mt-auto flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
      {/* Live Floating Cheat Alert Toast */}
      {liveToast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full rounded-2xl bg-[#160b16] border-2 border-rose-500/80 p-4 shadow-2xl shadow-rose-950/80 space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-center text-rose-400 shrink-0">
                <ShieldAlert className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-bold block">
                  Cheating Alert • Warning #{liveToast.violationCount}
                </span>
                <h4 className="text-xs font-bold text-white">
                  {liveToast.studentName} ({liveToast.studentCodeId})
                </h4>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setLiveToast(null)}
              className="text-slate-400 hover:text-white p-1 cursor-pointer"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-rose-200 leading-relaxed">{liveToast.message}</p>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] font-mono text-slate-400">
              {formatAlertTime(liveToast.timestamp)}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleMarkRead(liveToast.id)}
                className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-semibold transition cursor-pointer"
              >
                Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
