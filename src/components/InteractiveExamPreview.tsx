import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle2, XCircle, RotateCcw, ArrowRight, Sparkles, Award } from 'lucide-react';

interface QuestionSample {
  id: number;
  subject: string;
  question: string;
  options: string[];
  correctAnswer: number;
  marks: number;
}

const sampleQuestions: QuestionSample[] = [
  {
    id: 1,
    subject: 'Computer Networks',
    question: 'Which topology requires a multipoint connection where all nodes share a single communication line?',
    options: ['Star Topology', 'Mesh Topology', 'Bus Topology', 'Ring Topology'],
    correctAnswer: 2,
    marks: 2,
  },
  {
    id: 2,
    subject: 'Computer Networks',
    question: 'What is the primary role of the Address Resolution Protocol (ARP)?',
    options: [
      'Map 32-bit IPv4 address to 48-bit MAC address',
      'Map domain names to IP addresses',
      'Provide secure encryption across networks',
      'Route packets between different subnets',
    ],
    correctAnswer: 0,
    marks: 2,
  },
  {
    id: 3,
    subject: 'Computer Networks',
    question: 'Which class of IPv4 address provides a default subnet mask of 255.255.0.0?',
    options: ['Class A', 'Class B', 'Class C', 'Class D'],
    correctAnswer: 1,
    marks: 2,
  },
  {
    id: 4,
    subject: 'Computer Networks',
    question: 'What mechanism does TCP utilize to establish a reliable end-to-end full duplex connection?',
    options: [
      'Four-way Handshake',
      'Three-way Handshake (SYN, SYN-ACK, ACK)',
      'Carrier Sense Multiple Access (CSMA/CD)',
      'Sliding Window Piggybacking',
    ],
    correctAnswer: 1,
    marks: 2,
  },
  {
    id: 5,
    subject: 'Computer Networks',
    question: 'Which layer of the OSI model handles logical addressing and packet routing?',
    options: ['Data Link', 'Network', 'Transport', 'Session'],
    correctAnswer: 1,
    marks: 2,
  },
  {
    id: 6,
    subject: 'Computer Networks',
    question: 'Which of the following protocols is connectionless and does not guarantee packet delivery order?',
    options: ['TCP', 'UDP', 'SCTP', 'BGP'],
    correctAnswer: 1,
    marks: 2,
  },
  {
    id: 7,
    subject: 'Computer Networks',
    question: 'What is the default port number used for secure HTTPS web traffic?',
    options: ['Port 80', 'Port 21', 'Port 443', 'Port 8080'],
    correctAnswer: 2,
    marks: 2,
  },
];

