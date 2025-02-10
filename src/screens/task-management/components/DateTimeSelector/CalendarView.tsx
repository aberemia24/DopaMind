import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ACCESSIBILITY } from '../../../../constants/accessibility';

interface CalendarViewProps {
  selectedDate?: Date;
  onDateSelect: (date: Date) => void;
}

const DAYS_OF_WEEK = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

export const CalendarView: React.FC<CalendarViewProps> = ({
  selectedDate,
  onDateSelect,
}) => {
  const { t } = useTranslation();
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(
    selectedDate || today
  );

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days: (Date | null)[] = Array(startingDay).fill(null);
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const isToday = (date: Date) => {
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date: Date) => {
    return selectedDate && (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() - 1,
      1
    ));
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      1
    ));
  };

  const days = getDaysInMonth(currentMonth);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={goToPreviousMonth}
          style={styles.navigationButton}
          accessibilityRole="button"
          accessibilityLabel={t('taskManagement.dateTimeSelector.calendar.previousMonth')}
        >
          <MaterialIcons
            name="chevron-left"
            size={24}
            color={ACCESSIBILITY.COLORS.TEXT.PRIMARY}
          />
        </TouchableOpacity>

        <Text style={styles.monthYear}>
          {currentMonth.toLocaleDateString('ro-RO', {
            month: 'long',
            year: 'numeric',
          })}
        </Text>

        <TouchableOpacity
          onPress={goToNextMonth}
          style={styles.navigationButton}
          accessibilityRole="button"
          accessibilityLabel={t('taskManagement.dateTimeSelector.calendar.nextMonth')}
        >
          <MaterialIcons
            name="chevron-right"
            size={24}
            color={ACCESSIBILITY.COLORS.TEXT.PRIMARY}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.weekDays}>
        {DAYS_OF_WEEK.map((day, index) => (
          <Text key={index} style={styles.weekDay}>
            {day}
          </Text>
        ))}
      </View>

      <View style={styles.daysGrid}>
        {days.map((date, index) => (
          <View key={index} style={styles.dayCell}>
            {date && (
              <TouchableOpacity
                style={[
                  styles.day,
                  isToday(date) && styles.today,
                  isSelected(date) && styles.selected,
                ]}
                onPress={() => onDateSelect(date)}
                accessibilityRole="button"
                accessibilityLabel={date.toLocaleDateString()}
                accessibilityState={{ selected: isSelected(date) }}
              >
                <Text style={[
                  styles.dayText,
                  isToday(date) && styles.todayText,
                  isSelected(date) && styles.selectedText,
                ]}>
                  {date.getDate()}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: ACCESSIBILITY.COLORS.BACKGROUND.PRIMARY,
    borderRadius: ACCESSIBILITY.SPACING.SM,
    marginBottom: ACCESSIBILITY.SPACING.BASE,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: ACCESSIBILITY.SPACING.SM,
    marginBottom: ACCESSIBILITY.SPACING.SM,
  },
  navigationButton: {
    padding: ACCESSIBILITY.SPACING.SM,
    borderRadius: ACCESSIBILITY.SPACING.SM,
  },
  monthYear: {
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.LG,
    color: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
    fontWeight: ACCESSIBILITY.TYPOGRAPHY.WEIGHTS.SEMIBOLD,
  },
  weekDays: {
    flexDirection: 'row',
    marginBottom: ACCESSIBILITY.SPACING.SM,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.SM,
    color: ACCESSIBILITY.COLORS.TEXT.SECONDARY,
    fontWeight: ACCESSIBILITY.TYPOGRAPHY.WEIGHTS.MEDIUM,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    padding: 2,
  },
  day: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: ACCESSIBILITY.SPACING.SM,
  },
  dayText: {
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.SM,
    color: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
  },
  today: {
    backgroundColor: ACCESSIBILITY.COLORS.INTERACTIVE.SECONDARY,
  },
  todayText: {
    fontWeight: ACCESSIBILITY.TYPOGRAPHY.WEIGHTS.BOLD,
  },
  selected: {
    backgroundColor: ACCESSIBILITY.COLORS.INTERACTIVE.PRIMARY,
  },
  selectedText: {
    color: ACCESSIBILITY.COLORS.TEXT.ON_INTERACTIVE,
    fontWeight: ACCESSIBILITY.TYPOGRAPHY.WEIGHTS.BOLD,
  },
});
