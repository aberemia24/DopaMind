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
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      const interactionPromise = InteractionManager.runAfterInteractions(() => {
        if (mountedRef.current && inputRef.current) {
          inputRef.current.focus();
        }
      });

      return () => {
        interactionPromise.cancel();
      };
    }
  }, [isEditing]);

  useEffect(() => {
    if (task.completed) {
      const animation = Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.6,
          duration: 200,
          useNativeDriver: true,
        })
      ]);
      
      animation.start();

      return () => {
        animation.stop();
      };
    }
  }, [task.completed, fadeAnim]);

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
        disabled: isEditing 
      }}
      accessibilityLabel={t(TASK_TRANSLATIONS.ITEM.ACCESSIBILITY.TASK_STATUS, {
        title: task.title,
        status: task.completed ? t(COMMON_TRANSLATIONS.STATUS.COMPLETED) : t(COMMON_TRANSLATIONS.STATUS.INCOMPLETE)
      })}
    >
      <TouchableOpacity
        style={styles.checkbox}
        onPress={handleToggle}
        activeOpacity={0.7}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={t(TASK_TRANSLATIONS.ITEM.ACCESSIBILITY.TOGGLE_COMPLETE)}
        accessibilityState={{ checked: task.completed }}
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
              onSubmitEditing={handleSubmit}
              onBlur={handleSubmit}
              accessible={true}
              accessibilityRole="none"
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
          </View>
        ) : (
          <TouchableOpacity 
            onPress={() => setIsEditing(true)}
            style={styles.titleContainer}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={t(TASK_TRANSLATIONS.ITEM.ACCESSIBILITY.EDIT)}
          >
            <Text 
              style={[
                styles.title,
                task.completed && styles.titleCompleted,
                isPriority && styles.titlePriority
              ]}
              numberOfLines={2}
            >
              {task.title}
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => onDelete(task.id)}
          style={styles.deleteButton}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={t(TASK_TRANSLATIONS.ITEM.ACCESSIBILITY.DELETE)}
        >
          <Text style={styles.deleteText}>×</Text>
        </TouchableOpacity>
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
    alignItems: 'center',
    padding: ACCESSIBILITY.SPACING.MD,
    backgroundColor: ACCESSIBILITY.COLORS.BACKGROUND.PRIMARY,
    borderRadius: ACCESSIBILITY.SPACING.SM,
    marginVertical: ACCESSIBILITY.SPACING.XS,
    // Folosim culoarea TEXT.SECONDARY pentru umbră cu opacitate redusă
    shadowColor: ACCESSIBILITY.COLORS.TEXT.SECONDARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  checkbox: {
    width: ACCESSIBILITY.TOUCH_TARGET.MIN_WIDTH,
    height: ACCESSIBILITY.TOUCH_TARGET.MIN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: ACCESSIBILITY.SPACING.MD,
  },
  checkboxInner: {
    width: 24,
    height: 24,
    borderRadius: ACCESSIBILITY.SPACING.XS,
    borderWidth: 2,
    borderColor: ACCESSIBILITY.COLORS.INTERACTIVE.PRIMARY,
    backgroundColor: ACCESSIBILITY.COLORS.BACKGROUND.SECONDARY,
  },
  checkboxChecked: {
    backgroundColor: ACCESSIBILITY.COLORS.INTERACTIVE.PRIMARY,
    borderColor: ACCESSIBILITY.COLORS.INTERACTIVE.PRIMARY,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: ACCESSIBILITY.TOUCH_TARGET.MIN_HEIGHT,
  },
  titleContainer: {
    flex: 1,
    paddingVertical: ACCESSIBILITY.SPACING.SM,
    paddingRight: ACCESSIBILITY.SPACING.MD,
  },
  title: {
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.BASE,
    color: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
    fontWeight: ACCESSIBILITY.TYPOGRAPHY.WEIGHTS.REGULAR,
  },
  titleCompleted: {
    color: ACCESSIBILITY.COLORS.TEXT.SECONDARY,
    textDecorationLine: 'line-through',
  },
  titlePriority: {
    fontWeight: ACCESSIBILITY.TYPOGRAPHY.WEIGHTS.BOLD,
    color: ACCESSIBILITY.COLORS.INTERACTIVE.PRIMARY,
  },
  editContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    minHeight: ACCESSIBILITY.TOUCH_TARGET.MIN_HEIGHT,
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.BASE,
    color: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
    backgroundColor: ACCESSIBILITY.COLORS.BACKGROUND.SECONDARY,
    borderRadius: ACCESSIBILITY.SPACING.SM,
    paddingHorizontal: ACCESSIBILITY.SPACING.MD,
    paddingVertical: ACCESSIBILITY.SPACING.SM,
    marginRight: ACCESSIBILITY.SPACING.MD,
  },
  deleteButton: {
    width: ACCESSIBILITY.TOUCH_TARGET.MIN_WIDTH,
    height: ACCESSIBILITY.TOUCH_TARGET.MIN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: ACCESSIBILITY.COLORS.INTERACTIVE.DANGER,
    borderRadius: ACCESSIBILITY.SPACING.SM,
    marginLeft: ACCESSIBILITY.SPACING.SM,
  },
  deleteText: {
    color: ACCESSIBILITY.COLORS.BACKGROUND.PRIMARY,
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.LG,
    fontWeight: ACCESSIBILITY.TYPOGRAPHY.WEIGHTS.BOLD,
  },
});

export { TaskItem };
