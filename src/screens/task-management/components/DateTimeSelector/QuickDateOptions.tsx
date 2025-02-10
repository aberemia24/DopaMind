import React from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ACCESSIBILITY } from '../../../../constants/accessibility';
import { QUICK_DATE_OPTIONS, type QuickDateOptionKey } from '../../../../constants/quickOptions';

interface QuickDateOptionsProps {
  selectedDate?: Date;
  onDateSelect: (date: Date) => void;
}

export const QuickDateOptions: React.FC<QuickDateOptionsProps> = ({
  selectedDate,
  onDateSelect
}) => {
  const { t } = useTranslation();

  const isOptionSelected = (option: QuickDateOptionKey): boolean => {
    if (!selectedDate) return false;
    const optionDate = QUICK_DATE_OPTIONS[option].getDate();
    return (
      selectedDate.getFullYear() === optionDate.getFullYear() &&
      selectedDate.getMonth() === optionDate.getMonth() &&
      selectedDate.getDate() === optionDate.getDate()
    );
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {(Object.keys(QUICK_DATE_OPTIONS) as QuickDateOptionKey[]).map((key) => {
        const option = QUICK_DATE_OPTIONS[key];
        const selected = isOptionSelected(key);
        
        return (
          <TouchableOpacity
            key={key}
            style={[
              styles.option,
              selected && styles.selectedOption
            ]}
            onPress={() => onDateSelect(option.getDate())}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={t(option.titleKey)}
          >
            <MaterialIcons
              name={option.icon}
              size={24}
              color={selected ? ACCESSIBILITY.COLORS.TEXT.ON_INTERACTIVE : ACCESSIBILITY.COLORS.TEXT.PRIMARY}
              style={styles.icon}
            />
            <Text
              style={[
                styles.optionText,
                selected && styles.selectedOptionText,
                { color: selected ? ACCESSIBILITY.COLORS.TEXT.ON_INTERACTIVE : ACCESSIBILITY.COLORS.TEXT.PRIMARY }
              ]}
            >
              {t(option.titleKey)}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: ACCESSIBILITY.SPACING.BASE
  },
  contentContainer: {
    paddingHorizontal: ACCESSIBILITY.SPACING.SM
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: ACCESSIBILITY.SPACING.MD,
    marginRight: ACCESSIBILITY.SPACING.SM,
    borderRadius: ACCESSIBILITY.TOUCH_TARGET.SPACING,
    backgroundColor: ACCESSIBILITY.COLORS.BACKGROUND.SECONDARY,
    minHeight: ACCESSIBILITY.TOUCH_TARGET.MIN_HEIGHT
  },
  selectedOption: {
    backgroundColor: ACCESSIBILITY.COLORS.INTERACTIVE.PRIMARY
  },
  icon: {
    marginLeft: ACCESSIBILITY.SPACING.SM,
  },
  optionText: {
    color: ACCESSIBILITY.COLORS.TEXT.PRIMARY
  },
  selectedOptionText: {
    color: ACCESSIBILITY.COLORS.TEXT.ON_INTERACTIVE,
  }
});
