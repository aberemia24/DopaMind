import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { ACCESSIBILITY } from '../../constants/accessibility';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';
import { TASK_TRANSLATIONS, COMMON_TRANSLATIONS } from '../../i18n/keys';

interface Tag {
  id: string;
  label: string;
  color: string;
}

interface TagSelectorProps {
  tags: Tag[];
  selectedTags: string[];
  onTagSelect: (tagId: string) => void;
  onAddCustomTag?: (tag: Tag) => void;
}

const TagSelector: React.FC<TagSelectorProps> = ({
  tags,
  selectedTags,
  onTagSelect,
  onAddCustomTag
}) => {
  const { t } = useTranslation();
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [newTagText, setNewTagText] = useState('');

  const handleAddCustomTag = () => {
    if (newTagText.trim()) {
      const newTag: Tag = {
        id: `custom-${Date.now()}`,
        label: newTagText.trim(),
        color: ACCESSIBILITY.COLORS.INTERACTIVE.PRIMARY
      };

      onAddCustomTag?.(newTag);
      setNewTagText('');
      setIsAddingCustom(false);
    }
  };

  return (
    <View 
      style={styles.container}
      accessible={true}
      accessibilityRole="radiogroup"
      accessibilityLabel={t(TASK_TRANSLATIONS.TAG.ACCESSIBILITY.TAG_SELECTOR)}
    >
      <View style={styles.tagList}>
        {tags.map(tag => (
          <TouchableOpacity
            key={tag.id}
            style={[
              styles.tag,
              selectedTags.includes(tag.id) && styles.tagSelected,
              { backgroundColor: selectedTags.includes(tag.id) ? tag.color : tag.color + '10' }
            ]}
            onPress={() => onTagSelect(tag.id)}
            accessibilityRole="radio"
            accessibilityState={{ 
              selected: selectedTags.includes(tag.id),
            }}
            accessibilityLabel={t(TASK_TRANSLATIONS.TAG.ACCESSIBILITY.TAG_OPTION, {
              label: tag.label,
              selected: selectedTags.includes(tag.id)
            })}
          >
            <Text style={[
              styles.tagText,
              selectedTags.includes(tag.id) && styles.tagTextSelected,
              { color: selectedTags.includes(tag.id) ? ACCESSIBILITY.COLORS.BACKGROUND.PRIMARY : tag.color }
            ]}>
              {tag.label}
            </Text>
          </TouchableOpacity>
        ))}

        {onAddCustomTag && (
          isAddingCustom ? (
            <View style={styles.addTagContainer}>
              <TextInput
                style={styles.input}
                value={newTagText}
                onChangeText={setNewTagText}
                placeholder={t(TASK_TRANSLATIONS.TAG.LABELS.ADD_TAG)}
                placeholderTextColor={ACCESSIBILITY.COLORS.TEXT.DISABLED}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={handleAddCustomTag}
                accessibilityRole="none"
                accessibilityLabel={t(TASK_TRANSLATIONS.TAG.ACCESSIBILITY.TAG_SELECTOR)}
                accessibilityHint={t(TASK_TRANSLATIONS.TAG.ACCESSIBILITY.SELECTED_TAGS)}
              />
              <View style={styles.addTagActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.cancelButton]}
                  onPress={() => {
                    setIsAddingCustom(false);
                    setNewTagText('');
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={t(COMMON_TRANSLATIONS.ACTIONS.CANCEL)}
                >
                  <Text style={styles.actionButtonText}>
                    {t(COMMON_TRANSLATIONS.ACTIONS.CANCEL)}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    styles.addButton,
                    !newTagText.trim() && styles.addButtonDisabled
                  ]}
                  onPress={handleAddCustomTag}
                  disabled={!newTagText.trim()}
                  accessibilityRole="button"
                  accessibilityLabel={t(TASK_TRANSLATIONS.TAG.LABELS.ADD_TAG)}
                  accessibilityState={{ disabled: !newTagText.trim() }}
                >
                  <Text style={[
                    styles.actionButtonText,
                    !newTagText.trim() && styles.actionButtonTextDisabled
                  ]}>
                    {t(TASK_TRANSLATIONS.TAG.LABELS.ADD_TAG)}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.tag, styles.addTagButton]}
              onPress={() => setIsAddingCustom(true)}
              accessibilityRole="button"
              accessibilityLabel={t(TASK_TRANSLATIONS.TAG.LABELS.ADD_TAG)}
            >
              <MaterialIcons 
                name="add" 
                size={16} 
                color={ACCESSIBILITY.COLORS.INTERACTIVE.PRIMARY} 
              />
              <Text style={styles.addTagButtonText}>
                {t(TASK_TRANSLATIONS.TAG.LABELS.ADD_TAG)}
              </Text>
            </TouchableOpacity>
          )
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: ACCESSIBILITY.SPACING.MD,
  },
  tagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ACCESSIBILITY.SPACING.SM,
  },
  tag: {
    minWidth: ACCESSIBILITY.TOUCH_TARGET.MIN_WIDTH,
    height: ACCESSIBILITY.TOUCH_TARGET.MIN_HEIGHT,
    paddingHorizontal: ACCESSIBILITY.SPACING.MD,
    borderRadius: ACCESSIBILITY.SPACING.SM,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagSelected: {
    borderWidth: 0,
  },
  tagText: {
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.SM,
    fontWeight: ACCESSIBILITY.TYPOGRAPHY.WEIGHTS.MEDIUM,
  },
  tagTextSelected: {
    color: ACCESSIBILITY.COLORS.BACKGROUND.PRIMARY,
  },
  addTagContainer: {
    flex: 1,
    minWidth: 200,
    flexDirection: 'row',
    alignItems: 'center',
    gap: ACCESSIBILITY.SPACING.SM,
  },
  input: {
    flex: 1,
    height: ACCESSIBILITY.TOUCH_TARGET.MIN_HEIGHT,
    paddingHorizontal: ACCESSIBILITY.SPACING.MD,
    backgroundColor: ACCESSIBILITY.COLORS.BACKGROUND.SECONDARY,
    borderRadius: ACCESSIBILITY.SPACING.SM,
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.BASE,
    color: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
  },
  addTagActions: {
    flexDirection: 'row',
    gap: ACCESSIBILITY.SPACING.SM,
  },
  actionButton: {
    width: ACCESSIBILITY.TOUCH_TARGET.MIN_WIDTH,
    height: ACCESSIBILITY.TOUCH_TARGET.MIN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: ACCESSIBILITY.SPACING.SM,
  },
  cancelButton: {
    backgroundColor: ACCESSIBILITY.COLORS.BACKGROUND.SECONDARY,
  },
  addButton: {
    backgroundColor: ACCESSIBILITY.COLORS.INTERACTIVE.PRIMARY,
  },
  addButtonDisabled: {
    backgroundColor: ACCESSIBILITY.COLORS.BACKGROUND.DISABLED,
  },
  actionButtonText: {
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.SM,
    fontWeight: ACCESSIBILITY.TYPOGRAPHY.WEIGHTS.MEDIUM,
    color: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
  },
  actionButtonTextDisabled: {
    color: ACCESSIBILITY.COLORS.TEXT.DISABLED,
  },
  addTagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: ACCESSIBILITY.TOUCH_TARGET.MIN_WIDTH,
    height: ACCESSIBILITY.TOUCH_TARGET.MIN_HEIGHT,
    paddingHorizontal: ACCESSIBILITY.SPACING.MD,
    borderRadius: ACCESSIBILITY.SPACING.SM,
    backgroundColor: ACCESSIBILITY.COLORS.INTERACTIVE.SECONDARY,
    gap: ACCESSIBILITY.SPACING.XS,
  },
  addTagButtonText: {
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.SM,
    fontWeight: ACCESSIBILITY.TYPOGRAPHY.WEIGHTS.MEDIUM,
    color: ACCESSIBILITY.COLORS.INTERACTIVE.PRIMARY,
  },
});

export default TagSelector;
