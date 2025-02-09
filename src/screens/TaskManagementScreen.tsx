import React, { useState, useEffect } from 'react';
import { 
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
  Text,
} from 'react-native';
import TimeSection from '../components/TaskManagement/TimeSection';
import TaskFilter, { FilterOption } from '../components/TaskManagement/TaskFilter';
import { TIME_PERIODS, type TimePeriodKey } from '../constants/taskTypes';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';
import type { Task } from '../services/taskService';
import { ACCESSIBILITY } from '../constants/accessibility';
import { useTaskContext } from '../contexts/TaskContext';

const TaskManagementScreen: React.FC = () => {
  const { logout, user, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const { tasks, loading, error, addTask, updateTask, deleteTask, toggleTask } = useTaskContext();
  const [currentFilter, setCurrentFilter] = useState<FilterOption>('all');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Monitorizăm starea de autentificare 
  useEffect(() => {
    if (!isAuthenticated && isLoggingOut) {
      // Handle logout completion
    }
  }, [isAuthenticated, isLoggingOut]);

  const filterTasks = (taskList: Task[]): Task[] => {
    switch (currentFilter) {
      case 'active':
        return taskList.filter(task => !task.completed);
      case 'completed':
        return taskList.filter(task => task.completed);
      case 'priority':
        return taskList.filter(task => task.isPriority);
      default:
        return taskList;
    }
  };

  const getFilterCounts = () => {
    const allTasks = [...tasks.MORNING, ...tasks.AFTERNOON, ...tasks.EVENING];
    return {
      all: allTasks.length,
      active: allTasks.filter(task => !task.completed).length,
      completed: allTasks.filter(task => task.completed).length,
      priority: allTasks.filter(task => task.isPriority).length
    };
  };

  const getTotalTaskCount = (): number => {
    return tasks.MORNING.length + tasks.AFTERNOON.length + tasks.EVENING.length;
  };

  const showSoftLimitWarning = (periodId: TimePeriodKey, onConfirm: () => void): void => {
    if (getTotalTaskCount() >= 3) {
      Alert.alert(
        t('taskManagement.alerts.softLimit.title'),
        t('taskManagement.alerts.softLimit.message'),
        [
          {
            text: t('common.buttons.cancel'),
            style: "cancel"
          },
          {
            text: t('taskManagement.alerts.softLimit.confirm'),
            onPress: onConfirm
          }
        ]
      );
    } else {
      onConfirm();
    }
  };

  const handleAddTask = async (periodId: TimePeriodKey) => {
    if (!user?.uid) {
      Alert.alert(
        t('common.error'),
        t('taskManagement.errors.notAuthenticated')
      );
      return;
    }

    showSoftLimitWarning(periodId, async () => {
      const newTask: Task = {
        id: Date.now().toString(),
        title: '',
        completed: false,
        createdAt: new Date().toISOString(),
        userId: user.uid,
        isPriority: false,
        periodId
      };

      try {
        await addTask(periodId, newTask);
      } catch (error) {
        Alert.alert(
          t('common.error'),
          t('taskManagement.errors.addTask')
        );
      }
    });
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      // Nu mai avem nevoie de nicio logică de navigare
      // Navigarea se face automat prin schimbarea lui isAuthenticated
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggingOut(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{t('taskManagement.title')}</Text>
          <TouchableOpacity
            onPress={handleLogout}
            style={styles.signOutButton}
            disabled={isLoggingOut}
            accessibilityRole="button"
            accessibilityLabel={t('common.signOut')}
            accessibilityState={{ disabled: isLoggingOut }}
          >
            <MaterialIcons 
              name="logout" 
              size={24} 
              color={isLoggingOut ? '#999' : ACCESSIBILITY.COLORS.TEXT.PRIMARY} 
            />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
        >
          <TaskFilter
            currentFilter={currentFilter}
            onFilterChange={setCurrentFilter}
            counts={getFilterCounts()}
          />
          
          {Object.entries(TIME_PERIODS).map(([id, period]) => (
            <TimeSection
              key={id}
              period={period}
              tasks={filterTasks(tasks[id as TimePeriodKey])}
              onAddTask={() => handleAddTask(id as TimePeriodKey)}
              onToggleTask={(taskId) => toggleTask(id as TimePeriodKey, taskId)}
              onDeleteTask={(taskId) => deleteTask(id as TimePeriodKey, taskId)}
              onUpdateTask={(taskId, updatedTask) => updateTask(id as TimePeriodKey, taskId, updatedTask)}
            />
          ))}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ACCESSIBILITY.COLORS.BACKGROUND.PRIMARY,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: ACCESSIBILITY.SPACING.MD,
    backgroundColor: ACCESSIBILITY.COLORS.BACKGROUND.PRIMARY,
    borderBottomWidth: 1,
    borderBottomColor: ACCESSIBILITY.COLORS.INTERACTIVE.SECONDARY,
  },
  title: {
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.LG,
    fontWeight: ACCESSIBILITY.TYPOGRAPHY.WEIGHTS.SEMIBOLD,
    color: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
  },
  signOutButton: {
    width: ACCESSIBILITY.TOUCH_TARGET.MIN_WIDTH,
    height: ACCESSIBILITY.TOUCH_TARGET.MIN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: ACCESSIBILITY.SPACING.MD,
  },
});

export default TaskManagementScreen;
