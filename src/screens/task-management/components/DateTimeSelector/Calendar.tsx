import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ACCESSIBILITY } from '../../../../constants/accessibility';

interface CalendarProps {
  selectedDate?: Date;
  onDateSelect: (date: Date) => void;
}

interface DayProps {
  date: Date;
  isSelected: boolean;
  isToday: boolean;
  isCurrentMonth: boolean;
  onSelect: (date: Date) => void;
}

const Day: React.FC<DayProps> = ({ 
  date, 
  isSelected, 
  isToday, 
  isCurrentMonth,
  onSelect 
}) => (
  <TouchableOpacity
    style={[
      styles.dayButton,
      isToday && styles.todayButton,
      isSelected && styles.selectedDayButton,
      !isCurrentMonth && styles.outsideMonthButton
    ]}
    onPress={() => onSelect(date)}
    accessibilityRole="button"
    accessibilityState={{ selected: isSelected }}
    accessibilityLabel={date.toLocaleDateString()}
  >
    <Text style={[
      styles.dayText,
      isSelected && styles.selectedDayText,
      !isCurrentMonth && styles.outsideMonthText
    ]}>
      {date.getDate()}
    </Text>
  </TouchableOpacity>
);

const DAYS_IN_WEEK = 7;
const WEEKS_TO_SHOW = 6;

export const Calendar: React.FC<CalendarProps> = ({
  selectedDate,
  onDateSelect
}) => {
  const { t } = useTranslation();
  const [viewDate, setViewDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const getDaysInMonth = useCallback((year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  }, []);

  const getWeekDays = useCallback(() => {
    const weekDays = [];
    const date = new Date(2024, 0, 1); // Use a Sunday
    
    for (let i = 0; i < DAYS_IN_WEEK; i++) {
      weekDays.push(
        t(`calendar.weekDays.${date.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase()}`)
      );
      date.setDate(date.getDate() + 1);
    }
    
    return weekDays;
  }, [t]);

  const generateMonthDays = useCallback(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const days: Date[] = [];

    // Previous month days
    const prevMonth = new Date(year, month - 1, 1);
    const daysInPrevMonth = getDaysInMonth(year, month - 1);
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push(new Date(year, month - 1, daysInPrevMonth - i));
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }

    // Next month days
    const remainingDays = DAYS_IN_WEEK * WEEKS_TO_SHOW - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i));
    }

    return days;
  }, [viewDate, getDaysInMonth]);

  const isToday = useCallback((date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }, []);

  const isSelected = useCallback((date: Date) => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  }, [selectedDate]);

  const isCurrentMonth = useCallback((date: Date) => {
    return date.getMonth() === viewDate.getMonth();
  }, [viewDate]);

  const navigateMonth = useCallback((direction: 'prev' | 'next') => {
    setViewDate(currentDate => {
      const newDate = new Date(currentDate);
      newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigateMonth('prev')}
          accessibilityLabel={t('calendar.previousMonth')}
          style={styles.navigationButton}
        >
          <MaterialIcons
            name="chevron-left"
            size={24}
            color={ACCESSIBILITY.COLORS.TEXT.PRIMARY}
          />
        </TouchableOpacity>

        <Text style={styles.monthText}>
          {viewDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
        </Text>

        <TouchableOpacity
          onPress={() => navigateMonth('next')}
          accessibilityLabel={t('calendar.nextMonth')}
          style={styles.navigationButton}
        >
          <MaterialIcons
            name="chevron-right"
            size={24}
            color={ACCESSIBILITY.COLORS.TEXT.PRIMARY}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.weekDaysContainer}>
        {getWeekDays().map((day, index) => (
          <Text key={index} style={styles.weekDayText}>
            {day}
          </Text>
        ))}
      </View>

      <View style={styles.daysContainer}>
        {generateMonthDays().map((date, index) => (
          <Day
            key={index}
            date={date}
            isSelected={isSelected(date)}
            isToday={isToday(date)}
            isCurrentMonth={isCurrentMonth(date)}
            onSelect={onDateSelect}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ACCESSIBILITY.SPACING.MD,
  },
  monthText: {
    color: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.LG,
    fontWeight: '600',
  },
  navigationButton: {
    padding: ACCESSIBILITY.SPACING.SM,
  },
  navigationIcon: {
    color: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
  },
  weekDaysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: ACCESSIBILITY.SPACING.SM,
  },
  weekDayText: {
    color: ACCESSIBILITY.COLORS.TEXT.SECONDARY,
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.SM,
    fontWeight: '500',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayButton: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: ACCESSIBILITY.SPACING.SM,
  },
  dayText: {
    color: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.BASE,
  },
  outsideMonthButton: {
    opacity: 0.5
  },
  outsideMonthText: {
    color: ACCESSIBILITY.COLORS.TEXT.DISABLED,
  },
  todayButton: {
    backgroundColor: ACCESSIBILITY.COLORS.INTERACTIVE.SECONDARY,
  },
  selectedDayButton: {
    backgroundColor: ACCESSIBILITY.COLORS.INTERACTIVE.PRIMARY,
  },
  selectedDayText: {
    color: ACCESSIBILITY.COLORS.TEXT.ON_INTERACTIVE,
  },
});
