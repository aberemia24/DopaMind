import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TaskItem } from './TaskItem';
import { ACCESSIBILITY } from '../../constants/accessibility';
import type { Task } from '../../services/taskService';
import type { TimePeriod } from '../../constants/taskTypes';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';

interface TimeSectionProps {
  period: TimePeriod;
  tasks: Task[];
  onAddTask: () => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateTask: (taskId: string, updatedTask: Task) => void;
}

const TimeSection: React.FC<TimeSectionProps> = ({
  period,
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onUpdateTask
}) => {
  const { t } = useTranslation();
  const completedTasks = tasks.filter(task => task.completed).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.icon}>{period.icon}</Text>
          <View>
            <Text style={styles.title}>{period.label}</Text>
            <Text style={styles.timeFrame}>{period.timeFrame}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={onAddTask}
          accessibilityRole="button"
          accessibilityLabel={t('timeSection.accessibility.addTask', {
            period: period.label
          })}
        >
          <MaterialIcons 
            name="add" 
            size={24} 
            color={ACCESSIBILITY.COLORS.INTERACTIVE.PRIMARY} 
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.description}>{period.description}</Text>

      <View style={styles.progress}>
        <Text style={styles.progressText}>
          {t('timeSection.progress', {
            completed: completedTasks,
            total: tasks.length
          })}
        </Text>
      </View>

      <View style={styles.taskList}>
        {tasks.map(task => (
          <TaskItem
            key={task.id}
            task={task}
            onToggle={onToggleTask}
            onDelete={onDeleteTask}
            onUpdate={(updatedTask: Task) => onUpdateTask(task.id, updatedTask)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: ACCESSIBILITY.COLORS.BACKGROUND.PRIMARY,
    borderRadius: ACCESSIBILITY.SPACING.SM,
    padding: ACCESSIBILITY.SPACING.MD,
    marginBottom: ACCESSIBILITY.SPACING.MD,
    shadowColor: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ACCESSIBILITY.SPACING.SM,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.XL,
    marginRight: ACCESSIBILITY.SPACING.SM,
  },
  title: {
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.LG,
    fontWeight: ACCESSIBILITY.TYPOGRAPHY.WEIGHTS.SEMIBOLD,
    color: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
  },
  timeFrame: {
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.SM,
    color: ACCESSIBILITY.COLORS.TEXT.SECONDARY,
    marginTop: ACCESSIBILITY.SPACING.XS,
  },
  description: {
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.BASE,
    color: ACCESSIBILITY.COLORS.TEXT.SECONDARY,
    marginBottom: ACCESSIBILITY.SPACING.MD,
  },
  progress: {
    marginBottom: ACCESSIBILITY.SPACING.MD,
  },
  progressText: {
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.SM,
    color: ACCESSIBILITY.COLORS.TEXT.SECONDARY,
  },
  addButton: {
    width: ACCESSIBILITY.TOUCH_TARGET.MIN_WIDTH,
    height: ACCESSIBILITY.TOUCH_TARGET.MIN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: ACCESSIBILITY.SPACING.SM,
    backgroundColor: ACCESSIBILITY.COLORS.INTERACTIVE.SECONDARY,
  },
  taskList: {
    gap: ACCESSIBILITY.SPACING.SM,
  },
});

export default TimeSection;
