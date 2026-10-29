import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { OrbitLogo } from '../components/OrbitLogo.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { Eye, EyeOff, Lock, User, AlertCircle, ArrowLeft, Sparkles, GraduationCap } from 'lucide-react';
import { GoogleSignInButton } from '../components/GoogleSignInButton.tsx';
import { GoogleSignInModal, saveDeviceAccount } from '../components/GoogleSignInModal.tsx';
import { signInWithFirebaseGooglePopup } from '../services/firebase.ts';

export const StudentLogin: React.FC = () => {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleModalError, setGoogleModalError] = useState<string | null>(null);
  const [showGoogleModal, setShowGoogleModal] = useState(false);

  const handleGoogleSignInClick = async () => {
    try {
      setGoogleLoading(true);
      setError(null);
      setGoogleModalError(null);
      const fbUser = await signInWithFirebaseGooglePopup();
      if (fbUser && fbUser.email) {
        await loginWithGoogle({
          email: fbUser.email,
          name: fbUser.displayName || fbUser.email.split('@')[0],
          avatarUrl: fbUser.photoURL || undefined,
          expectedRole: 'student',
        });
        saveDeviceAccount({
          name: fbUser.displayName || fbUser.email.split('@')[0],
          email: fbUser.email,
          avatarUrl: fbUser.photoURL || undefined,
          role: 'student',
        });
        navigate('/student/dashboard');
        return;
      }
    } catch (popupErr: any) {
      console.warn('Student Google direct sign-in fallback:', popupErr);
      const code = popupErr?.code;
      if (code === 'auth/popup-blocked') {
        setGoogleModalError('Google popup was blocked. Please select or enter your account below.');
      } else if (code === 'auth/popup-closed-by-user') {
        setGoogleModalError('Google sign-in was closed before completing. Choose your account below to proceed.');
      } else {
        setGoogleModalError(popupErr.message || 'Unable to open Google popup.');
      }
      setShowGoogleModal(true);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!identifier.trim() || !password) {
      setError('Please enter your Student ID or email and password.');
      return;
    }

    try {
      setLoading(true);
      await login({
        identifier: identifier.trim(),
        password,
        expectedRole: 'student',
      });
      navigate('/student/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setIdentifier('STU-2024-001');
    setPassword('student123');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#070b14] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-cyan-600/10 via-indigo-600/15 to-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

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
          to="/admin/login"
          className="text-xs font-medium text-purple-400 hover:text-purple-300 transition"
        >
          Admin Portal →
        </Link>
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md z-10">
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800/90 p-8 shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <OrbitLogo size="lg" className="mb-3" />
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-800/40 text-cyan-300 text-xs font-semibold mb-2">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Student Portal</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Student Login</h2>
            <p className="text-xs text-slate-400 mt-1">
              Sign in with your Student ID or institutional email to access your examinations.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Google Sign-In Button */}
          <div className="mb-6 space-y-4">
            <GoogleSignInButton
              onClick={handleGoogleSignInClick}
              loading={googleLoading}
              label="Sign in with Google"
            />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
                <span className="bg-[#0e1628] px-3 text-slate-500 font-semibold">
                  Or continue with student credentials
                </span>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="student-id" className="block text-xs font-semibold text-slate-300 mb-1.5">
                Student ID or Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="student-id"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. STU-2024-001 or student@orbit.edu"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="student-password" className="block text-xs font-semibold text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => alert('For password reset, please contact your university department exam coordinator: exam-desk@orbit.edu')}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 transition"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="student-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950/70 border border-slate-700/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
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

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0"
                />
                <span>Remember my session</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-indigo-600/30 transition disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span>Login to Examination Portal</span>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Autofill */}
          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            <button
              type="button"
              onClick={handleFillDemo}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/60 border border-indigo-800/40 text-xs font-semibold text-cyan-300 hover:bg-indigo-900/60 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Autofill Demo Student (Aarav Mehta)</span>
            </button>
          </div>

          {/* Registration link */}
          <div className="mt-5 text-center text-xs text-slate-400">
            <span>Don't have an account? </span>
            <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-semibold underline underline-offset-2">
              Register here
            </Link>
          </div>
        </div>
      </div>

      <GoogleSignInModal
        isOpen={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        targetRole="student"
        initialError={googleModalError}
      />
    </div>
  );
};
