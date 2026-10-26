import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { OrbitDB, User, Exam, Question, ExamAttempt, ExamResult } from './db.ts';
import { calculateExamScore, isExamAvailable } from '../utils/examScoring.ts';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'orbit-portal-jwt-secret-key-production-ready';

// Authentication Middleware
export interface AuthRequest extends Request {
  user?: User;
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. No token provided.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
    const user = OrbitDB.findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User no longer exists.' });
    }
    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Your account is deactivated. Contact the administrator.' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session. Please login again.' });
  }
}

export function optionalAuthenticate(req: AuthRequest, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
      const user = OrbitDB.findUserById(decoded.id);
      if (user && user.status === 'active') {
        req.user = user;
      }
    } catch {}
  }
  next();
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
  }
  next();
}

export function requireStudent(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'student') {
    return res.status(403).json({ error: 'Access denied. Student portal only.' });
  }
  next();
}

function sanitizeUser(user: User) {
  const { passwordHash, ...safe } = user;
  return safe;
}

// ---------------- AUTH ROUTES ----------------

router.get('/auth/demo-accounts', (_req, res) => {
  res.json({
    student: {
      id: 'STU-2024-001',
      email: 'aarav@student.orbit.edu',
      password: 'student123',
      name: 'Aarav Mehta',
      role: 'student',
    },
    admin: {
      id: 'ADM-1001',
      email: 'admin@orbit.edu',
      password: 'admin123',
      name: 'Dr. Priya Nair',
      role: 'admin',
    },
  });
});

router.post('/auth/login', (req, res) => {
  const { identifier, password, expectedRole } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ error: 'Please provide ID/email and password.' });
  }

  const user = OrbitDB.findUserByCodeOrEmail(identifier);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials. User not found.' });
  }

  if (user.status !== 'active') {
    return res.status(403).json({ error: 'Account has been deactivated. Please contact support.' });
  }

  const isMatch = bcrypt.compareSync(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid password. Please check your credentials.' });
  }

  if (expectedRole && user.role !== expectedRole) {
    return res.status(403).json({
      error: `You cannot sign in as ${expectedRole} with a ${user.role} account.`,
    });
  }

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

  res.json({
    token,
    user: sanitizeUser(user),
  });
});

router.post('/auth/google', (req, res) => {
  const { email, name, googleId, avatarUrl, expectedRole } = req.body;
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Google account email is required.' });
  }

  const cleanEmail = email.trim().toLowerCase();

  // Strict role separation:
  // If user is logging in from the Admin portal (expectedRole === 'admin'), authenticate as admin.
  // If user is logging in from Student login (expectedRole === 'student' or omitted), authenticate strictly as student.
  const isAdminLogin = expectedRole === 'admin';
  const targetRole: 'admin' | 'student' = isAdminLogin ? 'admin' : 'student';

  // Find user with exact target role
  let user = OrbitDB.getUsers().find(
    (u) => u.email.toLowerCase() === cleanEmail && u.role === targetRole
  );

  if (!user) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const salt = bcrypt.genSaltSync(10);
    const defaultHash = bcrypt.hashSync(`google_${Date.now()}`, salt);

    if (isAdminLogin) {
      user = {
        id: `usr_admin_${Date.now()}`,
        name: (name && typeof name === 'string' && name.trim()) || 'Admin User',
        email: cleanEmail,
        codeId: cleanEmail === 'kotharitirthesh30@gmail.com' ? 'ADM-KOTHARI' : `ADM-G-${randomSuffix}`,
        passwordHash: defaultHash,
        role: 'admin',
        title: cleanEmail === 'kotharitirthesh30@gmail.com' ? 'Chief Examination Controller' : 'Academic Coordinator',
        department: 'Academic & Examination Council',
        status: 'active',
        avatarUrl: typeof avatarUrl === 'string' ? avatarUrl : undefined,
        authProvider: 'google',
        createdAt: new Date().toISOString(),
      };
    } else {
      user = {
        id: `usr_student_${Date.now()}`,
        name: (name && typeof name === 'string' && name.trim()) || cleanEmail.split('@')[0],
        email: cleanEmail,
        codeId: `STU-G-${randomSuffix}`,
        passwordHash: defaultHash,
        role: 'student',
        department: 'Computer Science & Engineering',
        year: '3rd Year',
        division: 'Division A',
        status: 'active',
        avatarUrl: typeof avatarUrl === 'string' ? avatarUrl : undefined,
        authProvider: 'google',
        createdAt: new Date().toISOString(),
      };
    }

    OrbitDB.createUser(user);
  } else {
    // Update avatar or authProvider if not previously set
    const updates: Partial<User> = {};
    if (avatarUrl && !user.avatarUrl) {
      updates.avatarUrl = avatarUrl;
    }
    if (!user.authProvider) {
      updates.authProvider = 'google';
    }
    if (Object.keys(updates).length > 0) {
      OrbitDB.updateUser(user.id, updates);
    }
  }

  if (user.status !== 'active') {
    return res.status(403).json({ error: 'Your account has been deactivated. Please contact administrator.' });
  }

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

  res.json({
    token,
    user: sanitizeUser(user),
  });
});

