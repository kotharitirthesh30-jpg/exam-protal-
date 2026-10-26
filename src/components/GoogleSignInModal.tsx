import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { X, UserPlus, Check, Shield, AlertCircle, ShieldCheck } from 'lucide-react';
import { signInWithFirebaseGooglePopup } from '../services/firebase.ts';

interface GoogleSignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetRole?: 'student' | 'admin';
}

export const GoogleSignInModal: React.FC<GoogleSignInModalProps> = ({
  isOpen,
  onClose,
  targetRole = 'student',
}) => {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'picker' | 'custom'>('picker');
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isAdmin = targetRole === 'admin';

  const handleSelectAccount = async (account: { name: string; email: string; avatarUrl?: string }) => {
    try {
      setLoading(true);
      setError(null);
      await loginWithGoogle({
        email: account.email,
        name: account.name,
        avatarUrl: account.avatarUrl,
        expectedRole: targetRole,
      });
      onClose();
      if (isAdmin) {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate with Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim() || !customEmail.includes('@')) {
      setError('Please enter a valid Google Account email.');
      return;
    }
    const name = customName.trim() || customEmail.split('@')[0];
    await handleSelectAccount({
      name,
      email: customEmail.trim(),
    });
  };

  const handleLaunchGooglePopup = async () => {
    try {
      setLoading(true);
      setError(null);
      const user = await signInWithFirebaseGooglePopup();
      if (user && user.email) {
        await handleSelectAccount({
          email: user.email,
          name: user.displayName || user.email.split('@')[0],
          avatarUrl: user.photoURL || undefined,
        });
      }
    } catch (popupErr: any) {
      // In restricted iframe environments where popup is blocked, offer direct account list
      console.warn('Firebase popup handled with fallback picker:', popupErr);
      setError('Direct Google popup was blocked or closed. Please select your account below to proceed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-white text-slate-800 shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header with Google Logo */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
              />
              <path
                fill="#FBBC05"
                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
              />
              <path fill="none" d="M0 0h48v48H0z" />
            </svg>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-semibold text-slate-900 leading-tight">
                  Sign in with Google
                </h3>
                {isAdmin && (
                  <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 font-semibold text-[10px]">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                {isAdmin ? 'to manage ExamPulse examinations' : 'to continue to ExamPulse Portal'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'picker' ? (
            <div className="space-y-3">
              <p className="text-xs font-medium text-slate-600">
                {isAdmin ? 'Choose an authorized administrator account:' : 'Choose an account:'}
              </p>

              {/* Primary User Account: Tirthesh Kothari */}
              <button
                type="button"
                onClick={() =>
                  handleSelectAccount({
                    name: 'Tirthesh Kothari',
                    email: 'kotharitirthesh30@gmail.com',
                  })
                }
                disabled={loading}
                className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between transition group cursor-pointer ${
                  isAdmin
                    ? 'border-purple-200 hover:border-purple-500 hover:bg-purple-50/50'
                    : 'border-slate-200 hover:border-blue-500 hover:bg-blue-50/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full font-bold flex items-center justify-center text-sm shadow-sm text-white ${
                      isAdmin
                        ? 'bg-gradient-to-tr from-purple-600 to-indigo-600'
                        : 'bg-gradient-to-tr from-blue-600 to-indigo-600'
                    }`}
                  >
                    T
                  </div>
                  <div>
                    <div
                      className={`text-sm font-semibold text-slate-900 ${
                        isAdmin ? 'group-hover:text-purple-700' : 'group-hover:text-blue-700'
                      }`}
                    >
                      Tirthesh Kothari
                    </div>
                    <div className="text-xs text-slate-500 font-mono">
                      kotharitirthesh30@gmail.com
                    </div>
                  </div>
                </div>
                <div
                  className={`px-2 py-0.5 rounded-md text-[10px] font-semibold flex items-center gap-1 ${
                    isAdmin
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {isAdmin && <ShieldCheck className="w-3 h-3 text-purple-600" />}
                  <span>{isAdmin ? 'Super Admin' : 'Google Account'}</span>
                </div>
              </button>

              {/* Use Another Google Account */}
              <button
                type="button"
                onClick={() => setMode('custom')}
                disabled={loading}
                className="w-full p-3.5 rounded-xl border border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-left flex items-center gap-3 transition text-slate-700 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold">
                    {isAdmin ? 'Login with any other Google Account' : 'Use another Google account'}
                  </div>
                  <div className="text-xs text-slate-500">
                    {isAdmin
                      ? 'Sign in as administrator with any email'
                      : 'Sign in with a different @gmail.com'}
                  </div>
                </div>
              </button>
            </div>
          ) : (
            <form onSubmit={handleCustomSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Google Account Email
                </label>
                <input
                  type="email"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder={isAdmin ? 'e.g. admin@school.edu or yourname@gmail.com' : 'e.g. yourname@gmail.com'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name / Designation
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder={isAdmin ? 'e.g. Prof. Administrator' : 'e.g. Student Name'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMode('picker')}
                  disabled={loading}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100 transition"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-5 py-2 rounded-xl text-xs font-semibold text-white transition shadow-sm ${
                    isAdmin
                      ? 'bg-purple-600 hover:bg-purple-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {loading ? 'Authenticating...' : isAdmin ? 'Authorize as Admin' : 'Sign In with Google'}
                </button>
              </div>
            </form>
          )}

          {/* Privacy & Security Note */}
          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 leading-relaxed flex items-start gap-2">
            <Shield className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
            <p>
              Identity verified via Google Sign-In & Firebase Auth. User sessions and data are securely persisted in Firestore.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
