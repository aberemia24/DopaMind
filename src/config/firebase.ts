import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  initializeAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  Auth,
  UserCredential,
  AuthError as FirebaseAuthError,
  getAuth,
  setPersistence,
  inMemoryPersistence
} from 'firebase/auth';
import {
  getFirestore,
  Firestore
} from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

// Funcții pentru autentificare
export const signInWithEmail = async (
  email: string,
  password: string
): Promise<UserCredential | AuthError> => {
  try {
    const auth = initializeFirebaseAuth();
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential;
  } catch (error: any) {
    console.error('Error signing in:', error);
    const authError: AuthError = {
      name: error.name || 'AuthError',
      code: error.code || 'auth/unknown',
      message: error.message || 'An unknown error occurred',
      customData: error.customData || {}
    };
    return authError;
  }
};

export const signUpWithEmail = async (
  email: string,
  password: string
): Promise<UserCredential | AuthError> => {
  try {
    const auth = initializeFirebaseAuth();
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential;
  } catch (error: any) {
    console.error('Error signing up:', error);
    const authError: AuthError = {
      name: error.name || 'AuthError',
      code: error.code || 'auth/unknown',
      message: error.message || 'An unknown error occurred',
      customData: error.customData || {}
    };
    return authError;
  }
};

export const signOut = async (): Promise<void | AuthError> => {
  try {
    const auth = getFirebaseAuth();
    await firebaseSignOut(auth);
  } catch (error: any) {
    console.error('Error signing out:', error);
    const authError: AuthError = {
      name: error.name || 'AuthError',
      code: error.code || 'auth/unknown',
      message: error.message || 'An unknown error occurred',
      customData: error.customData || {}
    };
    return authError;
  }
};

// Tipuri pentru autentificare
export interface AuthError {
  name: string;
  code: string;
  message: string;
  customData: any;
}

export const isAuthError = (result: any): result is AuthError => {
  return result && 'name' in result && 'code' in result && 'message' in result && 'customData' in result;
};
