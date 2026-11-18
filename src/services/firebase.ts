import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDocFromServer,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  query,
  orderBy,
  limit,
  onSnapshot,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// CRITICAL: The app requires firebaseConfig.firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// MANDATORY INITIAL CONNECTION TEST PER SKILL SPEC
export async function testConnection(): Promise<boolean> {
  const path = 'test/connection';
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or waiting for network.');
    }
    return false;
  }
}

// Auto-run test connection on load
testConnection().catch(() => {});

// Firestore persistence helpers for User, Exam, and Exam Results
export async function persistUserToFirestore(userData: {
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
}) {
  const path = `users/${userData.id}`;
  try {
    const userRef = doc(db, 'users', userData.id);
    await setDoc(userRef, {
      ...userData,
      updatedAt: serverTimestamp(),
      syncedAt: new Date().toISOString(),
    }, { merge: true });

    // If admin, also sync to /admins collection for RBAC
    if (userData.role === 'admin' || userData.email.toLowerCase() === 'kotharitirthesh30@gmail.com') {
      const adminRef = doc(db, 'admins', userData.id);
      await setDoc(adminRef, {
        email: userData.email,
        role: 'admin',
        authorizedAt: new Date().toISOString(),
      }, { merge: true });
    }
  } catch (error) {
    console.warn('Firestore user persistence sync note:', error);
  }
}

export async function persistExamResultToFirestore(resultData: any) {
  if (!resultData?.id) return;
  const path = `exam_results/${resultData.id}`;
  try {
    const resRef = doc(db, 'exam_results', resultData.id);
    await setDoc(resRef, {
      ...resultData,
      persistedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    console.warn('Firestore result persistence sync note:', error);
  }
}

export async function persistProctorLogToFirestore(logData: {
  id: string;
  attemptId: string;
  examId: string;
  examTitle: string;
  studentId: string;
  studentName: string;
  studentCodeId: string;
  type: 'tab_switch' | 'window_blur' | 'fullscreen_exit';
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  violationCount: number;
  isRead: boolean;
  timestamp: string;
}) {
  if (!logData?.id || !auth.currentUser) return;
  const path = `proctor_logs/${logData.id}`;
  try {
    const logRef = doc(db, 'proctor_logs', logData.id);
    const payload = {
      id: String(logData.id).slice(0, 128),
      attemptId: String(logData.attemptId || '').slice(0, 128),
      examId: String(logData.examId || '').slice(0, 128),
      examTitle: String(logData.examTitle || '').slice(0, 200),
      studentId: String(logData.studentId || '').slice(0, 128),
      studentName: String(logData.studentName || '').slice(0, 120),
      studentCodeId: String(logData.studentCodeId || '').slice(0, 64),
      authUid: auth.currentUser.uid,
      type: logData.type,
      message: String(logData.message || '').slice(0, 500),
      severity: logData.severity,
      violationCount: Math.max(1, Math.min(1000, Number(logData.violationCount || 1))),
      isRead: Boolean(logData.isRead),
      timestamp: String(logData.timestamp || new Date().toISOString()).slice(0, 64),
      createdAt: serverTimestamp(),
    };
    await setDoc(logRef, payload);
  } catch (error) {
    console.warn(`Firestore proctor log sync note (${path}):`, error);
  }
}

export function subscribeToFirestoreProctorLogs(
  onAlerts: (alerts: any[]) => void
): () => void {
  let unsubscribeSnapshot: (() => void) | null = null;
  let cancelled = false;

  const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
    if (unsubscribeSnapshot) {
      unsubscribeSnapshot();
      unsubscribeSnapshot = null;
    }
    if (!firebaseUser || cancelled) return;

    try {
      const isBootstrapAdmin =
        firebaseUser.emailVerified &&
        firebaseUser.email?.toLowerCase() === 'kotharitirthesh30@gmail.com';
      let isFirestoreAdmin = isBootstrapAdmin;

      if (!isFirestoreAdmin) {
        const adminSnap = await getDoc(doc(db, 'admins', firebaseUser.uid));
        isFirestoreAdmin = adminSnap.exists();
      }

      if (!isFirestoreAdmin || cancelled) return;

      const pathForOnSnapshot = 'proctor_logs';
      const q = query(
        collection(db, pathForOnSnapshot),
        orderBy('timestamp', 'desc'),
        limit(50)
      );

      unsubscribeSnapshot = onSnapshot(
        q,
        (snapshot) => {
          const items = snapshot.docs.map((d) => ({
            ...d.data(),
            id: d.id,
          }));
          onAlerts(items);
        },
        (error) => {
          try {
            handleFirestoreError(error, OperationType.LIST, pathForOnSnapshot);
          } catch {
            // Logged structured error via handleFirestoreError; keep Admin UI resilient
          }
        }
      );
    } catch {
      // Ignore if current Firebase user is a student rather than Firestore admin
    }
  });

  return () => {
    cancelled = true;
    unsubscribeAuth();
    if (unsubscribeSnapshot) {
      unsubscribeSnapshot();
    }
  };
}

export async function markFirestoreProctorLogRead(id: string) {
  if (!id || !auth.currentUser) return;
  const path = `proctor_logs/${id}`;
  try {
    await updateDoc(doc(db, 'proctor_logs', id), { isRead: true });
  } catch (error) {
    console.warn(`Firestore proctor log update note (${path}):`, error);
  }
}

export async function markAllFirestoreProctorLogsRead(ids: string[]) {
  if (!ids.length || !auth.currentUser) return;
  try {
    const batch = writeBatch(db);
    ids.slice(0, 50).forEach((id) => {
      batch.update(doc(db, 'proctor_logs', id), { isRead: true });
    });
    await batch.commit();
  } catch (error) {
    console.warn('Firestore proctor logs batch update note:', error);
  }
}

export async function signInWithFirebaseGooglePopup() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.warn('Firebase Google Popup error:', error);
    throw error;
  }
}
