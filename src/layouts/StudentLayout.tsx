import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { OrbitLogo } from '../components/OrbitLogo.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { ThemeSelector } from '../components/ThemeSelector.tsx';
import {
  LayoutDashboard,
  BookOpen,
  Award,
  User as UserIcon,
  LogOut,
  Bell,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';

export const StudentLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showNotificationToast, setShowNotificationToast] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { name: 'Exams', path: '/student/exams', icon: BookOpen },
    { name: 'Results', path: '/student/results', icon: Award },
    { name: 'Profile', path: '/student/profile', icon: UserIcon },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-theme-main text-theme-primary flex flex-col md:flex-row transition-colors">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-theme bg-theme-surface shrink-0 select-none p-5 transition-colors">
        <Link to="/student/dashboard" className="mb-8 px-2">
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

        {/* Portal info badge */}
        <div className="p-3.5 mb-4 rounded-xl bg-theme-elevated border border-theme text-xs text-theme-secondary space-y-1">
          <div className="flex items-center gap-1.5 text-theme-accent font-semibold">
            {user?.authProvider === 'google' ? (
              <span className="inline-flex items-center gap-1 text-theme-accent">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Google Account
              </span>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Active Student Portal</span>
              </>
            )}
          </div>
          <p className="text-[11px] text-theme-secondary truncate">ID: {user?.codeId || 'STU-2024'}</p>
          {user?.email && (
            <p className="text-[10px] text-theme-muted font-mono truncate">{user.email}</p>
          )}
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
              aria-label="Open sidebar"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div>
              <h1 className="text-lg sm:text-xl font-bold text-theme-primary flex items-center gap-2">
                <span>Hello, {user?.name || 'Student'}</span>
                <span className="text-base sm:text-lg">👋</span>
              </h1>
              <p className="text-xs sm:text-sm text-theme-secondary font-medium">
                {user?.department || 'B.Tech CSE'} • {user?.year || '3rd Year'} • {user?.division || 'Division B'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Theme Selector in student portal */}
            <ThemeSelector />

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setShowNotificationToast(!showNotificationToast)}
                className="p-2.5 rounded-xl bg-theme-surface border border-theme text-theme-secondary hover:text-theme-primary hover:bg-theme-elevated transition relative shadow-sm"
                aria-label="View notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-theme-accent ring-4 ring-theme-surface" />
              </button>

              {showNotificationToast && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-theme-surface border border-theme shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-theme-accent uppercase tracking-wider">Notifications</span>
                    <span className="text-[10px] bg-theme-accent/20 text-theme-accent px-2 py-0.5 rounded-full border border-theme">1 New</span>
                  </div>
                  <div className="text-xs text-theme-secondary bg-theme-elevated p-2.5 rounded-xl border border-theme">
                    <p className="font-semibold text-theme-primary">Computer Networks Quiz 2 is Live</p>
                    <p className="text-theme-secondary mt-1">Assessment window is open. Make sure to complete before the deadline.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar */}
            <Link
              to="/student/profile"
              className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-2 rounded-xl bg-theme-surface border border-theme hover:border-theme-strong transition shadow-sm"
            >
              <div className="w-8 h-8 rounded-lg btn-theme-primary flex items-center justify-center font-bold text-sm text-white shadow-sm">
                {user ? getInitials(user.name) : 'S'}
              </div>
              <span className="hidden sm:inline text-xs font-semibold text-theme-primary">
                {user?.name.split(' ')[0]}
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
    </div>
  );
};
