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
  const dayTimeColors = getDayTimeColors();
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
      {/* Separator subtil între categorii */}
      <View style={styles.separator} />
      
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
        <View style={styles.headerContainer}>
          <View 
            style={[
              styles.colorBar, 
              { backgroundColor: periodColors.BORDER }
            ]} 
          />
          <View 
            style={[
              styles.header,
              { backgroundColor: `${periodColors.PRIMARY}40` } // Creșterea opacității de la 15% la 40%
            ]}
          >
            <View style={styles.titleContainer}>
              <MaterialIcons 
                name={period.icon} 
                size={20} 
                color={periodColors.ICON} 
              />
              <Text style={[styles.title, { color: ACCESSIBILITY.COLORS.TEXT.PRIMARY }]}>
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
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggle={() => onToggleTask(task.id)}
            onDelete={() => onDeleteTask(task.id)}
            onUpdate={(updates: Partial<Task>) => onUpdateTask(task.id, updates)}
          />
        ))}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: ACCESSIBILITY.SPACING.MD, // Spațiu mai mare între categorii
  },
  separator: {
    height: 1,
    backgroundColor: ACCESSIBILITY.COLORS.BACKGROUND.DISABLED,
    marginHorizontal: ACCESSIBILITY.SPACING.LG,
    marginBottom: ACCESSIBILITY.SPACING.SM,
    opacity: 0.5,
  },
  headerContainer: {
    flexDirection: 'row',
    marginHorizontal: ACCESSIBILITY.SPACING.XS,
    borderRadius: ACCESSIBILITY.SPACING.SM,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08, // Creșterea ușoară a opacității umbrei pentru un efect mai vizibil
    shadowRadius: 1.5, // Reducerea razei umbrei pentru un efect mai definit
    elevation: 1, // Reducerea elevației pentru un efect mai subtil
    borderWidth: 0.5, // Adăugarea unui border subtil
    borderColor: 'rgba(0,0,0,0.05)', // Culoare semi-transparentă pentru border
  },
  colorBar: {
    width: 6, // Creșterea lățimii barei de culoare pentru mai multă vizibilitate
  },
  header: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: ACCESSIBILITY.SPACING.BASE,
    paddingVertical: ACCESSIBILITY.SPACING.SM,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ACCESSIBILITY.SPACING.SM,
  },
  title: {
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.BASE,
    fontWeight: ACCESSIBILITY.TYPOGRAPHY.WEIGHTS.MEDIUM,
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
});

export default TimeSection;
