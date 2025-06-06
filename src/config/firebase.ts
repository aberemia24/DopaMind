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
import { getValidatedEnv } from './environment';
import { RateLimiter } from '../services/rateLimiter';
import { initializeAppCheck, ReCaptchaV3Provider, AppCheck } from 'firebase/app-check';
import { ERROR_TRANSLATIONS } from '../i18n/keys';

// Variabile pentru singleton-uri
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let firestore: Firestore | null = null;
let appCheck: AppCheck | null = null;
let firebasePersistenceSet = false;

// Configurare Firebase cu variabile de mediu validate
const env = getValidatedEnv();
const firebaseConfig = {
  apiKey: env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Helper pentru gestionarea erorilor de autentificare
async function handleAuthOperation<T>(
  email: string,
  operation: () => Promise<T>,
  t: TFunction
): Promise<AuthResponse<T>> {
  const rateLimiter = RateLimiter.getInstance();
  
  try {
    // Verificăm rate limiting
    if (!await rateLimiter.checkRateLimit(email)) {
      return {
        status: 'error',
        error: {
          name: 'RateLimitError',
          code: 'auth/too-many-requests',
          message: t('errors.auth.tooManyAttempts'),
        },
      };
    }

    // Executăm operația de autentificare
    const result = await operation();
    
    // Resetăm rate limit după succes
    await rateLimiter.resetLimit(email);
    
    return {
      status: 'success',
      data: result,
    };
  } catch (error) {
    // Verifică dacă eroarea este de la Firebase
    if (error instanceof FirebaseError) {
      return {
        status: 'error',
        error: {
          name: error.name,
          code: error.code,
          message: getFirebaseErrorMessage(error, t),
        },
      };
    }

    // Pentru alte tipuri de erori, returnează un mesaj generic
    return {
      status: 'error',
      error: {
        name: 'UnknownError',
        code: 'auth/unknown',
        message: t(ERROR_TRANSLATIONS.AUTH.UNKNOWN),
      },
    };
  }
}

// Inițializare Firebase App
export function initializeFirebaseApp(): FirebaseApp {
  console.log('Inițializare Firebase App...');
  if (!app) {
    if (getApps().length === 0) {
      console.log('Creating new Firebase App instance');
      app = initializeApp(firebaseConfig);
      
      // Inițializăm App Check doar în producție și doar dacă avem cheie reCAPTCHA
      if (env.EXPO_PUBLIC_ENV === 'production' && env.EXPO_PUBLIC_RECAPTCHA_SITE_KEY) {
        console.log('Initializing Firebase App Check with reCAPTCHA');
        appCheck = initializeAppCheck(app, {
          provider: new ReCaptchaV3Provider(env.EXPO_PUBLIC_RECAPTCHA_SITE_KEY),
          isTokenAutoRefreshEnabled: true
        });
      } else if (env.EXPO_PUBLIC_ENV === 'production') {
        console.warn('Firebase App Check disabled: missing RECAPTCHA_SITE_KEY');
      }
    } else {
      console.log('Using existing Firebase App instance');
      app = getApps()[0];
    }
  }
  return app;
}

// Inițializare Firebase Auth
export async function initializeFirebaseAuth(): Promise<Auth> {
  if (!auth) {
    const app = initializeFirebaseApp();
    console.log('Got Firebase App instance, initializing Auth...');
    
    auth = initializeAuth(app);
  }
  return auth;
}

// Inițializare persistenței pentru Firebase Auth
export async function initializeFirebaseAuthPersistence(): Promise<void> {
  if (firebasePersistenceSet) {
    console.log('Firebase Auth persistence already set, skipping...');
    return;
  }

  try {
    const auth = await initializeFirebaseAuth();
    await setPersistence(auth, inMemoryPersistence);
    console.log('Firebase Auth persistence set to inMemory');
    firebasePersistenceSet = true;
  } catch (error) {
    console.error('Error setting Firebase Auth persistence:', error);
    throw error;
  }
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
export function getFirebaseErrorMessage(error: FirebaseError, t: TFunction): string {
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
  const auth = getFirebaseAuth();
  return handleAuthOperation(
    email,
    () => signInWithEmailAndPassword(auth, email, password),
    t
  );
}

export async function signUpWithEmail(
  email: string,
  password: string,
  t: TFunction
): Promise<AuthResponse<UserCredential>> {
  const auth = getFirebaseAuth();
  return handleAuthOperation(
    email,
    () => createUserWithEmailAndPassword(auth, email, password),
    t
  );
}

export async function signOut(t: TFunction): Promise<AuthResponse<void>> {
  try {
    const auth = getFirebaseAuth();
    await auth.signOut();
    return {
      status: 'success'
    };
  } catch (error) {
    return {
      error: {
        name: 'UnknownError',
        code: 'unknown',
        message: error instanceof Error ? error.message : t(ERROR_TRANSLATIONS.AUTH.UNKNOWN)
      },
      status: 'error'
    };
  }
}
