import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TabBar } from './TabBar';
import { QuickOptions } from './QuickOptions';
import { CalendarView } from './CalendarView';
import { TimePicker } from './TimePicker';
import { ACCESSIBILITY } from '../../../../constants/accessibility';
import type { Task } from '../../../../services/taskService';
import { useTranslation } from 'react-i18next';

interface DateTimeSelectorProps {
  dueDate?: Date;
  reminderMinutes?: number;
  onDateTimeChange: (updates: Partial<Task>) => void;
}

type TabType = 'date' | 'duration';

export const DateTimeSelector: React.FC<DateTimeSelectorProps> = ({
  dueDate,
  reminderMinutes,
  onDateTimeChange,
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('date');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(dueDate);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setShowTimePicker(true);
    onDateTimeChange({ dueDate: date });
  };

  const handleTimeSelect = (time: { hours: number; minutes: number }) => {
    if (selectedDate) {
      const newDate = new Date(selectedDate);
      newDate.setHours(time.hours);
      newDate.setMinutes(time.minutes);
      onDateTimeChange({ dueDate: newDate });
    }
  };

  const handleQuickOptionSelect = (option: { date: Date; time?: { hours: number; minutes: number } }) => {
    setSelectedDate(option.date);
    if (option.time) {
      handleTimeSelect(option.time);
    }
    setShowTimePicker(true);
  };

  return (
    <View style={styles.container}>
      <TabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {activeTab === 'date' && (
        <>
          <QuickOptions onOptionSelect={handleQuickOptionSelect} />
          
          <CalendarView
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
          />

          {showTimePicker && selectedDate && (
            <TimePicker
              onTimeSelect={handleTimeSelect}
              reminderMinutes={reminderMinutes}
              onReminderChange={(minutes) => onDateTimeChange({ reminderMinutes: minutes })}
            />
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: ACCESSIBILITY.COLORS.BACKGROUND.PRIMARY,
    borderRadius: ACCESSIBILITY.SPACING.SM,
    padding: ACCESSIBILITY.SPACING.BASE,
  },
});
