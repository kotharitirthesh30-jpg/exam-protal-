# Exam-Pulse — Online Examination Portal

Exam-Pulse is a complete, modern, responsive, and secure full-stack online examination portal designed for higher education institutions, academies, and certification providers.

---

## 🌟 Key Features

### For Students
- **Dedicated Student Authentication**: Login with Student ID or email, self-registration with academic details.
- **Student Dashboard**: Live overview of upcoming exams, completed tests, average scores, and notifications.
- **Available Examinations**: Filter by All, Live Now, Upcoming, or Completed with real-time status badges.
- **Online Examination Interface**:
  - Distraction-free test environment with full-screen toggle.
  - Server-enforced synchronized countdown timer with visual urgency alerts (< 5m warning, < 1m critical).
  - Question navigation palette (1 to N grid with color-coded answered, unanswered, flagged, and current question states).
  - Multi-choice radio selection, option clearing, question flagging, and debounced auto-saving.
  - Confirmation modal on submit showing detailed answered/unanswered counts.
  - Auto-submission upon timer expiry.
  - Duplicate attempt prevention with single-attempt enforcement.
- **Detailed Result Reports**:
  - Instant objective grading with support for negative marking.
  - Question-by-question review showing student choice vs official answer key with academic explanations.
  - Print-ready scorecard.
- **Profile Settings**: Update name, department, academic year, division, and password.

### For Administrators
- **Administrative Access Control**: Separate admin sign-in with server-side role verification (`admin`).
- **Administrative Dashboard**: Real-time metrics on total students, examinations, completed attempts, and average pass rate.
- **Examination Management**:
  - Create examinations with custom duration, passing marks, negative marking, and availability windows.
  - Interactive multi-question builder with option configuration, correct answer key, and marks allocation.
  - Instant publish/draft toggle and secure deletion.
- **Question Bank**:
  - Categorized multi-subject question repository (Computer Networks, Data Structures, Operating Systems, Database Systems).
  - Add, search, and delete questions with full answer keys and explanations.
- **Student Candidate Management**:
  - Directory of registered students with exam attendance and average score tracking.
  - Instant Activate/Deactivate access controls with confirmation.
- **Results & Reporting**:
  - Filter results by examination and pass/fail status.
  - Real functioning **Export to CSV Roster** button generating RFC-compliant audit logs.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS, React Router, Lucide React icons, JetBrains Mono & Plus Jakarta Sans typography.
- **Backend**: Node.js, Express.js REST API, JSON Web Tokens (JWT), bcryptjs for password hashing.
- **Database & Persistence**: Built-in zero-config persistent JSON database storage (`.data/orbit_db.json`) with MongoDB compatibility for scalable production deployment.
- **Testing**: Node.js native test runner (`node:test`) for pure evaluation and scoring logic.

---

## 🚀 Getting Started

### 1. Installation
Clone the repository and install the dependencies:
```bash
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Default configuration:
```env
PORT=3000
JWT_SECRET="orbit-portal-jwt-secret-key-production-ready"
APP_URL="http://localhost:3000"
```

### 3. Running the Application
To run the full-stack server (Express API + Vite React frontend) concurrently:
```bash
npm run dev
```
Open `http://localhost:3000` in your web browser.

### 4. Running Logic & Scoring Tests
Run the deterministic scoring and timer evaluation tests:
```bash
npm test
```

---

## 👥 Default Demo Credentials

For quick evaluation and testing, the application comes seeded with pre-configured accounts and active examinations:

### 🎓 Student Account
- **Student ID**: `STU-2024-001`
- **Email**: `aarav@student.orbit.edu`
- **Password**: `student123`
- *Note: You can click the "⚡ Autofill Demo Student" button on the Student Login page to sign in with one click.*

### 🛡️ Administrator Account
- **Admin ID**: `ADM-1001`
- **Email**: `admin@orbit.edu`
- **Password**: `admin123`
- *Note: You can click the "⚡ Autofill Demo Admin" button on the Admin Login page to sign in with one click.*

---

## 🔒 Creating Additional Administrators Securely

To create an additional administrator, use the administrative database script or add a record directly through the backend server environment:
```typescript
import bcrypt from 'bcryptjs';
import { OrbitDB } from './src/server/db.ts';

const adminPassword = 'YourSecurePasswordHere';
const passwordHash = bcrypt.hashSync(adminPassword, 10);

OrbitDB.createUser({
  id: `usr_admin_${Date.now()}`,
  name: 'Prof. Alan Turing',
  email: 'controller@orbit.edu',
  codeId: 'ADM-1002',
  passwordHash,
  role: 'admin',
  title: 'Dean of Examinations',
  department: 'Academic Council',
  status: 'active',
  createdAt: new Date().toISOString(),
});
```

---

## 📡 REST API Reference

### Authentication
- `POST /api/auth/login` — Sign in as student or admin (supports ID or email)
- `POST /api/auth/register` — Student self-registration
- `GET /api/auth/me` — Retrieve current authenticated profile
- `GET /api/auth/demo-accounts` — Demo credentials helper

### Examinations
- `GET /api/exams` — List published exams (for students) or all exams (for admin)
- `GET /api/exams/:id` — Get exam details (strips answer keys for students)
- `POST /api/exams` — Create a new exam with questions (Admin only)
- `PUT /api/exams/:id` — Update exam parameters (Admin only)
- `DELETE /api/exams/:id` — Delete an exam (Admin only)

### Exam Taking & Attempts
- `POST /api/exams/:id/start` — Start a new attempt or resume an active session
- `GET /api/attempts/:id` — Retrieve remaining time and questions
- `PUT /api/attempts/:id/answers` — Save answers intermittently
- `POST /api/attempts/:id/submit` — Submit exam and trigger server-side automated grading

### Results & Reports
- `GET /api/results/my-results` — Student results transcript
- `GET /api/results/:id` — Full result review with answer keys and solution guides
- `GET /api/admin/stats` — High-level administrative dashboard statistics
- `GET /api/admin/results` — Student results roster with optional examId filter
- `GET /api/admin/students` — Student candidate directory with active/inactive status toggle
- `GET /api/admin/question-bank` — Subject-wise question bank
- `POST /api/admin/question-bank` — Add question to repository
