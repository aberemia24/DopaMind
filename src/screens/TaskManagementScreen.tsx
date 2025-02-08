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
import { TIME_PERIODS, type TimePeriodKey } from '../constants/taskTypes';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';
import type { Task } from '../services/taskService';

interface TasksByPeriod {
  MORNING: Task[];
  AFTERNOON: Task[];
  EVENING: Task[];
}

interface TimePeriod {
  id: TimePeriodKey;
  label: string;
  icon: string;
  timeFrame: string;
  description: string;
}

const TaskManagementScreen: React.FC = () => {
  const { signOut } = useAuth();
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<TasksByPeriod>({
    MORNING: [],
    AFTERNOON: [],
    EVENING: []
  });

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
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={signOut}
          >
            <MaterialIcons name="logout" size={24} color="#fff" />
            <Text style={styles.logoutText}>{t('auth.signOut')}</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {Object.values(TIME_PERIODS).map((period) => (
            <TimeSection
              key={period.id}
              timePeriod={{
                id: period.id.toUpperCase() as TimePeriodKey,
                label: period.label,
                icon: period.icon,
                timeFrame: period.timeFrame,
                description: period.description
              }}
              tasks={tasks[period.id.toUpperCase() as TimePeriodKey] || []}
              onAddTask={() => handleAddTask(period.id.toUpperCase() as TimePeriodKey)}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
              onUpdateTask={handleUpdateTask}
            />
          ))}
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    backgroundColor: '#6495ED',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    borderRadius: 8,
  },
  logoutText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '500',
  },
  scrollContent: {
    padding: 16
  }
});

export default TaskManagementScreen;
