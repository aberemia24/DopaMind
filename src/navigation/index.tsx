import React, { useRef, useCallback } from 'react';
import { NavigationContainer, NavigationState } from '@react-navigation/native';
import { useAuth } from '../contexts/auth';
import { ActivityIndicator, View } from 'react-native';
import { AuthStack } from './AuthStack';
import { AppStack } from './AppStack';
import { useAuthMiddleware } from './middleware/authMiddleware';

export function Navigation() {
  const { isAuthenticated, loading, setIsAuthenticated } = useAuth();
  const navigationRef = useRef(null);
  const routeNameRef = useRef<string | undefined>();

  // Handler pentru când accesul este refuzat
  const handleAccessDenied = useCallback(() => {
    if (navigationRef.current) {
      // Forțăm reîncărcarea stării de autentificare
      // Acest lucru va determina re-renderul Navigation și afișarea AuthStack
      setIsAuthenticated(false);
    }
  }, [setIsAuthenticated]);

  // Folosim hook-ul în componenta principală
  const { checkAccess } = useAuthMiddleware({
    onDeny: handleAccessDenied
  });

  // Configurare middleware de autentificare
  const handleStateChange = useCallback((state: NavigationState | undefined) => {
    if (state) {
      // Salvăm numele rutei curente pentru tracking
      const currentRouteName = state.routes[state.index].name;
      routeNameRef.current = currentRouteName;

      // Verificăm accesul la rută folosind instanța existentă
      checkAccess(state);
    }
  }, [checkAccess]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6495ED" />
      </View>
    );
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      onStateChange={handleStateChange}
    >
      {isAuthenticated ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
