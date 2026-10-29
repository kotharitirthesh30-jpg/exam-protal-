import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  getDocFromServer, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup 
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

export async function signInWithFirebaseGooglePopup() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.warn('Firebase Google Popup error:', error);
    throw error;
  }
}
