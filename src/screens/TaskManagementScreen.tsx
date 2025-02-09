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
import { TIME_PERIODS, type TimePeriodKey, type TimePeriod } from '../constants/taskTypes';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';
import type { Task } from '../services/taskService';
import { ACCESSIBILITY } from '../constants/accessibility';

interface TasksByPeriod {
  MORNING: Task[];
  AFTERNOON: Task[];
  EVENING: Task[];
}

const TaskManagementScreen: React.FC = () => {
  const { signOut } = useAuth();
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<TasksByPeriod>({
    MORNING: [],
    AFTERNOON: [],
    EVENING: []
  });
  const [currentFilter, setCurrentFilter] = useState<FilterOption>('all');

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
        "Ești sigur?",
        "Ai deja 3 sau mai multe task-uri. Este recomandat să nu ai prea multe task-uri simultan pentru a evita supraîncărcarea. Vrei să continui?",
        [
          {
            text: "Nu, renunț",
            style: "cancel"
          },
          {
            text: "Da, adaug task",
            onPress: onConfirm
          }
        ]
      );
    } else {
      onConfirm();
    }
  };

  const handleAddTask = (periodId: TimePeriodKey): void => {
    const addNewTask = () => {
      const newTask: Task = {
        id: Date.now().toString(),
        title: '',
        completed: false,
        isPriority: false,
        userId: 'current_user', // TODO: Get from auth context
        periodId: periodId,
        createdAt: new Date().toISOString()
      };
      setTasks(prev => ({
        ...prev,
        [periodId]: [...prev[periodId], newTask]
      }));
    };

    showSoftLimitWarning(periodId, addNewTask);
  };

  const handleToggleTask = (taskId: string): void => {
    setTasks(prev => {
      const newTasks = { ...prev };
      Object.keys(newTasks).forEach((periodId) => {
        newTasks[periodId as TimePeriodKey] = newTasks[periodId as TimePeriodKey].map(task =>
          task.id === taskId ? { ...task, completed: !task.completed } : task
        );
      });
      return newTasks;
    });
  };

  const handleDeleteTask = (taskId: string): void => {
    setTasks(prev => {
      const newTasks = { ...prev };
      Object.keys(newTasks).forEach((periodId) => {
        newTasks[periodId as TimePeriodKey] = newTasks[periodId as TimePeriodKey].filter(task => task.id !== taskId);
      });
      return newTasks;
    });
  };

  const handleUpdateTask = (taskId: string, updatedTask: Task): void => {
    setTasks(prev => {
      const newTasks = { ...prev };
      Object.keys(newTasks).forEach((periodId) => {
        newTasks[periodId as TimePeriodKey] = newTasks[periodId as TimePeriodKey].map(task =>
          task.id === taskId ? { ...updatedTask } : task
        );
      });
      return newTasks;
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{t('taskManagement.title')}</Text>
          <TouchableOpacity
            onPress={signOut}
            style={styles.signOutButton}
            accessibilityRole="button"
            accessibilityLabel={t('common.signOut')}
          >
            <MaterialIcons name="logout" size={24} color={ACCESSIBILITY.COLORS.TEXT.PRIMARY} />
          </TouchableOpacity>
        </View>

        <TaskFilter
          currentFilter={currentFilter}
          onFilterChange={setCurrentFilter}
          counts={getFilterCounts()}
        />

        <ScrollView style={styles.content}>
          {Object.entries(TIME_PERIODS).map(([id, period]) => (
            <TimeSection
              key={id}
              period={period}
              tasks={filterTasks(tasks[id as TimePeriodKey])}
              onAddTask={() => handleAddTask(id as TimePeriodKey)}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              onUpdateTask={handleUpdateTask}
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
  content: {
    flex: 1,
  },
});

export default TaskManagementScreen;
