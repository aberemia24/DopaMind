import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  initializeAuth,
  browserLocalPersistence,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  Auth,
  UserCredential,
  AuthError as FirebaseAuthError
} from 'firebase/auth';
import {
  getFirestore,
  Firestore
} from 'firebase/firestore';

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
    const firebaseApp = initializeFirebaseApp();
    console.log('Got Firebase App instance, initializing Auth with memory persistence');
    auth = initializeAuth(firebaseApp, {
      persistence: browserLocalPersistence
    });
    console.log('Firebase Auth initialized successfully');
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

// Funcții pentru autentificare
export const signInWithEmail = async (
  email: string,
  password: string
): Promise<UserCredential | FirebaseAuthError> => {
  try {
    const authInstance = getFirebaseAuth();
    return await signInWithEmailAndPassword(authInstance, email, password);
  } catch (error) {
    const firebaseError = error as FirebaseAuthError;
    return {
      code: firebaseError.code,
      message: firebaseError.message
    };
  }
};

export const signUpWithEmail = async (
  email: string,
  password: string
): Promise<UserCredential | FirebaseAuthError> => {
  try {
    const authInstance = getFirebaseAuth();
    return await createUserWithEmailAndPassword(authInstance, email, password);
  } catch (error) {
    const firebaseError = error as FirebaseAuthError;
    return {
      code: firebaseError.code,
      message: firebaseError.message
    };
  }
};

export const signOut = async (): Promise<void | FirebaseAuthError> => {
  try {
    const authInstance = getFirebaseAuth();
    await firebaseSignOut(authInstance);
  } catch (error) {
    const firebaseError = error as FirebaseAuthError;
    return {
      code: firebaseError.code,
      message: firebaseError.message
    };
  }
};

// Tipuri pentru autentificare
export interface AuthError {
  code: string;
  message: string;
}

export const isAuthError = (result: any): result is AuthError => {
  return result && 'code' in result && 'message' in result;
};
