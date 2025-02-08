import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { getFirebaseAuth, signInWithEmail, signUpWithEmail, signOut as firebaseSignOut, isAuthError, initializeFirebaseAuth } from '../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_STATE_KEY = '@auth_state';
const AUTH_CREDENTIALS_KEY = '@auth_credentials';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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
        const result = await signInWithEmail(email, password);
        if (!isAuthError(result)) {
          console.log('useAuth: Reauth successful');
          return true;
        }
      }
    } catch (error) {
      console.error('useAuth: Reauth failed:', error);
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
        
        // Încercăm reautentificarea la pornire
        await attemptReauthentication();

        console.log('useAuth: Setting up auth state listener...');
        unsubscribe = onAuthStateChanged(auth, 
          async (user) => {
            console.log('useAuth: Auth state changed:', { 
              user: user ? 'exists' : 'null',
              emailVerified: user?.emailVerified,
              providerId: user?.providerId 
            });
            
            setUser(user);
            setIsAuthenticated(!!user);
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
      const result = await signInWithEmail(email, password);
      if (isAuthError(result)) {
        setError(result.message);
        return false;
      }
      // Salvăm credențialele la login reușit
      await persistCredentials(email, password);
      return true;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
      return false;
    }
  };

  const register = async (email: string, password: string) => {
    try {
      console.log('useAuth: Attempting registration...');
      setError(null);
      const result = await signUpWithEmail(email, password);
      if (isAuthError(result)) {
        console.error('useAuth: Registration error:', result);
        setError(result.message);
        return false;
      }
      console.log('useAuth: Registration successful');
      return true;
    } catch (error) {
      console.error('useAuth: Unexpected registration error:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      return false;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await firebaseSignOut();
      await AsyncStorage.removeItem(AUTH_CREDENTIALS_KEY);
      return true;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Logout failed');
      return false;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    signUp: signUpWithEmail,
    signOut,
  };
}
