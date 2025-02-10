import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import TaskItem from './TaskItem';
import { MaterialIcons } from '@expo/vector-icons';
import { ACCESSIBILITY } from '../../../constants/accessibility';
import type { Task } from '../../../services/taskService';
import type { TimePeriod } from '../../../constants/taskTypes';

interface TimeSectionProps {
  period: TimePeriod;
  tasks: Task[];
  onAddTask: () => void;
  onToggleTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
}

const TimeSection: React.FC<TimeSectionProps> = ({
  period,
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onUpdateTask,
}) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <MaterialIcons 
            name={period.icon} 
            size={24} 
            color={ACCESSIBILITY.COLORS.TEXT.PRIMARY} 
          />
          <Text style={styles.title}>{t(period.titleKey)}</Text>
        </View>
        <TouchableOpacity
          onPress={onAddTask}
          style={styles.addButton}
          accessibilityRole="button"
          accessibilityLabel={t('taskManagement.buttons.addTask')}
        >
          <MaterialIcons 
            name="add" 
            size={24} 
            color={ACCESSIBILITY.COLORS.INTERACTIVE.PRIMARY} 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.taskList}>
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggle={() => onToggleTask(task.id)}
            onDelete={() => onDeleteTask(task.id)}
            onUpdate={(updates: Partial<Task>) => onUpdateTask(task.id, updates)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: ACCESSIBILITY.SPACING.BASE,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: ACCESSIBILITY.SPACING.BASE,
    paddingVertical: ACCESSIBILITY.SPACING.BASE,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ACCESSIBILITY.SPACING.BASE,
  },
  title: {
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.LG,
    fontWeight: ACCESSIBILITY.TYPOGRAPHY.WEIGHTS.SEMIBOLD,
    color: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
  },
  addButton: {
    width: ACCESSIBILITY.TOUCH_TARGET.MIN_WIDTH,
    height: ACCESSIBILITY.TOUCH_TARGET.MIN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskList: {
    paddingHorizontal: ACCESSIBILITY.SPACING.BASE,
  },
});

export default TimeSection;
