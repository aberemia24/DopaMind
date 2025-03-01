import React, { useState, useCallback, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform,
  Alert,
  TouchableOpacity,
  Text 
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';
import TimeSection from './components/TimeSection';
import TaskFilter, { FilterOption } from './components/TaskFilter';
import TaskItem from './components/TaskItem'; // Import TaskItem component
import { TIME_PERIODS, type TimePeriodKey } from '../../constants/taskTypes';
import { useTaskContext } from '../../contexts/TaskContext';
import { ACCESSIBILITY } from '../../constants/accessibility';
import { useAuth } from '../../contexts/auth';
import type { Task } from '../../services/taskService';

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
      case 'all':
        // Modificare: task-urile completate apar în tab-ul "All", dar vor fi afișate separat
        return taskList;
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

  const getActiveTasksCountForPeriod = (periodId: TimePeriodKey): number => {
    return tasks[periodId].filter(task => !task.completed).length;
  };

  const getAllCompletedTasks = (): Task[] => {
    return [...tasks.MORNING, ...tasks.AFTERNOON, ...tasks.EVENING].filter(task => task.completed);
  };

  const showSoftLimitWarning = (periodId: TimePeriodKey, onConfirm: () => void): void => {
    if (getActiveTasksCountForPeriod(periodId) >= 3) {
      Alert.alert(
        t('taskManagement.alerts.softLimit.title'),
        t('taskManagement.alerts.softLimit.message'),
        [
          {
            text: t('taskManagement.alerts.softLimit.cancel'),
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
      const newTask = {
        title: '',
        completed: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isPriority: false,
        period: periodId,
        userId: user.uid
      };

      try {
        await addTask(newTask);
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
      
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TaskFilter
            currentFilter={currentFilter}
            onFilterChange={setCurrentFilter}
            counts={getFilterCounts()}
          />
          
          {/* Afișăm categoriile de perioade doar dacă nu suntem în tab-ul "completed" */}
          {currentFilter !== 'completed' && Object.entries(TIME_PERIODS).map(([id, period]) => (
            <TimeSection
              key={id}
              period={period}
              tasks={filterTasks(tasks[id as TimePeriodKey]).filter(task => !task.completed)}
              onAddTask={() => handleAddTask(id as TimePeriodKey)}
              onToggleTask={toggleTask}
              onDeleteTask={deleteTask}
              onUpdateTask={(taskId, updates) => updateTask(taskId, updates)}
            />
          ))}

          {/* Secțiunea pentru task-urile completate */}
          {(currentFilter === 'completed' || (currentFilter === 'all' && getAllCompletedTasks().length > 0)) && (
            <View style={styles.completedTasksSection}>
              {/* Afișăm header-ul doar în tab-ul "all" */}
              {currentFilter === 'all' && (
                <View style={styles.completedTasksHeader}>
                  <MaterialIcons 
                    name="check-circle" 
                    size={24} 
                    color={ACCESSIBILITY.COLORS.INTERACTIVE.PRIMARY} 
                  />
                  <Text style={styles.completedTasksTitle}>
                    {t('taskManagement.filters.completedTasks')}
                  </Text>
                </View>
              )}
              <View style={styles.completedTasksList}>
                {getAllCompletedTasks().map(task => (
                  <View key={task.id} style={styles.completedTaskContainer}>
                    <View style={styles.periodIconContainer}>
                      <MaterialIcons 
                        name={TIME_PERIODS[task.period].icon} 
                        size={16} 
                        color={ACCESSIBILITY.COLORS.TEXT.SECONDARY} 
                      />
                    </View>
                    <View style={styles.taskItemContainer}>
                      <TaskItem
                        task={task}
                        onToggle={() => toggleTask(task.id)}
                        onDelete={() => deleteTask(task.id)}
                        onUpdate={(updates) => updateTask(task.id, updates)}
                      />
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
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
  scrollContent: {
    padding: ACCESSIBILITY.SPACING.MD,
  },
  completedTasksSection: {
    marginTop: ACCESSIBILITY.SPACING.MD,
  },
  completedTasksHeader: {
    borderBottomWidth: 1,
    borderBottomColor: ACCESSIBILITY.COLORS.INTERACTIVE.SECONDARY,
    paddingBottom: ACCESSIBILITY.SPACING.SM,
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedTasksTitle: {
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.LG,
    fontWeight: ACCESSIBILITY.TYPOGRAPHY.WEIGHTS.SEMIBOLD,
    color: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
    marginLeft: ACCESSIBILITY.SPACING.SM,
  },
  completedTasksList: {
    marginTop: ACCESSIBILITY.SPACING.SM,
  },
  completedTaskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: ACCESSIBILITY.SPACING.SM,
  },
  periodIconContainer: {
    marginRight: ACCESSIBILITY.SPACING.SM,
  },
  taskItemContainer: {
    flex: 1,
  },
});

export default TaskManagementScreen;
