import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, Question } from '../services/api.ts';
import { formatDuration } from '../utils/examScoring.ts';
import { OrbitLogo } from '../components/OrbitLogo.tsx';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Flag,
  CheckCircle2,
  Send,
  RotateCcw,
  ShieldAlert,
  HelpCircle,
  X,
  Maximize2,
  Minimize2,
} from 'lucide-react';

export const ExaminationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [exam, setExam] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [questionId: string]: number }>({});
  const [flagged, setFlagged] = useState<{ [questionId: string]: boolean }>({});
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Sync answers with backend debounced
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize or resume attempt
  useEffect(() => {
    async function initExam() {
      if (!id) return;
      try {
        setLoading(true);
        const res = await api.startExam(id);
        setAttemptId(res.attemptId);
        setExam(res.exam);
        setQuestions(res.questions);
        setAnswers(res.savedAnswers || {});
        setSecondsRemaining(res.remainingSeconds);
      } catch (err: any) {
        if (err.message && err.message.includes('already submitted')) {
          setError('You have already taken and submitted this examination.');
        } else {
          setError(err.message || 'Failed to start examination.');
        }
      } finally {
        setLoading(false);
      }
    }
    initExam();
  }, [id]);

  // Timer countdown
  useEffect(() => {
    if (secondsRemaining <= 0 || !attemptId || submitting) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto submit on zero
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsRemaining, attemptId, submitting]);

  // Save answer locally & sync to server
  const handleSelectOption = (optionIndex: number) => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    const updatedAnswers = {
      ...answers,
      [currentQ.id]: optionIndex,
    };
    setAnswers(updatedAnswers);

    // Debounced sync to server
    if (attemptId) {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = setTimeout(() => {
        api.saveAnswers(attemptId, updatedAnswers).catch(() => {});
      }, 800);
    }
  };

  const handleClearAnswer = () => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    const updatedAnswers = { ...answers };
    delete updatedAnswers[currentQ.id];
    setAnswers(updatedAnswers);

    if (attemptId) {
      api.saveAnswers(attemptId, updatedAnswers).catch(() => {});
    }
  };

  const handleToggleFlag = () => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;
    setFlagged((prev) => ({
      ...prev,
      [currentQ.id]: !prev[currentQ.id],
    }));
  };

  const handleAutoSubmit = async () => {
    if (submitting || !attemptId) return;
    setSubmitting(true);
    try {
      const res = await api.submitExam(attemptId, answers);
      navigate(`/student/results/${res.resultId}`);
    } catch (err: any) {
      alert('Time expired. Submitting your examination...');
      navigate('/student/dashboard');
    }
  };

  const handleConfirmSubmit = async () => {
    if (!attemptId) return;
    try {
      setSubmitting(true);
      const res = await api.submitExam(attemptId, answers);
      setShowSubmitModal(false);
      navigate(`/student/results/${res.resultId}`);
    } catch (err: any) {
      alert(err.message || 'Failed to submit examination.');
      setSubmitting(false);
    }
  };

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullScreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullScreen(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-cyan-400 rounded-full animate-spin mb-4" />
        <h3 className="text-base font-semibold text-white">Preparing Examination Session</h3>
        <p className="text-xs text-slate-400 mt-1">Verifying eligibility and configuring questions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Unable to Start Exam</h2>
          <p className="text-xs text-slate-300 leading-relaxed">{error}</p>
          <button
            onClick={() => navigate('/student/dashboard')}
            className="w-full py-2.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition text-sm"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const flaggedCount = Object.values(flagged).filter(Boolean).length;
  const unansweredCount = totalQuestions - answeredCount;

  // Timer color states
  const isTimerCritical = secondsRemaining < 60; // < 1 min
  const isTimerWarning = secondsRemaining < 300 && !isTimerCritical; // < 5 mins

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col select-none">
      {/* Top Exam Navigation Bar */}
      <header className="h-18 border-b border-slate-800/80 bg-[#0a0f1d] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-lg">
        <div className="flex items-center gap-4">
          <OrbitLogo size="sm" />
          <div className="hidden sm:block h-6 w-[1px] bg-slate-800" />
          <div>
            <h1 className="text-sm sm:text-base font-bold text-white truncate max-w-xs sm:max-w-md">
              {exam?.title}
            </h1>
            <p className="text-[11px] text-cyan-400 font-semibold">{exam?.subject}</p>
          </div>
        </div>

        {/* Center: Live Timer Badge matching screenshot */}
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl border font-mono font-bold text-sm sm:text-base transition-all shadow-md ${
            isTimerCritical
              ? 'bg-rose-950/80 border-rose-600/80 text-rose-400 animate-pulse shadow-rose-900/30 ring-2 ring-rose-500/50'
              : isTimerWarning
              ? 'bg-amber-950/70 border-amber-600/60 text-amber-300 shadow-amber-900/20'
              : 'bg-indigo-950/70 border-indigo-700/60 text-cyan-400 shadow-indigo-950/30'
          }`}
        >
          <Clock className={`w-4 h-4 sm:w-5 sm:h-5 ${isTimerCritical ? 'text-rose-400' : 'text-cyan-400'}`} />
          <span>{formatDuration(secondsRemaining)}</span>
        </div>

        {/* Fullscreen & Quick Help */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleFullScreen}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Toggle fullscreen"
          >
            {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-indigo-600/25 transition active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Finish & Submit</span>
          </button>
        </div>
      </header>

      {/* Main Examination Body */}
      <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Question Presentation Area (8 cols) */}
        <div className="lg:col-span-8 flex flex-col space-y-5">
          {/* Question Card */}
          <div className="rounded-3xl bg-slate-900/80 border border-slate-800/90 p-6 sm:p-8 backdrop-blur-xl shadow-xl space-y-6">
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-xl bg-indigo-950/80 border border-indigo-700/50 text-cyan-300 text-xs font-bold font-mono">
                  Question {currentIndex + 1} of {totalQuestions}
                </span>
                <span className="text-xs text-slate-400">
                  Marks: <strong className="text-white">+{currentQ?.marks || 1}</strong>
                  {exam?.negativeMarking && (
                    <span className="text-rose-400 ml-1.5">(-0.5 on wrong)</span>
                  )}
                </span>
              </div>

              {/* Flag button */}
              <button
                onClick={handleToggleFlag}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                  flagged[currentQ?.id]
                    ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Flag className="w-3.5 h-3.5" />
                <span>{flagged[currentQ?.id] ? 'Flagged' : 'Flag'}</span>
              </button>
            </div>

            {/* Question Text */}
            <div className="py-2">
              <h2 className="text-base sm:text-lg font-semibold text-white leading-relaxed">
                {currentQ?.text}
              </h2>
            </div>

            {/* Answer Options */}
            <div className="space-y-3">
              {currentQ?.options.map((opt, idx) => {
                const isSelected = answers[currentQ.id] === idx;
                const optionLabel = String.fromCharCode(65 + idx); // A, B, C, D

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full text-left p-4 rounded-2xl border text-sm font-medium transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-blue-900/40 to-indigo-900/30 border-cyan-400/80 text-white shadow-lg shadow-indigo-950/40 ring-1 ring-cyan-400/40'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-850 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold border transition ${
                          isSelected
                            ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-sm'
                            : 'bg-slate-900 border-slate-700 text-slate-400'
                        }`}
                      >
                        {optionLabel}
                      </div>
                      <span className="leading-snug">{opt}</span>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected ? 'border-cyan-400 bg-cyan-400' : 'border-slate-700'
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-slate-950" />}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Bottom Actions of Question */}
            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
              <button
                onClick={handleClearAnswer}
                disabled={answers[currentQ?.id] === undefined}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white disabled:opacity-40 disabled:hover:text-slate-400 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear Selection</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-850 disabled:opacity-40 disabled:hover:bg-slate-950 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                {currentIndex < totalQuestions - 1 ? (
                  <button
                    onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => setShowSubmitModal(true)}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-600/30 transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Review & Submit</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Question Palette (4 cols) matching screenshot */}
        <div className="lg:col-span-4 space-y-5">
          <div className="rounded-3xl bg-slate-900/80 border border-slate-800/90 p-6 backdrop-blur-xl shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white tracking-wide">Question Palette</h3>
              <span className="text-xs text-cyan-400 font-mono font-semibold">
                {answeredCount}/{totalQuestions} Answered
              </span>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded bg-emerald-500/80" />
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded bg-slate-800 border border-slate-700" />
                <span>Unanswered ({unansweredCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded bg-amber-500/80" />
                <span>Flagged ({flaggedCount})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 rounded ring-2 ring-cyan-400 bg-slate-900" />
                <span>Current</span>
              </div>
            </div>

            {/* Question Number Grid */}
            <div className="grid grid-cols-5 gap-2.5">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = answers[q.id] !== undefined;
                const isFlagged = flagged[q.id];

                let btnStyle = 'bg-slate-950 text-slate-400 border border-slate-800 hover:border-slate-700';

                if (isFlagged) {
                  btnStyle = 'bg-amber-500/20 text-amber-300 border border-amber-500/60 font-bold';
                } else if (isAnswered) {
                  btnStyle = 'bg-emerald-600 text-white font-bold shadow-sm shadow-emerald-700/30 border border-emerald-500';
                }

                if (isCurrent) {
                  btnStyle += ' ring-2 ring-cyan-400 ring-offset-2 ring-offset-slate-900';
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-10 rounded-xl flex items-center justify-center text-xs font-mono transition transform hover:scale-105 active:scale-95 cursor-pointer ${btnStyle}`}
                    aria-label={`Jump to question ${idx + 1}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Prominent Submit Button */}
            <div className="pt-2">
              <button
                onClick={() => setShowSubmitModal(true)}
                className="w-full py-3 rounded-2xl font-bold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-xl shadow-indigo-600/30 transition text-sm flex items-center justify-center gap-2 active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>Submit Exam</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="max-w-md w-full rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-indigo-950 border border-indigo-700 flex items-center justify-center text-cyan-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white">Submit Examination?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Please review your progress before final submission. Once submitted, answers cannot be modified.
              </p>
            </div>

            {/* Summary counters */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-800/40">
                <span className="text-xl font-extrabold text-emerald-400">{answeredCount}</span>
                <span className="text-[10px] text-slate-400 block font-medium">Answered</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <span className="text-xl font-extrabold text-slate-300">{unansweredCount}</span>
                <span className="text-[10px] text-slate-400 block font-medium">Unanswered</span>
              </div>
              <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-800/40">
                <span className="text-xl font-extrabold text-amber-400">{flaggedCount}</span>
                <span className="text-[10px] text-slate-400 block font-medium">Flagged</span>
              </div>
            </div>

            {unansweredCount > 0 && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>You still have {unansweredCount} unanswered questions!</span>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition"
              >
                Continue Exam
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={handleConfirmSubmit}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-md shadow-indigo-600/30 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>Yes, Submit Now</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
