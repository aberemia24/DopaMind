import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useTranslation } from 'react-i18next';
import TaskItem from './TaskItem';
import { MaterialIcons } from '@expo/vector-icons';
import { ACCESSIBILITY } from '../../../constants/accessibility';
import type { Task } from '../../../services/taskService';
import type { TimePeriod } from '../../../constants/taskTypes';
import { getDayTimeColors } from '../../../utils/daytime';

// Activăm LayoutAnimation pentru Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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
  const periodColors = getPeriodColors();
  
  // Obținem culorile corespunzătoare perioadei
  function getPeriodColors() {
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
  }
  
  // Folosim LayoutAnimation în loc de Animated
  const toggleExpand = () => {
    // Configurăm animația pentru înainte de a schimba starea
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  return (
    <View style={styles.container}>
      {/* Spațiu între categorii */}
      <View style={styles.categorySpacing} />
      
      {/* Containerul principal cu bordură colorată */}
      <View style={[styles.sectionContainer, { borderLeftColor: periodColors.BORDER }]}>
        {/* Header-ul secțiunii - este mereu vizibil */}
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
              <MaterialIcons 
                name={isExpanded ? "expand-more" : "expand-less"} 
                size={20} 
                color={ACCESSIBILITY.COLORS.TEXT.SECONDARY} 
              />
            </View>
          </View>
        </TouchableOpacity>

        {/* Container pentru lista de task-uri - vizibil doar când isExpanded este true */}
        {isExpanded && (
          <View style={styles.taskListContainer}>
            {tasks.length > 0 ? (
              <View style={styles.taskList}>
                {tasks.map((task) => (
                  <View key={task.id} style={styles.taskItemWrapper}>
                    <TaskItem
                      task={task}
                      onToggle={() => onToggleTask(task.id)}
                      onDelete={() => onDeleteTask(task.id)}
                      onUpdate={(updates: Partial<Task>) => onUpdateTask(task.id, updates)}
                    />
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>Nu există sarcini pentru această perioadă</Text>
              </View>
            )}
          </View>
        )}
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
    // Umbre pentru întreaga secțiune
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
    backgroundColor: 'transparent',
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
  taskListContainer: {
    backgroundColor: 'transparent',
    // Fără umbră sau border
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  taskList: {
    paddingTop: 0,
    paddingBottom: ACCESSIBILITY.SPACING.XS,
    backgroundColor: 'transparent',
  },
  taskItemWrapper: {
    margin: 0,
    padding: ACCESSIBILITY.SPACING.XS,
    borderRadius: 0,
    // Fără umbre sau border-uri
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
    backgroundColor: 'transparent',
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