export const InteractiveExamPreview: React.FC = () => {
  const navigate = useNavigate();

  // Start by default on Question 5 (matching user's screenshot exactly!)
  const [currentIdx, setCurrentIdx] = useState(4); // 0-indexed, so 4 is Question 5
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: number }>({
    4: 1, // Question 5 default selected to "Network" as in screenshot!
  });
  const [submitted, setSubmitted] = useState(false);
  const [seconds, setSeconds] = useState(1122); // 18m 42s = 1122 seconds

  // Real-time ticking countdown timer
  useEffect(() => {
    if (submitted) return;
    const interval = setInterval(() => {
      setSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [submitted]);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `00:${pad(mins)}:${pad(secs)}`;
  };

  const currentQ = sampleQuestions[currentIdx];

  const handleSelectOption = (optIndex: number) => {
    if (submitted) return;
    setUserAnswers((prev) => ({
      ...prev,
      [currentIdx]: optIndex,
    }));
  };

  const calculateScore = () => {
    let score = 0;
    let total = 0;
    let correct = 0;
    sampleQuestions.forEach((q, idx) => {
      total += q.marks;
      if (userAnswers[idx] === q.correctAnswer) {
        score += q.marks;
        correct += 1;
      }
    });
    return { score, total, correct, percentage: Math.round((score / total) * 100) };
  };

  const handleReset = () => {
    setUserAnswers({ 4: 1 });
    setCurrentIdx(4);
    setSubmitted(false);
    setSeconds(1122);
  };

  const scoreSummary = calculateScore();

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Outer ambient glow */}
      <div className="absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 opacity-35 blur-xl animate-pulse" />

      {/* Main Glass Card */}
      <div className="relative rounded-2xl bg-gradient-to-b from-[#10172e] to-[#0c1224] border border-slate-700/80 p-5 sm:p-6 shadow-2xl backdrop-blur-xl">
        {/* Window Chrome Header matching screenshot */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/90 shadow-sm shadow-rose-500/50" />
            <div className="w-3 h-3 rounded-full bg-amber-500/90 shadow-sm shadow-amber-500/50" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/90 shadow-sm shadow-emerald-500/50" />
            <span className="ml-2 text-xs font-semibold text-slate-200">
              Exam-Pulse Active Examination
            </span>
          </div>

          {/* Interactive Working Live Countdown Timer */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-950/80 border border-indigo-700/50 text-cyan-400 text-xs font-mono font-bold shadow-inner">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            <span>{formatTimer(seconds)}</span>
          </div>
        </div>

        {/* Live Examination Body or Submitted Score View */}
        {!submitted ? (
          <div className="space-y-4">
            {/* Subject and Question Counter */}
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-cyan-400 bg-cyan-950/70 px-2 py-0.5 rounded-md border border-cyan-800/40">
                {currentQ.subject}
              </span>
              <span className="text-slate-400 font-mono">
                Question {currentQ.id} of {sampleQuestions.length}
              </span>
            </div>

            {/* Question Text */}
            <p className="text-sm font-semibold text-white leading-snug min-h-[40px]">
              {currentQ.question}
            </p>

            {/* Interactive Answer Options */}
            <div className="space-y-2 pt-1">
              {currentQ.options.map((opt, optIndex) => {
                const isSelected = userAnswers[currentIdx] === optIndex;

                return (
                  <button
                    key={optIndex}
                    type="button"
                    onClick={() => handleSelectOption(optIndex)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-medium border transition-all cursor-pointer text-left ${
                      isSelected
                        ? 'bg-indigo-600/25 border-cyan-400/80 text-white shadow-lg shadow-indigo-950/50 ring-1 ring-cyan-400/50'
                        : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:bg-slate-850 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 pr-2">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition ${
                          isSelected ? 'border-cyan-400 bg-cyan-400' : 'border-slate-600'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                      </div>
                      <span className="leading-tight">{opt}</span>
                    </div>

                    {isSelected && (
                      <span className="text-[10px] text-cyan-300 font-mono shrink-0 font-bold">
                        Selected
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Palette & Submit Action Bar matching screenshot */}
            <div className="pt-3 flex items-center justify-between border-t border-slate-800/80 gap-2">
              {/* Working Question Palette Numbers 1 through 7 */}
              <div className="flex items-center gap-1 overflow-x-auto py-1">
                {sampleQuestions.map((q, idx) => {
                  const isCurrent = idx === currentIdx;
                  const isAnswered = userAnswers[idx] !== undefined;

                  let style = 'bg-slate-850 text-slate-400 border border-slate-700/60 hover:text-white';
                  if (isCurrent) {
                    style = 'bg-cyan-500 text-slate-950 font-extrabold ring-2 ring-cyan-400 shadow-md shadow-cyan-500/30';
                  } else if (isAnswered) {
                    style = 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 font-bold';
                  }

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentIdx(idx)}
                      className={`w-6 h-6 rounded-md flex items-center justify-center text-[11px] transition transform hover:scale-105 active:scale-95 cursor-pointer ${style}`}
                      title={`Jump to Question ${q.id}`}
                    >
                      {q.id}
                    </button>
                  );
                })}
              </div>

              {/* Working Submit Exam button */}
              <button
                type="button"
                onClick={() => setSubmitted(true)}
                className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition transform hover:scale-105 active:scale-95 cursor-pointer shrink-0"
              >
                Submit Exam
              </button>
            </div>
          </div>
        ) : (
          /* Instant Working Score Evaluation Modal View */
          <div className="py-2 space-y-4 animate-in fade-in zoom-in-95">
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-white">Assessment Evaluated!</h4>
              <p className="text-xs text-slate-400">
                You scored <strong className="text-cyan-400">{scoreSummary.score}</strong> / {scoreSummary.total} Marks ({scoreSummary.percentage}%)
              </p>
              <div className="flex items-center justify-center gap-4 text-xs pt-1">
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {scoreSummary.correct} Correct
                </span>
                <span className="text-rose-400 font-semibold flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" /> {sampleQuestions.length - scoreSummary.correct} Incorrect
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake Demo</span>
              </button>

              <button
                type="button"
                onClick={() => navigate('/student/login')}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-xs font-bold text-white shadow-md shadow-indigo-600/30 hover:from-blue-500 hover:to-indigo-500 transition"
              >
                <span>Full Exam Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
