import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { TaskItem } from './TaskItem';
import { ACCESSIBILITY } from '../../constants/accessibility';
import type { Task } from '../../services/taskService';
import type { TimePeriod } from '../../constants/taskTypes';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';
import { TASK_TRANSLATIONS } from '../../i18n/keys';
import { formatTimeRange, parseTimeRange } from '../../utils/dateTimeFormat';

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
  const timeRange = parseTimeRange(period.timeFrame);
  const formattedTimeRange = formatTimeRange(t, timeRange);

  const renderItem = useCallback(({ item }: { item: Task }) => (
    <TaskItem
      key={item.id}
      task={item}
      onToggle={onToggleTask}
      onDelete={onDeleteTask}
      onUpdate={(updatedTask: Task) => onUpdateTask(item.id, updatedTask)}
    />
  ), [onToggleTask, onDeleteTask, onUpdateTask]);

  const keyExtractor = useCallback((item: Task) => item.id, []);

  return (
    <View 
      style={styles.container}
      accessible={true}
      accessibilityRole="tablist"
      accessibilityLabel={t(TASK_TRANSLATIONS.TIME.ACCESSIBILITY.TIME_SECTION, {
        period: t(TASK_TRANSLATIONS.TIME.PERIODS[period.id.toUpperCase() as keyof typeof TASK_TRANSLATIONS.TIME.PERIODS])
      })}
    >
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.icon}>{period.icon}</Text>
          <View>
            <Text style={styles.title}>
              {t(TASK_TRANSLATIONS.TIME.PERIODS[period.id.toUpperCase() as keyof typeof TASK_TRANSLATIONS.TIME.PERIODS])}
            </Text>
            <Text style={styles.timeFrame}>
              {formattedTimeRange}
            </Text>
          </View>
          <Text style={styles.description}>
            {t(TASK_TRANSLATIONS.TIME.LABELS.DESCRIPTION, { description: period.description })}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={onAddTask}
          accessibilityRole="button"
          accessibilityLabel={t(TASK_TRANSLATIONS.TIME.ACCESSIBILITY.ADD_TASK, {
            period: t(TASK_TRANSLATIONS.TIME.PERIODS[period.id.toUpperCase() as keyof typeof TASK_TRANSLATIONS.TIME.PERIODS])
          })}
        >
          <MaterialIcons 
            name="add" 
            size={24} 
            color={ACCESSIBILITY.COLORS.INTERACTIVE.PRIMARY} 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.progress}>
        <Text style={styles.progressText}>
          {t(TASK_TRANSLATIONS.TIME.LABELS.PROGRESS, {
            completed: completedTasks,
            total: tasks.length
          })}
        </Text>
      </View>

      <View style={[styles.taskList, { flex: 1 }]}>
        <FlashList
          data={tasks}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          estimatedItemSize={88} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
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
    flex: 1,
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
    flex: 1,
    minHeight: 200, 
  },
  listContent: {
    paddingVertical: ACCESSIBILITY.SPACING.SM,
  },
});

export default TimeSection;
