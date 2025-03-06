import * as Google from 'expo-auth-session/providers/google';
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/auth';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { GOOGLE_AUTH_TRANSLATIONS } from '../i18n/keys';
import { useTranslation } from 'react-i18next';
import * as Linking from 'expo-linking';

interface GoogleAuthState {
  isLoading: boolean;
  error: string | null;
  isReady: boolean;
}

export function useGoogleAuth() {
  const { t } = useTranslation();
  const { androidClientId, webClientId } = Constants.expoConfig?.extra?.googleAuth || {};
  const scheme = Constants.expoConfig?.scheme;
  
  const [state, setState] = useState<GoogleAuthState>({
    isLoading: false,
    error: null,
    isReady: false
  });
  
  // Verificăm dacă avem ID-urile clientului configurate
  useEffect(() => {
    console.log('useGoogleAuth: Verificare configurație ID-uri client', { 
      androidClientId, 
      webClientId,
      fromEnv: {
        android: process.env.EXPO_PUBLIC_GOOGLE_AUTH_ANDROID_CLIENT_ID,
        web: process.env.EXPO_PUBLIC_GOOGLE_AUTH_WEB_CLIENT_ID
      }
    });

    if (!androidClientId) {
      console.error('useGoogleAuth: Android Client ID nu este configurat în app.json');
      setState(prev => ({ ...prev, error: t(GOOGLE_AUTH_TRANSLATIONS.ERRORS.MISSING_CLIENT_ID) }));
    } else if (!webClientId && Platform.OS === 'android') {
      console.error('useGoogleAuth: Web Client ID nu este configurat în app.json');
      setState(prev => ({ ...prev, error: t(GOOGLE_AUTH_TRANSLATIONS.ERRORS.MISSING_CLIENT_ID) }));
    } else {
      setState(prev => ({ ...prev, isReady: true }));
      if (__DEV__) {
        console.log('useGoogleAuth: Client IDs configurate:', { androidClientId, webClientId });
        console.log('useGoogleAuth: Scheme:', scheme);
      }
    }
  }, [androidClientId, webClientId, scheme, t]);

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId,
    webClientId,
    redirectUri: Platform.select({
      android: `${scheme}://oauth2redirect/google`,
      default: Linking.createURL('/oauth2redirect/google')
    }),
    scopes: ['profile', 'email'],
    selectAccount: true,
    extraParams: {
      access_type: 'offline'
    }
  });

  const { loginWithGoogle } = useAuth();

  const handleGoogleSignIn = useCallback(async (idToken: string, accessToken: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      if (__DEV__) {
        console.log('useGoogleAuth: Începere proces de autentificare Google...');
      }

      const success = await loginWithGoogle(idToken, accessToken);
      
      if (!success) {
        throw new Error(t(GOOGLE_AUTH_TRANSLATIONS.ERRORS.AUTH_FAILED));
      }

      if (__DEV__) {
        console.log('useGoogleAuth: Autentificare Google reușită');
      }
    } catch (error) {
      console.error('useGoogleAuth error:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : t(GOOGLE_AUTH_TRANSLATIONS.ERRORS.UNKNOWN)
      }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [loginWithGoogle, t]);

  // Procesăm răspunsul de la Google
  useEffect(() => {
    if (response?.type === 'success' && response.authentication) {
      const { idToken, accessToken } = response.authentication;
      
      if (idToken && accessToken) {
        handleGoogleSignIn(idToken, accessToken);
      } else {
        console.error('useGoogleAuth: Lipsesc token-urile', response.authentication);
        setState(prev => ({ 
          ...prev, 
          error: t(GOOGLE_AUTH_TRANSLATIONS.ERRORS.MISSING_TOKENS)
        }));
      }
    } else if (response?.type === 'error') {
      console.error('useGoogleAuth: Eroare de autentificare Google', {
        error: response.error,
        errorCode: response.error?.code,
        errorDescription: response.error?.description
      });
      
      setState(prev => ({ 
        ...prev, 
        error: response.error?.message || t(GOOGLE_AUTH_TRANSLATIONS.ERRORS.UNKNOWN)
      }));
    }
  }, [response, handleGoogleSignIn, t]);

  const signInWithGoogle = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, error: null }));
      
      if (!request) {
        throw new Error(t(GOOGLE_AUTH_TRANSLATIONS.ERRORS.REQUEST_NOT_READY));
      }

      // Adăugăm loguri pentru debugging
      console.log('Config autentificare Google:', { 
        androidClientId, 
        webClientId, 
        scheme,
        redirectUri: Platform.select({
          android: `${scheme}://oauth2redirect/google`,
          default: Linking.createURL('/oauth2redirect/google')
        }),
        requestAvailable: !!request
      });

      console.log('Înainte de promptAsync()');
      const result = await promptAsync();
      console.log('După promptAsync() - rezultat:', result);
    } catch (error) {
      console.error('signInWithGoogle error:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : t(GOOGLE_AUTH_TRANSLATIONS.ERRORS.UNKNOWN)
      }));
    }
  }, [request, promptAsync, t, androidClientId, webClientId, scheme]);

  // Curățăm starea la unmount
  useEffect(() => {
    return () => {
      setState({
        isLoading: false,
        error: null,
        isReady: false
      });
    };
  }, []);

  return {
    signInWithGoogle,
    isLoading: state.isLoading,
    error: state.error,
    isReady: state.isReady && !!request
  };
}
