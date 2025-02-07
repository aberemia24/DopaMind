import { renderHook, act } from '@testing-library/react-native';
import { useAuth } from '../useAuth';
import { getFirebaseAuth, signInWithEmail, signUpWithEmail, signOut } from '../../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

// Mock Firebase functions
jest.mock('../../config/firebase', () => ({
  getFirebaseAuth: () => ({
    currentUser: null,
  }),
  signInWithEmail: jest.fn(),
  signUpWithEmail: jest.fn(),
  signOut: jest.fn(),
  isAuthError: (result: any) => result && 'code' in result && 'message' in result,
}));

jest.mock('firebase/auth', () => ({
  onAuthStateChanged: jest.fn(),
}));

describe('useAuth', () => {
  let authStateCallback: ((user: any) => void) | null = null;

  beforeEach(() => {
    // Reset mocks
    (onAuthStateChanged as jest.Mock).mockImplementation((auth, callback) => {
      authStateCallback = callback;
      return () => {};
    });
    (signInWithEmail as jest.Mock).mockReset();
    (signUpWithEmail as jest.Mock).mockReset();
    (signOut as jest.Mock).mockReset();
  });

  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.loading).toBe(true);
    expect(result.current.user).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should handle successful login', async () => {
    const mockUser = { uid: '123', email: 'test@example.com' };
    (signInWithEmail as jest.Mock).mockResolvedValueOnce({ user: mockUser });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      const success = await result.current.login('test@example.com', 'password');
      expect(success).toBe(true);
    });

    expect(result.current.error).toBeNull();
  });

  it('should handle login error', async () => {
    const mockError = { code: 'auth/wrong-password', message: 'Invalid password' };
    (signInWithEmail as jest.Mock).mockResolvedValueOnce(mockError);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      const success = await result.current.login('test@example.com', 'password');
      expect(success).toBe(false);
    });

    expect(result.current.error).toBe(mockError.message);
  });

  it('should handle successful registration', async () => {
    const mockUser = { uid: '123', email: 'test@example.com' };
    (signUpWithEmail as jest.Mock).mockResolvedValueOnce({ user: mockUser });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      const success = await result.current.register('test@example.com', 'password');
      expect(success).toBe(true);
    });

    expect(result.current.error).toBeNull();
  });

  it('should handle registration error', async () => {
    const mockError = { code: 'auth/email-already-in-use', message: 'Email already in use' };
    (signUpWithEmail as jest.Mock).mockResolvedValueOnce(mockError);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      const success = await result.current.register('test@example.com', 'password');
      expect(success).toBe(false);
    });

    expect(result.current.error).toBe(mockError.message);
  });

  it('should handle successful logout', async () => {
    (signOut as jest.Mock).mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      const success = await result.current.logout();
      expect(success).toBe(true);
    });

    expect(result.current.error).toBeNull();
  });

  it('should handle logout error', async () => {
    const mockError = { code: 'auth/no-current-user', message: 'No user signed in' };
    (signOut as jest.Mock).mockResolvedValueOnce(mockError);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      const success = await result.current.logout();
      expect(success).toBe(false);
    });

    expect(result.current.error).toBe(mockError.message);
  });

  it('should update auth state when user changes', () => {
    const mockUser = { uid: '123', email: 'test@example.com' };
    const { result } = renderHook(() => useAuth());

    act(() => {
      if (authStateCallback) {
        authStateCallback(mockUser);
      }
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.loading).toBe(false);
    expect(result.current.isAuthenticated).toBe(true);
  });
});
