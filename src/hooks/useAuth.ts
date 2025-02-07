import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { getFirebaseAuth, signInWithEmail, signUpWithEmail, signOut, isAuthError, initializeFirebaseAuth } from '../config/firebase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    console.log('useAuth: Initializing...');
    let unsubscribe: () => void;

    const initAuth = async () => {
      try {
        console.log('useAuth: Initializing Firebase Auth...');
        await initializeFirebaseAuth();
        console.log('useAuth: Firebase Auth initialized');

        console.log('useAuth: Setting up auth listener...');
        const auth = getFirebaseAuth();
        unsubscribe = onAuthStateChanged(auth, 
          (user) => {
            console.log('useAuth: Auth state changed:', { user: user ? 'exists' : 'null' });
            setUser(user);
            setIsAuthenticated(!!user);
            setLoading(false);
          }, 
          (error) => {
            console.error('useAuth: Auth error:', error);
            setError(error.message);
            setIsAuthenticated(false);
            setLoading(false);
          }
        );

        console.log('useAuth: Auth listener setup complete');
      } catch (error) {
        console.error('useAuth: Error initializing auth:', error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
        setIsAuthenticated(false);
        setLoading(false);
      }
    };

    initAuth();

    return () => {
      console.log('useAuth: Cleaning up auth listener...');
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('useAuth: Attempting login...');
      setError(null);
      const result = await signInWithEmail(email, password);
      if (isAuthError(result)) {
        console.error('useAuth: Login error:', result);
        setError(result.message);
        return false;
      }
      console.log('useAuth: Login successful');
      return true;
    } catch (error) {
      console.error('useAuth: Unexpected login error:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
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
      console.log('useAuth: Attempting logout...');
      setError(null);
      const result = await signOut();
      if (isAuthError(result)) {
        console.error('useAuth: Logout error:', result);
        setError(result.message);
        return false;
      }
      console.log('useAuth: Logout successful');
      return true;
    } catch (error) {
      console.error('useAuth: Unexpected logout error:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      return false;
    }
  };

  return {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout
  };
}
