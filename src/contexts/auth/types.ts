import { User } from 'firebase/auth';

export const AUTH_CONFIG = {
  CREDENTIALS_MAX_AGE_MS: 7 * 24 * 60 * 60 * 1000, // 7 zile
  MAX_RETRY_ATTEMPTS: 3,
  RETRY_BASE_DELAY: 500
} as const;

export interface StoredCredentials {
  email: string;
  password: string;
  timestamp: number;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  sessionExpired: boolean;
}

export interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  loading: boolean; 
  user: User | null;
  error: string | null;
  sessionExpired: boolean;
  setIsAuthenticated: (value: boolean) => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<boolean>;
  loginWithGoogle: (idToken: string, accessToken: string) => Promise<boolean>;
  attemptEmailReauth: (email: string, password: string) => Promise<boolean>;
  checkStoredCredentials: () => Promise<StoredCredentials | null>;
}
