import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { TASK_TAGS } from '../../constants/taskTags';
import type { TaskTagKey } from '../../constants/taskTags';

interface CustomTag {
  id: string;
  label: string;
  color: string;
  isCustom: boolean;
}

interface TagSelectorProps {
  selectedTags: string[];
  onTagToggle: (tagId: string) => void;
  onAddCustomTag: (tag: CustomTag) => void;
}

const TagSelector: React.FC<TagSelectorProps> = ({ selectedTags, onTagToggle, onAddCustomTag }) => {
  const [newTagText, setNewTagText] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleAddCustomTag = () => {
    if (newTagText.trim()) {
      const customTagId = `custom_${Date.now()}`;
      
      const newTag: CustomTag = {
        id: customTagId,
        label: newTagText.trim(),
        color: '#333333', // Culoare neutră pentru text
        isCustom: true // Marcăm eticheta ca fiind personalizată
      };
      
      onAddCustomTag(newTag);
      
      setNewTagText('');
      setShowCustomInput(false);
    }
  };

  const handleTagPress = (tagId: TaskTagKey | string) => {
    onTagToggle(tagId);
    setShowCustomInput(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.tagsContainer}>
        {Object.values(TASK_TAGS).map((tag) => (
          <TouchableOpacity
            key={tag.id}
            style={[
              styles.tag,
              { backgroundColor: tag.color + '20' },
              selectedTags.includes(tag.id) && styles.tagSelected,
              selectedTags.includes(tag.id) && { backgroundColor: tag.color + '40' }
            ]}
            onPress={() => handleTagPress(tag.id)}
          >
            <Text
              style={[
                styles.tagText,
                { color: tag.color },
                selectedTags.includes(tag.id) && styles.tagTextSelected
              ]}
            >
              {tag.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {!showCustomInput ? (
        <TouchableOpacity
          style={styles.addCustomButton}
          onPress={() => setShowCustomInput(true)}
        >
          <Text style={styles.addCustomButtonText}>+ Adaugă etichetă nouă</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.customTagInput}>
          <TextInput
            style={styles.input}
            value={newTagText}
            onChangeText={setNewTagText}
            placeholder="Numele etichetei..."
            maxLength={20}
            autoFocus
          />
          <View style={styles.customTagButtons}>
            <TouchableOpacity
              style={[styles.customTagButton, styles.cancelButton]}
              onPress={() => {
                setNewTagText('');
                setShowCustomInput(false);
              }}
            >
              <Text style={styles.cancelButtonText}>Anulează</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.customTagButton, styles.addButton]}
              onPress={handleAddCustomTag}
              disabled={!newTagText.trim()}
            >
              <Text style={[
                styles.addButtonText,
                !newTagText.trim() && styles.addButtonTextDisabled
              ]}>
                Adaugă
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tag: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  tagSelected: {
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500',
  },
  tagTextSelected: {
    fontWeight: '600',
  },
  addCustomButton: {
    paddingVertical: 8,
  },
  addCustomButtonText: {
    color: '#666',
    fontSize: 14,
  },
  customTagInput: {
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  customTagButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  customTagButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    color: '#666',
  },
  addButton: {
    backgroundColor: '#4CAF50',
  },
  addButtonText: {
    color: '#fff',
  },
  addButtonTextDisabled: {
    opacity: 0.5,
  },
});

export default TagSelector;
