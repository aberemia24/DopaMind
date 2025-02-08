import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import PropTypes from 'prop-types';
import TaskItem from './TaskItem';
import { TIME_PERIODS } from '../../constants/taskTypes';

const TimeSection = ({ timePeriod, task, onAddTask, onToggleTask, onDeleteTask, onUpdateTask }) => {
  const isCurrentPeriod = () => {
    const now = new Date();
    const [startHour] = timePeriod.timeFrame.split(' - ')[0].split(':').map(Number);
    const [endHour] = timePeriod.timeFrame.split(' - ')[1].split(':').map(Number);
    const currentHour = now.getHours();
    return currentHour >= startHour && currentHour < endHour;
  };

  return (
    <View style={[
      styles.timeSection,
      isCurrentPeriod() && styles.currentTimeSection
    ]}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.timePeriodTitle}>
            {timePeriod.icon} {timePeriod.label}
          </Text>
          <Text style={styles.timeFrame}>{timePeriod.timeFrame}</Text>
        </View>
        {isCurrentPeriod() && (
          <View style={styles.currentIndicator}>
            <Text style={styles.currentIndicatorText}>Acum</Text>
          </View>
        )}
      </View>

      {task ? (
        <TaskItem
          task={task}
          onToggle={onToggleTask}
          onDelete={onDeleteTask}
          onUpdate={onUpdateTask}
        />
      ) : (
        <TouchableOpacity 
          style={styles.addTaskButton} 
          onPress={onAddTask}
          accessibilityRole="button"
          accessibilityLabel={`Adaugă task pentru perioada ${timePeriod.label}`}
          accessibilityHint="Apasă pentru a adăuga un task nou"
        >
          <Text style={styles.addTaskButtonText}>+ Adaugă Task</Text>
          <Text style={styles.addTaskDescription}>Maxim un task per perioadă</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  timeSection: {
    marginBottom: 24,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  currentTimeSection: {
    backgroundColor: '#F5F3FF',
    borderColor: '#7C3AED',
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
  },
  timePeriodTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  timeFrame: {
    fontSize: 14,
    color: '#6B7280',
  },
  currentIndicator: {
    backgroundColor: '#7C3AED',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentIndicatorText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  addTaskButton: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  addTaskButtonText: {
    color: '#7C3AED',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  addTaskDescription: {
    color: '#6B7280',
    fontSize: 12,
  },
});

TimeSection.propTypes = {
  timePeriod: PropTypes.shape({
    id: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
    timeFrame: PropTypes.string.isRequired,
  }).isRequired,
  task: PropTypes.object,
  onAddTask: PropTypes.func.isRequired,
  onToggleTask: PropTypes.func.isRequired,
  onDeleteTask: PropTypes.func.isRequired,
  onUpdateTask: PropTypes.func.isRequired,
};

export default TimeSection;
