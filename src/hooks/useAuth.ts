import { useState, useEffect, useCallback } from 'react';
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

  /**
   * Funcție de expirare sesiune:
   * E apelată de useSessionManager când detectează un timeout.
   */
  const handleSessionExpired = useCallback(async () => {
    console.log('useAuth: Session expired. Logging out...');
    setSessionExpired(true);
    await logout();
  }, []);

  // Din useSessionManager, obținem un callback pentru update activitate
  const { updateLastActivity } = useSessionManager({
    onSessionExpired: handleSessionExpired,
    onTokenRefreshed: () => {
      console.log('useAuth: Token refreshed via useSessionManager');
    },
  });

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
   * Gestionează loading state și curăță credențialele în caz de eșec.
   */
  const attemptReauthentication = useCallback(async (t: TFunction): Promise<boolean> => {
    setLoading(true);
    try {
      const credsString = await secureStorage.getItem(AUTH_CREDENTIALS_KEY);
      if (!credsString) {
        setLoading(false);
        return false;
      }

      const { email, password, timestamp } = JSON.parse(credsString);
      const now = Date.now();
      
      // Verificăm dacă credențialele sunt prea vechi
      if (now - timestamp > AUTH_CONFIG.CREDENTIALS_MAX_AGE_MS) {
        console.log(`useAuth: Saved credentials from ${formatLogTimestamp(timestamp)} are too old, clearing`);
        await secureStorage.removeItem(AUTH_CREDENTIALS_KEY);
        setLoading(false);
        return false;
      }

      console.log(`useAuth: Attempting reauth with credentials saved at ${formatLogTimestamp(timestamp)}`);
      const result = await signInWithEmail(email, password, t);
      if (result.status === 'success' && result.data) {
        setUser(result.data.user);
        setIsAuthenticated(true);
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
  }, [updateLastActivity]);

  // Inițializează listener pe starea de autentificare
  useEffect(() => {
    console.log('useAuth: Initializing...');
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
              // Doar încercăm reautentificarea dacă nu avem user
              const reauthed = await attemptReauthentication(t);
              if (!reauthed) {
                setUser(null);
                setIsAuthenticated(false);
              }
            } else {
              setUser(firebaseUser);
              setIsAuthenticated(true);
              await updateLastActivity();
            }
            setLoading(false);
          }, 
          (error) => {
            console.error('useAuth: Auth error:', error);
            setError(error.message);
            setLoading(false);
          }
        );
      } catch (error) {
        console.error('useAuth: Initialization error:', error);
        setError(error instanceof Error ? error.message : 'Authentication error');
        setLoading(false);
      }
    };

    initAuth();

    return () => {
      if (unsubscribe) {
        console.log('useAuth: Cleaning up auth listener...');
        unsubscribe();
      }
    };
  }, [t, attemptReauthentication, updateLastActivity]);

  /**
   * Login
   */
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      setError(null);
      setLoading(true);

      const result = await signInWithEmail(email, password, t);
      
      if (result.status === 'error') {
        if (result.error) {
          setError(result.error.message);
        }
        return false;
      }
      if (result.status === 'success' && result.data) {
        setUser(result.data.user);
        setIsAuthenticated(true);
        await persistCredentials(email, password);
        await updateLastActivity();
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
  }, [t, persistCredentials, updateLastActivity]);

  /**
   * Register
   */
  const register = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      setError(null);
      setLoading(true);

      const result = await signUpWithEmail(email, password, t);
      
      if (result.status === 'error') {
        if (result.error) {
          setError(result.error.message);
        }
        return false;
      }
      if (result.status === 'success' && result.data) {
        setUser(result.data.user);
        setIsAuthenticated(true);
        await persistCredentials(email, password);
        await updateLastActivity();
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
  }, [t, persistCredentials, updateLastActivity]);

  /**
   * Deconectează utilizatorul și curăță datele locale.
   * Gestionează loading state și traduce mesajele de eroare.
   */
  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Ștergem credențialele din SecureStorage
      await secureStorage.removeItem(AUTH_CREDENTIALS_KEY);

      // Deconectăm din Firebase
      const result = await firebaseSignOut();

      if (result.status === 'error' && result.error) {
        setError(t(ERROR_TRANSLATIONS.AUTH.DEFAULT));
        return false;
      }

      setUser(null);
      setIsAuthenticated(false);
      return true;
    } catch (error) {
      setError(t(ERROR_TRANSLATIONS.GENERIC));
      return false;
    } finally {
      setLoading(false);
    }
  }, [t]);

  // Inițializare și subscripție la schimbări de autentificare
  useEffect(() => {
    const auth = initializeFirebaseAuth();
    
    // Încercăm reautentificarea la pornire
    attemptReauthentication(t);

    // Subscripție la schimbări de autentificare
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsAuthenticated(!!user);
      if (user) {
        updateLastActivity();
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [attemptReauthentication, t, updateLastActivity]);

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
