import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import TimeSection from '../components/TaskManagement/TimeSection';
import { TIME_PERIODS } from '../constants/taskTypes';

const TaskManagementScreen = () => {
  const [tasks, setTasks] = useState({
    morning: null,
    afternoon: null,
    evening: null
  });

  const handleAddTask = (periodId) => {
    setTasks(prev => ({
      ...prev,
      [periodId]: {
        id: Date.now().toString(),
        title: '',
        completed: false,
        status: 'not_started'
      }
    }));
  };

  const handleToggleTask = (periodId) => {
    setTasks(prev => ({
      ...prev,
      [periodId]: {
        ...prev[periodId],
        completed: !prev[periodId].completed
      }
    }));
  };

  const handleDeleteTask = (periodId) => {
    setTasks(prev => ({
      ...prev,
      [periodId]: null
    }));
  };

  const handleUpdateTask = (periodId, updatedTask) => {
    setTasks(prev => ({
      ...prev,
      [periodId]: updatedTask
    }));
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          <TimeSection
            timePeriod={TIME_PERIODS.MORNING}
            task={tasks.morning}
            onAddTask={() => handleAddTask('morning')}
            onToggleTask={() => handleToggleTask('morning')}
            onDeleteTask={() => handleDeleteTask('morning')}
            onUpdateTask={(task) => handleUpdateTask('morning', task)}
          />
          <TimeSection
            timePeriod={TIME_PERIODS.AFTERNOON}
            task={tasks.afternoon}
            onAddTask={() => handleAddTask('afternoon')}
            onToggleTask={() => handleToggleTask('afternoon')}
            onDeleteTask={() => handleDeleteTask('afternoon')}
            onUpdateTask={(task) => handleUpdateTask('afternoon', task)}
          />
          <TimeSection
            timePeriod={TIME_PERIODS.EVENING}
            task={tasks.evening}
            onAddTask={() => handleAddTask('evening')}
            onToggleTask={() => handleToggleTask('evening')}
            onDeleteTask={() => handleDeleteTask('evening')}
            onUpdateTask={(task) => handleUpdateTask('evening', task)}
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
  safeArea: {
    flex: 1
  },
  scrollView: {
    flex: 1
  },
  content: {
    padding: 16,
    paddingBottom: 32 // Extra padding at bottom for keyboard
  }
});

export default TaskManagementScreen;
