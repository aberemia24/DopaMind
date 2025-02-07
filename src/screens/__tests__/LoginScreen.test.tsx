import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { LoginScreen } from '../LoginScreen';
import { useAuth } from '../../hooks/useAuth';
import { useNavigation } from '@react-navigation/native';

// Mock hooks
jest.mock('../../hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

describe('LoginScreen', () => {
  const mockLogin = jest.fn();
  const mockNavigate = jest.fn();

  beforeEach(() => {
    // Setup useAuth mock
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
      error: null,
    });

    // Setup useNavigation mock
    (useNavigation as jest.Mock).mockReturnValue({
      navigate: mockNavigate,
    });

    // Clear mocks
    mockLogin.mockClear();
    mockNavigate.mockClear();
  });

  it('renders correctly', () => {
    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    
    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByText('Login')).toBeTruthy();
    expect(getByText("Don't have an account? Register")).toBeTruthy();
  });

  it('handles successful login', async () => {
    mockLogin.mockResolvedValueOnce(true);

    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('handles login failure', async () => {
    mockLogin.mockResolvedValueOnce(false);

    const { getByPlaceholderText, getByText } = render(<LoginScreen />);
    
    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'wrong-password');
    fireEvent.press(getByText('Login'));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'wrong-password');
    });
  });

  it('navigates to register screen when register link is pressed', () => {
    const { getByText } = render(<LoginScreen />);
    
    fireEvent.press(getByText("Don't have an account? Register"));
    
    expect(mockNavigate).toHaveBeenCalledWith('Register');
  });

  it('validates email and password before submission', async () => {
    const { getByText } = render(<LoginScreen />);
    
    fireEvent.press(getByText('Login'));

    expect(mockLogin).not.toHaveBeenCalled();
  });
});
