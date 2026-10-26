import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import {
  Laptop,
  Lock,
  LayoutDashboard,
  Clock,
  Award,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Play,
} from 'lucide-react';

interface StepItem {
  id: string;
  stepNumber: string;
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  detailsTitle: string;
  detailsDescription: string;
  previewBadge: string;
  keyFeatures: string[];
  actionLabel: string;
  actionRoute?: string;
  requiresAuth?: boolean;
}

export const HowItWorksInteractive: React.FC = () => {
  const navigate = useNavigate();
  const { user, loginAsDemoStudent } = useAuth();
  const [activeStepId, setActiveStepId] = useState<string>('home');
  const [loadingAction, setLoadingAction] = useState(false);

  const steps: StepItem[] = [
    {
      id: 'home',
      stepNumber: '1',
      title: 'Home',
      desc: 'Browse exams & portal',
      icon: Laptop,
      detailsTitle: 'Step 1: Discover & Explore Examinations',
      detailsDescription:
        'Candidates visit the Exam-Pulse portal to review upcoming departmental test dates, assessment instructions, and examination regulations before starting.',
      previewBadge: 'Public Catalog & Overview',
      keyFeatures: [
        'Responsive institutional landing page with live announcement banners',
        'Direct links for candidates, faculty invigilators, and exam controllers',
        'Interactive real-time sample assessment simulator',
      ],
      actionLabel: 'Explore Home & Features',
      actionRoute: '/',
    },
    {
      id: 'login',
      stepNumber: '2',
      title: 'Login',
      desc: 'Secure student/admin auth',
      icon: Lock,
      detailsTitle: 'Step 2: Authenticate Identity',
      detailsDescription:
        'Secure multi-tier login for Students (using official Student ID or email) and Administrators. Includes password toggling, input sanitization, and 1-click test credentials.',
      previewBadge: 'Role-Based Authentication',
      keyFeatures: [
        'Server-enforced role verification (student vs. exam administrator)',
        'BCrypt password encryption with tamper-resistant JWT session cookies',
        'Instant 1-click demo autofill for testing candidate and controller accounts',
      ],
      actionLabel: 'Go to Student Login',
      actionRoute: '/student/login',
    },
    {
      id: 'dashboard',
      stepNumber: '3',
      title: 'Dashboard',
      desc: 'View schedule & stats',
      icon: LayoutDashboard,
      detailsTitle: 'Step 3: Access Personalized Candidate Dashboard',
      detailsDescription:
        'Once logged in, candidates view personalized metrics: upcoming examination schedules, completed assessments, historical average scores, and notifications.',
      previewBadge: 'Personalized Candidate Hub',
      keyFeatures: [
        'Real-time counters for upcoming and evaluated examinations',
        'Direct "Start Exam" and "Resume Exam" triggers for live testing windows',
        'Live system notification drawer for critical examination updates',
      ],
      actionLabel: 'Open Student Dashboard',
      actionRoute: '/student/dashboard',
      requiresAuth: true,
    },
    {
      id: 'exam',
      stepNumber: '4',
      title: 'Exam',
      desc: 'Interactive timed exam',
      icon: Clock,
      detailsTitle: 'Step 4: Take Live Timed Examination',
      detailsDescription:
        'The candidate enters an isolated testing interface with a synchronized server countdown timer, question palette, flag-for-review capability, and debounced auto-save.',
      previewBadge: 'Secure Examination Environment',
      keyFeatures: [
        'Server-enforced countdown timer with visual urgency alerts (< 5m, < 1m)',
        'Interactive Question Palette with color-coded answered/unanswered states',
        'Pre-submission verification modal to prevent accidental early finishes',
      ],
      actionLabel: 'Launch Live Exam Simulator',
      actionRoute: '/exam/exam_ds_unit3',
      requiresAuth: true,
    },
    {
      id: 'result',
      stepNumber: '5',
      title: 'Results',
      desc: 'Instant marks & analysis',
      icon: Award,
      detailsTitle: 'Step 5: View Instant Graded Scorecard & Review',
      detailsDescription:
        'Candidates start with 0 completed assessments (0% score). Upon submitting any exam, the system calculates marks, applies configured penalties, and displays real-time performance.',
      previewBadge: 'Automated Instant Grading',
      keyFeatures: [
        'Zero fake data: All new candidates start with 0 results until an exam is submitted',
        'Automatic calculation of marks, percentages, and pass/fail status upon submission',
        'Question-by-question solution review comparing candidate choice against answer key',
      ],
      actionLabel: 'View Examination Results',
      actionRoute: '/student/results',
      requiresAuth: true,
    },
  ];

  const activeStep = steps.find((s) => s.id === activeStepId) || steps[0];

  const handleStepAction = async (step: StepItem) => {
    if (!step.actionRoute) return;

    // If step requires student authentication and user is not logged in:
    if (step.requiresAuth && !user) {
      try {
        setLoadingAction(true);
        // Automatically sign in demo student Aarav Mehta for seamless 1-click test!
        await loginAsDemoStudent();
        navigate(step.actionRoute);
      } catch {
        navigate('/student/login');
      } finally {
        setLoadingAction(false);
      }
      return;
    }

    if (step.actionRoute === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate(step.actionRoute);
    }
  };

  return (
    <div className="space-y-8">
      {/* 5 Clickable Interactive Step Cards matching mockup */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
        {steps.map((st) => {
          const Icon = st.icon;
          const isActive = st.id === activeStepId;

          return (
            <button
              key={st.id}
              type="button"
              onClick={() => setActiveStepId(st.id)}
              className={`p-4 rounded-2xl border text-center flex flex-col items-center transition-all cursor-pointer relative overflow-hidden group ${
                isActive
                  ? 'bg-gradient-to-b from-[#16213e] to-[#0f172a] border-cyan-400 shadow-xl shadow-cyan-950/40 ring-1 ring-cyan-400/50 scale-[1.02]'
                  : 'bg-slate-900/60 border-slate-800 hover:bg-slate-850 hover:border-slate-700'
              }`}
            >
              {/* Step Number Badge */}
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white mb-2.5 shadow-lg transition transform group-hover:scale-105 ${
                  isActive
                    ? 'bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 shadow-indigo-600/40'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-950/80 text-cyan-400 font-mono">
                  0{st.stepNumber}
                </span>
                <h4 className="font-bold text-white text-sm">{st.title}</h4>
              </div>

              <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{st.desc}</p>

              {/* Status indicator bar */}
              <div
                className={`mt-2.5 w-full h-1 rounded-full transition-all ${
                  isActive ? 'bg-gradient-to-r from-cyan-400 to-indigo-500' : 'bg-transparent'
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Interactive Step Explorer Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#0f172a] to-[#090e1c] border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-600/10 via-cyan-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left: Step Details */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-800/40 text-cyan-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{activeStep.previewBadge}</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {activeStep.detailsTitle}
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {activeStep.detailsDescription}
            </p>

            {/* Key feature list for this step */}
            <div className="space-y-2 pt-1">
              {activeStep.keyFeatures.map((feat, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <button
                type="button"
                disabled={loadingAction}
                onClick={() => handleStepAction(activeStep)}
                className="px-5 py-2.5 rounded-xl font-bold text-white text-xs sm:text-sm bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-indigo-600/30 transition transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loadingAction ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current text-cyan-300" />
                    <span>{activeStep.actionLabel}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Next Step walkthrough button */}
              <button
                type="button"
                onClick={() => {
                  const currentIndex = steps.findIndex((s) => s.id === activeStepId);
                  const nextIndex = (currentIndex + 1) % steps.length;
                  setActiveStepId(steps[nextIndex].id);
                }}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-700/80 hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>Walkthrough Next Step</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right: Interactive Step Snapshot Mock */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl bg-slate-950/80 border border-slate-800 p-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-850 pb-2.5 mb-3 text-xs">
                <span className="font-mono text-cyan-400 font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  Active Step: {activeStep.title}
                </span>
                <span className="text-slate-500 text-[11px] font-mono">
                  Stage {activeStep.stepNumber} of 5
                </span>
              </div>

              {activeStep.id === 'home' && (
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
                    <p className="font-semibold text-white">Your Smarter Online Examination Platform</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Comprehensive portal for students and faculty with secure timed exams.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 p-2 rounded-lg bg-indigo-950/60 text-center font-semibold text-cyan-300 text-[11px]">
                      Student Portal
                    </div>
                    <div className="flex-1 p-2 rounded-lg bg-purple-950/60 text-center font-semibold text-purple-300 text-[11px]">
                      Admin Console
                    </div>
                  </div>
                </div>
              )}

              {activeStep.id === 'login' && (
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                    <div className="text-[11px] text-slate-400">Student ID or Email:</div>
                    <div className="p-1.5 rounded bg-slate-950 font-mono text-cyan-300 text-[11px]">
                      STU-2024-001
                    </div>
                    <div className="text-[11px] text-slate-400">Password:</div>
                    <div className="p-1.5 rounded bg-slate-950 font-mono text-slate-400 text-[11px]">
                      ••••••••••••
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-center text-white font-bold text-xs">
                    Login to Examination Portal
                  </div>
                </div>
              )}

              {activeStep.id === 'dashboard' && (
                <div className="space-y-2 text-xs">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2 rounded-lg bg-slate-900 text-center">
                      <span className="text-[10px] text-slate-400 block">Upcoming</span>
                      <strong className="text-white text-sm">3</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900 text-center">
                      <span className="text-[10px] text-slate-400 block">Completed</span>
                      <strong className="text-white text-sm">2</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900 text-center">
                      <span className="text-[10px] text-slate-400 block">Avg Score</span>
                      <strong className="text-cyan-400 text-sm">60%</strong>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white text-[11px]">Computer Networks - Quiz 2</div>
                      <div className="text-[10px] text-emerald-400">Live Now</div>
                    </div>
                    <div className="px-2 py-1 rounded bg-indigo-600 text-white font-semibold text-[10px]">
                      Start Exam
                    </div>
                  </div>
                </div>
              )}

              {activeStep.id === 'exam' && (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-indigo-950/80 border border-indigo-700/50">
                    <span className="text-slate-200 font-semibold text-[11px]">Computer Networks</span>
                    <span className="font-mono text-cyan-400 font-bold text-xs">⏱ 19:46</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <p className="text-white font-medium text-[11px]">
                      Q5: Which layer handles packet routing?
                    </p>
                    <div className="p-1.5 rounded bg-indigo-900/40 border border-cyan-400/60 text-cyan-200 text-[10px] font-semibold">
                      ● Network Layer (Selected)
                    </div>
                  </div>
                </div>
              )}

              {activeStep.id === 'result' && (
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-800/40 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                        Result Ready
                      </span>
                      <span className="text-white font-bold text-sm">Marks: 18 / 20</span>
                    </div>
                    <span className="text-lg font-extrabold text-cyan-400 font-mono">90%</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-900 text-slate-300 text-[11px] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Detailed solution explanations unlocked</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
