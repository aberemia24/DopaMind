import React, { useState, useRef, useCallback, useEffect } from 'react';
import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut, 
  User,
  GoogleAuthProvider,
  signInWithCredential,
  OAuthCredential,
  setPersistence,
  inMemoryPersistence,
  Unsubscribe,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';
import { useTranslation } from 'react-i18next';
import { AuthContext } from './AuthContext';
import type { AuthContextValue } from './types';
import { useSessionManager } from '../../hooks/useSessionManager';
import { ERROR_TRANSLATIONS } from '../../i18n/keys';
import { secureStorage } from '../../utils/secureStorage';
import { 
  initializeFirebaseAuth,
  getFirebaseAuth,
  getFirebaseErrorMessage,
  initializeFirebaseAuthPersistence
} from '../../config/firebase';

// Singleton pentru inițializarea Firebase Auth
let authInitialized = false;

// Chei pentru stocare
const AUTH_STATE_KEY = 'auth_state';
const AUTH_METHOD_KEY = 'auth_method'; // "email" sau "google"
const AUTH_CREDENTIALS_KEY = 'auth_credentials';
const AUTH_TOKENS_KEY = 'auth_tokens';

interface AuthProviderProps {
  children: React.ReactNode;
}

interface StoredCredentials {
  email: string;
  password: string;
  timestamp: number;
}

interface TokenData {
  idToken: string;
  refreshToken: string;
  expiresAt: number;
}

const AUTH_CONFIG = {
  CREDENTIALS_MAX_AGE_MS: 7 * 24 * 60 * 60 * 1000, // 7 zile
  TOKEN_EXPIRY_MS: 3600 * 1000, // 1 oră
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_BASE_DELAY: 1000,
  MIN_REAUTH_INTERVAL: 60 * 1000, // 1 minut între încercări de reautentificare
};

