import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/HomeScreen';
import TaskManagementScreen from '../screens/TaskManagementScreen';
import { useTranslation } from 'react-i18next';

export type AppStackParamList = {
  TaskManagement: undefined;
  Home: undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

export function AppStack() {
  const { t } = useTranslation();

  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="TaskManagement" 
        component={TaskManagementScreen}
        options={{
          title: t('navigation.titles.taskManagement'),
          headerBackVisible: false,
        }}
      />
      <Stack.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: t('navigation.titles.home')
        }}
      />
    </Stack.Navigator>
  );
}
