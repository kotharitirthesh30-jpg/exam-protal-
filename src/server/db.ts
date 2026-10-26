import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  name: string;
  email: string;
  codeId: string; // Student ID e.g. STU-2024-001 or Admin ID e.g. ADM-1001
  passwordHash: string;
  role: 'student' | 'admin';
  department?: string;
  year?: string;
  division?: string;
  title?: string; // e.g. "Exam Controller"
  status: 'active' | 'inactive';
  avatarUrl?: string;
  authProvider?: 'password' | 'google';
  createdAt: string;
}

export interface Question {
  id: string;
  examId?: string; // Optional if in general question bank
  subject: string;
  topic?: string;
  text: string;
  options: string[];
  correctAnswerIndex: number; // 0-based
  marks: number;
  negativeMarks?: number;
  explanation: string;
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
  startDate: string; // ISO string
  endDate: string; // ISO string
  isPublished: boolean;
  negativeMarking: boolean;
  questions: Question[];
  createdBy: string;
  createdAt: string;
}

export interface ExamAttempt {
  id: string;
  examId: string;
  studentId: string;
  studentName: string;
  startTime: string; // ISO string
  expiresAt: string; // ISO string calculated by server
  answers: { [questionId: string]: number };
  status: 'in_progress' | 'submitted' | 'expired';
  submittedAt?: string;
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
  questionBreakdown: {
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

interface DatabaseSchema {
  users: User[];
  exams: Exam[];
  questionBank: Question[];
  attempts: ExamAttempt[];
  results: ExamResult[];
}

const DATA_DIR = path.resolve(process.cwd(), '.data');
const DB_FILE = path.resolve(DATA_DIR, 'orbit_db.json');

// Ensure directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let db: DatabaseSchema = {
  users: [],
  exams: [],
  questionBank: [],
  attempts: [],
  results: [],
};

// Seed initial data
export function initializeDatabase() {
  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      db = JSON.parse(content);
      const FAKE_EXAM_IDS = ['exam_cn_quiz2', 'exam_ds_unit3', 'exam_os_midsem', 'exam_dbms_final'];
      const FAKE_STUDENT_IDS = ['usr_student_1', 'usr_student_2', 'usr_student_3', 'usr_student_4'];

      // Ensure fake seed results or attempts are completely purged
      if (db.results) {
        db.results = db.results.filter(
          (r) => r.id !== 'res_seed_1' && !FAKE_EXAM_IDS.includes(r.examId)
        );
      }
      if (db.attempts) {
        db.attempts = db.attempts.filter(
          (a) => a.id !== 'att_seed_1' && !FAKE_EXAM_IDS.includes(a.examId)
        );
      }
      // Ensure fake exams and fake students are completely purged
      if (db.exams) {
        db.exams = db.exams.filter((e) => !FAKE_EXAM_IDS.includes(e.id));
      }
      if (db.users) {
        db.users = db.users.filter((u) => !FAKE_STUDENT_IDS.includes(u.id));
      }

      // Verify we have seed users
      if (db.users && db.users.length > 0) {
        // Guarantee kotharitirthesh30@gmail.com is present as admin
        const hasTirthesh = db.users.some(
          (u) => u.email.toLowerCase() === 'kotharitirthesh30@gmail.com'
        );
        if (!hasTirthesh) {
          const salt = bcrypt.genSaltSync(10);
          db.users.push({
            id: 'usr_admin_kothari',
            name: 'Tirthesh Kothari',
            email: 'kotharitirthesh30@gmail.com',
            codeId: 'ADM-KOTHARI',
            passwordHash: bcrypt.hashSync('admin123', salt),
            role: 'admin',
            title: 'Chief Administrator & Controller',
            department: 'Academic Affairs & Examination Board',
            status: 'active',
            authProvider: 'google',
            createdAt: new Date().toISOString(),
          });
        }
        saveDatabase();
        return;
      }
    } catch {
      // Re-seed if corrupted
    }
  }

  const salt = bcrypt.genSaltSync(10);
  const studentPasswordHash = bcrypt.hashSync('student123', salt);
  const adminPasswordHash = bcrypt.hashSync('admin123', salt);

  const initialUsers: User[] = [
    {
      id: 'usr_admin_kothari',
      name: 'Tirthesh Kothari',
      email: 'kotharitirthesh30@gmail.com',
      codeId: 'ADM-KOTHARI',
      passwordHash: adminPasswordHash,
      role: 'admin',
      title: 'Chief Administrator & Controller',
      department: 'Academic Affairs & Examination Board',
      status: 'active',
      authProvider: 'google',
      createdAt: new Date('2026-01-01T00:00:00Z').toISOString(),
    },
    {
      id: 'usr_admin_1',
      name: 'Dr. Priya Nair',
      email: 'admin@orbit.edu',
      codeId: 'ADM-1001',
      passwordHash: adminPasswordHash,
      role: 'admin',
      title: 'Exam Controller',
      department: 'Academic Affairs',
      status: 'active',
      createdAt: new Date('2026-01-10T08:00:00Z').toISOString(),
    },
    {
      id: 'usr_student_1',
      name: 'Aarav Mehta',
      email: 'aarav@student.orbit.edu',
      codeId: 'STU-2024-001',
      passwordHash: studentPasswordHash,
      role: 'student',
      department: 'B.Tech CSE',
      year: '3rd Year',
      division: 'Division B',
      status: 'active',
      createdAt: new Date('2026-02-01T09:00:00Z').toISOString(),
    },
    {
      id: 'usr_student_2',
      name: 'Sneha Patel',
      email: 'sneha@student.orbit.edu',
      codeId: 'STU-2024-002',
      passwordHash: studentPasswordHash,
      role: 'student',
      department: 'B.Tech CSE',
      year: '3rd Year',
      division: 'Division A',
      status: 'active',
      createdAt: new Date('2026-02-05T10:00:00Z').toISOString(),
    },
    {
      id: 'usr_student_3',
      name: 'Rohan Verma',
      email: 'rohan@student.orbit.edu',
      codeId: 'STU-2024-003',
      passwordHash: studentPasswordHash,
      role: 'student',
      department: 'B.Tech IT',
      year: '3rd Year',
      division: 'Division C',
      status: 'active',
      createdAt: new Date('2026-02-10T11:00:00Z').toISOString(),
    },
    {
      id: 'usr_student_4',
      name: 'Ananya Sharma',
      email: 'ananya@student.orbit.edu',
      codeId: 'STU-2024-004',
      passwordHash: studentPasswordHash,
      role: 'student',
      department: 'B.Tech AI & Data Science',
      year: '2nd Year',
      division: 'Division A',
      status: 'active',
      createdAt: new Date('2026-03-01T10:00:00Z').toISOString(),
    },
  ];

  // Question bank for Computer Networks, Data Structures, Operating Systems
  const cnQuestions: Question[] = [
    {
      id: 'q_cn_1',
      subject: 'Computer Networks',
      topic: 'Physical Layer',
      text: 'Which topology requires a multipoint connection where all nodes share a single communication line?',
      options: ['Star Topology', 'Mesh Topology', 'Bus Topology', 'Ring Topology'],
      correctAnswerIndex: 2,
      marks: 2,
      negativeMarks: 0.5,
      explanation: 'In Bus Topology, all devices are connected along a single backbone cable acting as a multipoint connection.',
    },
    {
      id: 'q_cn_2',
      subject: 'Computer Networks',
      topic: 'Data Link Layer',
      text: 'What is the primary role of the Address Resolution Protocol (ARP)?',
      options: [
        'Map 32-bit IPv4 address to 48-bit MAC address',
        'Map domain names to IP addresses',
        'Provide secure encryption across networks',
        'Route packets between different subnets',
      ],
      correctAnswerIndex: 0,
      marks: 2,
      negativeMarks: 0.5,
      explanation: 'ARP resolves logical network layer IP addresses to physical data link layer MAC addresses.',
    },
    {
      id: 'q_cn_3',
      subject: 'Computer Networks',
      topic: 'Network Layer',
      text: 'Which class of IPv4 address provides a default subnet mask of 255.255.0.0?',
      options: ['Class A', 'Class B', 'Class C', 'Class D'],
      correctAnswerIndex: 1,
      marks: 2,
      negativeMarks: 0.5,
      explanation: 'Class B addresses have a 16-bit network prefix (/16), yielding a default subnet mask of 255.255.0.0.',
    },
    {
      id: 'q_cn_4',
      subject: 'Computer Networks',
      topic: 'Transport Layer',
      text: 'What mechanism does TCP utilize to establish a reliable end-to-end full duplex connection?',
      options: [
        'Four-way Handshake',
        'Three-way Handshake (SYN, SYN-ACK, ACK)',
        'Carrier Sense Multiple Access (CSMA/CD)',
        'Sliding Window Piggybacking',
      ],
      correctAnswerIndex: 1,
      marks: 2,
      negativeMarks: 0.5,
      explanation: 'TCP sets up connection state via a three-way handshake: SYN from client, SYN-ACK from server, ACK from client.',
    },
    {
      id: 'q_cn_5',
      subject: 'Computer Networks',
      topic: 'OSI Reference Model',
      text: 'Which layer of the OSI model handles logical addressing and routing?',
      options: ['Data Link', 'Network', 'Transport', 'Session'],
      correctAnswerIndex: 1,
      marks: 2,
      negativeMarks: 0.5,
      explanation: 'The Network Layer (Layer 3) is responsible for packet forwarding, routing, and IP addressing.',
    },
    {
      id: 'q_cn_6',
      subject: 'Computer Networks',
      topic: 'Transport Layer',
      text: 'Which of the following protocols is connectionless and does not guarantee packet delivery order?',
      options: ['TCP', 'UDP', 'SCTP', 'BGP'],
      correctAnswerIndex: 1,
      marks: 2,
      negativeMarks: 0.5,
      explanation: 'UDP (User Datagram Protocol) is a lightweight, connectionless protocol without acknowledgments or retransmissions.',
    },
    {
      id: 'q_cn_7',
      subject: 'Computer Networks',
      topic: 'Application Layer',
      text: 'What is the default port number used for secure HTTPS web traffic?',
      options: ['Port 80', 'Port 21', 'Port 443', 'Port 8080'],
      correctAnswerIndex: 2,
      marks: 2,
      negativeMarks: 0.5,
      explanation: 'HTTPS operates over TLS/SSL using standardized TCP port 443.',
    },
    {
      id: 'q_cn_8',
      subject: 'Computer Networks',
      topic: 'Network Security',
      text: 'Which protocol is standardly used by email clients to retrieve messages from a mail server while keeping them synchronized across devices?',
      options: ['SMTP', 'IMAP', 'POP3', 'SNMP'],
      correctAnswerIndex: 1,
      marks: 2,
      negativeMarks: 0.5,
      explanation: 'IMAP (Internet Message Access Protocol) stores emails on the server and synchronizes changes across all devices.',
    },
    {
      id: 'q_cn_9',
      subject: 'Computer Networks',
      topic: 'Transport Layer',
      text: 'What is the purpose of the Congestion Window (cwnd) in TCP?',
      options: [
        'To prevent the receiver buffer from overflowing',
        'To limit the amount of data injected into the network to avoid congestion',
        'To encrypt payload data against man-in-the-middle attacks',
        'To calculate checksum values for transmission errors',
      ],
      correctAnswerIndex: 1,
      marks: 2,
      negativeMarks: 0.5,
      explanation: 'While the receiver advertised window (rwnd) prevents buffer overflow at the receiver, cwnd prevents network congestion.',
    },
    {
      id: 'q_cn_10',
      subject: 'Computer Networks',
      topic: 'Routing Protocols',
      text: 'Which routing protocol uses Dijkstra algorithm to compute the shortest path tree across link states?',
      options: ['RIP', 'BGP', 'OSPF', 'EGP'],
      correctAnswerIndex: 2,
      marks: 2,
      negativeMarks: 0.5,
      explanation: 'OSPF (Open Shortest Path First) is a link-state routing protocol that utilizes Dijkstra shortest-path-first algorithm.',
    },
  ];

  const dsQuestions: Question[] = [
    {
      id: 'q_ds_1',
      subject: 'Data Structures',
      topic: 'Binary Search Tree',
      text: 'What is the average time complexity of searching an element in a balanced Binary Search Tree (BST)?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
      correctAnswerIndex: 1,
      marks: 2.5,
      negativeMarks: 0.5,
      explanation: 'In a balanced BST like AVL or Red-Black tree, the height is logarithmic, giving O(log n) search time.',
    },
    {
      id: 'q_ds_2',
      subject: 'Data Structures',
      topic: 'Graph Algorithms',
      text: 'Which graph traversal algorithm uses a FIFO Queue data structure?',
      options: ['Depth First Search (DFS)', 'Breadth First Search (BFS)', 'Dijkstra Algorithm', 'Topological Sort'],
      correctAnswerIndex: 1,
      marks: 2.5,
      negativeMarks: 0.5,
      explanation: 'BFS explores neighbor nodes level by level using a First-In-First-Out (FIFO) queue.',
    },
    {
      id: 'q_ds_3',
      subject: 'Data Structures',
      topic: 'Hashing',
      text: 'What is the worst-case lookup time in a hash table when severe collisions occur and separate chaining is used without treeification?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n^2)'],
      correctAnswerIndex: 2,
      marks: 2.5,
      negativeMarks: 0.5,
      explanation: 'When all keys hash to the same bucket, the linked chain has length n, resulting in O(n) search time.',
    },
    {
      id: 'q_ds_4',
      subject: 'Data Structures',
      topic: 'Heaps',
      text: 'In a Min-Heap with N elements, where is the smallest element always located?',
      options: ['At the deepest leaf node', 'At the root node', 'In the left subtree', 'At random position'],
      correctAnswerIndex: 1,
      marks: 2.5,
      negativeMarks: 0.5,
      explanation: 'In any Min-Heap, every parent is smaller than or equal to its children, meaning the minimum element is at the root.',
    },
  ];

  const osQuestions: Question[] = [
    {
      id: 'q_os_1',
      subject: 'Operating Systems',
      topic: 'Process Scheduling',
      text: 'Which scheduling algorithm is non-preemptive and selects the process with the smallest execution burst time?',
      options: ['Round Robin (RR)', 'Shortest Job First (SJF)', 'Priority Scheduling', 'Multilevel Feedback Queue'],
      correctAnswerIndex: 1,
      marks: 3,
      negativeMarks: 1,
      explanation: 'Non-preemptive Shortest Job First schedules the process with the shortest CPU burst next and runs it to completion.',
    },
    {
      id: 'q_os_2',
      subject: 'Operating Systems',
      topic: 'Deadlocks',
      text: 'Which of the following is NOT one of Coffman four necessary conditions for deadlock?',
      options: ['Mutual Exclusion', 'Hold and Wait', 'Preemption Allowed', 'Circular Wait'],
      correctAnswerIndex: 2,
      marks: 3,
      negativeMarks: 1,
      explanation: 'The Coffman condition is "No Preemption". If preemption is allowed, deadlock cannot occur.',
    },
    {
      id: 'q_os_3',
      subject: 'Operating Systems',
      topic: 'Virtual Memory',
      text: 'What phenomenon occurs when a page replacement algorithm causes more page faults as the number of allocated physical frames increases?',
      options: ['Thrashing', 'Belady Anomaly', 'Aging', 'Starvation'],
      correctAnswerIndex: 1,
      marks: 3,
      negativeMarks: 1,
      explanation: 'Belady Anomaly can occur in FIFO page replacement where increasing memory frames increases page faults.',
    },
  ];

  const dbmsQuestions: Question[] = [
    {
      id: 'q_db_1',
      subject: 'Database Systems',
      topic: 'Normalization',
      text: 'A relation is in Boyce-Codd Normal Form (BCNF) if and only if for every functional dependency X -> Y:',
      options: [
        'X is a superkey',
        'Y is a prime attribute',
        'There are no transitive dependencies',
        'X is part of a candidate key',
      ],
      correctAnswerIndex: 0,
      marks: 2,
      negativeMarks: 0.5,
      explanation: 'BCNF requires that every determinant X in non-trivial functional dependencies X -> Y must be a superkey.',
    },
    {
      id: 'q_db_2',
      subject: 'Database Systems',
      topic: 'ACID Properties',
      text: 'Which ACID property guarantees that concurrent execution of transactions leaves the database in the same state as if transactions were executed serially?',
      options: ['Atomicity', 'Consistency', 'Isolation', 'Durability'],
      correctAnswerIndex: 2,
      marks: 2,
      negativeMarks: 0.5,
      explanation: 'Isolation ensures that concurrent transactions execute independently without interfering with each other.',
    },
  ];

  const now = new Date();
  const pastDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const futureStartDate = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString();
  const futureEndDate = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString();
  const activeStartDate = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString();
  const activeEndDate = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString();

  const initialExams: Exam[] = [
    {
      id: 'exam_cn_quiz2',
      title: 'Computer Networks - Quiz 2',
      subject: 'Computer Networks',
      description: 'Comprehensive assessment on OSI Reference Model, Transport Layer (TCP/UDP), and IP Routing architectures.',
      instructions: [
        'Total duration is 20 minutes.',
        'Each question carries 2 marks.',
        'Negative marking of 0.5 marks applies for incorrect answers.',
        'You can flag questions and review them before submission.',
        'Do not refresh or close the tab while the exam is active.',
      ],
      durationMinutes: 20,
      totalMarks: 20,
      passingMarks: 10,
      startDate: activeStartDate,
      endDate: activeEndDate,
      isPublished: true,
      negativeMarking: true,
      questions: cnQuestions,
      createdBy: 'Dr. Priya Nair',
      createdAt: new Date('2026-10-15T09:00:00Z').toISOString(),
    },
    {
      id: 'exam_ds_unit3',
      title: 'Data Structures - Unit Test 3 — Trees & Graphs',
      subject: 'Data Structures',
      description: 'Test on Binary Search Trees, Balanced Trees, Graph Traversals, and Heap data structures.',
      instructions: [
        'Total duration is 30 minutes.',
        'Each question carries 2.5 marks.',
        'Passing marks required: 5 out of 10 marks.',
        'Review your answers thoroughly in the question palette before clicking submit.',
      ],
      durationMinutes: 30,
      totalMarks: 10,
      passingMarks: 5,
      startDate: activeStartDate,
      endDate: activeEndDate,
      isPublished: true,
      negativeMarking: true,
      questions: dsQuestions,
      createdBy: 'Dr. Priya Nair',
      createdAt: new Date('2026-10-16T10:00:00Z').toISOString(),
    },
    {
      id: 'exam_os_midsem',
      title: 'Operating Systems - Mid Semester Exam',
      subject: 'Operating Systems',
      description: 'Midterm examination on CPU Scheduling, Deadlock prevention/avoidance, and Virtual Memory management.',
      instructions: [
        'Total duration is 45 minutes.',
        'Calculators and electronic aids are prohibited.',
        'Ensure a stable network connection before starting.',
      ],
      durationMinutes: 45,
      totalMarks: 9,
      passingMarks: 5,
      startDate: futureStartDate,
      endDate: futureEndDate,
      isPublished: true,
      negativeMarking: true,
      questions: osQuestions,
      createdBy: 'Dr. Priya Nair',
      createdAt: new Date('2026-10-18T11:00:00Z').toISOString(),
    },
    {
      id: 'exam_dbms_final',
      title: 'Database Management Systems - Relational Algebra & SQL',
      subject: 'Database Systems',
      description: 'Assessment covering Normalization (1NF, 2NF, 3NF, BCNF) and ACID transaction management.',
      instructions: [
        'Total duration is 15 minutes.',
        'All objective questions are mandatory.',
      ],
      durationMinutes: 15,
      totalMarks: 4,
      passingMarks: 2,
      startDate: pastDate,
      endDate: activeEndDate,
      isPublished: true,
      negativeMarking: true,
      questions: dbmsQuestions,
      createdBy: 'Dr. Priya Nair',
      createdAt: new Date('2026-10-01T09:00:00Z').toISOString(),
    },
  ];

  // Clean slate: 0 fake exams, 0 fake attempts, 0 fake results
  // Real exams are created by administrator, and real results are generated when students take exams.
  db = {
    users: initialUsers,
    exams: [],
    questionBank: [...cnQuestions, ...dsQuestions, ...osQuestions, ...dbmsQuestions],
    attempts: [],
    results: [],
  };

  saveDatabase();
}

