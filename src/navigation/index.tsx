import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import TaskManagementScreen from '../screens/TaskManagementScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { useAuth } from '../hooks/useAuth';
import { ActivityIndicator, View } from 'react-native';

export type RootStackParamList = {
  Home: undefined;
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  TaskManagement: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function Navigation() {
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    console.log('Navigation state:', { loading, isAuthenticated });
  }, [loading, isAuthenticated]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#6495ED" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#6495ED',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {!isAuthenticated ? (
          <Stack.Group screenOptions={{ headerShown: false }}>
            <Stack.Screen 
              name="Welcome" 
              component={WelcomeScreen}
            />
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{
                headerShown: true,
                title: 'Conectare'
              }}
            />
            <Stack.Screen 
              name="Register" 
              component={RegisterScreen}
              options={{
                headerShown: true,
                title: 'Înregistrare'
              }}
            />
          </Stack.Group>
        ) : (
          <Stack.Group>
            <Stack.Screen 
              name="TaskManagement" 
              component={TaskManagementScreen}
              options={{
                title: 'DopaMind - Tasks',
                headerBackVisible: false,
              }}
            />
            <Stack.Screen 
              name="Home" 
              component={HomeScreen}
              options={{
                title: 'DopaMind'
              }}
            />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
