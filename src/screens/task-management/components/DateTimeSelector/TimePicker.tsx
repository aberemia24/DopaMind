import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ACCESSIBILITY } from '../../../../constants/accessibility';
import { TASK_TRANSLATIONS } from '../../../../i18n/keys';

interface TimePickerProps {
  onTimeSelect: (time: { hours: number; minutes: number }) => void;
  reminderMinutes?: number;
  onReminderChange: (minutes: number) => void;
  selectedDate?: Date;
}

type TimeSlot = {
  period: string;
  time: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  startHour: number;
  endHour: number;
};

/**
 * Definim sloturile de timp disponibile pentru selecție rapidă
 * IMPACT: Acestea determină opțiunile predefinite pentru utilizatori
 */
const TIME_SLOTS: TimeSlot[] = [
  { period: 'morning', time: '09:00', icon: 'wb-sunny', startHour: 5, endHour: 11 },
  { period: 'afternoon', time: '14:00', icon: 'wb-sunny', startHour: 12, endHour: 17 },
  { period: 'evening', time: '20:00', icon: 'dark-mode', startHour: 18, endHour: 23 }
];

const REMINDER_OPTIONS = [
  { minutes: 0, titleKey: TASK_TRANSLATIONS.DATE_TIME_SELECTOR.REMINDERS.AT_TIME },
  { minutes: 15, titleKey: TASK_TRANSLATIONS.DATE_TIME_SELECTOR.REMINDERS.BEFORE_15M },
  { minutes: 30, titleKey: TASK_TRANSLATIONS.DATE_TIME_SELECTOR.REMINDERS.BEFORE_30M },
  { minutes: 60, titleKey: TASK_TRANSLATIONS.DATE_TIME_SELECTOR.REMINDERS.BEFORE_1H },
  { minutes: 120, titleKey: TASK_TRANSLATIONS.DATE_TIME_SELECTOR.REMINDERS.BEFORE_2H },
];

/**
 * Componenta TimePicker
 * Permite utilizatorului să selecteze ora pentru un task
 * 
 * IMPACT: Această componentă afectează modul în care utilizatorii setează ora pentru sarcini
 * și influențează categorisirea automată a sarcinilor în funcție de momentul zilei
 */