// Route to register/add any new Administrator login
router.post('/auth/admin/register', (req, res) => {
  const { name, email, codeId, password, title, department } = req.body;

  if (!name || !email || !codeId || !password) {
    return res.status(400).json({ error: 'Admin Name, Email, Admin ID, and Password are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanCode = codeId.trim().toUpperCase();

  const existing = OrbitDB.getUsers().find(
    (u) => u.email.toLowerCase() === cleanEmail || u.codeId.toUpperCase() === cleanCode
  );

  if (existing) {
    return res.status(409).json({ error: 'An administrator or user with this email or Admin ID already exists.' });
  }

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(password, salt);

  const newAdmin: User = {
    id: `usr_admin_${Date.now()}`,
    name: name.trim(),
    email: cleanEmail,
    codeId: cleanCode,
    passwordHash,
    role: 'admin',
    title: title?.trim() || 'Academic Administrator',
    department: department?.trim() || 'Examination Operations',
    status: 'active',
    authProvider: 'password',
    createdAt: new Date().toISOString(),
  };

  OrbitDB.createUser(newAdmin);

  const token = jwt.sign({ id: newAdmin.id, role: newAdmin.role }, JWT_SECRET, { expiresIn: '7d' });

  res.status(201).json({
    message: 'New administrator login registered successfully.',
    token,
    user: sanitizeUser(newAdmin),
  });
});

router.post('/auth/register', (req, res) => {
  const { name, email, codeId, password, department, year, division } = req.body;

  if (!name || !email || !codeId || !password) {
    return res.status(400).json({ error: 'Name, email, student ID, and password are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  const existingEmail = OrbitDB.getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existingEmail) {
    return res.status(409).json({ error: 'An account with this email address already exists.' });
  }

  const existingCode = OrbitDB.getUsers().find((u) => u.codeId.toLowerCase() === codeId.toLowerCase());
  if (existingCode) {
    return res.status(409).json({ error: 'An account with this Student ID already exists.' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const newUser: User = {
    id: `usr_stu_${Date.now()}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    codeId: codeId.trim().toUpperCase(),
    passwordHash,
    role: 'student',
    department: department || 'Computer Science & Engineering',
    year: year || '3rd Year',
    division: division || 'Division A',
    status: 'active',
    createdAt: new Date().toISOString(),
  };

  OrbitDB.createUser(newUser);
  const token = jwt.sign({ id: newUser.id, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });

  res.status(201).json({
    token,
    user: sanitizeUser(newUser),
  });
});

router.get('/auth/me', authenticate, (req: AuthRequest, res) => {
  res.json({ user: sanitizeUser(req.user!) });
});

router.put('/users/profile', authenticate, (req: AuthRequest, res) => {
  const { name, department, year, division, newPassword } = req.body;
  const updates: Partial<User> = {};
  if (name) updates.name = name;
  if (department) updates.department = department;
  if (year) updates.year = year;
  if (division) updates.division = division;

  if (newPassword && newPassword.trim().length >= 6) {
    updates.passwordHash = bcrypt.hashSync(newPassword.trim(), 10);
  }

  const updated = OrbitDB.updateUser(req.user!.id, updates);
  res.json({ user: sanitizeUser(updated!) });
});

// ---------------- EXAMS ROUTES ----------------

router.get('/exams', optionalAuthenticate, (req: AuthRequest, res) => {
  const isAdmin = req.user?.role === 'admin';
  const studentId = req.user?.role === 'student' ? req.user.id : undefined;

  let exams = OrbitDB.getExams();
  if (!isAdmin) {
    exams = exams.filter((e) => e.isPublished);
  }

  const mapped = exams.map((exam) => {
    const { available, status } = isExamAvailable(exam.startDate, exam.endDate);
    
    // Check if student has already taken or is currently taking it
    let studentAttemptStatus: 'not_started' | 'in_progress' | 'completed' = 'not_started';
    let resultId: string | undefined = undefined;

    if (studentId) {
      const attempt = OrbitDB.findAnyAttempt(studentId, exam.id);
      if (attempt) {
        if (attempt.status === 'submitted' || attempt.status === 'expired') {
          studentAttemptStatus = 'completed';
          const resObj = OrbitDB.findResultByAttempt(attempt.id);
          if (resObj) resultId = resObj.id;
        } else if (attempt.status === 'in_progress') {
          studentAttemptStatus = 'in_progress';
        }
      }
    }

    return {
      id: exam.id,
      title: exam.title,
      subject: exam.subject,
      description: exam.description,
      instructions: exam.instructions,
      durationMinutes: exam.durationMinutes,
      totalMarks: exam.totalMarks,
      passingMarks: exam.passingMarks,
      startDate: exam.startDate,
      endDate: exam.endDate,
      isPublished: exam.isPublished,
      negativeMarking: exam.negativeMarking,
      questionCount: exam.questions.length,
      available,
      status, // 'upcoming' | 'live' | 'ended'
      studentAttemptStatus,
      resultId,
      createdBy: exam.createdBy,
      createdAt: exam.createdAt,
    };
  });

  res.json({ exams: mapped });
});

router.get('/exams/:id', optionalAuthenticate, (req: AuthRequest, res) => {
  const exam = OrbitDB.findExamById(req.params.id);
  if (!exam) {
    return res.status(404).json({ error: 'Examination not found.' });
  }

  const isAdmin = req.user?.role === 'admin';
  const { available, status } = isExamAvailable(exam.startDate, exam.endDate);

  // If student is querying, strip out correct answers from questions
  const safeQuestions = exam.questions.map((q) => {
    if (isAdmin) {
      return q;
    }
    const { correctAnswerIndex, explanation, ...studentQuestion } = q;
    return studentQuestion;
  });

  res.json({
    exam: {
      ...exam,
      questions: safeQuestions,
      available,
      status,
    },
  });
});

router.post('/exams', authenticate, requireAdmin, (req: AuthRequest, res) => {
  const {
    title,
    subject,
    description,
    instructions,
    durationMinutes,
    passingMarks,
    startDate,
    endDate,
    negativeMarking,
    questions,
    isPublished,
  } = req.body;

  if (!title || !subject || !durationMinutes || !questions || !Array.isArray(questions)) {
    return res.status(400).json({ error: 'Title, subject, duration, and questions are required.' });
  }

  const formattedQuestions: Question[] = questions.map((q: any, idx: number) => ({
    id: q.id || `q_${Date.now()}_${idx}`,
    subject,
    text: q.text,
    options: q.options || [],
    correctAnswerIndex: Number(q.correctAnswerIndex ?? 0),
    marks: Number(q.marks || 1),
    negativeMarks: negativeMarking ? Number(q.negativeMarks || 0.5) : 0,
    explanation: q.explanation || '',
  }));

  const totalMarks = formattedQuestions.reduce((sum, q) => sum + (q.marks || 1), 0);

  const newExam: Exam = {
    id: `exam_${Date.now()}`,
    title,
    subject,
    description: description || '',
    instructions: instructions || ['Read all questions carefully.', 'Submit before the timer expires.'],
    durationMinutes: Number(durationMinutes),
    totalMarks,
    passingMarks: Number(passingMarks || Math.ceil(totalMarks * 0.4)),
    startDate: startDate || new Date().toISOString(),
    endDate: endDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    isPublished: isPublished ?? true,
    negativeMarking: Boolean(negativeMarking),
    questions: formattedQuestions,
    createdBy: req.user!.name,
    createdAt: new Date().toISOString(),
  };

  OrbitDB.createExam(newExam);
  res.status(201).json({ exam: newExam });
});

router.put('/exams/:id', authenticate, requireAdmin, (req: AuthRequest, res) => {
  const exam = OrbitDB.findExamById(req.params.id);
  if (!exam) {
    return res.status(404).json({ error: 'Examination not found.' });
  }

  const updates = { ...req.body };
  if (updates.questions && Array.isArray(updates.questions)) {
    updates.totalMarks = updates.questions.reduce((sum: number, q: any) => sum + (Number(q.marks) || 1), 0);
  }

  const updated = OrbitDB.updateExam(req.params.id, updates);
  res.json({ exam: updated });
});

router.delete('/exams/:id', authenticate, requireAdmin, (req: AuthRequest, res) => {
  const success = OrbitDB.deleteExam(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Examination not found.' });
  }
  res.json({ message: 'Examination deleted successfully.' });
});

router.post('/admin/exams/sample', authenticate, requireAdmin, (req: AuthRequest, res) => {
  const creatorName = req.user?.name || 'Administrator';
  const newExam = OrbitDB.seedSampleExam(creatorName);
  res.status(201).json({
    message: 'Sample assessment created successfully.',
    exam: newExam,
  });
});

router.post('/admin/exams/clear-all', authenticate, requireAdmin, (_req: AuthRequest, res) => {
  const count = OrbitDB.getExams().length;
  while (OrbitDB.getExams().length > 0) {
    OrbitDB.getExams().pop();
  }
  res.json({ message: `All ${count} examinations cleared.` });
});

// ---------------- EXAM ATTEMPT & TAKING SYSTEM ----------------

router.post('/exams/:id/start', authenticate, requireStudent, (req: AuthRequest, res) => {
  const exam = OrbitDB.findExamById(req.params.id);
  if (!exam) {
    return res.status(404).json({ error: 'Examination not found.' });
  }

  if (!exam.isPublished) {
    return res.status(400).json({ error: 'This examination is not yet published.' });
  }

  const { available } = isExamAvailable(exam.startDate, exam.endDate);
  if (!available) {
    return res.status(400).json({ error: 'Examination is outside its scheduled availability window.' });
  }

  // Check existing attempt
  const existingAttempt = OrbitDB.findAnyAttempt(req.user!.id, exam.id);
  if (existingAttempt) {
    if (existingAttempt.status === 'submitted' || existingAttempt.status === 'expired') {
      const existingResult = OrbitDB.findResultByAttempt(existingAttempt.id);
      return res.status(400).json({
        error: 'You have already submitted this examination.',
        alreadySubmitted: true,
        resultId: existingResult?.id,
      });
    }

    // Attempt is in progress, resume!
    const now = Date.now();
    const expiresAtMs = new Date(existingAttempt.expiresAt).getTime();
    const remainingSeconds = Math.max(0, Math.floor((expiresAtMs - now) / 1000));

    if (remainingSeconds <= 0) {
      // Auto-submit expired attempt
      existingAttempt.status = 'expired';
      OrbitDB.updateAttempt(existingAttempt.id, { status: 'expired' });
      return res.status(400).json({ error: 'Time has expired for this attempt.' });
    }

    const safeQuestions = exam.questions.map((q) => {
      const { correctAnswerIndex, explanation, ...rest } = q;
      return rest;
    });

    return res.json({
      attemptId: existingAttempt.id,
      exam: {
        id: exam.id,
        title: exam.title,
        subject: exam.subject,
        durationMinutes: exam.durationMinutes,
        totalMarks: exam.totalMarks,
        negativeMarking: exam.negativeMarking,
      },
      questions: safeQuestions,
      savedAnswers: existingAttempt.answers,
      remainingSeconds,
    });
  }

  // Create brand new attempt
  const startTime = new Date();
  const expiresAt = new Date(startTime.getTime() + exam.durationMinutes * 60 * 1000);

  const newAttempt: ExamAttempt = {
    id: `att_${Date.now()}`,
    examId: exam.id,
    studentId: req.user!.id,
    studentName: req.user!.name,
    startTime: startTime.toISOString(),
    expiresAt: expiresAt.toISOString(),
    answers: {},
    status: 'in_progress',
  };

  OrbitDB.createAttempt(newAttempt);

  const safeQuestions = exam.questions.map((q) => {
    const { correctAnswerIndex, explanation, ...rest } = q;
    return rest;
  });

  res.json({
    attemptId: newAttempt.id,
    exam: {
      id: exam.id,
      title: exam.title,
      subject: exam.subject,
      durationMinutes: exam.durationMinutes,
      totalMarks: exam.totalMarks,
      negativeMarking: exam.negativeMarking,
    },
    questions: safeQuestions,
    savedAnswers: {},
    remainingSeconds: exam.durationMinutes * 60,
  });
});

router.get('/attempts/:id', authenticate, requireStudent, (req: AuthRequest, res) => {
  const attempt = OrbitDB.findAttemptById(req.params.id);
  if (!attempt) {
    return res.status(404).json({ error: 'Attempt not found.' });
  }

  if (attempt.studentId !== req.user!.id) {
    return res.status(403).json({ error: 'Unauthorized to access this attempt.' });
  }

  const exam = OrbitDB.findExamById(attempt.examId);
  if (!exam) {
    return res.status(404).json({ error: 'Associated examination not found.' });
  }

  const now = Date.now();
  const expiresAtMs = new Date(attempt.expiresAt).getTime();
  const remainingSeconds = Math.max(0, Math.floor((expiresAtMs - now) / 1000));

  const safeQuestions = exam.questions.map((q) => {
    const { correctAnswerIndex, explanation, ...rest } = q;
    return rest;
  });

  res.json({
    attemptId: attempt.id,
    exam: {
      id: exam.id,
      title: exam.title,
      subject: exam.subject,
      durationMinutes: exam.durationMinutes,
      totalMarks: exam.totalMarks,
      negativeMarking: exam.negativeMarking,
    },
    questions: safeQuestions,
    savedAnswers: attempt.answers,
    remainingSeconds,
    status: attempt.status,
  });
});

router.put('/attempts/:id/answers', authenticate, requireStudent, (req: AuthRequest, res) => {
  const attempt = OrbitDB.findAttemptById(req.params.id);
  if (!attempt) {
    return res.status(404).json({ error: 'Attempt not found.' });
  }

  if (attempt.studentId !== req.user!.id) {
    return res.status(403).json({ error: 'Unauthorized.' });
  }

  if (attempt.status !== 'in_progress') {
    return res.status(400).json({ error: 'Cannot update answers for an inactive or submitted attempt.' });
  }

  const { answers } = req.body;
  if (!answers || typeof answers !== 'object') {
    return res.status(400).json({ error: 'Invalid answers payload.' });
  }

  OrbitDB.updateAttempt(attempt.id, { answers });
  res.json({ success: true, savedAnswers: answers });
});

router.post('/attempts/:id/submit', authenticate, requireStudent, (req: AuthRequest, res) => {
  const attempt = OrbitDB.findAttemptById(req.params.id);
  if (!attempt) {
    return res.status(404).json({ error: 'Attempt not found.' });
  }

  if (attempt.studentId !== req.user!.id) {
    return res.status(403).json({ error: 'Unauthorized.' });
  }

  if (attempt.status === 'submitted') {
    const existingResult = OrbitDB.findResultByAttempt(attempt.id);
    return res.json({ resultId: existingResult?.id, message: 'Attempt was already submitted.' });
  }

  const exam = OrbitDB.findExamById(attempt.examId);
  if (!exam) {
    return res.status(404).json({ error: 'Exam not found.' });
  }

  // Accept optional final answers submitted in body
  const finalAnswers = req.body.answers || attempt.answers || {};

  // Grade exam securely on server!
  const scoring = calculateExamScore(finalAnswers, exam.questions, exam.passingMarks, exam.negativeMarking);

  const now = new Date();
  const startTime = new Date(attempt.startTime);
  const timeSpentSeconds = Math.max(10, Math.floor((now.getTime() - startTime.getTime()) / 1000));

  // Build question breakdown with explanation
  const questionBreakdown = exam.questions.map((q) => {
    const studentChoice = finalAnswers[q.id];
    const isAttempted = studentChoice !== undefined && studentChoice !== null && studentChoice >= 0;
    const isCorrect = isAttempted && studentChoice === q.correctAnswerIndex;
    let marksAwarded = 0;
    if (isCorrect) {
      marksAwarded = q.marks;
    } else if (isAttempted && exam.negativeMarking && q.negativeMarks) {
      marksAwarded = -q.negativeMarks;
    }

    return {
      questionId: q.id,
      questionText: q.text,
      options: q.options,
      studentAnswer: isAttempted ? studentChoice : undefined,
      correctAnswer: q.correctAnswerIndex,
      isCorrect,
      marksAwarded,
      explanation: q.explanation || '',
    };
  });

  const result: ExamResult = {
    id: `res_${Date.now()}`,
    attemptId: attempt.id,
    examId: exam.id,
    examTitle: exam.title,
    subject: exam.subject,
    studentId: req.user!.id,
    studentName: req.user!.name,
    studentCodeId: req.user!.codeId,
    totalMarks: exam.totalMarks,
    marksObtained: scoring.marksObtained,
    percentage: scoring.percentage,
    passed: scoring.passed,
    correctCount: scoring.correctCount,
    incorrectCount: scoring.incorrectCount,
    unattemptedCount: scoring.unattemptedCount,
    timeSpentSeconds,
    submittedAt: now.toISOString(),
    isPublished: true,
    questionBreakdown,
  };

  OrbitDB.createResult(result);
  OrbitDB.updateAttempt(attempt.id, {
    answers: finalAnswers,
    status: 'submitted',
    submittedAt: now.toISOString(),
  });

  res.json({
    success: true,
    resultId: result.id,
    summary: {
      marksObtained: result.marksObtained,
      totalMarks: result.totalMarks,
      percentage: result.percentage,
      passed: result.passed,
    },
  });
});

// ---------------- RESULTS ROUTES ----------------

router.get('/results/my-results', authenticate, requireStudent, (req: AuthRequest, res) => {
  const results = OrbitDB.findResultsByStudent(req.user!.id);
  // Sort descending by submission date
  results.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

  // Return list summary
  const mapped = results.map((r) => ({
    id: r.id,
    examId: r.examId,
    examTitle: r.examTitle,
    subject: r.subject,
    marksObtained: r.marksObtained,
    totalMarks: r.totalMarks,
    percentage: r.percentage,
    passed: r.passed,
    submittedAt: r.submittedAt,
    timeSpentSeconds: r.timeSpentSeconds,
  }));

  res.json({ results: mapped });
});

router.get('/results/:id', authenticate, (req: AuthRequest, res) => {
  const result = OrbitDB.findResultById(req.params.id);
  if (!result) {
    return res.status(404).json({ error: 'Result not found.' });
  }

  // Authorization check: only owner or admin can view
  if (req.user!.role !== 'admin' && result.studentId !== req.user!.id) {
    return res.status(403).json({ error: 'You are not authorized to view this result.' });
  }

  res.json({ result });
});

// ---------------- ADMIN ROUTES ----------------

router.get('/admin/stats', authenticate, requireAdmin, (_req, res) => {
  const students = OrbitDB.getUsers().filter((u) => u.role === 'student');
  const exams = OrbitDB.getExams();
  const results = OrbitDB.getResults();

  const totalStudents = students.length;
  const totalExams = exams.length;
  const totalResults = results.length;

  const passedCount = results.filter((r) => r.passed).length;
  const avgPassRate = totalResults > 0 ? Math.round((passedCount / totalResults) * 100) : 0;

  const avgScore =
    totalResults > 0
      ? Math.round((results.reduce((acc, r) => acc + r.percentage, 0) / totalResults) * 10) / 10
      : 0;

  res.json({
    stats: {
      totalStudents,
      totalExams,
      totalResults,
      avgPassRate,
      avgScore,
    },
  });
});

router.get('/admin/results', authenticate, requireAdmin, (req, res) => {
  const { examId, studentId } = req.query;
  let results = OrbitDB.getResults();

  if (examId && typeof examId === 'string') {
    results = results.filter((r) => r.examId === examId);
  }
  if (studentId && typeof studentId === 'string') {
    results = results.filter((r) => r.studentId === studentId);
  }

  results.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  res.json({ results });
});

router.get('/admin/students', authenticate, requireAdmin, (_req, res) => {
  const students = OrbitDB.getUsers().filter((u) => u.role === 'student');
  const results = OrbitDB.getResults();

  const mapped = students.map((s) => {
    const studentResults = results.filter((r) => r.studentId === s.id);
    const avgScore =
      studentResults.length > 0
        ? Math.round((studentResults.reduce((sum, r) => sum + r.percentage, 0) / studentResults.length) * 10) / 10
        : 0;

    return {
      id: s.id,
      name: s.name,
      email: s.email,
      codeId: s.codeId,
      department: s.department || 'Computer Science',
      year: s.year || '3rd Year',
      division: s.division || 'A',
      status: s.status,
      createdAt: s.createdAt,
      examsCompleted: studentResults.length,
      averageScore: avgScore,
    };
  });

  res.json({ students: mapped });
});

router.put('/admin/students/:id/status', authenticate, requireAdmin, (req, res) => {
  const { status } = req.body;
  if (status !== 'active' && status !== 'inactive') {
    return res.status(400).json({ error: 'Status must be active or inactive' });
  }

  const updated = OrbitDB.updateUser(req.params.id, { status });
  if (!updated) {
    return res.status(404).json({ error: 'Student not found.' });
  }

  res.json({ student: sanitizeUser(updated) });
});

router.get('/admin/question-bank', authenticate, requireAdmin, (_req, res) => {
  res.json({ questions: OrbitDB.getQuestionBank() });
});

router.post('/admin/question-bank', authenticate, requireAdmin, (req, res) => {
  const { subject, topic, text, options, correctAnswerIndex, marks, negativeMarks, explanation } = req.body;
  if (!subject || !text || !options || options.length < 2) {
    return res.status(400).json({ error: 'Subject, question text, and at least 2 options are required.' });
  }

  const newQ: Question = {
    id: `qb_${Date.now()}`,
    subject,
    topic: topic || '',
    text,
    options,
    correctAnswerIndex: Number(correctAnswerIndex || 0),
    marks: Number(marks || 2),
    negativeMarks: Number(negativeMarks || 0.5),
    explanation: explanation || '',
  };

  OrbitDB.addQuestionToBank(newQ);
  res.status(201).json({ question: newQ });
});

router.delete('/admin/question-bank/:id', authenticate, requireAdmin, (req, res) => {
  const success = OrbitDB.deleteQuestionFromBank(req.params.id);
  if (!success) {
    return res.status(404).json({ error: 'Question not found' });
  }
  res.json({ message: 'Question removed from question bank' });
});

export default router;
