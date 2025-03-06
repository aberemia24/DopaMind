import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useTranslation } from 'react-i18next';
import TaskItem from './TaskItem';
import { MaterialIcons } from '@expo/vector-icons';
import { ACCESSIBILITY } from '../../../constants/accessibility';
import type { Task } from '../../../services/taskService';
import type { TimePeriod } from '../../../constants/taskTypes';
import { getDayTimeColors } from '../../../utils/daytime';

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
  const [isExpanded, setIsExpanded] = useState(true);
  const animatedHeight = useRef(new Animated.Value(1)).current;
  const animatedRotation = useRef(new Animated.Value(0)).current;
  
  // Obținem culorile corespunzătoare perioadei
  const getPeriodColors = () => {
    switch (period.id) {
      case 'MORNING':
        return ACCESSIBILITY.COLORS.DAYTIME.MORNING;
      case 'AFTERNOON':
        return ACCESSIBILITY.COLORS.DAYTIME.AFTERNOON;
      case 'EVENING':
        return ACCESSIBILITY.COLORS.DAYTIME.EVENING;
      default:
        return ACCESSIBILITY.COLORS.DAYTIME.MORNING;
    }
  };

  const periodColors = getPeriodColors();
  
  const toggleExpand = () => {
    const newValue = !isExpanded;
    setIsExpanded(newValue);
    
    // Animație pentru înălțime
    Animated.timing(animatedHeight, {
      toValue: newValue ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
    
    // Animație pentru rotația iconului
    Animated.timing(animatedRotation, {
      toValue: newValue ? 0 : 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };
  
  // Calculăm rotația iconului
  const iconRotation = animatedRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={styles.container}>
      {/* Spațiu între categorii în loc de separator subtil */}
      <View style={styles.categorySpacing} />
      
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={toggleExpand}
        accessibilityRole="button"
        accessibilityLabel={isExpanded ? 
          t('taskManagement.buttons.collapseSection', { section: t(period.titleKey) }) : 
          t('taskManagement.buttons.expandSection', { section: t(period.titleKey) })
        }
        accessibilityHint={isExpanded ? 
          t('taskManagement.accessibility.collapseHint') : 
          t('taskManagement.accessibility.expandHint')
        }
      >
        <View style={[styles.headerCard, { borderLeftColor: periodColors.BORDER }]}>
          <View style={styles.titleContainer}>
            <MaterialIcons 
              name={period.icon} 
              size={20} 
              color={periodColors.ICON} 
            />
            <Text style={styles.title}>
              {t(period.titleKey)}
            </Text>
            <Text style={styles.taskCount}>
              ({tasks.length})
            </Text>
          </View>
          <View style={styles.actionContainer}>
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation(); // Previne propagarea evenimentului la părinte
                onAddTask();
              }}
              style={styles.addButton}
              accessibilityRole="button"
              accessibilityLabel={t('taskManagement.buttons.addTask')}
            >
              <MaterialIcons 
                name="add" 
                size={20} 
                color={ACCESSIBILITY.COLORS.INTERACTIVE.PRIMARY} 
              />
            </TouchableOpacity>
            <Animated.View style={{ transform: [{ rotate: iconRotation }] }}>
              <MaterialIcons 
                name="expand-more" 
                size={20} 
                color={ACCESSIBILITY.COLORS.TEXT.SECONDARY} 
              />
            </Animated.View>
          </View>
        </View>
      </TouchableOpacity>

      <Animated.View 
        style={[
          styles.taskList,
          {
            maxHeight: animatedHeight.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 1000] // Valoare mare pentru a acoperi toate task-urile
            }),
            opacity: animatedHeight,
            overflow: 'hidden',
          }
        ]}
      >
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggle={() => onToggleTask(task.id)}
              onDelete={() => onDeleteTask(task.id)}
              onUpdate={(updates: Partial<Task>) => onUpdateTask(task.id, updates)}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Nu există sarcini pentru această perioadă</Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: ACCESSIBILITY.SPACING.MD,
  },
  categorySpacing: {
    height: ACCESSIBILITY.SPACING.SM,
  },
  headerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: ACCESSIBILITY.COLORS.BACKGROUND.PRIMARY,
    marginHorizontal: ACCESSIBILITY.SPACING.SM,
    paddingHorizontal: ACCESSIBILITY.SPACING.BASE,
    paddingVertical: ACCESSIBILITY.SPACING.SM,
    borderRadius: ACCESSIBILITY.SPACING.SM,
    borderLeftWidth: 4,
    // Adăugăm o umbră mai consistentă
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ACCESSIBILITY.SPACING.SM,
  },
  title: {
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.BASE,
    fontWeight: ACCESSIBILITY.TYPOGRAPHY.WEIGHTS.MEDIUM,
    color: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
  },
  taskCount: {
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.SM,
    color: ACCESSIBILITY.COLORS.TEXT.SECONDARY,
    marginLeft: ACCESSIBILITY.SPACING.XS,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    width: ACCESSIBILITY.TOUCH_TARGET.MIN_WIDTH,
    height: ACCESSIBILITY.TOUCH_TARGET.MIN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskList: {
    paddingTop: ACCESSIBILITY.SPACING.XS,
  },
  emptyState: {
    padding: ACCESSIBILITY.SPACING.MD,
    alignItems: 'center',
  },
  emptyStateText: {
    color: ACCESSIBILITY.COLORS.TEXT.SECONDARY,
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.SM,
    fontStyle: 'italic',
  }
});

export default TimeSection;