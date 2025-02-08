import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Animated, InteractionManager } from 'react-native';
import PropTypes from 'prop-types';
import { TASK_STATUS } from '../../constants/taskTypes';

const TaskItem = ({ task, onToggle, onDelete, onUpdate }) => {
  const [title, setTitle] = useState(task.title);
  const [isEditing, setIsEditing] = useState(!task.title);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const inputRef = useRef(null);

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
      console.log('TaskItem: Se intră în modul de editare, focus pe TextInput');
      InteractionManager.runAfterInteractions(() => {
        inputRef.current.focus();
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
      onDelete();
    }
  };

  return (
    <Animated.View style={[styles.taskItem, { opacity: fadeAnim }]}>
      {isEditing ? (
        <View style={styles.editContainer}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Descrie task-ul tău..."
            onSubmitEditing={handleSubmit}
            autoFocus
            onFocus={() => console.log('TaskItem: Input a primit focus')}
            onBlur={() => console.log('TaskItem: Input a pierdut focus')}
          />
          <View style={styles.editButtons}>
            <TouchableOpacity
              onPress={handleSubmit}
              style={styles.editButton}
              activeOpacity={0.7}
            >
              <Text style={styles.editButtonText}>✓</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleCancel}
              style={[styles.editButton, styles.cancelButton]}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          <TouchableOpacity 
            onPress={onToggle}
            style={styles.checkbox}
            activeOpacity={0.7}
          >
            <View style={[styles.checkboxInner, task.completed && styles.checkboxChecked]}>
              {task.completed && <Text style={styles.checkmark}>✓</Text>}
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => setIsEditing(true)}
            style={styles.titleContainer}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.title,
              task.completed && styles.titleCompleted
            ]}>{title}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onDelete}
            style={styles.deleteButton}
            activeOpacity={0.7}
          >
            <Text style={styles.deleteButtonText}>×</Text>
          </TouchableOpacity>
        </>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginVertical: 6,
  },
  editContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    padding: 12,
    borderWidth: 1,
    borderColor: '#7C3AED',
    borderRadius: 8,
    marginRight: 8,
  },
  editButtons: {
    flexDirection: 'row',
  },
  editButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 24,
  },
  cancelButton: {
    backgroundColor: '#EF4444',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 20,
  },
  checkbox: {
    padding: 8,
  },
  checkboxInner: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#7C3AED',
  },
  checkmark: {
    color: '#fff',
    fontSize: 18,
  },
  titleContainer: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  title: {
    fontSize: 16,
    color: '#1F2937',
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
  },
  deleteButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#EF4444',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

TaskItem.propTypes = {
  task: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    completed: PropTypes.bool.isRequired,
    status: PropTypes.oneOf(Object.values(TASK_STATUS)).isRequired,
  }).isRequired,
  onToggle: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onUpdate: PropTypes.func.isRequired,
};

export default TaskItem;
