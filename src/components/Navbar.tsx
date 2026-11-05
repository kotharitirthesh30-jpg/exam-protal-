import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { OrbitLogo } from './OrbitLogo.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { ThemeSelector } from './ThemeSelector.tsx';
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
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-theme-glass border-b border-theme transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo */}
          <Link to="/" className="focus:outline-none focus:ring-2 focus:ring-theme-accent rounded-lg p-1">
            <OrbitLogo size="md" showSubtitle />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-theme-secondary">
            <Link to="/" className="hover:text-theme-accent transition-colors">
              Home
            </Link>
            <a href="#features" className="hover:text-theme-accent transition-colors">
              Features
            </a>
            <a href="#about" className="hover:text-theme-accent transition-colors">
              About
            </a>
            <a href="#contact" className="hover:text-theme-accent transition-colors">
              Contact
            </a>
          </div>

          {/* Actions & Theme Selector */}
          <div className="hidden md:flex items-center gap-3">
            {/* Theme Palette Switcher */}
            <ThemeSelector />

            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-theme-surface text-theme-primary hover:bg-theme-elevated border border-theme transition shadow-sm"
                >
                  <LayoutDashboard className="w-4 h-4 text-theme-accent" />
                  <span>{user.role === 'admin' ? 'Admin Dashboard' : 'Student Portal'}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-theme-secondary hover:text-rose-400 hover:bg-rose-500/10 transition"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/student/login"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium text-theme-primary hover:text-white bg-theme-surface hover:bg-theme-elevated border border-theme transition shadow-sm"
                >
                  <GraduationCap className="w-4 h-4 text-theme-accent" />
                  <span>Student Login</span>
                </Link>

                <Link
                  to="/admin/login"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium text-theme-secondary hover:text-theme-primary hover:bg-theme-surface/50 border border-transparent hover:border-theme transition"
                >
                  <Shield className="w-4 h-4 text-purple-400" />
                  <span>Admin Login</span>
                </Link>

                <Link
                  to="/register"
                  className="btn-theme-primary flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium shadow-md transition active:scale-95"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Sign Up</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger & theme */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeSelector compact />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-theme-secondary hover:text-theme-primary hover:bg-theme-surface focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-theme bg-theme-surface px-4 pt-3 pb-6 space-y-3">
          <div className="flex flex-col space-y-2 text-base font-medium text-theme-secondary">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-theme-elevated text-theme-primary"
            >
              Home
            </Link>
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-theme-elevated text-theme-primary"
            >
              Features
            </a>
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-theme-elevated text-theme-primary"
            >
              About
            </a>
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-lg hover:bg-theme-elevated text-theme-primary"
            >
              Contact
            </a>
          </div>

          <div className="pt-3 border-t border-theme flex flex-col gap-2">
            {user ? (
              <>
                <Link
                  to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium btn-theme-primary"
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
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium bg-theme-surface text-theme-primary border border-theme"
                >
                  <GraduationCap className="w-4 h-4 text-theme-accent" />
                  <span>Student Login</span>
                </Link>
                <Link
                  to="/admin/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium bg-theme-surface/60 text-theme-secondary border border-theme/60"
                >
                  <Shield className="w-4 h-4 text-purple-400" />
                  <span>Admin Login</span>
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium btn-theme-primary"
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
