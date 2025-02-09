import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { initializeFirebaseApp, initializeFirebaseAuth, initializeFirestore } from './src/config/firebase';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Navigation } from './src/navigation';
import { GlobalErrorBoundary } from './src/core/error/ErrorBoundary';
import './src/i18n';  // Import i18n configuration

export default function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('Starting Firebase initialization...');
        initializeFirebaseApp();
        initializeFirebaseAuth();
        initializeFirestore();
        console.log('Firebase initialized successfully');
        setIsInitializing(false);
      } catch (err) {
        console.error('Error initializing Firebase:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setIsInitializing(false);
      }
    };

    initialize();
  }, []);

  if (isInitializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6495ED" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'red' }}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <GlobalErrorBoundary>
      <SafeAreaProvider>
        <Navigation />
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </GlobalErrorBoundary>
  );
}
