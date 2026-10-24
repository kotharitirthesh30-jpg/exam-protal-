import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { OrbitLogo } from '../components/OrbitLogo.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import {
  LayoutDashboard,
  FileSpreadsheet,
  HelpCircle,
  Users,
  BarChart3,
  User as UserIcon,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  Bell,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-800/80 bg-[#0a0f1d]/90 shrink-0 select-none p-5">
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
                    ? 'bg-gradient-to-r from-purple-600/30 to-indigo-600/20 text-purple-300 border border-purple-500/30 shadow-lg shadow-purple-950/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-850/60'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-purple-400' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Controller Badge */}
        <div className="p-3.5 mb-4 rounded-xl bg-purple-950/30 border border-purple-900/40 text-xs text-purple-300 space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span>Admin Control Panel</span>
          </div>
          <p className="text-[11px] text-slate-400">ID: {user?.codeId || 'ADM-1001'}</p>
        </div>

        {/* Logout */}
        <div className="pt-4 border-t border-slate-800/80">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-20 border-b border-slate-800/80 bg-[#0a0f1d]/60 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              aria-label="Open navigation sidebar"
            >
              <Menu className="w-6 h-6" />
            </button>

            <div>
              <h1 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>Welcome, {user?.name || 'Administrator'}</span>
              </h1>
              <p className="text-xs sm:text-sm text-purple-400/90 font-medium">
                {user?.title || 'Exam Controller'} • Exam-Pulse Academic Administration
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <button
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
            </button>

            <Link
              to="/admin/profile"
              className="flex items-center gap-2.5 p-1.5 sm:px-3 sm:py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center font-bold text-sm text-white shadow-md shadow-purple-600/30">
                {user?.name ? user.name[0].toUpperCase() : 'A'}
              </div>
              <span className="hidden sm:inline text-xs font-semibold text-slate-200">
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
          <div className="relative w-72 bg-[#090e1c] border-r border-slate-800 p-5 flex flex-col z-10">
            <div className="flex items-center justify-between mb-8">
              <OrbitLogo size="md" />
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
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
                        ? 'bg-gradient-to-r from-purple-600/30 to-indigo-600/20 text-purple-300 border border-purple-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
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
