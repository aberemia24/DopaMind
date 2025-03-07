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
import { getDayTimeColors } from '../../utils/daytime';

const TaskManagementScreen: React.FC = () => {
  const { logout, user, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const { tasks, loading, error, addTask, updateTask, deleteTask, toggleTask } = useTaskContext();
  const [currentFilter, setCurrentFilter] = useState<FilterOption>('all');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dayTimeColors = getDayTimeColors();

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
    if (periodId === 'COMPLETED') return 0; // Nu există task-uri active în secțiunea COMPLETED
    return tasks[periodId].filter(task => !task.completed).length;
  };

  const getAllCompletedTasks = (): Task[] => {
    // Colectăm toate task-urile completate din toate perioadele (cu excepția COMPLETED)
    return [...tasks.MORNING, ...tasks.AFTERNOON, ...tasks.EVENING].filter(task => task.completed);
  };

  // Adăugăm task-urile completate în obiectul tasks pentru a fi folosite cu TimeSection
  const tasksWithCompleted = {
    ...tasks,
    COMPLETED: getAllCompletedTasks()
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
      <View style={[styles.header, { borderBottomColor: dayTimeColors.PRIMARY }]}>
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
          {currentFilter !== 'completed' && Object.entries(TIME_PERIODS)
            .filter(([id]) => id !== 'COMPLETED') // Excludem secțiunea COMPLETED din ciclul normal
            .map(([id, period]) => (
              <TimeSection
                key={id}
                period={period}
                tasks={filterTasks(tasks[id as TimePeriodKey])}
                onAddTask={() => handleAddTask(id as TimePeriodKey)}
                onToggleTask={toggleTask}
                onDeleteTask={deleteTask}
                onUpdateTask={(taskId, updates) => updateTask(taskId, updates as Partial<Omit<Task, 'id' | 'userId'>>)}
              />
          ))}

          {/* Secțiunea pentru task-urile completate - folosind componenta TimeSection */}
          {(currentFilter === 'completed' || (currentFilter === 'all' && getAllCompletedTasks().length > 0)) && (
            <TimeSection
              key="COMPLETED"
              period={TIME_PERIODS.COMPLETED}
              tasks={tasksWithCompleted.COMPLETED}
              onAddTask={() => {}} // Nu permitem adăugarea de task-uri direct în secțiunea completate
              onToggleTask={toggleTask}
              onDeleteTask={deleteTask}
              onUpdateTask={(taskId, updates) => updateTask(taskId, updates as Partial<Omit<Task, 'id' | 'userId'>>)}
            />
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
    paddingHorizontal: ACCESSIBILITY.SPACING.MD,
    paddingTop: ACCESSIBILITY.SPACING.XL,
    paddingBottom: ACCESSIBILITY.SPACING.SM,
    borderBottomWidth: 2,
  },
  title: {
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.XL,
    fontWeight: ACCESSIBILITY.TYPOGRAPHY.WEIGHTS.BOLD,
    color: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
    letterSpacing: 0.5,
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