/**
 * Provider pentru autentificare
 * Gestionează starea de autentificare și expune metodele necesare
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const { t } = useTranslation();
  
  // State-uri
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  // Referințe pentru state și funcții
  const userRef = useRef<User | null>(null);
  const isAuthenticatedRef = useRef<boolean>(false);
  const loadingRef = useRef<boolean>(true);
  const logoutRef = useRef<() => Promise<boolean>>();
  const authListenerRef = useRef<Unsubscribe | null>(null);
  const listenerInitialized = useRef<boolean>(false);
  const lastReauthAttempt = useRef<number>(0);
  const firebasePersistenceSet = useRef<boolean>(false);
  const isLoggingOut = useRef(false);

  // Din useSessionManager, obținem un callback pentru update activitate
  const { updateLastActivity } = useSessionManager({
    onSessionExpired: async () => {
      console.log(`AuthProvider: Session expired. Logging out...`);
      setSessionExpired(true);
      if (logoutRef.current) {
        await logoutRef.current();
      }
    },
    onTokenRefreshed: () => {
      console.log(`AuthProvider: Token refreshed via useSessionManager`);
    },
  });

  // Handler pentru erori de autentificare
  const handleAuthError = useCallback((error: any) => {
    const errorMessage = getFirebaseErrorMessage(error, t);
    setError(errorMessage);
  }, [t]);

  /**
   * Curăță datele de autentificare și starea
   */
  const cleanupAuthData = useCallback(async (preserveCredentials: boolean = false): Promise<void> => {
    try {
      console.log('AuthProvider: Curățare date autentificare...');
      
      const itemsToRemove = [
        AUTH_TOKENS_KEY,
        AUTH_METHOD_KEY,
        ...(preserveCredentials ? [] : [AUTH_CREDENTIALS_KEY])
      ];

      await Promise.all(itemsToRemove.map(key => secureStorage.removeItem(key)));
      
      if (!preserveCredentials) {
        console.log('AuthProvider: Credențialele au fost șterse');
      } else {
        console.log('AuthProvider: Credențialele au fost păstrate pentru reautentificare');
      }
      
      console.log('AuthProvider: Curățare completă cu succes');
    } catch (error) {
      console.error('AuthProvider: Eroare la curățare:', error);
    }
  }, []);

  /**
   * Gestionează schimbările de stare ale utilizatorului
   */
  const handleUserStateChange = useCallback(async (newUser: User | null) => {
    const prevUser = userRef.current;
    if (prevUser?.uid === newUser?.uid) {
      return; // Evităm actualizări inutile verificând și UID-ul
    }

    userRef.current = newUser;
    const newAuthState = !!newUser;

    // Actualizăm starea doar dacă s-a schimbat efectiv
    if (isAuthenticatedRef.current !== newAuthState) {
      isAuthenticatedRef.current = newAuthState;
      setIsAuthenticated(newAuthState);
    }

    // Setăm user-ul doar dacă s-a schimbat
    if (prevUser !== newUser) {
      setUser(newUser);
      if (newUser) {
        updateLastActivity();
        setSessionExpired(false);
      }
      
      const changeType = prevUser === null ? 'login' : newUser === null ? 'logout' : 'update';
      console.log(`AuthProvider: User state changed (${changeType}) - ${newUser ? 'authenticated' : 'unauthenticated'}`);
    }
  }, [updateLastActivity]);

  // Utilitar pentru reîncercarea operațiilor eșuate
  const withRetry = async <T,>(
    operation: () => Promise<T>,
    maxAttempts = AUTH_CONFIG.MAX_RETRY_ATTEMPTS,
    baseDelay = AUTH_CONFIG.RETRY_BASE_DELAY
  ): Promise<T> => {
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        if (attempt === maxAttempts) break;
        
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  };

  // Salvare credențiale în secure storage
  const persistCredentials = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('AuthProvider: Începere salvare credențiale...');
      
      if (!email || !password) {
        console.error('AuthProvider: Email sau parolă lipsă');
        return false;
      }

      // Salvăm credențialele direct în secure storage
      // Este sigur pentru că secureStorage folosește criptare la nivel de sistem
      const credentials: StoredCredentials = {
        email,
        password, // Salvăm parola în formă clară pentru reautentificare
        timestamp: Date.now()
      };

      await secureStorage.setItem(AUTH_CREDENTIALS_KEY, JSON.stringify(credentials));
      
      // Verificare salvare
      const savedData = await secureStorage.getItem(AUTH_CREDENTIALS_KEY);
      if (!savedData) {
        console.error('AuthProvider: Credențialele nu au fost salvate corect');
        return false;
      }

      console.log('AuthProvider: Credențiale salvate cu succes');
      return true;
    } catch (error) {
      console.error('AuthProvider: Eroare la salvarea credențialelor:', error);
      return false;
    }
  }, []);

  // Tipuri pentru token-uri
  interface TokenData {
    idToken: string;
    refreshToken: string;
    expiresAt: number;
  }

  // Funcții pentru gestionarea token-urilor
  const persistTokens = useCallback(async (tokenData: TokenData) => {
    try {
      await secureStorage.setItem(AUTH_TOKENS_KEY, JSON.stringify(tokenData));
      console.log('AuthProvider: Tokens saved successfully');
    } catch (error) {
      console.error('AuthProvider: Error saving tokens:', error);
    }
  }, []);

  const getTokens = useCallback(async (): Promise<TokenData | null> => {
    try {
      const tokenString = await secureStorage.getItem(AUTH_TOKENS_KEY);
      return tokenString ? JSON.parse(tokenString) as TokenData : null;
    } catch (error) {
      console.error('AuthProvider: Error retrieving tokens:', error);
      return null;
    }
  }, []);

  const clearTokens = useCallback(async () => {
    try {
      await secureStorage.removeItem(AUTH_TOKENS_KEY);
      console.log('AuthProvider: Tokens cleared');
    } catch (error) {
      console.error('AuthProvider: Error clearing tokens:', error);
    }
  }, []);

  // Gestionare token refresh
  const onTokenRefreshed = useCallback(async (user: User) => {
    try {
      const token = await user.getIdToken();
      await persistTokens({
        idToken: token,
        refreshToken: user.refreshToken,
        expiresAt: Date.now() + AUTH_CONFIG.TOKEN_EXPIRY_MS
      });
      console.log('AuthProvider: Tokens refreshed and persisted');
    } catch (error) {
      console.error('AuthProvider: Error refreshing tokens:', error);
    }
  }, [persistTokens]);

  // Inițializare listener pentru token refresh
  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsubscribe = auth.onIdTokenChanged(async (user) => {
      if (user) {
        await onTokenRefreshed(user);
      }
    });

    return () => unsubscribe();
  }, [onTokenRefreshed]);

  // Reautentificare cu email/parolă
  const attemptEmailReauth = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('AuthProvider: Încercare reautentificare cu email...');
      const auth = getFirebaseAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (userCredential.user) {
        console.log('AuthProvider: Reauth successful using email credentials');
        await handleUserStateChange(userCredential.user);
        setLoading(false);
        return true;
      }
      setLoading(false);
      return false;
    } catch (error) {
      console.error('AuthProvider: Email reauth error:', error);
      await cleanupAuthData(true);
      setLoading(false);
      return false;
    }
  }, [handleUserStateChange, cleanupAuthData]);

  // Reautentificare cu Google
  const attemptGoogleReauth = useCallback(async (): Promise<boolean> => {
    try {
      const tokens = await getTokens();
      if (!tokens) {
        console.log('AuthProvider: No saved Google tokens found');
        return false;
      }
      if (Date.now() >= tokens.expiresAt) {
        console.log('AuthProvider: Saved Google tokens have expired');
        await clearTokens();
        return false;
      }
      const auth = getFirebaseAuth();
      const credential = GoogleAuthProvider.credential(tokens.idToken, tokens.refreshToken);
      if (!credential) {
        console.log('AuthProvider: Could not create credential from tokens');
        return false;
      }
      const userCredential = await signInWithCredential(auth, credential);
      if (userCredential.user) {
        console.log('AuthProvider: Reauth successful using Google tokens');
        await handleUserStateChange(userCredential.user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('AuthProvider: Google reauth error:', error);
      await clearTokens();
      return false;
    }
  }, [getTokens, clearTokens, handleUserStateChange]);

  // Verificare credențiale
  const checkStoredCredentials = useCallback(async (): Promise<StoredCredentials | null> => {
    try {
      console.log('AuthProvider: Verificare credențiale stocate...');
      
      const storedCredentialsJson = await secureStorage.getItem(AUTH_CREDENTIALS_KEY);
      if (!storedCredentialsJson) {
        console.log('AuthProvider: Nu există credențiale stocate');
        return null;
      }

      const storedCredentials: StoredCredentials = JSON.parse(storedCredentialsJson);
      const currentTime = Date.now();
      const credentialAge = currentTime - storedCredentials.timestamp;
      
      // Verifică dacă credențialele au expirat (30 zile)
      if (credentialAge > 30 * 24 * 60 * 60 * 1000) {
        console.log('AuthProvider: Credențialele au expirat');
        await cleanupAuthData(false);
        return null;
      }

      console.log('AuthProvider: Credențiale valide găsite');
      return storedCredentials;
    } catch (error) {
      console.error('AuthProvider: Eroare la verificarea credențialelor:', error);
      return null;
    }
  }, [cleanupAuthData]);

  // Reautentificare consolidată
  const attemptReauthentication = useCallback(async (): Promise<boolean> => {
    const now = Date.now();
    
    if (now - lastReauthAttempt.current < AUTH_CONFIG.MIN_REAUTH_INTERVAL) {
      console.log('AuthProvider: Skipping reauth due to cooldown');
      setLoading(false);
      return false;
    }
    lastReauthAttempt.current = now;

    try {
      // Verificăm mai întâi credențialele stocate
      const storedCreds = await checkStoredCredentials();
      if (!storedCreds) {
        console.log('AuthProvider: Nu există credențiale valide stocate');
        setLoading(false);
        return false;
      }

      // Verificăm metoda de autentificare
      const method = await secureStorage.getItem(AUTH_METHOD_KEY);
      console.log(`AuthProvider: Metoda de autentificare stocată = ${method}`);
      
      if (!method) {
        console.log('AuthProvider: Nu există metodă de autentificare stocată - setăm implicit email');
        await secureStorage.setItem(AUTH_METHOD_KEY, 'email');
      }

      const authMethod = method || 'email';
      console.log(`AuthProvider: Încercare reautentificare cu metoda ${authMethod}`);
      
      const result = authMethod === 'email' 
        ? await attemptEmailReauth(storedCreds.email, storedCreds.password)
        : await attemptGoogleReauth();
      
      if (!result) {
        console.log('AuthProvider: Reautentificare eșuată - curățare date');
        await cleanupAuthData();
        setLoading(false);
      } else {
        console.log('AuthProvider: Reautentificare reușită');
      }
      
      return result;
    } catch (error) {
      console.error('AuthProvider: Eroare la reautentificare:', error);
      await cleanupAuthData();
      setLoading(false);
      return false;
    }
  }, [attemptEmailReauth, attemptGoogleReauth, cleanupAuthData, checkStoredCredentials]);

  // Inițializare Firebase Auth cu persistență
  const initializeFirebaseAuth = useCallback(async () => {
    try {
      const auth = getFirebaseAuth();
      
      if (!firebasePersistenceSet.current) {
        await setPersistence(auth, inMemoryPersistence);
        console.log('Firebase Auth persistence set to inMemory');
        firebasePersistenceSet.current = true;
      }
      
      return auth;
    } catch (error) {
      console.error('AuthProvider: Error initializing Firebase Auth:', error);
      throw error;
    }
  }, []);

  // Login cu salvare token-uri
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    if (!email || !password) {
      setError('Email și parola sunt obligatorii');
      return false;
    }

    setLoading(true);
    try {
      console.log('AuthProvider: Încercare autentificare...');
      const auth = getFirebaseAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      if (userCredential.user) {
        // 1. Mai întâi salvăm credențialele pentru reautentificare
        console.log('AuthProvider: Salvare credențiale...');
        const success = await persistCredentials(email, password);
        if (!success) {
          console.error('AuthProvider: Eroare la salvarea credențialelor');
          return false;
        }

        // 2. Setăm metoda de autentificare
        console.log('AuthProvider: Salvare metodă de autentificare...');
        await secureStorage.setItem(AUTH_METHOD_KEY, 'email');
        console.log('AuthProvider: Metoda de autentificare (email) salvată în secure storage');
        
        // 3. Salvăm token-urile (opțional - dacă eșuează, tot avem credențialele)
        try {
          console.log('AuthProvider: Salvare token-uri...');
          const token = await userCredential.user.getIdToken();
          await persistTokens({
            idToken: token,
            refreshToken: userCredential.user.refreshToken,
            expiresAt: Date.now() + AUTH_CONFIG.TOKEN_EXPIRY_MS
          });
        } catch (tokenError) {
          console.warn('AuthProvider: Eroare la salvarea token-urilor:', tokenError);
          // Continuăm chiar dacă eșuează salvarea token-urilor
        }

        // 4. Actualizăm starea
        handleUserStateChange(userCredential.user);
        setError(null);
        console.log('AuthProvider: Autentificare completă cu succes');
        return true;
      }
      return false;
    } catch (error: any) {
      if (error?.code === 'auth/too-many-requests') {
        lastReauthAttempt.current = Date.now() + (5 * 60 * 1000);
        setError('Prea multe încercări. Te rugăm așteaptă câteva minute.');
      } else {
        handleAuthError(error);
      }
      return false;
    } finally {
      setLoading(false);
    }
  }, [handleUserStateChange, handleAuthError, persistTokens, persistCredentials]);

  // Implementăm register
  const register = useCallback(async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    loadingRef.current = true;
    try {
      const auth = getFirebaseAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      if (userCredential.user) {
        console.log('AuthProvider: Registration successful');
        // Salvăm credențialele pentru autentificare automată
        await persistCredentials(email, password);
        handleUserStateChange(userCredential.user);
        return true;
      }
      return false;
    } catch (error: any) {
      if (error?.code === 'auth/email-already-in-use') {
        console.log('AuthProvider: Email already registered');
      } else if (error?.code === 'auth/invalid-email') {
        console.log('AuthProvider: Invalid email format');
      } else {
        console.error('AuthProvider: Unexpected registration error:', error);
      }
      handleAuthError(error);
      return false;
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [handleUserStateChange, persistCredentials, handleAuthError]);

  // Login cu Google
  const loginWithGoogle = useCallback(async (idToken: string, accessToken: string): Promise<boolean> => {
    setLoading(true);
    try {
      await withRetry(async () => {
        await persistTokens({
          idToken: idToken,
          refreshToken: accessToken,
          expiresAt: Date.now() + AUTH_CONFIG.TOKEN_EXPIRY_MS
        });
        await secureStorage.setItem(AUTH_METHOD_KEY, 'google');
        console.log('AuthProvider: Metoda de autentificare (google) salvată în secure storage');
        
        // Verificare persistență Google auth
        const verifyMethod = await secureStorage.getItem(AUTH_METHOD_KEY);
        if (verifyMethod !== 'google') {
          console.error('AuthProvider: Failed to persist Google auth method', { expected: 'google', got: verifyMethod });
          throw new Error('Failed to persist Google auth method');
        }
        console.log('AuthProvider: Google auth method persisted successfully:', verifyMethod);
      });

      const credential = GoogleAuthProvider.credential(idToken, accessToken);
      const userCredential = await signInWithCredential(getFirebaseAuth(), credential);
      setUser(userCredential.user);
      return true;
    } catch (error) {
      console.error('AuthProvider: Google login failed:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Logout și curățare state
   */
  const logout = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);
      isLoggingOut.current = true;
      
      console.log('AuthProvider: Început logout...');
      await getFirebaseAuth().signOut();
      
      // Curățare completă a datelor de autentificare
      await cleanupAuthData(false);
      
      setUser(null);
      setIsAuthenticated(false);
      console.log('AuthProvider: Logout finalizat cu succes');
      return true;
    } catch (error) {
      console.error('AuthProvider: Eroare logout:', error);
      return false;
    } finally {
      setLoading(false);
      isLoggingOut.current = false;
    }
  }, [cleanupAuthData]);

  // Salvăm referința pentru logout
  useEffect(() => {
    logoutRef.current = logout;
  }, [logout]);

  // Inițializare Firebase și setare listener
  useEffect(() => {
    if (listenerInitialized.current) return;
    listenerInitialized.current = true; // Setăm flag-ul imediat pentru a preveni multiple inițializări
    
    const initialize = async () => {
      try {
        await initializeFirebaseAuthPersistence();
        const auth = getFirebaseAuth();
        
        authListenerRef.current = onAuthStateChanged(auth, async (user) => {
          if (user) {
            console.log('AuthProvider: User detected - updating state');
            setUser(user);
            setError(null);
          } else if (!isLoggingOut.current) {
            console.log('AuthProvider: Attempting automatic reauth');
            const success = await attemptReauthentication();
            if (!success) {
              console.log('AuthProvider: Automatic reauth failed');
              setUser(null);
            }
          }
        });
      } catch (error) {
        console.error('AuthProvider: Auth listener setup error:', error);
        listenerInitialized.current = false;
        authListenerRef.current?.();
      }
    };

    initialize();

    return () => {
      authListenerRef.current?.();
      authListenerRef.current = null;
    };
  }, []);

  // Salvăm starea când se schimbă
  useEffect(() => {
    secureStorage.setItem(AUTH_STATE_KEY, JSON.stringify({
      isAuthenticated,
      timestamp: Date.now()
    }));
  }, [isAuthenticated]);

  // Pentru moment, vom expune state-ul și funcțiile de bază
  const contextValue: AuthContextValue = {
    isAuthenticated,
    isLoading: loading,
    loading, // pentru compatibilitate
    user,
    error,
    sessionExpired,
    setIsAuthenticated,
    login,
    register,
    loginWithGoogle,
    logout,
    attemptEmailReauth,
    checkStoredCredentials
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}
