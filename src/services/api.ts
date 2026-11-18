const API_BASE = '/api';

export interface User {
  id: string;
  name: string;
  email: string;
  codeId: string;
  role: 'student' | 'admin';
  department?: string;
  year?: string;
  division?: string;
  title?: string;
  status: 'active' | 'inactive';
  avatarUrl?: string;
  authProvider?: 'password' | 'google';
  createdAt: string;
}

export interface Question {
  id: string;
  subject: string;
  topic?: string;
  text: string;
  options: string[];
  correctAnswerIndex?: number;
  marks: number;
  negativeMarks?: number;
  explanation?: string;
}

export interface Exam {
  id: string;
  title: string;
  subject: string;
  description: string;
  instructions: string[];
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  startDate: string;
  endDate: string;
  isPublished: boolean;
  negativeMarking: boolean;
  questionCount?: number;
  questions?: Question[];
  available?: boolean;
  status?: 'upcoming' | 'live' | 'ended';
  studentAttemptStatus?: 'not_started' | 'in_progress' | 'completed';
  resultId?: string;
  createdBy?: string;
  createdAt?: string;
}

export interface ExamResult {
  id: string;
  attemptId: string;
  examId: string;
  examTitle: string;
  subject: string;
  studentId: string;
  studentName: string;
  studentCodeId: string;
  totalMarks: number;
  marksObtained: number;
  percentage: number;
  passed: boolean;
  correctCount: number;
  incorrectCount: number;
  unattemptedCount: number;
  timeSpentSeconds: number;
  submittedAt: string;
  isPublished: boolean;
  questionBreakdown?: {
    questionId: string;
    questionText: string;
    options: string[];
    studentAnswer?: number;
    correctAnswer: number;
    isCorrect: boolean;
    marksAwarded: number;
    explanation: string;
  }[];
}

export interface AdminStats {
  totalStudents: number;
  totalExams: number;
  totalResults: number;
  avgPassRate: number;
  avgScore: number;
}

export interface ProctorAlert {
  id: string;
  attemptId: string;
  examId: string;
  examTitle: string;
  studentId: string;
  studentName: string;
  studentCodeId: string;
  studentEmail?: string;
  type: 'tab_switch' | 'window_blur' | 'fullscreen_exit';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  violationCount: number;
  isRead: boolean;
  timestamp: string;
}

export function getAuthToken(): string | null {
  const tabToken = sessionStorage.getItem('orbit_token');
  if (tabToken) return tabToken;

  const path = typeof window !== 'undefined' ? window.location.pathname : '';
  if (path.startsWith('/admin')) {
    return localStorage.getItem('orbit_token_admin') || localStorage.getItem('orbit_token');
  }
  if (path.startsWith('/student') || path.startsWith('/exam')) {
    return localStorage.getItem('orbit_token_student') || localStorage.getItem('orbit_token');
  }
  return localStorage.getItem('orbit_token');
}

export function setAuthToken(token: string | null, role?: 'student' | 'admin') {
  if (token) {
    sessionStorage.setItem('orbit_token', token);
    if (role) {
      localStorage.setItem(`orbit_token_${role}`, token);
    }
    localStorage.setItem('orbit_token', token);
  } else {
    const tabToken = sessionStorage.getItem('orbit_token');
    sessionStorage.removeItem('orbit_token');
    if (role) {
      localStorage.removeItem(`orbit_token_${role}`);
    }
    if (!role || localStorage.getItem('orbit_token') === tabToken) {
      localStorage.removeItem('orbit_token');
    }
  }
}

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `Request failed with status ${response.status}`);
  }

  return data;
}

