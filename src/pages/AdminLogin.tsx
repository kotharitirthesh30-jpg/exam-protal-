import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { OrbitLogo } from '../components/OrbitLogo.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { Eye, EyeOff, Lock, ShieldCheck, AlertCircle, ArrowLeft, Sparkles, Key } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!identifier.trim() || !password) {
      setError('Please enter your Administrator ID/Email and password.');
      return;
    }

    try {
      setLoading(true);
      await login({
        identifier: identifier.trim(),
        password,
        expectedRole: 'admin',
      });
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'Administrator authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setIdentifier('admin@orbit.edu');
    setPassword('admin123');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#070b14] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-purple-600/10 via-indigo-600/15 to-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Back to Home Link */}
      <div className="mb-6 z-10 w-full max-w-md flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
        <Link
          to="/student/login"
          className="text-xs font-medium text-cyan-400 hover:text-cyan-300 transition"
        >
          ← Student Login
        </Link>
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md z-10">
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800/90 p-8 shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <OrbitLogo size="lg" className="mb-3" />
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/70 border border-purple-800/40 text-purple-300 text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Restricted Administration</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Admin Login</h2>
            <p className="text-xs text-slate-400 mt-1">
              Authorized examination controllers, invigilators, and academic coordinators only.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="admin-id" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Admin ID or Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Key className="w-4 h-4" />
                </div>
                <input
                  id="admin-id"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. ADM-1001 or admin@orbit.edu"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="admin-password" className="block text-xs font-semibold text-slate-300">
                  Admin Master Password
                </label>
                <button
                  type="button"
                  onClick={() => alert('For security purposes, admin password resets must be authorized by the Chief Technology Officer or Institution Registrar.')}
                  className="text-[11px] text-purple-400 hover:text-purple-300 transition"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter administrator password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-lg shadow-purple-600/30 transition disabled:opacity-60 flex items-center justify-center gap-2 mt-4"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span>Access Admin Console</span>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Autofill */}
          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            <button
              type="button"
              onClick={handleFillDemo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-950/60 border border-purple-800/40 text-xs font-semibold text-purple-300 hover:bg-purple-900/60 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Autofill Demo Admin (Dr. Priya Nair)</span>
            </button>
          </div>

          <p className="mt-5 text-center text-[11px] text-slate-500">
            All administrative actions are logged and subject to academic audit compliance.
          </p>
        </div>
      </div>
    </div>
  );
};
