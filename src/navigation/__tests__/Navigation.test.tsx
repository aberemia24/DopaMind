import React from 'react';
import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { Navigation } from '../index';
import { useAuth } from '../../hooks/useAuth';

// Mock hooks
jest.mock('../../hooks/useAuth', () => ({
  useAuth: jest.fn(() => ({
    isAuthenticated: false,
    loading: false,
    error: null
  }))
}));

// Mock screens
jest.mock('../../screens/LoginScreen', () => ({
  LoginScreen: () => null
}));

jest.mock('../../screens/RegisterScreen', () => ({
  RegisterScreen: () => null
}));

jest.mock('../../screens/HomeScreen', () => ({
  HomeScreen: () => null
}));

describe('Navigation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders auth stack when user is not authenticated', () => {
    (useAuth as jest.Mock).mockImplementation(() => ({
      isAuthenticated: false,
      loading: false,
      error: null
    }));

    const { getByTestId } = render(
      <NavigationContainer>
        <Navigation />
      </NavigationContainer>
    );

    expect(getByTestId('auth-stack')).toBeTruthy();
  });

  it('renders app stack when user is authenticated', () => {
    (useAuth as jest.Mock).mockImplementation(() => ({
      isAuthenticated: true,
      loading: false,
      error: null
    }));

    const { getByTestId } = render(
      <NavigationContainer>
        <Navigation />
      </NavigationContainer>
    );

    expect(getByTestId('app-stack')).toBeTruthy();
  });

  it('renders loading indicator when loading', () => {
    (useAuth as jest.Mock).mockImplementation(() => ({
      isAuthenticated: false,
      loading: true,
      error: null
    }));

    const { getByTestId } = render(
      <NavigationContainer>
        <Navigation />
      </NavigationContainer>
    );

    expect(getByTestId('loading-indicator')).toBeTruthy();
  });
});