export const api = {
  // Auth
  getDemoAccounts: () => fetchWithAuth('/auth/demo-accounts'),
  login: (credentials: { identifier: string; password: string; expectedRole?: string }) =>
    fetchWithAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  loginWithGoogle: (googleData: {
    email: string;
    name: string;
    googleId?: string;
    avatarUrl?: string;
    expectedRole?: 'student' | 'admin';
  }) =>
    fetchWithAuth('/auth/google', {
      method: 'POST',
      body: JSON.stringify(googleData),
    }),
  registerAdmin: (adminData: {
    name: string;
    email: string;
    codeId: string;
    password: string;
    title?: string;
    department?: string;
  }) =>
    fetchWithAuth('/auth/admin/register', {
      method: 'POST',
      body: JSON.stringify(adminData),
    }),
  register: (studentData: any) =>
    fetchWithAuth('/auth/register', {
      method: 'POST',
      body: JSON.stringify(studentData),
    }),
  getMe: () => fetchWithAuth('/auth/me'),
  updateProfile: (profileData: any) =>
    fetchWithAuth('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),

  // Exams
  getExams: () => fetchWithAuth('/exams'),
  getExamById: (id: string) => fetchWithAuth(`/exams/${id}`),
  createExam: (examData: any) =>
    fetchWithAuth('/exams', {
      method: 'POST',
      body: JSON.stringify(examData),
    }),
  updateExam: (id: string, examData: any) =>
    fetchWithAuth(`/exams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(examData),
    }),
  deleteExam: (id: string) =>
    fetchWithAuth(`/exams/${id}`, {
      method: 'DELETE',
    }),
  createSampleExam: () =>
    fetchWithAuth('/admin/exams/sample', {
      method: 'POST',
    }),
  clearAllExams: () =>
    fetchWithAuth('/admin/exams/clear-all', {
      method: 'POST',
    }),

  // Attempts
  startExam: (examId: string) =>
    fetchWithAuth(`/exams/${examId}/start`, {
      method: 'POST',
    }),
  getAttempt: (attemptId: string) => fetchWithAuth(`/attempts/${attemptId}`),
  saveAnswers: (attemptId: string, answers: { [key: string]: number }) =>
    fetchWithAuth(`/attempts/${attemptId}/answers`, {
      method: 'PUT',
      body: JSON.stringify({ answers }),
    }),
  submitExam: (attemptId: string, answers?: { [key: string]: number }) =>
    fetchWithAuth(`/attempts/${attemptId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    }),

  // Results
  getMyResults: () => fetchWithAuth('/results/my-results'),
  getResultById: (id: string) => fetchWithAuth(`/results/${id}`),

  // Admin
  getAdminStats: () => fetchWithAuth('/admin/stats'),
  getAdminResults: (filter?: { examId?: string; studentId?: string }) => {
    const params = new URLSearchParams();
    if (filter?.examId) params.append('examId', filter.examId);
    if (filter?.studentId) params.append('studentId', filter.studentId);
    const query = params.toString() ? `?${params.toString()}` : '';
    return fetchWithAuth(`/admin/results${query}`);
  },
  getStudents: () => fetchWithAuth('/admin/students'),
  updateStudentStatus: (id: string, status: 'active' | 'inactive') =>
    fetchWithAuth(`/admin/students/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
  getQuestionBank: () => fetchWithAuth('/admin/question-bank'),
  addQuestionToBank: (question: any) =>
    fetchWithAuth('/admin/question-bank', {
      method: 'POST',
      body: JSON.stringify(question),
    }),
  deleteQuestionFromBank: (id: string) =>
    fetchWithAuth(`/admin/question-bank/${id}`, {
      method: 'DELETE',
    }),

  // Proctoring / Anti-Cheat Alerts
  reportProctorViolation: (payload: {
    attemptId?: string;
    examId: string;
    type: 'tab_switch' | 'window_blur' | 'fullscreen_exit';
    message?: string;
  }) =>
    fetchWithAuth('/proctor/violation', {
      method: 'POST',
      keepalive: true,
      body: JSON.stringify(payload),
    }),
  getAdminProctorAlerts: () =>
    fetchWithAuth('/admin/proctor-alerts') as Promise<{
      alerts: ProctorAlert[];
      unreadCount: number;
    }>,
  markProctorAlertRead: (id: string) =>
    fetchWithAuth(`/admin/proctor-alerts/${id}/read`, {
      method: 'PUT',
    }),
  markAllProctorAlertsRead: () =>
    fetchWithAuth('/admin/proctor-alerts/read-all', {
      method: 'PUT',
    }),
};
