import { initializeApp, getApps, FirebaseApp, FirebaseError } from 'firebase/app';
import { 
  initializeAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  Auth,
  UserCredential,
  getAuth,
  setPersistence,
  inMemoryPersistence
} from 'firebase/auth';
import {
  getFirestore,
  Firestore
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';

// Verificăm dacă toate variabilele de mediu necesare sunt definite
const requiredEnvVars = [
  'EXPO_PUBLIC_FIREBASE_API_KEY',
  'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'EXPO_PUBLIC_FIREBASE_APP_ID',
  'EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID'
];

const missingEnvVars = requiredEnvVars.filter(
  varName => !process.env[varName]
);

if (missingEnvVars.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnvVars.join(', ')}`
  );
}

// Variabile pentru singleton-uri
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;

// Configurare Firebase
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Inițializare Firebase App
export function initializeFirebaseApp(): FirebaseApp {
  console.log('Inițializare Firebase App...');
  if (!app) {
    if (getApps().length === 0) {
      console.log('Creating new Firebase App instance');
      app = initializeApp(firebaseConfig);
    } else {
      console.log('Using existing Firebase App instance');
      app = getApps()[0];
    }
  }
  return app;
}

// Inițializare Firebase Auth
export function initializeFirebaseAuth(): Auth {
  console.log('Inițializare Firebase Auth...');
  if (!auth) {
    const app = initializeFirebaseApp();
    console.log('Got Firebase App instance, initializing Auth...');
    
    auth = initializeAuth(app);
    
    // Setăm persistența pentru React Native
    setPersistence(auth, inMemoryPersistence)
      .then(() => {
        console.log('Firebase Auth persistence set to inMemory');
      })
      .catch((error) => {
        console.error('Error setting persistence:', error);
      });
  }
  return auth;
}

// Inițializare Firestore
export function initializeFirestore(): Firestore {
  console.log('Inițializare Firestore...');
  if (!firestore) {
    const firebaseApp = initializeFirebaseApp();
    console.log('Got Firebase App instance, initializing Firestore');
    firestore = getFirestore(firebaseApp);
    console.log('Firestore initialized successfully');
  }
  return firestore;
}

// Getters
export function getFirebaseAuth(): Auth {
  if (!auth) {
    throw new Error('Firebase Auth not initialized');
  }
  return auth;
}

export function getFirebaseFirestore(): Firestore {
  if (!firestore) {
    throw new Error('Firestore not initialized');
  }
  return firestore;
}

// Tipuri pentru autentificare
export interface AuthError {
  name: string;
  code: string;
  message: string;
}

export interface AuthResponse<T> {
  data?: T;
  error?: AuthError;
  status: 'success' | 'error';
}

// Helper pentru traducerea erorilor Firebase
function getFirebaseErrorMessage(error: FirebaseError, t: TFunction): string {
  switch (error.code) {
    case 'auth/invalid-email':
      return t('auth.errors.invalidEmail');
    case 'auth/user-disabled':
      return t('auth.errors.userDisabled');
    case 'auth/user-not-found':
      return t('auth.errors.userNotFound');
    case 'auth/wrong-password':
      return t('auth.errors.wrongPassword');
    case 'auth/email-already-in-use':
      return t('auth.errors.emailInUse');
    case 'auth/weak-password':
      return t('auth.errors.weakPassword');
    case 'auth/operation-not-allowed':
      return t('auth.errors.operationNotAllowed');
    case 'auth/too-many-requests':
      return t('auth.errors.tooManyRequests');
    default:
      return t('auth.errors.unknownError');
  }
}

// Funcții pentru autentificare
export async function signInWithEmail(
  email: string,
  password: string,
  t: TFunction
): Promise<AuthResponse<UserCredential>> {
  try {
    const auth = getFirebaseAuth();
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return {
      data: userCredential,
      status: 'success'
    };
  } catch (error) {
    if (error instanceof FirebaseError) {
      return {
        error: {
          name: error.name,
          code: error.code,
          message: getFirebaseErrorMessage(error, t)
        },
        status: 'error'
      };
    }
    return {
      error: {
        name: 'UnknownError',
        code: 'unknown',
        message: t('auth.errors.generic')
      },
      status: 'error'
    };
  }
}

export async function signUpWithEmail(
  email: string,
  password: string,
  t: TFunction
): Promise<AuthResponse<UserCredential>> {
  try {
    const auth = getFirebaseAuth();
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return {
      data: userCredential,
      status: 'success'
    };
  } catch (error) {
    if (error instanceof FirebaseError) {
      return {
        error: {
          name: error.name,
          code: error.code,
          message: getFirebaseErrorMessage(error, t)
        },
        status: 'error'
      };
    }
    return {
      error: {
        name: 'UnknownError',
        code: 'unknown',
        message: t('auth.errors.generic')
      },
      status: 'error'
    };
  }
}

export async function signOut(): Promise<AuthResponse<void>> {
  try {
    const auth = getFirebaseAuth();
    await firebaseSignOut(auth);
    return { status: 'success' };
  } catch (error) {
    if (error instanceof FirebaseError) {
      return {
        error: {
          name: error.name,
          code: error.code,
          message: error.message
        },
        status: 'error'
      };
    }
    return {
      error: {
        name: 'UnknownError',
        code: 'unknown',
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      },
      status: 'error'
    };
  }
}
