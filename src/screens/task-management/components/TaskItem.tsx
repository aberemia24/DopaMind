import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ACCESSIBILITY } from '../../../constants/accessibility';
import { DateTimeSelector } from './DateTimeSelector';
import type { Task } from '../../../services/taskService';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

interface TaskItemProps {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
  onUpdate: (updates: Partial<Task>) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggle,
  onDelete,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const { t, i18n } = useTranslation();

  const handleSubmitEditing = () => {
    if (title.trim() !== task.title) {
      onUpdate({ title: title.trim() });
    }
    setIsEditing(false);
  };

  // Formatarea datei completării
  const formatCompletionDate = () => {
    if (!task.completedAt) return '';
    
    const locale = i18n.language === 'ro' ? ro : undefined;
    return format(new Date(task.completedAt), 'dd MMM HH:mm', { locale });
  };

  return (
    <View style={[
      styles.container, 
      task.completed && styles.completedContainer,
      task.completed && styles.completedContainerCompact
    ]}>
      <TouchableOpacity
        style={[styles.checkbox, task.completed && styles.completedCheckbox]}
        onPress={onToggle}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: task.completed }}
        accessibilityLabel={task.title || t('taskManagement.labels.untitledTask')}
      >
        <MaterialIcons
          name={task.completed ? 'check-box' : 'check-box-outline-blank'}
          size={task.completed ? 18 : 24}
          color={ACCESSIBILITY.COLORS.TEXT.SECONDARY}
        />
      </TouchableOpacity>

      <View style={styles.contentContainer}>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            onBlur={handleSubmitEditing}
            onSubmitEditing={handleSubmitEditing}
            autoFocus
            accessibilityLabel={t('taskManagement.labels.editTask')}
          />
        ) : (
          <TouchableOpacity
            style={styles.titleContainer}
            onPress={() => !task.completed && setIsEditing(true)}
            accessibilityRole="button"
            accessibilityLabel={t('taskManagement.labels.editTask')}
          >
            <Text
              style={[
                styles.title,
                task.completed && styles.completedTitle,
                !task.title && styles.untitledTask,
              ]}
            >
              {task.title || t('taskManagement.labels.untitledTask')}
            </Text>
          </TouchableOpacity>
        )}

        {!task.completed ? (
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onUpdate({ isPriority: !task.isPriority })}
              accessibilityRole="button"
              accessibilityLabel={t(
                task.isPriority
                  ? 'taskManagement.buttons.removePriority'
                  : 'taskManagement.buttons.addPriority'
              )}
            >
              <MaterialIcons
                name={task.isPriority ? 'star' : 'star-outline'}
                size={24}
                color={task.isPriority 
                  ? (task.completed ? ACCESSIBILITY.COLORS.TEXT.SECONDARY : '#FFD700') 
                  : ACCESSIBILITY.COLORS.TEXT.SECONDARY}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={onDelete}
              accessibilityRole="button"
              accessibilityLabel={t('taskManagement.buttons.deleteTask')}
            >
              <MaterialIcons
                name="delete-outline"
                size={24}
                color={ACCESSIBILITY.COLORS.TEXT.SECONDARY}
              />
            </TouchableOpacity>

            <DateTimeSelector
              dueDate={task.dueDate}
              reminderMinutes={task.reminderMinutes}
              onDateTimeChange={(updates) => onUpdate(updates)}
            />
          </View>
        ) : (
          <View style={styles.completionDateContainer}>
            <Text style={styles.completionDate}>
              {formatCompletionDate()}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4, 
    minHeight: 36, 
    backgroundColor: ACCESSIBILITY.COLORS.BACKGROUND.PRIMARY,
    borderRadius: ACCESSIBILITY.SPACING.SM,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    marginHorizontal: ACCESSIBILITY.SPACING.SM,
    marginVertical: 2, 
  },
  completedContainer: {
    opacity: 0.8, 
    backgroundColor: 'rgba(0,0,0,0.03)', 
    borderColor: 'rgba(0,0,0,0.05)', 
  },
  completedContainerCompact: {
    paddingVertical: 0,
    minHeight: 24,
    marginVertical: 0,
    borderWidth: 0.5,
  },
  checkbox: {
    width: 36, 
    height: 36, 
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedCheckbox: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
    minHeight: ACCESSIBILITY.TOUCH_TARGET.MIN_HEIGHT,
  },
  title: {
    fontSize: 14, 
    color: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: ACCESSIBILITY.COLORS.TEXT.SECONDARY,
    fontSize: 12,
  },
  untitledTask: {
    fontStyle: 'italic',
    color: ACCESSIBILITY.COLORS.TEXT.SECONDARY,
  },
  input: {
    flex: 1,
    fontSize: 14, 
    color: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
    minHeight: 36, 
    paddingHorizontal: ACCESSIBILITY.SPACING.SM,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 36, 
    height: 36, 
    justifyContent: 'center',
    alignItems: 'center',
  },
  completionDateContainer: {
    paddingHorizontal: ACCESSIBILITY.SPACING.SM,
    justifyContent: 'center',
  },
  completionDate: {
    fontSize: 11,
    color: ACCESSIBILITY.COLORS.TEXT.SECONDARY,
    fontStyle: 'italic',
  },
});

export default TaskItem;
