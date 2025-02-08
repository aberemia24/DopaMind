import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import TimeSection from '../components/TaskManagement/TimeSection';
import { TIME_PERIODS } from '../constants/taskTypes';

const TaskManagementScreen = () => {
  const [tasks, setTasks] = useState({
    morning: [],
    afternoon: [],
    evening: []
  });

  const getTotalTaskCount = () => {
    return tasks.morning.length + tasks.afternoon.length + tasks.evening.length;
  };

  const showSoftLimitWarning = (periodId, onConfirm) => {
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

  const handleAddTask = (periodId) => {
    const addNewTask = () => {
      const newTask = {
        id: Date.now().toString(),
        title: '',
        completed: false,
        status: 'not_started',
        isPriority: getTotalTaskCount() < 3 // Primele 3 task-uri overall sunt prioritare
      };
      setTasks(prev => ({
        ...prev,
        [periodId]: [...prev[periodId], newTask]
      }));
    };

    showSoftLimitWarning(periodId, addNewTask);
  };

  const handleToggleTask = (periodId, taskId) => {
    setTasks(prev => ({
      ...prev,
      [periodId]: prev[periodId].map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    }));
  };

  const handleDeleteTask = (periodId, taskId) => {
    setTasks(prev => {
      const newTasks = {
        ...prev,
        [periodId]: prev[periodId].filter(task => task.id !== taskId)
      };
      
      // Recalculăm prioritățile după ștergere
      const allTasks = [
        ...newTasks.morning,
        ...newTasks.afternoon,
        ...newTasks.evening
      ];
      
      // Actualizăm isPriority pentru toate task-urile rămase
      ['morning', 'afternoon', 'evening'].forEach(period => {
        newTasks[period] = newTasks[period].map((task, index) => ({
          ...task,
          isPriority: allTasks.indexOf(task) < 3
        }));
      });
      
      return newTasks;
    });
  };

  const handleUpdateTask = (periodId, taskId, updatedTask) => {
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
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <TimeSection
            timePeriod={TIME_PERIODS.MORNING}
            tasks={tasks.morning}
            onAddTask={() => handleAddTask('morning')}
            onToggleTask={(taskId) => handleToggleTask('morning', taskId)}
            onDeleteTask={(taskId) => handleDeleteTask('morning', taskId)}
            onUpdateTask={(taskId, task) => handleUpdateTask('morning', taskId, task)}
          />
          <TimeSection
            timePeriod={TIME_PERIODS.AFTERNOON}
            tasks={tasks.afternoon}
            onAddTask={() => handleAddTask('afternoon')}
            onToggleTask={(taskId) => handleToggleTask('afternoon', taskId)}
            onDeleteTask={(taskId) => handleDeleteTask('afternoon', taskId)}
            onUpdateTask={(taskId, task) => handleUpdateTask('afternoon', taskId, task)}
          />
          <TimeSection
            timePeriod={TIME_PERIODS.EVENING}
            tasks={tasks.evening}
            onAddTask={() => handleAddTask('evening')}
            onToggleTask={(taskId) => handleToggleTask('evening', taskId)}
            onDeleteTask={(taskId) => handleDeleteTask('evening', taskId)}
            onUpdateTask={(taskId, task) => handleUpdateTask('evening', taskId, task)}
          />
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
  scrollContent: {
    padding: 16
  }
});

export default TaskManagementScreen;
