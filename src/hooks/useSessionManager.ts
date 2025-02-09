import { useRef, useEffect, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from 'firebase/auth';
import { SESSION_CONFIG } from '../config/environment';
import { getFirebaseAuth } from '../config/firebase';

const LAST_ACTIVITY_KEY = '@last_activity';
const USER_TOKEN_KEY = '@user_token';

export interface SessionManagerConfig {
  onSessionExpired: () => Promise<void>;
  onTokenRefreshed?: () => void;
}

export function useSessionManager({ onSessionExpired, onTokenRefreshed }: SessionManagerConfig) {
  const sessionCheckTimer = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  const updateLastActivity = useCallback(async () => {
    const timestamp = Date.now();
    lastActivityRef.current = timestamp;
    try {
      await AsyncStorage.setItem(LAST_ACTIVITY_KEY, timestamp.toString());
      console.log('SessionManager: Last activity updated');
    } catch (error) {
      console.error('SessionManager: Error updating last activity:', error);
    }
  }, []);

  const refreshUserSession = useCallback(async () => {
    const auth = getFirebaseAuth();
    const currentUser = auth.currentUser;

    if (currentUser) {
      try {
        const newToken = await currentUser.getIdToken(true);
        await AsyncStorage.setItem(USER_TOKEN_KEY, newToken);
        await updateLastActivity();
        console.log('SessionManager: Token refreshed successfully');
        onTokenRefreshed?.();
      } catch (error) {
        console.error('SessionManager: Error refreshing token:', error);
        await onSessionExpired();
      }
    }
  }, [onSessionExpired, onTokenRefreshed, updateLastActivity]);

  const checkSessionTimeout = useCallback(async () => {
    // Nu verificăm timeout-ul dacă aplicația este în background
    if (appStateRef.current !== 'active') {
      return;
    }

    const now = Date.now();
    const timeSinceLastActivity = now - lastActivityRef.current;

    if (timeSinceLastActivity >= SESSION_CONFIG.TIMEOUT_MS) {
      console.log('SessionManager: Session timeout');
      await onSessionExpired();
      return;
    }

    if (timeSinceLastActivity >= SESSION_CONFIG.REFRESH_THRESHOLD_MS) {
      console.log('SessionManager: Token refresh needed');
      await refreshUserSession();
    }
  }, [onSessionExpired, refreshUserSession]);

  // Inițializare și cleanup pentru timer
  useEffect(() => {
    // Încărcăm ultima activitate din storage la inițializare
    const loadLastActivity = async () => {
      try {
        const storedActivity = await AsyncStorage.getItem(LAST_ACTIVITY_KEY);
        if (storedActivity) {
          lastActivityRef.current = parseInt(storedActivity, 10);
        }
      } catch (error) {
        console.error('SessionManager: Error loading last activity:', error);
      }
    };

    loadLastActivity();
    sessionCheckTimer.current = setInterval(checkSessionTimeout, 60000);

    return () => {
      if (sessionCheckTimer.current) {
        clearInterval(sessionCheckTimer.current);
        sessionCheckTimer.current = null;
      }
    };
  }, [checkSessionTimeout]);

  // Handler pentru evenimente de background/foreground
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (
        appStateRef.current.match(/inactive|background/) && 
        nextAppState === 'active'
      ) {
        console.log('SessionManager: App has come to foreground');
        await updateLastActivity();
        await checkSessionTimeout();
      }
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [updateLastActivity, checkSessionTimeout]);

  return {
    updateLastActivity,
    refreshUserSession
  };
}
