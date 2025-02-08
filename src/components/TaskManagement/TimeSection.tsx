import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import TaskItem from './TaskItem';
import { TIME_PERIODS, type TimePeriodKey } from '../../constants/taskTypes';
import type { Task } from '../../services/taskService';

interface TimePeriod {
  id: TimePeriodKey;
  label: string;
  icon: string;
  timeFrame: string;
  description: string;
}

interface TimeSectionProps {
  timePeriod: TimePeriod;
  tasks: Task[];
  onAddTask: () => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateTask: (taskId: string, task: Task) => void;
}

const TimeSection: React.FC<TimeSectionProps> = ({ 
  timePeriod, 
  tasks, 
  onAddTask, 
  onToggleTask, 
  onDeleteTask, 
  onUpdateTask 
}) => {
  const isCurrentPeriod = () => {
    const now = new Date();
    const [startHour] = timePeriod.timeFrame.split(' - ')[0].split(':').map(Number);
    const [endHour] = timePeriod.timeFrame.split(' - ')[1].split(':').map(Number);
    const currentHour = now.getHours();
    return currentHour >= startHour && currentHour < endHour;
  };

  const priorityTasks = tasks.filter(task => task.isPriority);
  const additionalTasks = tasks.filter(task => !task.isPriority);

  return (
    <View style={[
      styles.timeSection,
      isCurrentPeriod() && styles.currentTimeSection
    ]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.timePeriodTitle}>
            {timePeriod.icon} {timePeriod.label}
          </Text>
          <Text style={styles.timeFrame}>{timePeriod.timeFrame}</Text>
        </View>
        {isCurrentPeriod() && (
          <View style={styles.currentIndicator}>
            <Text style={styles.currentIndicatorText}>Acum</Text>
          </View>
        )}
      </View>

      {/* Priority Tasks */}
      <View style={styles.priorityTasksSection}>
        {priorityTasks.map(task => (
          <TaskItem
            key={task.id}
            task={task}
            onToggle={() => onToggleTask(task.id)}
            onDelete={() => onDeleteTask(task.id)}
            onUpdate={(updatedTask) => onUpdateTask(task.id, updatedTask)}
            isPriority={true}
          />
        ))}
      </View>

      {/* Additional Tasks */}
      {additionalTasks.length > 0 && (
        <View style={styles.additionalTasksSection}>
          <Text style={styles.additionalTasksHeader}>Task-uri Adiționale</Text>
          {additionalTasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={() => onToggleTask(task.id)}
              onDelete={() => onDeleteTask(task.id)}
              onUpdate={(updatedTask) => onUpdateTask(task.id, updatedTask)}
              isPriority={false}
            />
          ))}
        </View>
      )}

      <TouchableOpacity 
        style={styles.addTaskButton} 
        onPress={onAddTask}
        accessibilityRole="button"
        accessibilityLabel={`Adaugă task pentru perioada ${timePeriod.label}`}
        accessibilityHint="Apasă pentru a adăuga un task nou"
      >
        <Text style={styles.addTaskButtonText}>+ Adaugă Task</Text>
        <Text style={styles.addTaskDescription}>
          {tasks.length >= 3 
            ? "Recomandăm maxim 3 task-uri prioritare"
            : "Adaugă un task prioritar"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  timeSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currentTimeSection: {
    borderWidth: 2,
    borderColor: '#4F46E5'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  titleContainer: {
    flex: 1
  },
  timePeriodTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4
  },
  timeFrame: {
    fontSize: 14,
    color: '#6B7280'
  },
  currentIndicator: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12
  },
  currentIndicatorText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500'
  },
  priorityTasksSection: {
    marginBottom: 16
  },
  additionalTasksSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB'
  },
  additionalTasksHeader: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 8
  },
  addTaskButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 8
  },
  addTaskButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4F46E5'
  },
  addTaskDescription: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4
  }
});

export default TimeSection;
