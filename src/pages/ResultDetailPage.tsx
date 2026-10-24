import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, ExamResult } from '../services/api.ts';
import { formatDuration } from '../utils/examScoring.ts';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  FileCheck,
  AlertCircle,
  HelpCircle,
  Printer,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

export const ResultDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [result, setResult] = useState<ExamResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadResult() {
      if (!id) return;
      try {
        setLoading(true);
        const res = await api.getResultById(id);
        setResult(res.result);
      } catch (err: any) {
        setError(err.message || 'Failed to load examination result.');
      } finally {
        setLoading(false);
      }
    }
    loadResult();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <div className="w-10 h-10 border-3 border-indigo-500/20 border-t-cyan-400 rounded-full animate-spin" />
        <p className="text-sm text-slate-400">Loading comprehensive performance report...</p>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="p-8 text-center text-slate-400 border border-slate-800 rounded-3xl bg-slate-900/60 max-w-lg mx-auto">
        <AlertCircle className="w-10 h-10 mx-auto mb-3 text-rose-400" />
        <h3 className="text-lg font-bold text-white">Result Not Available</h3>
        <p className="text-xs text-slate-400 mt-1 mb-5">{error || 'Could not find the requested score report.'}</p>
        <button
          onClick={() => navigate('/student/results')}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition"
        >
          View My Results
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Top Breadcrumb & Print */}
      <div className="flex items-center justify-between">
        <Link
          to="/student/results"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Results</span>
        </Link>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Scorecard</span>
        </button>
      </div>

      {/* Main Score Banner Card */}
      <div className="rounded-3xl bg-gradient-to-br from-[#0c1326] to-[#0f172a] border border-slate-800 p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-cyan-500/10 via-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
                {result.subject}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                  result.passed
                    ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60'
                    : 'bg-rose-950/80 text-rose-400 border-rose-800/60'
                }`}
              >
                {result.passed ? 'Passed Examination' : 'Did Not Meet Passing Criteria'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {result.examTitle}
            </h1>

            <p className="text-xs sm:text-sm text-slate-400">
              Student: <strong className="text-white">{result.studentName}</strong> • ID:{' '}
              <strong className="text-white font-mono">{result.studentCodeId}</strong>
            </p>
          </div>

          {/* Big Score Callout */}
          <div className="flex items-center gap-6 bg-slate-950/70 p-5 rounded-3xl border border-slate-800/90 shrink-0">
            <div>
              <span className="text-xs font-medium text-slate-400 block">Marks Obtained</span>
              <div className="text-3xl sm:text-4xl font-extrabold text-white mt-0.5">
                {result.marksObtained}
                <span className="text-base text-slate-500 font-normal"> / {result.totalMarks}</span>
              </div>
            </div>

            <div className="h-12 w-[1px] bg-slate-800" />

            <div>
              <span className="text-xs font-medium text-slate-400 block">Overall Percentage</span>
              <div className="text-3xl sm:text-4xl font-extrabold text-cyan-400 mt-0.5">
                {result.percentage}%
              </div>
            </div>
          </div>
        </div>

        {/* 4 Performance Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8 pt-6 border-t border-slate-800/80">
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-xs text-slate-400 block flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Correct</span>
            </span>
            <span className="text-xl font-bold text-emerald-400 mt-1 block">
              {result.correctCount}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-xs text-slate-400 block flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5 text-rose-400" />
              <span>Incorrect</span>
            </span>
            <span className="text-xl font-bold text-rose-400 mt-1 block">
              {result.incorrectCount}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-xs text-slate-400 block flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              <span>Unattempted</span>
            </span>
            <span className="text-xl font-bold text-slate-300 mt-1 block">
              {result.unattemptedCount}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-xs text-slate-400 block flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Time Spent</span>
            </span>
            <span className="text-xl font-bold text-cyan-300 mt-1 block font-mono">
              {formatDuration(result.timeSpentSeconds)}
            </span>
          </div>
        </div>
      </div>

      {/* Question Breakdown and Solutions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Question Review & Solutions</h3>
          <span className="text-xs text-slate-400">
            Detailed breakdown of your answers against the authorized solution key
          </span>
        </div>

        {result.questionBreakdown?.map((q, idx) => {
          const isAttempted = q.studentAnswer !== undefined;

          return (
            <div
              key={q.questionId}
              className={`p-6 rounded-3xl border transition ${
                q.isCorrect
                  ? 'bg-slate-900/60 border-slate-800 hover:border-emerald-500/40'
                  : isAttempted
                  ? 'bg-slate-900/60 border-slate-800 hover:border-rose-500/40'
                  : 'bg-slate-900/40 border-slate-850'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold font-mono text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-lg border border-cyan-800/40">
                  Question {idx + 1}
                </span>

                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                      q.isCorrect
                        ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800/50'
                        : isAttempted
                        ? 'bg-rose-950/80 text-rose-400 border-rose-800/50'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    {q.isCorrect ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Correct (+{q.marksAwarded})</span>
                      </>
                    ) : isAttempted ? (
                      <>
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Incorrect ({q.marksAwarded})</span>
                      </>
                    ) : (
                      <>
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Unattempted (0)</span>
                      </>
                    )}
                  </span>
                </div>
              </div>

              <h4 className="text-sm sm:text-base font-semibold text-white mb-4 leading-snug">
                {q.questionText}
              </h4>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
                {q.options.map((opt, optIdx) => {
                  const isStudentChoice = q.studentAnswer === optIdx;
                  const isCorrectChoice = q.correctAnswer === optIdx;

                  let optClass = 'bg-slate-950/60 border-slate-800 text-slate-400';
                  if (isCorrectChoice) {
                    optClass = 'bg-emerald-950/50 border-emerald-500/60 text-emerald-200 font-semibold ring-1 ring-emerald-500/40';
                  } else if (isStudentChoice && !q.isCorrect) {
                    optClass = 'bg-rose-950/50 border-rose-500/60 text-rose-200 font-semibold';
                  }

                  return (
                    <div
                      key={optIdx}
                      className={`p-3 rounded-2xl border text-xs flex items-center justify-between ${optClass}`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-md flex items-center justify-center font-bold bg-slate-900 border border-slate-800 text-[10px]">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{opt}</span>
                      </div>

                      {isCorrectChoice && (
                        <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                          Correct Key
                        </span>
                      )}
                      {isStudentChoice && !isCorrectChoice && (
                        <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider">
                          Your Choice
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Explanation Note */}
              {q.explanation && (
                <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-900/40 text-xs text-indigo-200 leading-relaxed">
                  <strong className="text-cyan-300 block mb-0.5">Academic Solution & Explanation:</strong>
                  {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
