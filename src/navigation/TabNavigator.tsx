import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';
import { ACCESSIBILITY } from '../constants/accessibility';

// Screens
import TaskManagementScreen from '../screens/task-management/TaskManagementScreen';
import CalendarScreen from '../screens/calendar/CalendarScreen';
import FocusScreen from '../screens/focus/FocusScreen';
import StatsScreen from '../screens/stats/StatsScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';

export type TabParamList = {
  Tasks: undefined;
  Calendar: undefined;
  Focus: undefined;
  Stats: undefined;
  Settings: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

export function TabNavigator() {
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: ACCESSIBILITY.COLORS.INTERACTIVE.PRIMARY,
        tabBarInactiveTintColor: ACCESSIBILITY.COLORS.TEXT.SECONDARY,
        tabBarStyle: {
          height: ACCESSIBILITY.TOUCH_TARGET.MIN_HEIGHT,
          paddingBottom: ACCESSIBILITY.SPACING.XS,
          paddingTop: ACCESSIBILITY.SPACING.XS,
        },
        tabBarLabelStyle: {
          fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.XS,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Tasks"
        component={TaskManagementScreen}
        options={{
          title: t('navigation.tabs.tasks'),
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="check-box" size={size} color={color} />
          ),
        }}
      />
      
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          title: t('navigation.tabs.calendar'),
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="calendar-today" size={size} color={color} />
          ),
        }}
      />
      
      <Tab.Screen
        name="Focus"
        component={FocusScreen}
        options={{
          title: t('navigation.tabs.focus'),
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="center-focus-strong" size={size} color={color} />
          ),
        }}
      />
      
      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{
          title: t('navigation.tabs.stats'),
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="insert-chart" size={size} color={color} />
          ),
        }}
      />
      
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: t('navigation.tabs.settings'),
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
