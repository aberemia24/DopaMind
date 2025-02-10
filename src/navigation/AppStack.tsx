import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabNavigator } from './TabNavigator';
import TaskManagementScreen from '../screens/task-management/TaskManagementScreen';
import { useTranslation } from 'react-i18next';

export type AppStackParamList = {
  MainTabs: undefined;
  TaskManagement: undefined; // Pentru backwards compatibility
};

const Stack = createNativeStackNavigator<AppStackParamList>();

export function AppStack() {
  const { t } = useTranslation();

  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="MainTabs" 
        component={TabNavigator}
        options={{
          headerShown: false
        }}
      />
      {/* Pentru backwards compatibility - redirectează la tab-ul Tasks */}
      <Stack.Screen 
        name="TaskManagement" 
        component={TaskManagementScreen}
        options={{
          title: t('navigation.titles.taskManagement')
        }}
      />
    </Stack.Navigator>
  );
}
