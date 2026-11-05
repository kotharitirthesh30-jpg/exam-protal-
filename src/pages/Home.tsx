import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar.tsx';
import { InteractiveExamPreview } from '../components/InteractiveExamPreview.tsx';
import { HowItWorksInteractive } from '../components/HowItWorksInteractive.tsx';
import {
  Zap,
  BarChart2,
  Clock,
  CheckCircle2,
  Lock,
  ArrowRight,
  GraduationCap,
  Shield,
  Sparkles,
} from 'lucide-react';

export const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col transition-colors selection:bg-indigo-500/30 selection:text-indigo-200 relative overflow-x-hidden">
      {/* Background Technical Grid */}
      <div className="technical-grid" />

      {/* Luxury Ambient Mesh Glows */}
      <div className="absolute top-10 left-1/4 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-indigo-600/18 via-purple-600/12 to-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-0 w-[500px] h-[450px] bg-gradient-to-bl from-blue-600/15 via-indigo-600/10 to-transparent rounded-full blur-[150px] pointer-events-none" />

      <Navbar />

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Content Column */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Premium Meta Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-950/40 backdrop-blur-md text-indigo-300 text-xs font-mono tracking-widest uppercase shadow-sm">
              <span className="w-2 h-2 rounded-full bg-indigo-400 shadow-[0_0_10px_#818cf8] animate-pulse" />
              <span>System Protocol: Active</span>
              <span className="text-indigo-400/50">•</span>
              <span className="text-[11px] text-indigo-200/80 normal-case font-sans font-medium">Enterprise Tier</span>
            </div>

            {/* Premium Titanium & Platinum Heading */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.06] v12-heading">
              Secure Scale <br />
              Assessments.
            </h1>

            <p className="text-base sm:text-lg text-[var(--ink-muted)] max-w-xl leading-relaxed font-normal">
              A high-performance examination engine designed for universities. Automated grading, real-time analytics, and tamper-resistant protocols in a unified interface.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-3">
              <Link
                to="/student/login"
                className="btn-v12-accent px-6 py-3.5 rounded-xl font-semibold text-sm inline-flex items-center gap-2.5 shadow-xl transition-all"
              >
                <GraduationCap className="w-4.5 h-4.5 text-white" />
                <span className="text-white">Student Portal</span>
                <ArrowRight className="w-4 h-4 text-white ml-0.5" />
              </Link>

              <Link
                to="/admin/login"
                className="btn-v12-outline px-6 py-3.5 rounded-xl font-medium text-sm inline-flex items-center gap-2.5 border border-white/10 hover:border-indigo-400/50"
              >
                <Shield className="w-4.5 h-4.5 text-indigo-400" />
                <span>Admin Terminal</span>
              </Link>

              <Link
                to="/register"
                className="px-4 py-3.5 text-xs text-indigo-300/80 hover:text-white font-mono tracking-wide transition inline-flex items-center gap-1.5"
              >
                <span>Enroll Profile →</span>
              </Link>
            </div>

            {/* Spec Bar */}
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-[var(--border)] max-w-lg">
              <div>
                <span className="text-2xl font-bold text-indigo-400 block font-mono">0.0s</span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)]">Grading Delay</span>
              </div>
              <div>
                <span className="text-2xl font-bold text-white block font-mono">100%</span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)]">Integrity Lock</span>
              </div>
              <div>
                <span className="text-2xl font-bold text-sky-400 block font-mono">Real-time</span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--ink-muted)]">Telemetry</span>
              </div>
            </div>
          </div>

          {/* Right Column: Live Working Interactive Examination Preview */}
          <div className="lg:col-span-5 relative">
            <InteractiveExamPreview />
          </div>
        </div>

        {/* Technical Architecture Feature Grid */}
        <section id="features" className="pt-28 pb-12 border-t border-[var(--border)] mt-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <div className="v12-meta mb-2">Core Specifications</div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Institutional-Grade Platform Architecture
              </h2>
            </div>
            <p className="text-xs text-[var(--ink-muted)] max-w-md font-mono">
              Engineered with deterministic timers, isolated answer vectors, and zero client-side credential exposure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] hover:border-indigo-500/40 transition-all group shadow-lg hover:shadow-indigo-500/10">
              <div className="w-11 h-11 rounded-xl bg-indigo-950/70 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-5 group-hover:scale-105 transition shadow-sm">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2 font-mono tracking-tight flex items-center gap-2">
                <span className="text-indigo-400">01.</span>
                <span>Secure Isolation</span>
              </h3>
              <p className="text-xs text-[var(--ink-muted)] leading-relaxed">
                Strict server-enforced timing bounds, isolated answer keys, single-session tokens, and role-enforced Firestore access.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] hover:border-indigo-500/40 transition-all group shadow-lg hover:shadow-indigo-500/10">
              <div className="w-11 h-11 rounded-xl bg-indigo-950/70 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-5 group-hover:scale-105 transition shadow-sm">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2 font-mono tracking-tight flex items-center gap-2">
                <span className="text-indigo-400">02.</span>
                <span>Timed Assessment</span>
              </h3>
              <p className="text-xs text-[var(--ink-muted)] leading-relaxed">
                Persistent auto-save per question, countdown countdown locks, and instant lock upon duration expiry.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] hover:border-indigo-500/40 transition-all group shadow-lg hover:shadow-indigo-500/10">
              <div className="w-11 h-11 rounded-xl bg-purple-950/70 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-5 group-hover:scale-105 transition shadow-sm">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2 font-mono tracking-tight flex items-center gap-2">
                <span className="text-purple-400">03.</span>
                <span>Automated Evaluation</span>
              </h3>
              <p className="text-xs text-[var(--ink-muted)] leading-relaxed">
                Zero-wait score calculation, negative marking computation, and instant candidate scorecard generation.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-[var(--surface)] border border-[var(--border)] hover:border-indigo-500/40 transition-all group shadow-lg hover:shadow-indigo-500/10">
              <div className="w-11 h-11 rounded-xl bg-emerald-950/70 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5 group-hover:scale-105 transition shadow-sm">
                <BarChart2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-white mb-2 font-mono tracking-tight flex items-center gap-2">
                <span className="text-emerald-400">04.</span>
                <span>Telemetry & Analytics</span>
              </h3>
              <p className="text-xs text-[var(--ink-muted)] leading-relaxed">
                Genuine real-time metrics across exams, candidates, passing ratios, and subject-level proficiency distributions.
              </p>
            </div>
          </div>
        </section>

        {/* Interactive Walkthrough Section */}
        <section className="py-20 border-t border-[var(--border)] relative">
          <div className="text-left max-w-2xl mb-12 space-y-2">
            <div className="v12-meta">Workflow Execution</div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Interactive Protocol Walkthrough
            </h2>
            <p className="text-xs text-[var(--ink-muted)] font-mono">
              Select any stage below to inspect the operational pipeline from creation to candidate verification.
            </p>
          </div>

          <HowItWorksInteractive />
        </section>

        {/* Institutional Authority & Contact */}
        <section id="about" className="py-16 border-t border-[var(--border)]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <div className="v12-meta">System Foundation</div>
              <h3 className="text-xl font-bold text-white">Exam-Pulse Examination Infrastructure</h3>
              <p className="text-xs text-[var(--ink-muted)] leading-relaxed">
                Exam-Pulse was engineered to bridge institutional integrity and student convenience. By combining strict server-enforced timers, isolated answer keys, and automatic multi-tier scoring with an intuitive modern UI, Exam-Pulse eliminates assessment bottlenecks for academic departments worldwide.
              </p>
              <div className="space-y-2.5 text-xs text-[var(--ink-muted)] font-mono pt-2">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Supports objective multiple-choice questions with custom marks</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Fractional negative marking prevents guessing bias</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Subject-categorized question banks and authentic metrics</span>
                </div>
              </div>
            </div>

            <div id="contact" className="p-6 sm:p-7 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-4 shadow-xl">
              <div className="v12-meta">Academic Registry</div>
              <h4 className="text-base font-bold text-white">Support & Administration Desk</h4>
              <p className="text-xs text-[var(--ink-muted)]">
                Our academic examination support desk is available for university coordinators and students.
              </p>
              <div className="space-y-2.5 text-xs font-mono pt-1">
                <div className="p-3.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)]">
                  <span className="text-[var(--ink-muted)] block text-[10px] uppercase tracking-wider mb-0.5">Examination Desk</span>
                  <span className="text-indigo-300 font-semibold">exam-desk@exampulse.edu</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border)]">
                  <span className="text-[var(--ink-muted)] block text-[10px] uppercase tracking-wider mb-0.5">Controller of Examinations</span>
                  <span className="text-white">Dr. Priya Nair (Academic Hall A-204)</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] bg-[#090d1c]/80 py-7 text-xs text-[var(--ink-muted)] relative z-10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono">
          <p>© 2026 EXAM-PULSE — Technical Assessment Platform. All rights reserved.</p>
          <div className="flex items-center gap-6 text-xs">
            <Link to="/student/login" className="hover:text-indigo-400 transition-colors">
              Student Portal
            </Link>
            <Link to="/admin/login" className="hover:text-indigo-400 transition-colors">
              Admin Terminal
            </Link>
            <Link to="/register" className="hover:text-indigo-400 transition-colors">
              Registration
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
