import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Modal } from 'react-native';
import { TabBar } from './TabBar';
import { QuickOptions } from './QuickOptions';
import { CalendarView } from './CalendarView';
import { TimePicker } from './TimePicker';
import { ACCESSIBILITY } from '../../../../constants/accessibility';
import type { Task } from '../../../../services/taskService';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';
import { TASK_TRANSLATIONS } from '../../../../i18n/keys';

interface DateTimeSelectorProps {
  dueDate?: Date | string;
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
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(() => {
    if (!dueDate) return undefined;
    return typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  });
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

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

  const formatDate = (date?: Date | string) => {
    if (!date) return t(TASK_TRANSLATIONS.DATE_TIME_SELECTOR.QUICK_OPTIONS.TODAY);
    
    try {
      // Convertim string-ul ISO la obiect Date dacă este necesar
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const dateString = dateObj.toDateString();
      const todayString = today.toDateString();
      const tomorrowString = tomorrow.toDateString();
      
      if (dateString === todayString) {
        return t(TASK_TRANSLATIONS.DATE_TIME_SELECTOR.QUICK_OPTIONS.TODAY);
      } else if (dateString === tomorrowString) {
        return t(TASK_TRANSLATIONS.DATE_TIME_SELECTOR.QUICK_OPTIONS.TOMORROW);
      } else {
        return dateObj.toLocaleDateString();
      }
    } catch (error) {
      console.error('Error formatting date:', error, date);
      return t(TASK_TRANSLATIONS.DATE_TIME_SELECTOR.QUICK_OPTIONS.TODAY);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => setModalVisible(true)}
        accessibilityRole="button"
        accessibilityLabel={t(TASK_TRANSLATIONS.BUTTONS.SET_DATE_TIME)}
      >
        <MaterialIcons
          name="event"
          size={24}
          color={ACCESSIBILITY.COLORS.TEXT.SECONDARY}
        />
        {dueDate && (
          <Text style={styles.dateText}>
            {formatDate(dueDate)}
          </Text>
        )}
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t(TASK_TRANSLATIONS.DATE_TIME_SELECTOR.TABS.DATE)}</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={24} color={ACCESSIBILITY.COLORS.TEXT.PRIMARY} />
              </TouchableOpacity>
            </View>

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
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: ACCESSIBILITY.SPACING.XS,
    borderRadius: ACCESSIBILITY.SPACING.SM,
    backgroundColor: ACCESSIBILITY.COLORS.BACKGROUND.SECONDARY,
    minHeight: ACCESSIBILITY.TOUCH_TARGET.MIN_HEIGHT,
    minWidth: ACCESSIBILITY.TOUCH_TARGET.MIN_WIDTH,
  },
  dateText: {
    marginLeft: ACCESSIBILITY.SPACING.XS,
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.SM,
    color: ACCESSIBILITY.COLORS.TEXT.SECONDARY,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: ACCESSIBILITY.COLORS.BACKGROUND.PRIMARY,
    borderTopLeftRadius: ACCESSIBILITY.SPACING.MD,
    borderTopRightRadius: ACCESSIBILITY.SPACING.MD,
    padding: ACCESSIBILITY.SPACING.BASE,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ACCESSIBILITY.SPACING.BASE,
  },
  modalTitle: {
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.LG,
    fontWeight: ACCESSIBILITY.TYPOGRAPHY.WEIGHTS.SEMIBOLD,
    color: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
  },
  closeButton: {
    padding: ACCESSIBILITY.SPACING.XS,
  },
});
