import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Animated, InteractionManager } from 'react-native';
import type { Task } from '../../services/taskService';

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
    <Animated.View style={[
      styles.taskItem,
      isPriority && styles.priorityTask,
      { opacity: fadeAnim }
    ]}>
      <TouchableOpacity
        style={styles.checkbox}
        onPress={() => onToggle(task.id)}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: task.completed }}
        accessibilityLabel={`Marchează task-ul ${title} ca ${task.completed ? 'neterminat' : 'terminat'}`}
      >
        <View style={[
          styles.checkboxInner,
          task.completed && styles.checkboxChecked,
          isPriority && styles.priorityCheckbox
        ]}>
          {task.completed && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </TouchableOpacity>

      <View style={styles.contentContainer}>
        {isEditing ? (
          <TextInput
            ref={inputRef}
            style={[styles.input, isPriority && styles.priorityInput]}
            value={title}
            onChangeText={setTitle}
            onBlur={handleSubmit}
            onSubmitEditing={handleSubmit}
            placeholder="Descrie task-ul..."
            placeholderTextColor="#9CA3AF"
            returnKeyType="done"
          />
        ) : (
          <TouchableOpacity
            style={styles.titleContainer}
            onPress={() => setIsEditing(true)}
            accessibilityRole="button"
            accessibilityLabel="Editează titlul task-ului"
          >
            <Text style={[
              styles.title,
              task.completed && styles.titleCompleted,
              isPriority && styles.priorityTitle
            ]}>
              {title}
            </Text>
          </TouchableOpacity>
        )}

        {!isEditing && (
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => onDelete(task.id)}
            accessibilityRole="button"
            accessibilityLabel="Șterge task-ul"
          >
            <Text style={styles.deleteButtonText}>×</Text>
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1
  },
  priorityTask: {
    borderLeftWidth: 4,
    borderLeftColor: '#4F46E5',
    backgroundColor: '#F5F3FF'
  },
  checkbox: {
    marginRight: 12,
    height: 24,
    width: 24,
    justifyContent: 'center',
    alignItems: 'center'
  },
  checkboxInner: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#9CA3AF',
    justifyContent: 'center',
    alignItems: 'center'
  },
  checkboxChecked: {
    backgroundColor: '#10B981',
    borderColor: '#10B981'
  },
  priorityCheckbox: {
    borderColor: '#4F46E5'
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold'
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center'
  },
  titleContainer: {
    flex: 1,
    paddingVertical: 4
  },
  title: {
    fontSize: 16,
    color: '#1F2937'
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: '#9CA3AF'
  },
  priorityTitle: {
    color: '#4F46E5',
    fontWeight: '500'
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1F2937',
    padding: 0
  },
  priorityInput: {
    color: '#4F46E5'
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8
  },
  deleteButtonText: {
    fontSize: 20,
    color: '#9CA3AF',
    fontWeight: 'bold'
  }
});

export default TaskItem;
