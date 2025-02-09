import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Animated, InteractionManager } from 'react-native';
import type { Task } from '../../services/taskService';
import { ACCESSIBILITY } from '../../constants/accessibility';
import { useTranslation } from 'react-i18next';

interface TaskItemProps {
  task: Task;
  onToggle: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onUpdate: (task: Task) => void;
  isPriority?: boolean;
}

const TaskItem: React.FC<TaskItemProps> = ({ 
  task, 
  onToggle, 
  onDelete, 
  onUpdate, 
  isPriority = false 
}) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState(task.title);
  const [isEditing, setIsEditing] = useState(!task.title);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (task.completed) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.6,
          duration: 200,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [task.completed, fadeAnim]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      InteractionManager.runAfterInteractions(() => {
        inputRef.current?.focus();
      });
    }
  }, [isEditing]);

  const handleSubmit = () => {
    const trimmedTitle = title.trim();
    if (trimmedTitle.length >= 3) {
      onUpdate({ ...task, title: trimmedTitle });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    if (task.title) {
      setTitle(task.title);
      setIsEditing(false);
    } else {
      onDelete(task.id);
    }
  };

  return (
    <Animated.View 
      style={[styles.container, { opacity: fadeAnim }]}
      accessible={true}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: task.completed }}
      accessibilityLabel={t('taskItem.accessibility.taskStatus', {
        title: task.title,
        status: task.completed ? t('common.completed') : t('common.incomplete')
      })}
    >
      <TouchableOpacity
        style={styles.checkbox}
        onPress={() => onToggle(task.id)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={t('taskItem.accessibility.toggleComplete', {
          action: task.completed ? t('common.markIncomplete') : t('common.markComplete')
        })}
      >
        <View style={[
          styles.checkboxInner,
          task.completed && styles.checkboxChecked
        ]} />
      </TouchableOpacity>

      <View style={styles.content}>
        {isEditing ? (
          <View style={styles.editContainer}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              onBlur={handleCancel}
              onSubmitEditing={handleSubmit}
              placeholder={t('taskItem.placeholder.title')}
              maxLength={100}
              multiline
              accessibilityLabel={t('taskItem.accessibility.editTitle')}
              accessibilityHint={t('taskItem.accessibility.editTitleHint')}
            />
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={handleCancel}
                accessibilityLabel={t('common.cancel')}
              >
                <Text style={styles.buttonText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  styles.editButton,
                  title.trim().length < 3 && styles.editButtonDisabled
                ]}
                onPress={handleSubmit}
                disabled={title.trim().length < 3}
                accessibilityLabel={t('common.save')}
                accessibilityState={{ disabled: title.trim().length < 3 }}
              >
                <Text style={[
                  styles.buttonText,
                  title.trim().length < 3 && styles.buttonTextDisabled
                ]}>
                  {t('common.save')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <Text 
              style={[
                styles.title,
                task.completed && styles.titleCompleted,
                isPriority && styles.titlePriority
              ]}
              accessibilityLabel={task.title}
            >
              {task.title}
            </Text>
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setIsEditing(true)}
                accessibilityLabel={t('taskItem.accessibility.edit')}
              >
                <Text style={styles.buttonText}>{t('common.edit')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => onDelete(task.id)}
                accessibilityLabel={t('taskItem.accessibility.delete')}
              >
                <Text style={styles.deleteButtonText}>{t('common.delete')}</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: ACCESSIBILITY.SPACING.MD,
    backgroundColor: ACCESSIBILITY.COLORS.BACKGROUND.PRIMARY,
    borderRadius: ACCESSIBILITY.SPACING.SM,
    alignItems: 'center',
    shadowColor: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  checkbox: {
    width: ACCESSIBILITY.TOUCH_TARGET.MIN_WIDTH,
    height: ACCESSIBILITY.TOUCH_TARGET.MIN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxInner: {
    width: ACCESSIBILITY.TOUCH_TARGET.MIN_WIDTH / 2,
    height: ACCESSIBILITY.TOUCH_TARGET.MIN_HEIGHT / 2,
    borderWidth: 2,
    borderColor: ACCESSIBILITY.COLORS.INTERACTIVE.PRIMARY,
    borderRadius: ACCESSIBILITY.SPACING.XS,
  },
  checkboxChecked: {
    backgroundColor: ACCESSIBILITY.COLORS.INTERACTIVE.PRIMARY,
  },
  content: {
    flex: 1,
    marginLeft: ACCESSIBILITY.SPACING.MD,
  },
  editContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.BASE,
    color: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: ACCESSIBILITY.COLORS.TEXT.DISABLED,
  },
  titlePriority: {
    color: ACCESSIBILITY.COLORS.INTERACTIVE.PRIMARY,
    fontWeight: ACCESSIBILITY.TYPOGRAPHY.WEIGHTS.BOLD,
  },
  input: {
    flex: 1,
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.BASE,
    color: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
    minHeight: ACCESSIBILITY.TOUCH_TARGET.MIN_HEIGHT,
    textAlignVertical: 'center',
    padding: ACCESSIBILITY.SPACING.SM,
  },
  actions: {
    flexDirection: 'row',
    gap: ACCESSIBILITY.SPACING.SM,
  },
  actionButton: {
    minWidth: ACCESSIBILITY.TOUCH_TARGET.MIN_WIDTH,
    height: ACCESSIBILITY.TOUCH_TARGET.MIN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: ACCESSIBILITY.SPACING.MD,
    borderRadius: ACCESSIBILITY.SPACING.SM,
  },
  editButton: {
    backgroundColor: ACCESSIBILITY.COLORS.INTERACTIVE.SECONDARY,
  },
  editButtonDisabled: {
    backgroundColor: ACCESSIBILITY.COLORS.BACKGROUND.DISABLED,
  },
  deleteButton: {
    backgroundColor: ACCESSIBILITY.COLORS.INTERACTIVE.DANGER,
  },
  buttonText: {
    color: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.SM,
    fontWeight: ACCESSIBILITY.TYPOGRAPHY.WEIGHTS.MEDIUM,
  },
  buttonTextDisabled: {
    color: ACCESSIBILITY.COLORS.TEXT.DISABLED,
  },
  deleteButtonText: {
    color: ACCESSIBILITY.COLORS.BACKGROUND.PRIMARY,
  },
});

export { TaskItem };
