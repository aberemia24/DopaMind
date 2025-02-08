import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import PropTypes from 'prop-types';
import { TASK_TAGS } from '../../constants/taskTags';

const TagSelector = ({ selectedTags, onTagToggle, onAddCustomTag }) => {
  const [newTagText, setNewTagText] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleAddCustomTag = () => {
    if (newTagText.trim()) {
      const customTagId = `custom_${Date.now()}`;
      
      const newTag = {
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

  const handleTagPress = (tagId) => {
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
            onPress={() => onTagToggle(tag.id)}
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

TagSelector.propTypes = {
  selectedTags: PropTypes.arrayOf(PropTypes.string).isRequired,
  onTagToggle: PropTypes.func.isRequired,
  onAddCustomTag: PropTypes.func.isRequired
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee'
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    gap: 8
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center'
  },
  tagSelected: {
    borderWidth: 1,
    borderColor: 'transparent'
  },
  tagText: {
    fontSize: 14,
    fontWeight: '500'
  },
  tagTextSelected: {
    fontWeight: '600'
  },
  addCustomButton: {
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center'
  },
  addCustomButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500'
  },
  customTagInput: {
    marginTop: 8,
    paddingHorizontal: 12
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#eee'
  },
  customTagButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    gap: 8
  },
  customTagButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8
  },
  cancelButton: {
    backgroundColor: '#f0f0f0'
  },
  addButton: {
    backgroundColor: '#4CAF50'
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '500'
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '500'
  },
  addButtonTextDisabled: {
    opacity: 0.5
  }
});

export default TagSelector;
