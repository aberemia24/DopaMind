import { useState, useEffect, useCallback, useRef } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { 
  getFirebaseAuth, 
  signInWithEmail, 
  signUpWithEmail, 
  signOut as firebaseSignOut,
  AuthError,
  AuthResponse,
  initializeFirebaseAuth 
} from '../config/firebase';
import { useTranslation } from 'react-i18next';
import { useSessionManager } from './useSessionManager';
import { TFunction } from 'i18next';
import { secureStorage } from '../utils/secureStorage';
import { ERROR_TRANSLATIONS } from '../i18n/keys';
import { AUTH_CONFIG } from '../config/environment';
import { formatLogTimestamp } from '../utils/dateTimeFormat';
import * as Crypto from 'expo-crypto';

// Singleton pentru inițializarea Firebase Auth
let authInitialized = false;
let authListenerRef: (() => void) | null = null;

const AUTH_STATE_KEY = '@auth_state';
const AUTH_CREDENTIALS_KEY = 'AUTH_CREDENTIALS_KEY';

interface StoredCredentials {
  email: string;
  password: string;
  salt: string;
  timestamp: number;
}

export interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  sessionExpired: boolean;
  setIsAuthenticated: (value: boolean) => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<boolean>;
}

/**
 * Utilitar pentru reîncercarea operațiilor eșuate cu exponential backoff
 */
const withRetry = async <T>(
  operation: () => Promise<T>,
  maxAttempts = 3,
  baseDelay = 1000
): Promise<T> => {
  let lastError: Error = new Error('Operation failed');
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      if (attempt === maxAttempts) break;
      
      const delay = baseDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
      console.log(`useAuth: Retry attempt ${attempt} after ${delay}ms`);
    }
  }
  
  throw lastError;
};

/**
 * Hook principal pentru gestionarea autentificării și a stării user-ului.
 * Folosește useSessionManager pentru timeout/refresh și onAuthStateChanged pentru actualizarea locală.
 */