export function saveDatabase() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save database file:', err);
  }
}

// Data Access Object
export const OrbitDB = {
  getUsers: () => db.users,
  findUserById: (id: string) => db.users.find((u) => u.id === id),
  findUserByCodeOrEmail: (identifier: string) => {
    const clean = identifier.trim().toLowerCase();
    return db.users.find(
      (u) => u.email.toLowerCase() === clean || u.codeId.toLowerCase() === clean
    );
  },
  createUser: (user: User) => {
    db.users.push(user);
    saveDatabase();
    return user;
  },
  updateUser: (id: string, updates: Partial<User>) => {
    const user = db.users.find((u) => u.id === id);
    if (!user) return null;
    Object.assign(user, updates);
    saveDatabase();
    return user;
  },

  getExams: () => db.exams,
  findExamById: (id: string) => db.exams.find((e) => e.id === id),
  createExam: (exam: Exam) => {
    db.exams.push(exam);
    saveDatabase();
    return exam;
  },
  updateExam: (id: string, updates: Partial<Exam>) => {
    const exam = db.exams.find((e) => e.id === id);
    if (!exam) return null;
    Object.assign(exam, updates);
    saveDatabase();
    return exam;
  },
  deleteExam: (id: string) => {
    const index = db.exams.findIndex((e) => e.id === id);
    if (index === -1) return false;
    db.exams.splice(index, 1);
    saveDatabase();
    return true;
  },

  getQuestionBank: () => db.questionBank,
  addQuestionToBank: (q: Question) => {
    db.questionBank.push(q);
    saveDatabase();
    return q;
  },
  deleteQuestionFromBank: (id: string) => {
    const index = db.questionBank.findIndex((q) => q.id === id);
    if (index === -1) return false;
    db.questionBank.splice(index, 1);
    saveDatabase();
    return true;
  },

  getAttempts: () => db.attempts,
  findAttemptById: (id: string) => db.attempts.find((a) => a.id === id),
  findActiveAttempt: (studentId: string, examId: string) => {
    return db.attempts.find(
      (a) => a.studentId === studentId && a.examId === examId && a.status === 'in_progress'
    );
  },
  findAnyAttempt: (studentId: string, examId: string) => {
    return db.attempts.find((a) => a.studentId === studentId && a.examId === examId);
  },
  createAttempt: (attempt: ExamAttempt) => {
    db.attempts.push(attempt);
    saveDatabase();
    return attempt;
  },
  updateAttempt: (id: string, updates: Partial<ExamAttempt>) => {
    const attempt = db.attempts.find((a) => a.id === id);
    if (!attempt) return null;
    Object.assign(attempt, updates);
    saveDatabase();
    return attempt;
  },

  getResults: () => db.results,
  findResultById: (id: string) => db.results.find((r) => r.id === id),
  findResultByAttempt: (attemptId: string) => db.results.find((r) => r.attemptId === attemptId),
  findResultsByStudent: (studentId: string) => db.results.filter((r) => r.studentId === studentId),
  findResultsByExam: (examId: string) => db.results.filter((r) => r.examId === examId),
  createResult: (result: ExamResult) => {
    db.results.push(result);
    saveDatabase();
    return result;
  },
  seedSampleExam: (creatorName: string = 'Tirthesh Kothari') => {
    const sampleQuestions = db.questionBank.slice(0, 5);
    const sampleExam: Exam = {
      id: `exam_${Date.now()}`,
      title: 'Computer Networks & Systems Assessment',
      subject: 'Computer Science',
      description: 'Institutional examination covering network topology, transport protocols, and data structures.',
      instructions: [
        'Total duration is 30 minutes.',
        'Objective multi-choice format.',
        'Each question carries 2 marks.',
        'Passing marks required: 5 out of 10 marks.',
        'Full-screen monitoring and proctoring enabled.',
      ],
      durationMinutes: 30,
      totalMarks: 10,
      passingMarks: 5,
      startDate: new Date(Date.now() - 3600000).toISOString(),
      endDate: new Date(Date.now() + 86400000 * 14).toISOString(),
      isPublished: true,
      negativeMarking: true,
      questions: sampleQuestions,
      createdBy: creatorName,
      createdAt: new Date().toISOString(),
    };
    db.exams.push(sampleExam);
    saveDatabase();
    return sampleExam;
  },
};
