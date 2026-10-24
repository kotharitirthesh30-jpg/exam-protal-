import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateExamScore, formatDuration, isExamAvailable, QuestionItem } from './examScoring.ts';

const mockQuestions: QuestionItem[] = [
  {
    id: 'q1',
    text: 'What is 2 + 2?',
    options: ['3', '4', '5', '6'],
    correctAnswerIndex: 1,
    marks: 2,
    negativeMarks: 0.5,
  },
  {
    id: 'q2',
    text: 'What is the capital of France?',
    options: ['Berlin', 'Madrid', 'Paris', 'Rome'],
    correctAnswerIndex: 2,
    marks: 2,
    negativeMarks: 0.5,
  },
  {
    id: 'q3',
    text: 'Which data structure uses LIFO?',
    options: ['Queue', 'Stack', 'Array', 'Tree'],
    correctAnswerIndex: 1,
    marks: 3,
    negativeMarks: 1,
  },
];

test('calculateExamScore: all correct gives 100% and passing status', () => {
  const answers = { q1: 1, q2: 2, q3: 1 };
  const result = calculateExamScore(answers, mockQuestions, 4);

  assert.equal(result.totalMarks, 7);
  assert.equal(result.marksObtained, 7);
  assert.equal(result.percentage, 100);
  assert.equal(result.passed, true);
  assert.equal(result.correctCount, 3);
  assert.equal(result.incorrectCount, 0);
  assert.equal(result.unattemptedCount, 0);
});

test('calculateExamScore: handles incorrect answers with negative marking', () => {
  // q1 correct (+2), q2 wrong (-0.5), q3 unattempted (0) -> total marks 1.5
  const answers = { q1: 1, q2: 0 };
  const result = calculateExamScore(answers, mockQuestions, 4, true);

  assert.equal(result.totalMarks, 7);
  assert.equal(result.marksObtained, 1.5);
  assert.equal(result.correctCount, 1);
  assert.equal(result.incorrectCount, 1);
  assert.equal(result.unattemptedCount, 1);
  assert.equal(result.passed, false); // threshold 4
});

test('calculateExamScore: marks obtained clamped at 0', () => {
  const answers = { q1: 0, q2: 0, q3: 0 };
  const result = calculateExamScore(answers, mockQuestions, 3, true);

  assert.equal(result.marksObtained, 0);
  assert.equal(result.percentage, 0);
  assert.equal(result.passed, false);
});

test('formatDuration formats seconds to MM:SS and HH:MM:SS properly', () => {
  assert.equal(formatDuration(0), '00:00');
  assert.equal(formatDuration(45), '00:45');
  assert.equal(formatDuration(65), '01:05');
  assert.equal(formatDuration(1122), '18:42'); // 18 mins 42 secs
  assert.equal(formatDuration(3665), '01:01:05'); // 1 hr 1 min 5 secs
});

test('isExamAvailable checks current time against window', () => {
  const now = new Date('2026-10-24T10:00:00Z');
  
  // Future exam
  const future = isExamAvailable('2026-10-25T10:00:00Z', '2026-10-25T12:00:00Z', now);
  assert.equal(future.status, 'upcoming');
  assert.equal(future.available, false);

  // Active exam
  const active = isExamAvailable('2026-10-24T08:00:00Z', '2026-10-24T18:00:00Z', now);
  assert.equal(active.status, 'live');
  assert.equal(active.available, true);

  // Past exam
  const past = isExamAvailable('2026-10-23T08:00:00Z', '2026-10-23T18:00:00Z', now);
  assert.equal(past.status, 'ended');
  assert.equal(past.available, false);
});
