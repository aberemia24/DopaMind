import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ACCESSIBILITY } from '../../../../constants/accessibility';

interface TimePickerProps {
  onTimeSelect: (time: { hours: number; minutes: number }) => void;
  reminderMinutes?: number;
  onReminderChange: (minutes: number) => void;
}

const TIME_SLOTS = [
  { period: 'morning', time: '09:00', icon: 'wb-sunny' },
  { period: 'afternoon', time: '14:00', icon: 'wb-sunny' },
  { period: 'evening', time: '20:00', icon: 'dark-mode' }
];

const REMINDER_OPTIONS = [
  { minutes: 0, titleKey: 'taskManagement.dateTimeSelector.reminders.atTime' },
  { minutes: 15, titleKey: 'taskManagement.dateTimeSelector.reminders.before15m' },
  { minutes: 30, titleKey: 'taskManagement.dateTimeSelector.reminders.before30m' },
  { minutes: 60, titleKey: 'taskManagement.dateTimeSelector.reminders.before1h' },
  { minutes: 120, titleKey: 'taskManagement.dateTimeSelector.reminders.before2h' },
];

export const TimePicker: React.FC<TimePickerProps> = ({
  onTimeSelect,
  reminderMinutes,
  onReminderChange,
}) => {
  const { t } = useTranslation();
  const [showCustomTime, setShowCustomTime] = useState(false);

  const handleTimeSlotSelect = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    onTimeSelect({ hours, minutes });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {t('taskManagement.dateTimeSelector.timePicker.title')}
      </Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.timeSlots}>
          {TIME_SLOTS.map((slot) => (
            <TouchableOpacity
              key={slot.time}
              style={styles.timeSlot}
              onPress={() => handleTimeSlotSelect(slot.time)}
              accessibilityRole="button"
              accessibilityLabel={t(`taskManagement.dateTimeSelector.timePicker.${slot.period}`)}
            >
              <MaterialIcons
                name={slot.icon}
                size={24}
                color={ACCESSIBILITY.COLORS.TEXT.PRIMARY}
                style={styles.icon}
              />
              <Text style={styles.timeText}>{slot.time}</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={styles.timeSlot}
            onPress={() => setShowCustomTime(!showCustomTime)}
            accessibilityRole="button"
            accessibilityLabel={t('taskManagement.dateTimeSelector.timePicker.custom')}
          >
            <MaterialIcons
              name="schedule"
              size={24}
              color={ACCESSIBILITY.COLORS.TEXT.PRIMARY}
              style={styles.icon}
            />
            <Text style={styles.timeText}>
              {t('taskManagement.dateTimeSelector.timePicker.custom')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <View style={styles.reminderSection}>
        <Text style={styles.reminderTitle}>
          {t('taskManagement.dateTimeSelector.reminders.title')}
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.reminderOptions}>
            {REMINDER_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.minutes}
                style={[
                  styles.reminderOption,
                  reminderMinutes === option.minutes && styles.selectedReminder,
                ]}
                onPress={() => onReminderChange(option.minutes)}
                accessibilityRole="button"
                accessibilityLabel={t(option.titleKey)}
                accessibilityState={{ selected: reminderMinutes === option.minutes }}
              >
                <MaterialIcons
                  name="notifications"
                  size={20}
                  color={reminderMinutes === option.minutes
                    ? ACCESSIBILITY.COLORS.TEXT.ON_INTERACTIVE
                    : ACCESSIBILITY.COLORS.TEXT.PRIMARY}
                  style={styles.reminderIcon}
                />
                <Text style={[
                  styles.reminderText,
                  reminderMinutes === option.minutes && styles.selectedReminderText,
                ]}>
                  {t(option.titleKey)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: ACCESSIBILITY.COLORS.BACKGROUND.PRIMARY,
    borderRadius: ACCESSIBILITY.SPACING.SM,
    padding: ACCESSIBILITY.SPACING.BASE,
  },
  title: {
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.LG,
    color: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
    fontWeight: ACCESSIBILITY.TYPOGRAPHY.WEIGHTS.SEMIBOLD,
    marginBottom: ACCESSIBILITY.SPACING.BASE,
  },
  timeSlots: {
    flexDirection: 'row',
    marginBottom: ACCESSIBILITY.SPACING.BASE,
  },
  timeSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ACCESSIBILITY.COLORS.BACKGROUND.SECONDARY,
    borderRadius: ACCESSIBILITY.SPACING.SM,
    padding: ACCESSIBILITY.SPACING.SM,
    marginRight: ACCESSIBILITY.SPACING.SM,
    minHeight: ACCESSIBILITY.TOUCH_TARGET.MIN_HEIGHT,
    minWidth: ACCESSIBILITY.TOUCH_TARGET.MIN_WIDTH * 2,
  },
  icon: {
    marginRight: ACCESSIBILITY.SPACING.SM,
  },
  timeText: {
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.BASE,
    color: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
    fontWeight: ACCESSIBILITY.TYPOGRAPHY.WEIGHTS.MEDIUM,
  },
  reminderSection: {
    marginTop: ACCESSIBILITY.SPACING.BASE,
  },
  reminderTitle: {
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.BASE,
    color: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
    fontWeight: ACCESSIBILITY.TYPOGRAPHY.WEIGHTS.SEMIBOLD,
    marginBottom: ACCESSIBILITY.SPACING.SM,
  },
  reminderOptions: {
    flexDirection: 'row',
  },
  reminderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ACCESSIBILITY.COLORS.BACKGROUND.SECONDARY,
    borderRadius: ACCESSIBILITY.SPACING.SM,
    padding: ACCESSIBILITY.SPACING.SM,
    marginRight: ACCESSIBILITY.SPACING.SM,
    minHeight: ACCESSIBILITY.TOUCH_TARGET.MIN_HEIGHT,
  },
  selectedReminder: {
    backgroundColor: ACCESSIBILITY.COLORS.INTERACTIVE.PRIMARY,
  },
  reminderIcon: {
    marginRight: ACCESSIBILITY.SPACING.SM,
  },
  reminderText: {
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.SM,
    color: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
  },
  selectedReminderText: {
    color: ACCESSIBILITY.COLORS.TEXT.ON_INTERACTIVE,
    fontWeight: ACCESSIBILITY.TYPOGRAPHY.WEIGHTS.SEMIBOLD,
  },
});