export const useAuth = (): UseAuthReturn => {
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const userRef = useRef<User | null>(null);
  const isAuthenticatedRef = useRef<boolean>(false);
  const loadingRef = useRef<boolean>(true);

  // Referință pentru funcția logout pentru a evita dependența circulară
  const logoutRef = useRef<() => Promise<boolean>>();

  // Din useSessionManager, obținem un callback pentru update activitate
  const { updateLastActivity } = useSessionManager({
    onSessionExpired: async () => {
      console.log(`useAuth: Session expired. Logging out...`);
      setSessionExpired(true);
      if (logoutRef.current) {
        await logoutRef.current();
      }
    },
    onTokenRefreshed: () => {
      console.log(`useAuth: Token refreshed via useSessionManager`);
    },
  });

  /**
   * Gestionează schimbările de stare ale utilizatorului
   */
  const handleUserStateChange = useCallback((newUser: User | null) => {
    const prevUser = userRef.current;
    if (prevUser === newUser) {
      return; // Evităm actualizări inutile
    }

    userRef.current = newUser;
    setUser(newUser);

    const newAuthState = !!newUser;
    if (isAuthenticatedRef.current !== newAuthState) {
      isAuthenticatedRef.current = newAuthState;
      setIsAuthenticated(newAuthState);
    }
    
    if (newUser) {
      updateLastActivity();
      setSessionExpired(false);
    }
    
    // Logăm doar când starea se schimbă efectiv
    if (prevUser !== newUser) {
      const changeType = prevUser === null ? 'login' : newUser === null ? 'logout' : 'update';
      console.log(`useAuth: User state changed (${changeType}) - ${newUser ? 'authenticated' : 'unauthenticated'}`);
    }
  }, [updateLastActivity]);

  /**
   * Gestionează erorile de autentificare într-un mod optimizat
   */
  const handleAuthError = useCallback((error: unknown) => {
    console.error('useAuth: Auth error:', error);
    
    // Curățăm orice eroare existentă înainte de a seta una nouă
    setError(null);

    // Întârziem afișarea noii erori pentru a preveni flickering
    setTimeout(() => {
      setError(error instanceof Error ? error.message : t(ERROR_TRANSLATIONS.AUTH.DEFAULT));
    }, 100);

    setLoading(false);
  }, [t]);

  /**
   * Generează un salt unic pentru criptare (8 bytes, encoded hex)
   */
  const generateSalt = async (): Promise<string> => {
    try {
      const randomBytes = await Crypto.getRandomBytesAsync(8);
      return Buffer.from(randomBytes).toString('hex');
    } catch (error) {
      console.error('useAuth: Error generating salt:', error);
      throw new Error('Failed to generate secure salt');
    }
  };

  /**
   * Criptează parola folosind salt-ul specificat
   */
  const encryptPassword = async (password: string, salt: string): Promise<string> => {
    return await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      password + salt
    );
  };

  /**
   * Salvează și validează credențialele în secure storage cu retry
   */
  const persistCredentials = useCallback(async (email: string, password: string) => {
    try {
      const timestamp = Date.now();
      const salt = await generateSalt();
      const encryptedPassword = await encryptPassword(password, salt);
      const data: StoredCredentials = { 
        email, 
        password: encryptedPassword, 
        salt,
        timestamp 
      };
      
      // Folosim withRetry pentru operațiile de stocare
      await withRetry(
        () => secureStorage.setItem(AUTH_CREDENTIALS_KEY, JSON.stringify(data)),
        3,
        500
      );
      
      // Validăm că datele au fost stocate corect
      const verifyData = await secureStorage.getItem(AUTH_CREDENTIALS_KEY);
      if (!verifyData) {
        throw new Error('Failed to verify stored credentials');
      }
      
      const parsedData = JSON.parse(verifyData) as StoredCredentials;
      if (parsedData.email !== email || parsedData.salt !== salt) {
        console.warn('useAuth: Stored credentials validation failed, removing corrupted data');
        await secureStorage.removeItem(AUTH_CREDENTIALS_KEY);
        throw new Error('Stored credentials were invalid and have been cleared');
      }

      await updateLastActivity();
      console.log(`useAuth: Credentials saved and verified at ${formatLogTimestamp(timestamp)}`);
      
      return true;
    } catch (err) {
      console.error('useAuth: Error saving credentials:', err);
      return false;
    }
  }, [updateLastActivity]);

  /**
   * Încearcă reautentificarea cu credențialele salvate.
   */
  const attemptReauthentication = useCallback(async (): Promise<boolean> => {
    setLoading(true);
    try {
      const credsString = await secureStorage.getItem(AUTH_CREDENTIALS_KEY);
      if (!credsString) {
        setLoading(false);
        return false;
      }

      const { email, password, timestamp } = JSON.parse(credsString) as StoredCredentials;
      const now = Date.now();
      
      if (now - timestamp > AUTH_CONFIG.CREDENTIALS_MAX_AGE_MS) {
        console.log(`useAuth: Saved credentials from ${formatLogTimestamp(timestamp)} are too old, clearing`);
        await secureStorage.removeItem(AUTH_CREDENTIALS_KEY);
        setLoading(false);
        return false;
      }

      console.log(`useAuth: Attempting reauth with credentials saved at ${formatLogTimestamp(timestamp)}`);
      const result = await withRetry(() => signInWithEmail(email, password, t));
      
      if (result.status === 'success' && result.data) {
        handleUserStateChange(result.data.user);
        await updateLastActivity();
        return true;
      } else {
        console.log('useAuth: Reauth failed, removing credentials');
        await secureStorage.removeItem(AUTH_CREDENTIALS_KEY);
        return false;
      }
    } catch (err) {
      console.error('useAuth: Reauth error:', err);
      await secureStorage.removeItem(AUTH_CREDENTIALS_KEY);
      return false;
    } finally {
      setLoading(false);
    }
  }, [t, updateLastActivity, handleUserStateChange]);

  /**
   * Actualizează starea de loading în mod optimizat
   */
  const updateLoadingState = useCallback(() => {
    if (user === null && !loading && !loadingRef.current) {
      loadingRef.current = true;
      setLoading(true);
    } else if ((user !== null || loadingRef.current) && loading) {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [user, loading]);

  // Aplicăm actualizarea stării de loading
  useEffect(() => {
    updateLoadingState();
  }, [updateLoadingState]);

  // Efect pentru inițializarea Firebase Auth și setarea listener-ului
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (!authInitialized) {
          console.log('useAuth: Initializing Firebase Auth...');
          await initializeFirebaseAuth();
          authInitialized = true;
        }

        // Curățăm listener-ul existent înainte de a adăuga unul nou
        if (authListenerRef) {
          console.log('useAuth: Removing existing listener before adding a new one');
          authListenerRef();
          authListenerRef = null;
        }

        const auth = getFirebaseAuth();
        console.log('useAuth: Setting up auth state listener...');
        authListenerRef = onAuthStateChanged(auth, handleUserStateChange);

        setLoading(false);
      } catch (error) {
        console.error('useAuth: Error initializing auth:', error);
        setError(t(ERROR_TRANSLATIONS.AUTH.DEFAULT));
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      if (authListenerRef) {
        console.log('useAuth: Cleaning up auth listener...');
        authListenerRef();
        authListenerRef = null;
      }
    };
  }, [handleUserStateChange, t]);

  /**
   * Login cu retry în caz de eșec
   */
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const result = await withRetry(() => signInWithEmail(email, password, t));
      if (result.status === 'error' && result.error) {
        setError(t(ERROR_TRANSLATIONS.AUTH.DEFAULT));
        return false;
      }

      const success = await persistCredentials(email, password);
      if (!success) {
        console.error('useAuth: Failed to persist credentials after login');
        setError(t(ERROR_TRANSLATIONS.AUTH.DEFAULT));
        return false;
      }

      console.log(`useAuth: Login successful for ${email}`);
      return true;
    } catch (error) {
      console.error(`useAuth: Error during login:`, error);
      setError(t(ERROR_TRANSLATIONS.GENERIC));
      return false;
    } finally {
      setLoading(false);
    }
  }, [t, persistCredentials]);

  /**
   * Register cu retry în caz de eșec
   */
  const register = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      setError(null);
      setLoading(true);

      const result = await withRetry(() => signUpWithEmail(email, password, t));
      
      if (result.status === 'error') {
        if (result.error) {
          setError(result.error.message);
        }
        return false;
      }
      if (result.status === 'success' && result.data) {
        handleUserStateChange(result.data.user);
        await persistCredentials(email, password);
        return true;
      }
      return false;
    } catch (err) {
      console.error('useAuth: Register error:', err);
      setError(t(ERROR_TRANSLATIONS.AUTH.DEFAULT));
      return false;
    } finally {
      setLoading(false);
    }
  }, [t, persistCredentials, handleUserStateChange]);

  /**
   * Deconectare și curățare completă a stării de autentificare
   */
  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);
    setSessionExpired(false);

    try {
      const result = await withRetry(() => firebaseSignOut(t));
      if (result.status === 'error' && result.error) {
        setError(t(ERROR_TRANSLATIONS.AUTH.DEFAULT));
        return false;
      }

      // Eliminăm listener-ul Firebase pentru a preveni probleme de stare
      if (authListenerRef) {
        console.log('useAuth: Removing Firebase Auth listener on logout...');
        authListenerRef();
        authListenerRef = null;
      }

      // Curățăm datele stocate și resetăm starea
      await secureStorage.removeItem(AUTH_CREDENTIALS_KEY);
      await secureStorage.removeItem(AUTH_STATE_KEY);
      
      userRef.current = null;
      isAuthenticatedRef.current = false;
      setUser(null);
      setIsAuthenticated(false);
      setSessionExpired(false);
      setError(null);

      console.log('useAuth: Logged out successfully and cleared all auth state');
      return true;
    } catch (error) {
      console.error('useAuth: Error during logout:', error);
      setError(t(ERROR_TRANSLATIONS.GENERIC));
      return false;
    } finally {
      setLoading(false);
    }
  }, [t]);

  // Setăm referința pentru logout
  useEffect(() => {
    logoutRef.current = logout;
  }, [logout]);

  return {
    user,
    loading,
    error,
    isAuthenticated,
    sessionExpired,
    setIsAuthenticated,
    login,
    logout,
    register
  };
}
