import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { OrbitLogo } from './OrbitLogo.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { LogIn, UserPlus, Menu, X, Shield, GraduationCap, LayoutDashboard, LogOut } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[#070b14]/80 border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo */}
          <Link to="/" className="focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-lg p-1">
            <OrbitLogo size="md" showSubtitle />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <Link to="/" className="hover:text-cyan-400 transition-colors">
              Home
            </Link>
            <a href="#features" className="hover:text-cyan-400 transition-colors">
              Features
            </a>
            <a href="#about" className="hover:text-cyan-400 transition-colors">
              About
            </a>
            <a href="#contact" className="hover:text-cyan-400 transition-colors">
              Contact
            </a>
          </div>

          {/* Actions */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-slate-800/80 text-white hover:bg-slate-700/80 border border-slate-700 transition"
                >
                  <LayoutDashboard className="w-4 h-4 text-cyan-400" />
                  <span>{user.role === 'admin' ? 'Admin Dashboard' : 'Student Portal'}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/student/login"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium text-slate-200 hover:text-white bg-slate-900/60 hover:bg-slate-800/80 border border-slate-700/70 transition shadow-sm"
                >
                  <GraduationCap className="w-4 h-4 text-cyan-400" />
                  <span>Student Login</span>
                </Link>

                <Link
                  to="/admin/login"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 border border-transparent hover:border-slate-700/50 transition"
                >
                  <Shield className="w-4 h-4 text-purple-400" />
                  <span>Admin Login</span>
                </Link>

                <Link
                  to="/register"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-md shadow-indigo-600/25 transition active:scale-95"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Sign Up</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-[#090e1c] px-4 pt-3 pb-6 space-y-3">
          <div className="flex flex-col space-y-2 text-base font-medium text-slate-300">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-800"
            >
              Home
            </Link>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-800"
            >
              Features
            </a>
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-800"
            >
              About
            </a>
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-slate-800"
            >
              Contact
            </a>
          </div>

          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            {user ? (
              <>
                <Link
                  to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium bg-indigo-600 text-white"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Go to Dashboard</span>
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-rose-400 bg-rose-500/10"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/student/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium bg-slate-800 text-white border border-slate-700"
                >
                  <GraduationCap className="w-4 h-4 text-cyan-400" />
                  <span>Student Login</span>
                </Link>
                <Link
                  to="/admin/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium bg-slate-800/60 text-slate-300 border border-slate-700/60"
                >
                  <Shield className="w-4 h-4 text-purple-400" />
                  <span>Admin Login</span>
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Student Sign Up</span>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