export const TimePicker: React.FC<TimePickerProps> = ({
  onTimeSelect,
  reminderMinutes,
  onReminderChange,
  selectedDate
}) => {
  const { t } = useTranslation();
  const [showCustomTime, setShowCustomTime] = useState(false);
  const [customHours, setCustomHours] = useState('');
  const [customMinutes, setCustomMinutes] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [customTimeConfirmed, setCustomTimeConfirmed] = useState(false);
  const [customTimeError, setCustomTimeError] = useState<string | null>(null);

  /**
   * Determină perioada zilei în funcție de ora curentă
   * IMPACT: Afectează selecția implicită și categorizarea sarcinilor
   */
  useEffect(() => {
    if (selectedDate) {
      const hours = selectedDate.getHours();
      const minutes = selectedDate.getMinutes();
      
      // Verificăm dacă ora corespunde unuia dintre sloturile predefinite
      const exactSlotMatch = TIME_SLOTS.find(slot => {
        const [slotHours, slotMinutes] = slot.time.split(':').map(Number);
        return hours === slotHours && minutes === slotMinutes;
      });
      
      if (exactSlotMatch) {
        // Dacă ora corespunde exact unui slot predefinit, îl selectăm
        setSelectedPeriod(exactSlotMatch.period);
        setSelectedTimeSlot(exactSlotMatch);
        setShowCustomTime(false);
      } else {
        // Dacă ora nu corespunde unui slot predefinit, activăm modul de timp personalizat
        // și precompletăm câmpurile cu valorile existente
        setCustomHours(hours.toString());
        setCustomMinutes(minutes.toString().padStart(2, '0'));
        setShowCustomTime(true);
        
        // Determinăm perioada zilei în funcție de ora curentă
        const period = TIME_SLOTS.find(slot => hours >= slot.startHour && hours <= slot.endHour);
        if (period) {
          setSelectedPeriod(period.period);
          setSelectedTimeSlot(period);
        }
      }
    }
  }, [selectedDate]);

  /**
   * Gestionează selecția unui slot de timp predefinit
   * IMPACT: Setează ora și actualizează perioada zilei
   */
  const handleTimeSlotSelect = (slot: TimeSlot) => {
    const [hours, minutes] = slot.time.split(':').map(Number);
    onTimeSelect({ hours, minutes });
    setSelectedPeriod(slot.period);
    setSelectedTimeSlot(slot);
    setShowCustomTime(false);
  };

  /**
   * Gestionează selecția unei ore personalizate
   * IMPACT: Permite utilizatorilor să seteze o oră exactă și actualizează perioada zilei
   */
  const handleCustomTimeSelect = () => {
    if (customHours && customMinutes) {
      const hours = parseInt(customHours, 10);
      const minutes = parseInt(customMinutes, 10);
      
      if (!isNaN(hours) && !isNaN(minutes) && hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
        onTimeSelect({ hours, minutes });
        
        // Determinăm perioada zilei în funcție de ora selectată
        const period = TIME_SLOTS.find(slot => hours >= slot.startHour && hours <= slot.endHour);
        if (period) {
          setSelectedPeriod(period.period);
          setSelectedTimeSlot(period);
        }
        
        // Setăm starea de confirmare și resetăm eroarea
        setCustomTimeConfirmed(true);
        setCustomTimeError(null);
        
        // Resetăm starea după 2 secunde
        setTimeout(() => {
          setCustomTimeConfirmed(false);
        }, 2000);
      } else {
        // Setăm eroarea pentru valori invalide
        setCustomTimeError(t('taskManagement.errors.invalidTime'));
      }
    } else {
      // Setăm eroarea pentru câmpuri goale
      setCustomTimeError(t('taskManagement.errors.requiredFields'));
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {t(TASK_TRANSLATIONS.DATE_TIME_SELECTOR.TIME_PICKER.TITLE)}
      </Text>

      {selectedPeriod && (
        <View style={styles.selectedPeriodContainer}>
          <Text style={styles.selectedPeriodText}>
            {t(TASK_TRANSLATIONS.DATE_TIME_SELECTOR.TIME_PICKER[selectedPeriod.toUpperCase() as keyof typeof TASK_TRANSLATIONS.DATE_TIME_SELECTOR.TIME_PICKER])}
          </Text>
        </View>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.timeSlots}>
          {TIME_SLOTS.map((slot) => (
            <TouchableOpacity
              key={slot.time}
              style={[
                styles.timeSlot,
                selectedPeriod === slot.period && styles.selectedTimeSlot
              ]}
              onPress={() => handleTimeSlotSelect(slot)}
              accessibilityRole="button"
              accessibilityLabel={t(TASK_TRANSLATIONS.DATE_TIME_SELECTOR.TIME_PICKER[slot.period.toUpperCase() as keyof typeof TASK_TRANSLATIONS.DATE_TIME_SELECTOR.TIME_PICKER])}
              accessibilityState={{ selected: selectedPeriod === slot.period }}
            >
              <MaterialIcons
                name={slot.icon}
                size={24}
                color={selectedPeriod === slot.period 
                  ? ACCESSIBILITY.COLORS.TEXT.ON_INTERACTIVE 
                  : ACCESSIBILITY.COLORS.TEXT.PRIMARY}
                style={styles.icon}
              />
              <Text style={[
                styles.timeText,
                selectedPeriod === slot.period && styles.selectedTimeText
              ]}>
                {slot.time}
              </Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            style={[
              styles.timeSlot,
              showCustomTime && styles.selectedTimeSlot
            ]}
            onPress={() => setShowCustomTime(!showCustomTime)}
            accessibilityRole="button"
            accessibilityLabel={t(TASK_TRANSLATIONS.DATE_TIME_SELECTOR.TIME_PICKER.CUSTOM)}
            accessibilityState={{ selected: showCustomTime }}
          >
            <MaterialIcons
              name="schedule"
              size={24}
              color={showCustomTime 
                ? ACCESSIBILITY.COLORS.TEXT.ON_INTERACTIVE 
                : ACCESSIBILITY.COLORS.TEXT.PRIMARY}
              style={styles.icon}
            />
            <Text style={[
              styles.timeText,
              showCustomTime && styles.selectedTimeText
            ]}>
              {t(TASK_TRANSLATIONS.DATE_TIME_SELECTOR.TIME_PICKER.CUSTOM)}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {showCustomTime && (
        <View style={styles.customTimeContainer}>
          <View style={styles.customTimeInputContainer}>
            <TextInput
              style={[styles.customTimeInput, customTimeError && styles.inputError]}
              placeholder="HH"
              keyboardType="numeric"
              maxLength={2}
              value={customHours}
              onChangeText={(text) => {
                const filteredText = text.replace(/[^0-9]/g, '');
                setCustomHours(filteredText);
                setCustomTimeError(null);
                setCustomTimeConfirmed(false);
              }}
              accessibilityLabel={t('common.fields.hours')}
            />
            <Text style={styles.customTimeSeparator}>:</Text>
            <TextInput
              style={[styles.customTimeInput, customTimeError && styles.inputError]}
              placeholder="MM"
              keyboardType="numeric"
              maxLength={2}
              value={customMinutes}
              onChangeText={(text) => {
                const filteredText = text.replace(/[^0-9]/g, '');
                setCustomMinutes(filteredText);
                setCustomTimeError(null);
                setCustomTimeConfirmed(false);
              }}
              accessibilityLabel={t('common.fields.minutes')}
            />
          </View>
          <TouchableOpacity
            style={[
              styles.customTimeButton,
              customTimeConfirmed && styles.customTimeButtonConfirmed
            ]}
            onPress={handleCustomTimeSelect}
            accessibilityRole="button"
            accessibilityLabel={t(TASK_TRANSLATIONS.BUTTONS.OK)}
          >
            <MaterialIcons
              name={customTimeConfirmed ? "check-circle" : "check"}
              size={24}
              color={ACCESSIBILITY.COLORS.TEXT.ON_INTERACTIVE}
            />
          </TouchableOpacity>
        </View>
      )}
      
      {customTimeError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{customTimeError}</Text>
        </View>
      )}
      
      {customTimeConfirmed && !customTimeError && (
        <View style={styles.confirmationContainer}>
          <Text style={styles.confirmationText}>
            {t('taskManagement.confirmations.timeSet')}
          </Text>
        </View>
      )}

      <View style={styles.reminderSection}>
        <Text style={styles.reminderTitle}>
          {t(TASK_TRANSLATIONS.DATE_TIME_SELECTOR.REMINDERS.TITLE)}
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
  selectedPeriodContainer: {
    backgroundColor: ACCESSIBILITY.COLORS.BACKGROUND.SECONDARY,
    borderRadius: ACCESSIBILITY.SPACING.SM,
    padding: ACCESSIBILITY.SPACING.SM,
    marginBottom: ACCESSIBILITY.SPACING.BASE,
    alignItems: 'center',
  },
  selectedPeriodText: {
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.BASE,
    color: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
    fontWeight: ACCESSIBILITY.TYPOGRAPHY.WEIGHTS.SEMIBOLD,
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
  selectedTimeSlot: {
    backgroundColor: ACCESSIBILITY.COLORS.INTERACTIVE.PRIMARY,
  },
  icon: {
    marginRight: ACCESSIBILITY.SPACING.SM,
  },
  timeText: {
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.BASE,
    color: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
    fontWeight: ACCESSIBILITY.TYPOGRAPHY.WEIGHTS.MEDIUM,
  },
  selectedTimeText: {
    color: ACCESSIBILITY.COLORS.TEXT.ON_INTERACTIVE,
  },
  customTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: ACCESSIBILITY.SPACING.BASE,
  },
  customTimeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ACCESSIBILITY.COLORS.BACKGROUND.SECONDARY,
    borderRadius: ACCESSIBILITY.SPACING.SM,
    padding: ACCESSIBILITY.SPACING.SM,
    flex: 1,
  },
  customTimeInput: {
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.LG,
    color: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
    width: 40,
    textAlign: 'center',
    padding: ACCESSIBILITY.SPACING.XS,
  },
  customTimeSeparator: {
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.LG,
    color: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
    marginHorizontal: ACCESSIBILITY.SPACING.XS,
  },
  customTimeButton: {
    backgroundColor: ACCESSIBILITY.COLORS.INTERACTIVE.PRIMARY,
    borderRadius: ACCESSIBILITY.SPACING.SM,
    padding: ACCESSIBILITY.SPACING.SM,
    marginLeft: ACCESSIBILITY.SPACING.SM,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: ACCESSIBILITY.TOUCH_TARGET.MIN_WIDTH,
    minHeight: ACCESSIBILITY.TOUCH_TARGET.MIN_HEIGHT,
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
  inputError: {
    borderWidth: 1,
    borderColor: ACCESSIBILITY.COLORS.STATES.ERROR,
  },
  errorContainer: {
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    padding: ACCESSIBILITY.SPACING.SM,
    borderRadius: ACCESSIBILITY.SPACING.SM,
    marginBottom: ACCESSIBILITY.SPACING.BASE,
  },
  errorText: {
    color: ACCESSIBILITY.COLORS.STATES.ERROR,
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.SM,
    textAlign: 'center',
  },
  confirmationContainer: {
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    padding: ACCESSIBILITY.SPACING.SM,
    borderRadius: ACCESSIBILITY.SPACING.SM,
    marginBottom: ACCESSIBILITY.SPACING.BASE,
  },
  confirmationText: {
    color: ACCESSIBILITY.COLORS.STATES.SUCCESS,
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.SM,
    textAlign: 'center',
  },
  customTimeButtonConfirmed: {
    backgroundColor: ACCESSIBILITY.COLORS.STATES.SUCCESS,
  },
});
