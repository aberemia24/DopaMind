import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ACCESSIBILITY } from '../../../../constants/accessibility';
import { TASK_TRANSLATIONS } from '../../../../i18n/keys';

interface QuickOption {
  id: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  titleKey: string;
  getDate: () => { date: Date; time?: { hours: number; minutes: number } };
}

interface QuickOptionsProps {
  onOptionSelect: (option: { date: Date; time?: { hours: number; minutes: number } }) => void;
}

/**
 * Opțiunile rapide pentru selectarea datei și orei
 * IMPACT: Modificarea acestor opțiuni afectează direct experiența utilizatorului
 * pentru setarea rapidă a termenelor limită
 */
const QUICK_OPTIONS: QuickOption[] = [
  {
    id: 'today',
    icon: 'today',
    titleKey: TASK_TRANSLATIONS.DATE_TIME_SELECTOR.QUICK_OPTIONS.TODAY,
    getDate: () => ({
      date: new Date(),
      time: { hours: 12, minutes: 0 }, // Ora implicită pentru astăzi - prânz
    }),
  },
  {
    id: 'tomorrow',
    icon: 'event',
    titleKey: TASK_TRANSLATIONS.DATE_TIME_SELECTOR.QUICK_OPTIONS.TOMORROW,
    getDate: () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return { 
        date: tomorrow,
        time: { hours: 12, minutes: 0 }, // Ora implicită pentru "mâine" - prânz
      };
    },
  },
  {
    id: 'tonight',
    icon: 'nights-stay',
    titleKey: TASK_TRANSLATIONS.DATE_TIME_SELECTOR.QUICK_OPTIONS.TONIGHT,
    getDate: () => ({
      date: new Date(),
      time: { hours: 20, minutes: 0 }, // Ora implicită pentru "în această seară" - 20:00
    }),
  },
  {
    id: 'weekend',
    icon: 'weekend',
    titleKey: TASK_TRANSLATIONS.DATE_TIME_SELECTOR.QUICK_OPTIONS.WEEKEND,
    getDate: () => {
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0 = Duminică, 6 = Sâmbătă
      const daysUntilSaturday = dayOfWeek === 6 ? 7 : 6 - dayOfWeek;
      const weekend = new Date();
      weekend.setDate(today.getDate() + daysUntilSaturday);
      return {
        date: weekend,
        time: { hours: 10, minutes: 0 }, // Ora implicită pentru weekend - 10:00
      };
    },
  },
  {
    id: 'nextWeek',
    icon: 'date-range',
    titleKey: TASK_TRANSLATIONS.DATE_TIME_SELECTOR.QUICK_OPTIONS.NEXT_WEEK,
    getDate: () => {
      const today = new Date();
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 7);
      return {
        date: nextWeek,
        time: { hours: 9, minutes: 0 }, // Ora implicită pentru "săptămâna viitoare" - 9:00
      };
    },
  },
  {
    id: 'morning',
    icon: 'wb-sunny',
    titleKey: TASK_TRANSLATIONS.DATE_TIME_SELECTOR.QUICK_OPTIONS.MORNING,
    getDate: () => ({
      date: new Date(),
      time: { hours: 9, minutes: 0 }, // Ora implicită pentru dimineață - 9:00
    }),
  },
  {
    id: 'afternoon',
    icon: 'wb-twilight',
    titleKey: TASK_TRANSLATIONS.DATE_TIME_SELECTOR.QUICK_OPTIONS.AFTERNOON,
    getDate: () => ({
      date: new Date(),
      time: { hours: 14, minutes: 0 }, // Ora implicită pentru după-amiază - 14:00
    }),
  },
  {
    id: 'evening',
    icon: 'bedtime',
    titleKey: TASK_TRANSLATIONS.DATE_TIME_SELECTOR.QUICK_OPTIONS.EVENING,
    getDate: () => ({
      date: new Date(),
      time: { hours: 20, minutes: 0 }, // Ora implicită pentru seară - 20:00
    }),
  },
];

export const QuickOptions: React.FC<QuickOptionsProps> = ({ onOptionSelect }) => {
  const { t } = useTranslation();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleOptionSelect = (option: QuickOption) => {
    setSelectedOption(option.id);
    onOptionSelect(option.getDate());
  };

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
          style={[
            styles.option,
            selectedOption === option.id && styles.selectedOption
          ]}
          onPress={() => handleOptionSelect(option)}
          accessibilityRole="button"
          accessibilityLabel={t(option.titleKey)}
          accessibilityState={{ selected: selectedOption === option.id }}
        >
          <MaterialIcons
            name={option.icon}
            size={24}
            color={selectedOption === option.id 
              ? ACCESSIBILITY.COLORS.TEXT.ON_INTERACTIVE 
              : ACCESSIBILITY.COLORS.TEXT.PRIMARY}
            style={styles.icon}
          />
          <Text style={[
            styles.text,
            selectedOption === option.id && styles.selectedText
          ]}>
            {t(option.titleKey)}
          </Text>
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
    paddingHorizontal: ACCESSIBILITY.SPACING.SM,
    paddingVertical: ACCESSIBILITY.SPACING.XS,
    marginHorizontal: ACCESSIBILITY.SPACING.XS,
    minWidth: 100,
    minHeight: 44, // Respectă standardul de accesibilitate pentru touch targets
  },
  selectedOption: {
    backgroundColor: ACCESSIBILITY.COLORS.INTERACTIVE.PRIMARY,
  },
  icon: {
    marginRight: ACCESSIBILITY.SPACING.XS,
  },
  text: {
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.SM,
    color: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
  },
  selectedText: {
    color: ACCESSIBILITY.COLORS.TEXT.ON_INTERACTIVE,
    fontWeight: ACCESSIBILITY.TYPOGRAPHY.WEIGHTS.MEDIUM,
  },
});
