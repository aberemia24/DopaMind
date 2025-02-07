import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { RegisterScreen } from '../RegisterScreen';
import { useAuth } from '../../hooks/useAuth';
import { useNavigation } from '@react-navigation/native';

// Mock hooks
jest.mock('../../hooks/useAuth', () => ({
  useAuth: jest.fn(() => ({
    register: jest.fn(),
    error: null
  }))
}));

jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(() => ({
    navigate: jest.fn()
  }))
}));

describe('RegisterScreen', () => {
  const mockRegister = jest.fn();
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockImplementation(() => ({
      register: mockRegister,
      error: null
    }));
    (useNavigation as jest.Mock).mockImplementation(() => ({
      navigate: mockNavigate
    }));
  });

  it('renders register form', () => {
    const { getByPlaceholderText, getByText } = render(<RegisterScreen />);

    expect(getByPlaceholderText('Email')).toBeTruthy();
    expect(getByPlaceholderText('Password')).toBeTruthy();
    expect(getByPlaceholderText('Confirm Password')).toBeTruthy();
    expect(getByText('Register')).toBeTruthy();
  });

  it('calls register when form is submitted with matching passwords', async () => {
    mockRegister.mockResolvedValueOnce(true);
    const { getByPlaceholderText, getByText } = render(<RegisterScreen />);

    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'password123');
    fireEvent.press(getByText('Register'));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('shows error when passwords do not match', async () => {
    const { getByPlaceholderText, getByText } = render(<RegisterScreen />);

    fireEvent.changeText(getByPlaceholderText('Email'), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText('Password'), 'password123');
    fireEvent.changeText(getByPlaceholderText('Confirm Password'), 'different');
    fireEvent.press(getByText('Register'));

    expect(getByText('Passwords do not match')).toBeTruthy();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('shows error when fields are empty', () => {
    const { getByText } = render(<RegisterScreen />);

    fireEvent.press(getByText('Register'));

    expect(getByText('Please fill in all fields')).toBeTruthy();
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it('shows auth error when registration fails', () => {
    const error = 'Registration failed';
    (useAuth as jest.Mock).mockImplementation(() => ({
      register: mockRegister,
      error
    }));

    const { getByText } = render(<RegisterScreen />);

    expect(getByText(error)).toBeTruthy();
  });

  it('navigates to login screen when login link is pressed', () => {
    const { getByText } = render(<RegisterScreen />);

    fireEvent.press(getByText('Already have an account? Login'));

    expect(mockNavigate).toHaveBeenCalledWith('Login');
  });
});
