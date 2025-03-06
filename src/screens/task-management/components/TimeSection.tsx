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
  
  const   toggleExpand = () => {
    const newValue = !isExpanded;
    setIsExpanded(newValue);
    
    // Folosim o animație mai fluidă cu easing
    Animated.parallel([
      // Animație pentru înălțime
      Animated.timing(animatedHeight, {
        toValue: newValue ? 1 : 0,
        duration: 300, // Puțin mai lent pentru o tranziție mai fluidă
        useNativeDriver: false,
      }),
      
      // Animație pentru rotația iconului
      Animated.timing(animatedRotation, {
        toValue: newValue ? 0 : 1,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
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
      
      {/* Creăm un container cu border stânga colorat pentru întreaga secțiune */}
      <View style={[styles.sectionContainer, { borderLeftColor: periodColors.BORDER }]}>
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
          <View style={styles.headerCard}>
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
            // Asigurăm că nu există border sau umbre conflictuale
            borderWidth: 0,
            shadowOpacity: 0,
            elevation: 0,
          }
        ]}
      >
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <View key={task.id} style={styles.taskItemWrapper}>
              <TaskItem
                task={task}
                onToggle={() => onToggleTask(task.id)}
                onDelete={() => onDeleteTask(task.id)}
                onUpdate={(updates: Partial<Task>) => onUpdateTask(task.id, updates)}
              />
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Nu există sarcini pentru această perioadă</Text>
          </View>
        )}
      </Animated.View>
      </View>
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
  sectionContainer: {
    marginHorizontal: ACCESSIBILITY.SPACING.SM,
    borderLeftWidth: 4,
    borderRadius: ACCESSIBILITY.SPACING.SM,
    overflow: 'hidden',
    backgroundColor: ACCESSIBILITY.COLORS.BACKGROUND.PRIMARY,
    // Adăugăm o umbră pentru întreaga secțiune
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  headerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: ACCESSIBILITY.COLORS.BACKGROUND.PRIMARY,
    paddingHorizontal: ACCESSIBILITY.SPACING.BASE,
    paddingVertical: ACCESSIBILITY.SPACING.SM,
    // Am eliminat border și shadow pentru că acum sunt la nivelul containerului părinte
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
    // Fără padding sau margine suplimentară, pentru că acum totul este în interiorul aceluiași container
    paddingTop: 0,
    paddingBottom: ACCESSIBILITY.SPACING.XS,
    // Asigurăm că task-urile nu au stil vizual conflictual în timpul animației
    backgroundColor: 'transparent',
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  taskItemWrapper: {
    // Acest wrapper va "neutraliza" efectele vizuale ale TaskItem în timpul animației
    marginHorizontal: ACCESSIBILITY.SPACING.XS,
    marginVertical: ACCESSIBILITY.SPACING.XS / 2,
    borderRadius: 0,
    shadowOpacity: 0,
    elevation: 0,
    backgroundColor: 'transparent',
    overflow: 'hidden', // Ascunde orice efect vizual care iese din container
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