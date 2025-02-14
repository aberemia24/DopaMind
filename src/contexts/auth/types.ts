import { User } from 'firebase/auth';

export interface StoredCredentials {
  email: string;
  password: string;
  salt: string;
  timestamp: number;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  sessionExpired: boolean;
}

export interface AuthContextValue extends AuthState {
  setIsAuthenticated: (value: boolean) => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<boolean>;
}
