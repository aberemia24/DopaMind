import { useState, useEffect } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';

const AUTH_STATE_KEY = '@auth_state';
const AUTH_CREDENTIALS_KEY = '@auth_credentials';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { t } = useTranslation();

  // Salvăm credențialele la login
  const persistCredentials = async (email: string, password: string) => {
    try {
      await AsyncStorage.setItem(AUTH_CREDENTIALS_KEY, JSON.stringify({ email, password }));
      console.log('useAuth: Credentials saved successfully');
    } catch (error) {
      console.error('useAuth: Error saving credentials:', error);
    }
  };

  // Încercăm reautentificarea cu credențialele salvate
  const attemptReauthentication = async () => {
    try {
      const savedCredentialsString = await AsyncStorage.getItem(AUTH_CREDENTIALS_KEY);
      if (savedCredentialsString) {
        const { email, password } = JSON.parse(savedCredentialsString);
        console.log('useAuth: Attempting reauth with saved credentials');
        const result = await signInWithEmail(email, password, t);
        if (result.status === 'success' && result.data) {
          console.log('useAuth: Reauth successful');
          return true;
        } else {
          console.log('useAuth: Reauth failed, clearing credentials');
          await AsyncStorage.removeItem(AUTH_CREDENTIALS_KEY);
        }
      }
    } catch (error) {
      console.error('useAuth: Reauth failed:', error);
      await AsyncStorage.removeItem(AUTH_CREDENTIALS_KEY);
    }
    return false;
  };

  useEffect(() => {
    console.log('useAuth: Initializing...');
    let unsubscribe: () => void;

    const initAuth = async () => {
      try {
        console.log('useAuth: Initializing Firebase Auth...');
        const auth = await initializeFirebaseAuth();
        
        console.log('useAuth: Setting up auth state listener...');
        unsubscribe = onAuthStateChanged(auth, 
          async (user) => {
            console.log('useAuth: Auth state changed:', { 
              user: user ? 'exists' : 'null',
              emailVerified: user?.emailVerified,
              providerId: user?.providerId 
            });
            
            if (!user) {
              // Doar încercăm reautentificarea dacă nu avem user
              const reauthed = await attemptReauthentication();
              if (!reauthed) {
                setUser(null);
                setIsAuthenticated(false);
              }
            } else {
              setUser(user);
              setIsAuthenticated(true);
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
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const result = await signInWithEmail(email, password, t);
      if (result.status === 'error' && result.error) {
        setError(result.error.message);
        return false;
      }
      if (result.status === 'success' && result.data) {
        setUser(result.data.user);
        setIsAuthenticated(true);
        await persistCredentials(email, password);
        return true;
      }
      return false;
    } catch (error) {
      setError(t('auth.errors.generic'));
      return false;
    }
  };

  const register = async (email: string, password: string) => {
    try {
      setError(null);
      const result = await signUpWithEmail(email, password, t);
      if (result.status === 'error' && result.error) {
        setError(result.error.message);
        return false;
      }
      if (result.status === 'success' && result.data) {
        setUser(result.data.user);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      setError(t('auth.errors.generic'));
      return false;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      setLoading(true); // Setăm loading pentru a preveni flashuri UI

      // Mai întâi ștergem credențialele locale
      await AsyncStorage.removeItem(AUTH_CREDENTIALS_KEY);
      
      // La final facem logout din Firebase
      const result = await firebaseSignOut();
      
      if (result.status === 'error' && result.error) {
        setError(result.error.message);
        setLoading(false);
        return false;
      }
      
      // Apoi actualizăm starea
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      
      return true;
    } catch (error) {
      setLoading(false);
      setError(error instanceof Error ? error.message : 'Logout failed');
      return false;
    }
  };

  return {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    register
  };
}
