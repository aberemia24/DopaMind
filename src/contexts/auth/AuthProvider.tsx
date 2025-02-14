import React, { useState, useRef, useCallback, useEffect } from 'react';
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { useTranslation } from 'react-i18next';
import { AuthContext } from './AuthContext';
import type { AuthContextValue } from './types';
import { useSessionManager } from '../../hooks/useSessionManager';
import { ERROR_TRANSLATIONS } from '../../i18n/keys';
import { 
  initializeFirebaseAuth,
  getFirebaseAuth
} from '../../config/firebase';

// Singleton pentru inițializarea Firebase Auth
let authInitialized = false;

interface AuthProviderProps {
  children: React.ReactNode;
}

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

  // Referințe pentru a evita re-renderurile inutile
  const userRef = useRef<User | null>(null);
  const loadingRef = useRef(true);
  const isAuthenticatedRef = useRef(false);
  const authListenerRef = useRef<(() => void) | null>(null);
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

  // Gestionăm erorile de autentificare
  const handleAuthError = useCallback((error: unknown) => {
    console.error('useAuth: Auth error:', error);
    setError(null);
    setTimeout(() => {
      setError(error instanceof Error ? error.message : t(ERROR_TRANSLATIONS.AUTH.DEFAULT));
    }, 100);
    setLoading(false);
  }, [t]);

  // Gestionăm schimbările de stare ale utilizatorului
  const handleUserStateChange = useCallback((newUser: User | null) => {
    const prevUser = userRef.current;
    if (prevUser?.uid === newUser?.uid) {
      return;
    }

    userRef.current = newUser;
    const newAuthState = !!newUser;

    if (isAuthenticatedRef.current !== newAuthState) {
      isAuthenticatedRef.current = newAuthState;
      setIsAuthenticated(newAuthState);
    }

    if (prevUser !== newUser) {
      setUser(newUser);
      if (newUser) {
        updateLastActivity();
        setSessionExpired(false);
      }
      
      const changeType = prevUser === null ? 'login' : newUser === null ? 'logout' : 'update';
      console.log(`useAuth: User state changed (${changeType}) - ${newUser ? 'authenticated' : 'unauthenticated'}`);
    }
  }, [updateLastActivity]);

  // Implementăm login
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      loadingRef.current = true;
      
      const auth = getFirebaseAuth();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      if (userCredential.user) {
        console.log('useAuth: Login successful');
        return true;
      }
      return false;
    } catch (error) {
      console.error('useAuth: Login failed:', error);
      handleAuthError(error);
      return false;
    }
  }, [handleAuthError]);

  // Implementăm register
  const register = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      loadingRef.current = true;
      
      const auth = getFirebaseAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      if (userCredential.user) {
        console.log('useAuth: Registration successful');
        return true;
      }
      return false;
    } catch (error) {
      console.error('useAuth: Registration failed:', error);
      handleAuthError(error);
      return false;
    }
  }, [handleAuthError]);

  /**
   * Curăță datele de autentificare și starea
   */
  const cleanupAuthData = useCallback(async () => {
    try {
      setUser(null);
      setIsAuthenticated(false);
      isAuthenticatedRef.current = false;
      userRef.current = null;
      setSessionExpired(false);
      setError(null);
      return true;
    } catch (error) {
      console.error('useAuth: Error cleaning up auth data:', error);
      return false;
    }
  }, []);

  /**
   * Logout și curățare state
   */
  const logout = useCallback(async (): Promise<boolean> => {
    try {
      setLoading(true);
      loadingRef.current = true;

      const auth = getFirebaseAuth();
      await signOut(auth);
      await cleanupAuthData();
      
      console.log('useAuth: Logout successful');
      return true;
    } catch (error) {
      console.error('useAuth: Logout failed:', error);
      handleAuthError(error);
      return false;
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [cleanupAuthData, handleAuthError]);

  // Setăm referința pentru logout
  useEffect(() => {
    logoutRef.current = logout;
  }, [logout]);

  // Pentru moment, vom expune state-ul și funcțiile de bază
  const contextValue: AuthContextValue = {
    user,
    loading,
    error,
    isAuthenticated,
    sessionExpired,
    setIsAuthenticated,
    login,
    register,
    logout
  };

  // Efect pentru inițializare și listener
  useEffect(() => {
    const initAndListen = async () => {
      try {
        if (!authInitialized) {
          console.log('useAuth: Initializing Firebase Auth...');
          await initializeFirebaseAuth();
          authInitialized = true;
        }
        
        console.log('useAuth: Setting up auth state listener...');
        if (authListenerRef.current) {
          console.log('useAuth: Removing existing listener before adding a new one');
          authListenerRef.current();
          authListenerRef.current = null;
        }
        
        const auth = getFirebaseAuth();
        authListenerRef.current = onAuthStateChanged(auth, (newUser) => {
          handleUserStateChange(newUser);
          if (loadingRef.current) {
            loadingRef.current = false;
            setLoading(false);
          }
        });
      } catch (error) {
        console.error('useAuth: Error in initialization:', error);
        handleAuthError(error);
      }
    };

    initAndListen();

    return () => {
      if (authListenerRef.current) {
        console.log('useAuth: Cleaning up auth listener...');
        authListenerRef.current();
        authListenerRef.current = null;
      }
    };
  }, [handleUserStateChange, handleAuthError]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}
