import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ACCESSIBILITY } from '../../../../constants/accessibility';

interface QuickOption {
  id: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  titleKey: string;
  getDate: () => { date: Date; time?: { hours: number; minutes: number } };
}

interface QuickOptionsProps {
  onOptionSelect: (option: { date: Date; time?: { hours: number; minutes: number } }) => void;
}

const QUICK_OPTIONS: QuickOption[] = [
  {
    id: 'today',
    icon: 'today',
    titleKey: 'taskManagement.dateTimeSelector.quickOptions.today',
    getDate: () => ({ date: new Date() }),
  },
  {
    id: 'tomorrow',
    icon: 'event',
    titleKey: 'taskManagement.dateTimeSelector.quickOptions.tomorrow',
    getDate: () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return { date: tomorrow };
    },
  },
  {
    id: 'tonight',
    icon: 'nights-stay',
    titleKey: 'taskManagement.dateTimeSelector.quickOptions.tonight',
    getDate: () => ({
      date: new Date(),
      time: { hours: 20, minutes: 0 },
    }),
  },
  {
    id: 'weekend',
    icon: 'weekend',
    titleKey: 'taskManagement.dateTimeSelector.quickOptions.weekend',
    getDate: () => {
      const date = new Date();
      const daysUntilWeekend = 6 - date.getDay(); // 6 = Sâmbătă
      date.setDate(date.getDate() + daysUntilWeekend);
      return { date };
    },
  },
  {
    id: 'nextWeek',
    icon: 'date-range',
    titleKey: 'taskManagement.dateTimeSelector.quickOptions.nextWeek',
    getDate: () => {
      const date = new Date();
      date.setDate(date.getDate() + 7);
      return { date };
    },
  },
];

export const QuickOptions: React.FC<QuickOptionsProps> = ({ onOptionSelect }) => {
  const { t } = useTranslation();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {QUICK_OPTIONS.map((option) => (
        <TouchableOpacity
          key={option.id}
          style={styles.option}
          onPress={() => onOptionSelect(option.getDate())}
          accessibilityRole="button"
          accessibilityLabel={t(option.titleKey)}
        >
          <MaterialIcons
            name={option.icon}
            size={24}
            color={ACCESSIBILITY.COLORS.TEXT.PRIMARY}
            style={styles.icon}
          />
          <Text style={styles.text}>{t(option.titleKey)}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: ACCESSIBILITY.SPACING.BASE,
  },
  contentContainer: {
    paddingHorizontal: ACCESSIBILITY.SPACING.XS,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ACCESSIBILITY.COLORS.BACKGROUND.SECONDARY,
    borderRadius: ACCESSIBILITY.SPACING.SM,
    padding: ACCESSIBILITY.SPACING.SM,
    marginHorizontal: ACCESSIBILITY.SPACING.XS,
    minHeight: ACCESSIBILITY.TOUCH_TARGET.MIN_HEIGHT,
    minWidth: ACCESSIBILITY.TOUCH_TARGET.MIN_WIDTH * 2,
  },
  icon: {
    marginRight: ACCESSIBILITY.SPACING.SM,
  },
  text: {
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.SM,
    color: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
    fontWeight: ACCESSIBILITY.TYPOGRAPHY.WEIGHTS.MEDIUM,
  },
});
