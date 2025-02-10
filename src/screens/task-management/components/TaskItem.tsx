import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ACCESSIBILITY } from '../../../constants/accessibility';
import type { Task } from '../../../services/taskService';

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
  const { t } = useTranslation();

  const handleSubmitEditing = () => {
    if (title.trim() !== task.title) {
      onUpdate({ title: title.trim() });
    }
    setIsEditing(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.checkbox}
        onPress={onToggle}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: task.completed }}
        accessibilityLabel={task.title || t('taskManagement.labels.untitledTask')}
      >
        <MaterialIcons
          name={task.completed ? 'check-box' : 'check-box-outline-blank'}
          size={24}
          color={task.completed ? ACCESSIBILITY.COLORS.INTERACTIVE.PRIMARY : ACCESSIBILITY.COLORS.TEXT.SECONDARY}
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
            onPress={() => setIsEditing(true)}
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
              color={task.isPriority ? '#FFD700' : ACCESSIBILITY.COLORS.TEXT.SECONDARY}
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
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: ACCESSIBILITY.SPACING.SM,
    minHeight: ACCESSIBILITY.TOUCH_TARGET.MIN_HEIGHT,
  },
  checkbox: {
    width: ACCESSIBILITY.TOUCH_TARGET.MIN_WIDTH,
    height: ACCESSIBILITY.TOUCH_TARGET.MIN_HEIGHT,
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
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.BASE,
    color: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: ACCESSIBILITY.COLORS.TEXT.SECONDARY,
  },
  untitledTask: {
    fontStyle: 'italic',
    color: ACCESSIBILITY.COLORS.TEXT.SECONDARY,
  },
  input: {
    flex: 1,
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.BASE,
    color: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
    minHeight: ACCESSIBILITY.TOUCH_TARGET.MIN_HEIGHT,
    paddingHorizontal: ACCESSIBILITY.SPACING.SM,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: ACCESSIBILITY.TOUCH_TARGET.MIN_WIDTH,
    height: ACCESSIBILITY.TOUCH_TARGET.MIN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TaskItem;
