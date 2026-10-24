import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar.tsx';
import {
  ShieldCheck,
  Zap,
  Award,
  BarChart2,
  Clock,
  CheckCircle2,
  Lock,
  ArrowRight,
  GraduationCap,
  Sparkles,
  ChevronRight,
  Laptop,
} from 'lucide-react';

export const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col selection:bg-indigo-500/30 selection:text-cyan-300">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden">
        {/* Glow ambient background effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-cyan-600/15 via-indigo-600/20 to-purple-600/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/60 border border-indigo-700/40 text-cyan-400 text-xs font-semibold tracking-wide shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next-Generation Academic Assessment</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
                Your Smarter{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-400">
                  Online Examination
                </span>{' '}
                Platform
              </h1>

              <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Take exams, track progress and achieve more with Exam-Pulse. The secure, automated examination suite for students and universities.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/student/login"
                  className="px-6 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-xl shadow-indigo-600/30 transition transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
                >
                  <GraduationCap className="w-5 h-5 text-cyan-300" />
                  <span>Student Login</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>

                <Link
                  to="/admin/login"
                  className="px-6 py-3.5 rounded-xl font-semibold text-slate-200 bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700/80 hover:border-slate-600 shadow-lg transition flex items-center gap-2"
                >
                  <ShieldCheck className="w-5 h-5 text-purple-400" />
                  <span>Admin Login</span>
                </Link>

                <Link
                  to="/register"
                  className="px-5 py-3.5 rounded-xl font-medium text-slate-400 hover:text-white transition flex items-center gap-1.5"
                >
                  <span>New Student? Sign Up</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Badges / Pill features under hero */}
              <div className="pt-6 border-t border-slate-800/60 flex flex-wrap items-center justify-center lg:justify-start gap-6 sm:gap-8 text-xs font-medium text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-cyan-950/60 border border-cyan-800/50 flex items-center justify-center text-cyan-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-slate-200 font-semibold block">Secure</span>
                    <span>& Reliable</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-950/60 border border-indigo-800/50 flex items-center justify-center text-indigo-400">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-slate-200 font-semibold block">Easy</span>
                    <span>to Use</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-950/60 border border-purple-800/50 flex items-center justify-center text-purple-400">
                    <BarChart2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-slate-200 font-semibold block">Track</span>
                    <span>Progress</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Graphic: Examination Card Mockup */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-md">
                {/* Glow ring behind card */}
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 opacity-30 blur-xl" />

                <div className="relative rounded-2xl bg-gradient-to-b from-[#10172e] to-[#0c1224] border border-slate-700/80 p-5 shadow-2xl backdrop-blur-xl space-y-4">
                  {/* Mock Exam Window Header */}
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                      <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                      <span className="ml-2 text-xs font-semibold text-slate-300">Exam-Pulse Active Examination</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-950/80 border border-indigo-700/40 text-cyan-400 text-xs font-mono font-bold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>00:18:42</span>
                    </div>
                  </div>

                  {/* Mock Question Preview */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-semibold text-cyan-400">Computer Networks</span>
                      <span>Question 5 of 15</span>
                    </div>

                    <p className="text-sm font-semibold text-white leading-snug">
                      Which layer of the OSI model handles logical addressing and packet routing?
                    </p>

                    <div className="space-y-2 pt-1">
                      {['Data Link', 'Network', 'Transport', 'Session'].map((opt, i) => {
                        const isSelected = i === 1;
                        return (
                          <div
                            key={opt}
                            className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-medium border transition ${
                              isSelected
                                ? 'bg-indigo-600/25 border-cyan-400/60 text-white shadow-sm'
                                : 'bg-slate-900/60 border-slate-800 text-slate-300'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                  isSelected ? 'border-cyan-400 bg-cyan-400' : 'border-slate-600'
                                }`}
                              >
                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />}
                              </div>
                              <span>{opt}</span>
                            </div>
                            {isSelected && <span className="text-[10px] text-cyan-300 font-mono">Selected</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Mock Palette / Action */}
                  <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                        <div
                          key={num}
                          className={`w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold ${
                            num === 5
                              ? 'bg-cyan-500 text-slate-950 ring-2 ring-cyan-400'
                              : num < 5
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {num}
                        </div>
                      ))}
                    </div>
                    <span className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold">
                      Submit Exam
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section id="features" className="py-20 bg-[#0a0f1d]/50 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-cyan-400">
              Built for Modern Academia
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Enterprise Examination Engine
            </p>
            <p className="text-base text-slate-400">
              High-concurrency, tamper-resistant, automated evaluation built for universities and competitive assessments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/50 transition group hover:shadow-xl hover:shadow-cyan-950/20">
              <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400 mb-5 group-hover:scale-110 transition">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">1. Secure Examinations</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Strict server-side timing rules, tamper-proof answer key separation, single-attempt policies, and role-based access.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/50 transition group hover:shadow-xl hover:shadow-indigo-950/20">
              <div className="w-12 h-12 rounded-xl bg-indigo-950/80 border border-indigo-800/60 flex items-center justify-center text-indigo-400 mb-5 group-hover:scale-110 transition">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">2. Flexible Online Exams</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Scheduled availability windows, question palettes, auto-save persistence, and multi-device responsive delivery.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-purple-500/50 transition group hover:shadow-xl hover:shadow-purple-950/20">
              <div className="w-12 h-12 rounded-xl bg-purple-950/80 border border-purple-800/60 flex items-center justify-center text-purple-400 mb-5 group-hover:scale-110 transition">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">3. Instant Results</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Zero-wait automated grading with negative marking calculation, comprehensive pass/fail statistics, and question explanations.
              </p>
            </div>

            {/* Card 4 */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-blue-500/50 transition group hover:shadow-xl hover:shadow-blue-950/20">
              <div className="w-12 h-12 rounded-xl bg-blue-950/80 border border-blue-800/60 flex items-center justify-center text-blue-400 mb-5 group-hover:scale-110 transition">
                <BarChart2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">4. Performance Tracking</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Subject-wise mastery trends, student historical records, administrator analytics, and exportable CSV reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works flow (as in mockup image 2) */}
      <section className="py-20 border-t border-slate-800/80 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-purple-400">
              Seamless Workflow
            </h2>
            <p className="text-3xl font-extrabold text-white">How Exam-Pulse Works</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            {[
              { step: '1', title: 'Home', desc: 'Browse exams & portal', icon: Laptop },
              { step: '2', title: 'Login', desc: 'Secure student/admin auth', icon: Lock },
              { step: '3', title: 'Dashboard', desc: 'View schedule & stats', icon: BarChart2 },
              { step: '4', title: 'Exam', desc: 'Interactive timed exam', icon: Clock },
              { step: '5', title: 'Results', desc: 'Instant marks & analysis', icon: Award },
            ].map((st, i) => {
              const Icon = st.icon;
              return (
                <div
                  key={st.step}
                  className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col items-center hover:border-slate-700 transition"
                >
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white mb-3 shadow-lg shadow-indigo-600/20">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-white text-base">{st.title}</h4>
                  <p className="text-xs text-slate-400 mt-1">{st.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About & Contact Section */}
      <section id="about" className="py-16 bg-[#090e1c] border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">About Exam-Pulse Examination Portal</h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                Exam-Pulse was engineered to bridge institutional integrity and student convenience. By combining strict server-enforced timers, isolated answer keys, and automatic multi-tier scoring with intuitive modern UI, Exam-Pulse eliminates assessment bottlenecks for academic departments worldwide.
              </p>
              <div className="space-y-2 text-sm text-slate-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Supports objective multiple-choice questions with custom marks</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Fractional negative marking prevents guessing inflation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Comprehensive question bank categorization by subject</span>
                </div>
              </div>
            </div>

            <div id="contact" className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <h4 className="text-lg font-bold text-white">Need Support or Have Questions?</h4>
              <p className="text-xs text-slate-400">
                Our academic examination support desk is available 24/7 for exam coordinators and students.
              </p>
              <div className="space-y-2 text-xs text-slate-300">
                <div className="p-3 rounded-xl bg-slate-850 border border-slate-800">
                  <span className="text-slate-400 block">Examination Office:</span>
                  <span className="font-medium text-white">exam-desk@orbit.edu</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-850 border border-slate-800">
                  <span className="text-slate-400 block">Controller of Examinations:</span>
                  <span className="font-medium text-white">Dr. Priya Nair (Academic Hall A-204)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-850 bg-[#060911] py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Exam-Pulse — Online Examination Portal. All rights reserved.</p>
          <div className="flex items-center gap-6 text-slate-400">
            <Link to="/student/login" className="hover:text-cyan-400">
              Student Portal
            </Link>
            <Link to="/admin/login" className="hover:text-purple-400">
              Admin Console
            </Link>
            <Link to="/register" className="hover:text-white">
              Student Registration
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
