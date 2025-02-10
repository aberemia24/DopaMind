import { useState, useEffect, useCallback, useRef } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
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

const AUTH_STATE_KEY = '@auth_state';
const AUTH_CREDENTIALS_KEY = 'AUTH_CREDENTIALS_KEY';

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
export function useAuth(): UseAuthReturn {
  const { t } = useTranslation();
  
  // Starea principală
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  // Referință pentru funcția logout pentru a evita dependența circulară
  const logoutRef = useRef<() => Promise<boolean>>();

  // Din useSessionManager, obținem un callback pentru update activitate
  const { updateLastActivity } = useSessionManager({
    onSessionExpired: async () => {
      console.log('useAuth: Session expired. Logging out...');
      setSessionExpired(true);
      if (logoutRef.current) {
        await logoutRef.current();
      }
    },
    onTokenRefreshed: () => {
      console.log('useAuth: Token refreshed via useSessionManager');
    },
  });

  /**
   * Handler centralizat pentru actualizarea stării utilizatorului
   */
  const handleUserStateChange = useCallback((newUser: User | null) => {
    setUser(newUser);
    setIsAuthenticated(!!newUser);
    if (newUser) {
      updateLastActivity();
      setSessionExpired(false);
    }
    setLoading(false);
  }, [updateLastActivity]);

  /**
   * Handler centralizat pentru erori de autentificare
   */
  const handleAuthError = useCallback((error: unknown) => {
    console.error('useAuth: Auth error:', error);
    setError(t(ERROR_TRANSLATIONS.AUTH.DEFAULT));
    setLoading(false);
  }, [t]);

  // Salvăm credențialele la login
  const persistCredentials = useCallback(
    async (email: string, password: string) => {
      try {
        const timestamp = Date.now();
        const data = {
          email,
          password,
          timestamp
        };
        await secureStorage.setItem(AUTH_CREDENTIALS_KEY, JSON.stringify(data));
        await updateLastActivity();
        console.log(`useAuth: Credentials saved in SecureStorage at ${formatLogTimestamp(timestamp)}`);
      } catch (err) {
        console.error('useAuth: Error saving credentials:', err);
      }
    },
    [updateLastActivity]
  );

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

      const { email, password, timestamp } = JSON.parse(credsString);
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

  // Inițializare și subscripție la schimbări de autentificare
  useEffect(() => {
    let unsubscribe: () => void;
    
    const initAuth = async () => {
      try {
        console.log('useAuth: Initializing Firebase Auth...');
        const auth = await initializeFirebaseAuth();
        
        console.log('useAuth: Setting up auth state listener...');
        unsubscribe = onAuthStateChanged(auth, 
          async (firebaseUser) => {
            console.log('useAuth: Auth state changed:', { 
              user: firebaseUser ? 'exists' : 'null',
              emailVerified: firebaseUser?.emailVerified,
              providerId: firebaseUser?.providerId 
            });
            
            if (!firebaseUser) {
              const reauthed = await attemptReauthentication();
              if (!reauthed) {
                handleUserStateChange(null);
              }
            } else {
              handleUserStateChange(firebaseUser);
            }
          }, 
          handleAuthError
        );

        // Încercăm reautentificarea inițială doar dacă nu avem user
        if (!auth.currentUser) {
          await attemptReauthentication();
        }
      } catch (error) {
        handleAuthError(error instanceof Error ? error : new Error('Authentication error'));
      }
    };

    initAuth();
    return () => {
      if (unsubscribe) {
        console.log('useAuth: Cleaning up auth listener...');
        unsubscribe();
      }
    };
  }, [attemptReauthentication, handleUserStateChange, handleAuthError]);

  /**
   * Login cu retry în caz de eșec
   */
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      setError(null);
      setLoading(true);
      console.log('useAuth: Attempting login...');

      const result = await withRetry(() => signInWithEmail(email, password, t));
      console.log('useAuth: Login result:', { status: result.status, hasData: !!result.data });
      
      if (result.status === 'error') {
        if (result.error) {
          console.log('useAuth: Login error:', result.error);
          setError(result.error.message);
        }
        return false;
      }
      if (result.status === 'success' && result.data) {
        console.log('useAuth: Login successful, updating state...');
        handleUserStateChange(result.data.user);
        await persistCredentials(email, password);
        return true;
      }
      return false;
    } catch (err) {
      console.error('useAuth: Login error:', err);
      setError(t(ERROR_TRANSLATIONS.AUTH.DEFAULT));
      return false;
    } finally {
      setLoading(false);
    }
  }, [t, handleUserStateChange, persistCredentials]);

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
   * Logout cu curățarea datelor locale
   */
  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await secureStorage.removeItem(AUTH_CREDENTIALS_KEY);
      const result = await withRetry(() => firebaseSignOut(t));

      if (result.status === 'error' && result.error) {
        setError(t(ERROR_TRANSLATIONS.AUTH.DEFAULT));
        return false;
      }

      handleUserStateChange(null);
      return true;
    } catch (error) {
      setError(t(ERROR_TRANSLATIONS.GENERIC));
      return false;
    } finally {
      setLoading(false);
    }
  }, [t, handleUserStateChange]);

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
