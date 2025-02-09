import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Animated, 
  StyleSheet,
  InteractionManager 
} from 'react-native';
import type { Task } from '../../services/taskService';
import { ACCESSIBILITY } from '../../constants/accessibility';
import { useTranslation } from 'react-i18next';
import { TASK_TRANSLATIONS, COMMON_TRANSLATIONS } from '../../i18n/keys';
import { formatRelativeTime } from '../../utils/dateTimeFormat';

interface TaskItemProps {
  task: Task;
  onToggle: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onUpdate: (task: Task) => void;
  isPriority?: boolean;
}

const TaskItem: React.FC<TaskItemProps> = React.memo(({ 
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

  const handleSubmit = useCallback(() => {
    const trimmedTitle = title.trim();
    if (trimmedTitle.length >= 3) {
      onUpdate({ ...task, title: trimmedTitle });
      setIsEditing(false);
    }
  }, [title, task, onUpdate]);

  const handleCancel = useCallback(() => {
    if (task.title) {
      setTitle(task.title);
      setIsEditing(false);
    } else {
      onDelete(task.id);
    }
  }, [task.title, task.id, onDelete]);

  const handleToggle = useCallback(() => {
    onToggle(task.id);
  }, [task.id, onToggle]);

  return (
    <Animated.View 
      style={[styles.container, { opacity: fadeAnim }]}
      accessible={true}
      accessibilityRole="checkbox"
      accessibilityState={{ 
        checked: task.completed,
        disabled: isEditing,
      }}
      accessibilityLabel={t(TASK_TRANSLATIONS.ITEM.ACCESSIBILITY.TASK_STATUS, {
        title: task.title,
        status: task.completed ? t(COMMON_TRANSLATIONS.STATUS.COMPLETED) : t(COMMON_TRANSLATIONS.STATUS.INCOMPLETE),
        priority: isPriority ? t(TASK_TRANSLATIONS.ITEM.ACCESSIBILITY.PRIORITY) : ''
      })}
    >
      <TouchableOpacity
        style={styles.checkbox}
        onPress={handleToggle}
        activeOpacity={0.7}
        accessibilityRole="button"
        disabled={isEditing}
        accessibilityState={{ disabled: isEditing }}
        accessibilityLabel={t(TASK_TRANSLATIONS.ITEM.ACCESSIBILITY.TOGGLE_COMPLETE, {
          action: task.completed ? t(COMMON_TRANSLATIONS.STATUS.MARK_INCOMPLETE) : t(COMMON_TRANSLATIONS.STATUS.MARK_COMPLETE)
        })}
      >
        <View style={[
          styles.checkboxInner,
          task.completed && styles.checkboxChecked
        ]} />
      </TouchableOpacity>

      <View style={styles.content}>
        {isEditing ? (
          <View 
            style={styles.editContainer}
            accessible={true}
            accessibilityRole="none"
            accessibilityLabel={t(TASK_TRANSLATIONS.ITEM.ACCESSIBILITY.EDIT_MODE)}
          >
            <TextInput
              ref={inputRef}
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              onBlur={handleCancel}
              onSubmitEditing={handleSubmit}
              placeholder={t(TASK_TRANSLATIONS.ITEM.PLACEHOLDER.TITLE)}
              maxLength={100}
              multiline
              accessibilityLabel={t(TASK_TRANSLATIONS.ITEM.ACCESSIBILITY.EDIT_TITLE)}
              accessibilityHint={t(TASK_TRANSLATIONS.ITEM.ACCESSIBILITY.EDIT_TITLE_HINT)}
              accessibilityState={{
                disabled: false,
                selected: true
              }}
              accessibilityValue={{
                text: title,
                min: 3,
                max: 100,
                now: title.length
              }}
            />
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={handleCancel}
                accessibilityRole="button"
                accessibilityLabel={t(COMMON_TRANSLATIONS.ACTIONS.CANCEL)}
              >
                <Text style={styles.buttonText}>{t(COMMON_TRANSLATIONS.ACTIONS.CANCEL)}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  styles.editButton,
                  title.trim().length < 3 && styles.editButtonDisabled
                ]}
                onPress={handleSubmit}
                disabled={title.trim().length < 3}
                accessibilityRole="button"
                accessibilityLabel={t(COMMON_TRANSLATIONS.ACTIONS.SAVE)}
                accessibilityState={{ 
                  disabled: title.trim().length < 3,
                  busy: false
                }}
                accessibilityHint={
                  title.trim().length < 3 
                    ? t(TASK_TRANSLATIONS.ITEM.ACCESSIBILITY.VALIDATION.TITLE_TOO_SHORT)
                    : undefined
                }
              >
                <Text style={[
                  styles.buttonText,
                  title.trim().length < 3 && styles.buttonTextDisabled
                ]}>
                  {t(COMMON_TRANSLATIONS.ACTIONS.SAVE)}
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
              accessibilityLabel={`${task.title}${isPriority ? ', ' + t(TASK_TRANSLATIONS.ITEM.ACCESSIBILITY.PRIORITY) : ''}`}
            >
              {task.title}
            </Text>
            <Text style={styles.metadata}>
              {t(TASK_TRANSLATIONS.ITEM.METADATA.CREATED, {
                date: formatRelativeTime(t, task.createdAt)
              })}
              {task.updatedAt && (
                <>
                  {' • '}
                  {t(TASK_TRANSLATIONS.ITEM.METADATA.UPDATED, {
                    date: formatRelativeTime(t, task.updatedAt)
                  })}
                </>
              )}
            </Text>
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setIsEditing(true)}
                accessibilityRole="button"
                accessibilityLabel={t(TASK_TRANSLATIONS.ITEM.ACCESSIBILITY.EDIT)}
              >
                <Text style={styles.buttonText}>{t(COMMON_TRANSLATIONS.ACTIONS.EDIT)}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => onDelete(task.id)}
                accessibilityRole="button"
                accessibilityLabel={t(TASK_TRANSLATIONS.ITEM.ACCESSIBILITY.DELETE)}
              >
                <Text style={[styles.buttonText, styles.deleteButtonText]}>
                  {t(COMMON_TRANSLATIONS.ACTIONS.DELETE)}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </Animated.View>
  );
}, (prevProps, nextProps) => {
  // Comparăm doar proprietățile care afectează randarea
  return (
    prevProps.task.id === nextProps.task.id &&
    prevProps.task.title === nextProps.task.title &&
    prevProps.task.completed === nextProps.task.completed &&
    prevProps.isPriority === nextProps.isPriority
  );
});

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
  metadata: {
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.XS,
    color: ACCESSIBILITY.COLORS.TEXT.SECONDARY,
  },
});

export { TaskItem };
