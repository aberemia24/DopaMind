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

  // Determinăm stilurile containerului în funcție de starea task-ului
  const containerStyle = [
    styles.container,
    task.completed ? styles.completedContainer : null,
    task.completed ? styles.completedContainerCompact : null,
    task.isPriority && !task.completed ? styles.priorityContainer : null,
  ];

  // Determinăm stilurile pentru checkbox
  const checkboxStyle = [
    styles.checkbox,
    task.completed ? styles.completedCheckbox : null,
  ];

  // Determinăm stilurile pentru containerul de conținut
  const contentContainerStyle = [
    styles.contentContainer,
    task.completed ? styles.completedContentContainer : null,
  ];

  // Determinăm stilurile pentru titlu
  const titleStyle = [
    styles.title,
    task.completed ? styles.completedTitle : null,
    !task.title ? styles.untitledTask : null,
  ];

  return (
    <View style={containerStyle}>
      <TouchableOpacity
        style={checkboxStyle}
        onPress={onToggle}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: task.completed }}
        accessibilityLabel={task.title || t('taskManagement.labels.untitledTask')}
      >
        <MaterialIcons
          name={task.completed ? 'check-box' : 'check-box-outline-blank'}
          size={task.completed ? 16 : 24}
          color={ACCESSIBILITY.COLORS.TEXT.SECONDARY}
        />
      </TouchableOpacity>

      <View style={contentContainerStyle}>
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
            <Text style={titleStyle}>
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
    opacity: 0.9, 
    backgroundColor: 'rgba(0,0,0,0.02)', 
    borderColor: 'rgba(0,0,0,0.08)', 
  },
  priorityContainer: {
    borderLeftWidth: 4,
    borderLeftColor: ACCESSIBILITY.COLORS.INTERACTIVE.PRIMARY,
    backgroundColor: 'rgba(0,0,0,0.01)',
  },
  completedContainerCompact: {
    paddingVertical: 2,
    minHeight: 30,
    height: 30,
    marginVertical: 2, 
    borderWidth: 1,
    borderRadius: 4, 
    borderColor: 'rgba(0,0,0,0.1)', 
  },
  checkbox: {
    width: 36, 
    height: 36, 
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedCheckbox: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 2,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  completedContentContainer: {
    paddingVertical: 0,
    height: 30,
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
    fontSize: 13, 
    lineHeight: 18,
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
    paddingHorizontal: 8,
    justifyContent: 'center',
    height: 30,
  },
  completionDate: {
    fontSize: 12,
    color: ACCESSIBILITY.COLORS.TEXT.SECONDARY,
    fontStyle: 'italic',
  },
});

export default TaskItem;
