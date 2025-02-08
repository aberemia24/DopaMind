import React, { useState } from 'react';
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
import { TIME_PERIODS } from '../constants/taskTypes';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  status: 'not_started' | 'in_progress' | 'completed';
  isPriority: boolean;
}

interface TasksByPeriod {
  morning: Task[];
  afternoon: Task[];
  evening: Task[];
}

type TimePeriodId = 'morning' | 'afternoon' | 'evening';

interface TimePeriod {
  id: TimePeriodId;
  label: string;
  icon: string;
  timeFrame: string;
  description: string;
}

const TaskManagementScreen: React.FC = () => {
  const { signOut } = useAuth();
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<TasksByPeriod>({
    morning: [],
    afternoon: [],
    evening: []
  });

  const getTotalTaskCount = (): number => {
    return tasks.morning.length + tasks.afternoon.length + tasks.evening.length;
  };

  const showSoftLimitWarning = (periodId: TimePeriodId, onConfirm: () => void): void => {
    if (getTotalTaskCount() >= 3) {
      Alert.alert(
        "Ești sigur?",
        "Ești sigur că nu e prea mult? Încearcă să te concentrezi pe maximum 3 sarcini prioritare.",
        [
          {
            text: "Renunț",
            style: "cancel"
          },
          { 
            text: "Adaug oricum", 
            onPress: onConfirm
          }
        ]
      );
    } else {
      onConfirm();
    }
  };

  const handleAddTask = (periodId: TimePeriodId): void => {
    const addNewTask = () => {
      const newTask: Task = {
        id: Date.now().toString(),
        title: '',
        completed: false,
        status: 'not_started',
        isPriority: getTotalTaskCount() < 3
      };
      setTasks(prev => ({
        ...prev,
        [periodId]: [...prev[periodId], newTask]
      }));
    };

    showSoftLimitWarning(periodId, addNewTask);
  };

  const handleToggleTask = (periodId: TimePeriodId, taskId: string): void => {
    setTasks(prev => ({
      ...prev,
      [periodId]: prev[periodId].map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    }));
  };

  const handleDeleteTask = (periodId: TimePeriodId, taskId: string): void => {
    setTasks(prev => {
      const newTasks = {
        ...prev,
        [periodId]: prev[periodId].filter(task => task.id !== taskId)
      };
      
      const allTasks = [
        ...newTasks.morning,
        ...newTasks.afternoon,
        ...newTasks.evening
      ];
      
      ['morning', 'afternoon', 'evening'].forEach(period => {
        newTasks[period as TimePeriodId] = newTasks[period as TimePeriodId].map((task, index) => ({
          ...task,
          isPriority: allTasks.indexOf(task) < 3
        }));
      });
      
      return newTasks;
    });
  };

  const handleUpdateTask = (periodId: TimePeriodId, taskId: string, updatedTask: Task): void => {
    setTasks(prev => ({
      ...prev,
      [periodId]: prev[periodId].map(task => 
        task.id === taskId ? { ...updatedTask, isPriority: task.isPriority } : task
      )
    }));
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
          {(Object.values(TIME_PERIODS) as Array<{ id: TimePeriodId, label: string, icon: string, timeFrame: string, description: string }>).map((period) => (
            <TimeSection
              key={period.id}
              timePeriod={period}
              tasks={tasks[period.id]}
              onAddTask={() => handleAddTask(period.id)}
              onToggleTask={(taskId) => handleToggleTask(period.id, taskId)}
              onDeleteTask={(taskId) => handleDeleteTask(period.id, taskId)}
              onUpdateTask={(taskId, task) => handleUpdateTask(period.id, taskId, task)}
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
    backgroundColor: '#fff'
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
