export interface QuestionItem {
  id: string;
  text: string;
  options: string[];
  correctAnswerIndex: number;
  marks: number;
  negativeMarks?: number;
  explanation?: string;
}

export interface StudentAnswers {
  [questionId: string]: number; // option index 0, 1, 2, 3
}

export interface ExamScoreResult {
  totalMarks: number;
  marksObtained: number;
  percentage: number;
  passed: boolean;
  correctCount: number;
  incorrectCount: number;
  unattemptedCount: number;
  details: {
    questionId: string;
    studentAnswer?: number;
    correctAnswer: number;
    isCorrect: boolean;
    marksAwarded: number;
  }[];
}

/**
 * Calculates exam score given student answers, question definitions, and passing marks threshold.
 * Correct answers award `question.marks`.
 * Incorrect answers subtract `negativeMarks` (if configured and > 0).
 * Unattempted answers receive 0 marks.
 */
export function calculateExamScore(
  answers: StudentAnswers,
  questions: QuestionItem[],
  passingMarks: number,
  allowNegativeMarking = true
): ExamScoreResult {
  let marksObtained = 0;
  let totalMarks = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let unattemptedCount = 0;

  const details = questions.map((q) => {
    const qMarks = q.marks > 0 ? q.marks : 1;
    totalMarks += qMarks;

    const studentAnswer = answers[q.id];
    const isAttempted = studentAnswer !== undefined && studentAnswer !== null && studentAnswer >= 0;

    let isCorrect = false;
    let marksAwarded = 0;

    if (!isAttempted) {
      unattemptedCount += 1;
      marksAwarded = 0;
    } else if (studentAnswer === q.correctAnswerIndex) {
      isCorrect = true;
      correctCount += 1;
      marksAwarded = qMarks;
      marksObtained += qMarks;
    } else {
      incorrectCount += 1;
      const penalty = allowNegativeMarking && q.negativeMarks ? q.negativeMarks : 0;
      marksAwarded = -penalty;
      marksObtained -= penalty;
    }

    return {
      questionId: q.id,
      studentAnswer: isAttempted ? studentAnswer : undefined,
      correctAnswer: q.correctAnswerIndex,
      isCorrect,
      marksAwarded,
    };
  });

  // Clamp marks obtained to not drop below 0 if all wrong
  const finalMarks = Math.max(0, Math.round(marksObtained * 100) / 100);
  const percentage = totalMarks > 0 ? Math.round((finalMarks / totalMarks) * 1000) / 10 : 0;
  const passed = finalMarks >= passingMarks;

  return {
    totalMarks,
    marksObtained: finalMarks,
    percentage,
    passed,
    correctCount,
    incorrectCount,
    unattemptedCount,
    details,
  };
}

/**
 * Formats a duration in seconds to MM:SS or HH:MM:SS format
 */
export function formatDuration(seconds: number): string {
  if (seconds <= 0) return '00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (hrs > 0) {
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}

/**
 * Checks if an exam is within its availability window
 */
export function isExamAvailable(
  startDateStr: string | null | undefined,
  endDateStr: string | null | undefined,
  referenceDate = new Date()
): { available: boolean; status: 'upcoming' | 'live' | 'ended' } {
  const now = referenceDate.getTime();

  if (startDateStr) {
    const start = new Date(startDateStr).getTime();
    if (now < start) {
      return { available: false, status: 'upcoming' };
    }
  }

  if (endDateStr) {
    const end = new Date(endDateStr).getTime();
    if (now > end) {
      return { available: false, status: 'ended' };
    }
  }

  return { available: true, status: 'live' };
}
