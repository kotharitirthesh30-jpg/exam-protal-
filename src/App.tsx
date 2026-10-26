import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';

// Pages
import { Home } from './pages/Home.tsx';
import { StudentLogin } from './pages/StudentLogin.tsx';
import { AdminLogin } from './pages/AdminLogin.tsx';
import { Register } from './pages/Register.tsx';
import { StudentDashboard } from './pages/StudentDashboard.tsx';
import { Exams } from './pages/Exams.tsx';
import { ExaminationPage } from './pages/ExaminationPage.tsx';
import { StudentResults } from './pages/StudentResults.tsx';
import { ResultDetailPage } from './pages/ResultDetailPage.tsx';
import { Profile } from './pages/Profile.tsx';

// Admin Pages
import { AdminDashboard } from './pages/AdminDashboard.tsx';
import { AdminManageExams } from './pages/AdminManageExams.tsx';
import { AdminQuestionBank } from './pages/AdminQuestionBank.tsx';
import { AdminStudents } from './pages/AdminStudents.tsx';
import { AdminReports } from './pages/AdminReports.tsx';

// Layouts
import { StudentLayout } from './layouts/StudentLayout.tsx';
import { AdminLayout } from './layouts/AdminLayout.tsx';

// Protected Route Guard for Students
const StudentRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const hasToken = Boolean(localStorage.getItem('orbit_token'));

  if (loading || (hasToken && !user)) {
    return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/student/login" replace />;
  }
  if (user.role !== 'student') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <>{children}</>;
};

// Protected Route Guard for Administrators
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  const hasToken = Boolean(localStorage.getItem('orbit_token'));

  if (loading || (hasToken && !user)) {
    return (
      <div className="min-h-screen bg-[#070b14] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }
  if (user.role !== 'admin') {
    return <Navigate to="/student/dashboard" replace />;
  }
  return <>{children}</>;
};


export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Landing & Authentication */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<StudentLogin />} />
          <Route path="/student/login" element={<StudentLogin />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/register" element={<Register />} />

          {/* Student Portal Protected Routes */}
          <Route
            path="/student"
            element={
              <StudentRoute>
                <StudentLayout />
              </StudentRoute>
            }
          >
            <Route index element={<Navigate to="/student/dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="exams" element={<Exams />} />
            <Route path="results" element={<StudentResults />} />
            <Route path="results/:id" element={<ResultDetailPage />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Standalone Distraction-Free Examination Interface */}
          <Route
            path="/exam/:id"
            element={
              <StudentRoute>
                <ExaminationPage />
              </StudentRoute>
            }
          />

          {/* Administrator Portal Protected Routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="exams" element={<AdminManageExams />} />
            <Route path="questions" element={<AdminQuestionBank />} />
            <Route path="students" element={<AdminStudents />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
