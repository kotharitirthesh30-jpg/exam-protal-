import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { OrbitLogo } from '../components/OrbitLogo.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { 
  Eye, 
  EyeOff, 
  Lock, 
  ShieldCheck, 
  AlertCircle, 
  ArrowLeft, 
  Sparkles, 
  Key, 
  UserPlus, 
  CheckCircle2, 
  X,
  Mail,
  User,
  Building
} from 'lucide-react';
import { GoogleSignInButton } from '../components/GoogleSignInButton.tsx';
import { GoogleSignInModal } from '../components/GoogleSignInModal.tsx';

export const AdminLogin: React.FC = () => {
  const { login, registerAdmin } = useAuth();
  const navigate = useNavigate();

  // Login form state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Google Modal state
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  // Add Any Admin Modal state
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminCode, setNewAdminCode] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminTitle, setNewAdminTitle] = useState('Examination Coordinator');
  const [newAdminDept, setNewAdminDept] = useState('Academic Affairs');
  const [addAdminLoading, setAddAdminLoading] = useState(false);
  const [addAdminError, setAddAdminError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

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

  const handleCreateAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddAdminError(null);

    if (!newAdminName.trim() || !newAdminEmail.trim() || !newAdminCode.trim() || !newAdminPassword) {
      setAddAdminError('Please fill in all required fields.');
      return;
    }

    if (newAdminPassword.length < 6) {
      setAddAdminError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setAddAdminLoading(true);
      await registerAdmin({
        name: newAdminName.trim(),
        email: newAdminEmail.trim(),
        codeId: newAdminCode.trim().toUpperCase(),
        password: newAdminPassword,
        title: newAdminTitle.trim() || 'Academic Administrator',
        department: newAdminDept.trim() || 'Examination Operations',
      });

      // Populate credentials into the login fields
      setIdentifier(newAdminEmail.trim());
      setPassword(newAdminPassword);
      setSuccessMsg(`Administrator account for "${newAdminName}" successfully registered and synchronized! You are now logged in or can access the portal.`);
      setShowAddAdminModal(false);

      // Auto-navigate to dashboard
      navigate('/admin/dashboard');
    } catch (err: any) {
      setAddAdminError(err.message || 'Failed to add administrator login.');
    } finally {
      setAddAdminLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-purple-600/15 via-indigo-600/15 to-blue-600/15 rounded-full blur-[110px] pointer-events-none" />

      {/* Back Links */}
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
          ← Student Portal
        </Link>
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md z-10">
        <div className="rounded-3xl bg-slate-900/85 border border-slate-800/90 p-8 shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <OrbitLogo size="lg" className="mb-3" />
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/70 border border-purple-800/40 text-purple-300 text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              <span>Restricted Administration</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Admin Login</h2>
            <p className="text-xs text-slate-400 mt-1">
              Sign in via Google or credentials to manage examination integrity, questions, and evaluations.
            </p>
          </div>

          {/* Success Banner */}
          {successMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Sign-In for Admin */}
          <div className="mb-6 space-y-3">
            <GoogleSignInButton
              onClick={() => setShowGoogleModal(true)}
              label="Sign in with Google (Admin Portal)"
            />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
                <span className="bg-[#0e1628] px-3 text-slate-500 font-semibold">
                  Or enter administrator credentials
                </span>
              </div>
            </div>
          </div>

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
                  placeholder="e.g. ADM-1001, admin@orbit.edu, or your email"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="admin-password" className="block text-xs font-semibold text-slate-300">
                  Administrator Password
                </label>
                <button
                  type="button"
                  onClick={() => alert('For security purposes, admin password resets must be authorized by the Institutional Examination Board.')}
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

          {/* Quick Actions: Add Any Admin Login & Demo Account */}
          <div className="mt-6 pt-5 border-t border-slate-800 space-y-2.5 text-center">
            {/* Add Any Login in Admin button */}
            <button
              type="button"
              onClick={() => {
                setAddAdminError(null);
                setShowAddAdminModal(true);
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-purple-500/30 hover:border-purple-500/60 text-xs font-semibold text-purple-200 transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
            >
              <UserPlus className="w-4 h-4 text-purple-400" />
              <span>+ Add / Register Any New Admin Login</span>
            </button>

            {/* Quick Demo Credentials Autofill */}
            <button
              type="button"
              onClick={handleFillDemo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-950/60 border border-purple-800/40 text-xs font-medium text-purple-300 hover:bg-purple-900/60 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>Autofill Demo Admin (Dr. Priya Nair)</span>
            </button>
          </div>

          <p className="mt-5 text-center text-[11px] text-slate-500">
            Powered by Firebase Auth & Cloud Firestore. Actions are logged for academic audit compliance.
          </p>
        </div>
      </div>

      {/* Google Sign In Modal */}
      <GoogleSignInModal
        isOpen={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        targetRole="admin"
      />

      {/* Add Any New Admin Login Modal */}
      {showAddAdminModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-2xl bg-slate-900 text-white border border-slate-800 shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Add New Admin Login</h3>
                  <p className="text-xs text-slate-400">Create & authorize any administrator credentials</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddAdminModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {addAdminError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{addAdminError}</span>
              </div>
            )}

            <form onSubmit={handleCreateAdminSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Administrator Full Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={newAdminName}
                    onChange={(e) => setNewAdminName(e.target.value)}
                    placeholder="e.g. Prof. Rajesh Sharma"
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Admin Email *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="e.g. rajesh@university.edu or any email"
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Admin Code / ID *
                  </label>
                  <input
                    type="text"
                    value={newAdminCode}
                    onChange={(e) => setNewAdminCode(e.target.value)}
                    placeholder="e.g. ADM-2005"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Designation / Title
                  </label>
                  <input
                    type="text"
                    value={newAdminTitle}
                    onChange={(e) => setNewAdminTitle(e.target.value)}
                    placeholder="e.g. Senior Invigilator"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={newAdminDept}
                    onChange={(e) => setNewAdminDept(e.target.value)}
                    placeholder="e.g. Examination Cell"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddAdminModal(false)}
                  disabled={addAdminLoading}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addAdminLoading}
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-600/30 transition flex items-center gap-1.5"
                >
                  {addAdminLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Register & Authorize Admin</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
