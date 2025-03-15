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
import { getTimePeriodFromDate } from '../../../../utils/timeUtils';

interface DateTimeSelectorProps {
  dueDate?: Date | string;
  reminderMinutes?: number;
  onDateTimeChange: (updates: Partial<Task>) => void;
  isCompleted?: boolean;
  initialModalVisible?: boolean;
  onClose?: () => void;
}

type TabType = 'date' | 'duration';

/**
 * Componenta DateTimeSelector
 * Permite utilizatorului să selecteze data și ora pentru un task
 * Afișează data și ora într-un format accesibil pentru utilizatorii cu ADHD
 * 
 * IMPACT: Modificarea acestei componente afectează modul în care utilizatorii văd și setează datele scadente
 */
export const DateTimeSelector: React.FC<DateTimeSelectorProps> = ({
  dueDate,
  reminderMinutes,
  onDateTimeChange,
  isCompleted = false,
  initialModalVisible = false,
  onClose,
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabType>('date');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(() => {
    if (!dueDate) return undefined;
    return typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  });
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [modalVisible, setModalVisible] = useState(initialModalVisible);

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
      
      // Determinăm perioada corectă bazată pe ora selectată
      const period = getTimePeriodFromDate(newDate);
      
      // Actualizăm task-ul cu noua dată și perioada corespunzătoare
      onDateTimeChange({ 
        dueDate: newDate,
        period: period
      });
    }
  };

  /**
   * Gestionează selectarea unei opțiuni rapide
   * IMPACT: Setează data și ora într-o singură operație
   * @param option Opțiunea selectată care conține data și, opțional, ora
   */
  const handleQuickOptionSelect = (option: { date: Date; time?: { hours: number; minutes: number } }) => {
    // Creăm o nouă dată bazată pe opțiunea selectată
    const newDate = new Date(option.date);
    
    // Dacă opțiunea include și ora, o setăm
    if (option.time) {
      newDate.setHours(option.time.hours);
      newDate.setMinutes(option.time.minutes);
    }
    
    // Determinăm perioada corectă bazată pe ora selectată
    const period = getTimePeriodFromDate(newDate);
    
    // Actualizăm starea locală
    setSelectedDate(newDate);
    
    // Trimitem actualizarea către părinte
    onDateTimeChange({ 
      dueDate: newDate,
      period: period
    });
    
    // Închide direct modalul fără a mai afișa selectorul de timp
    // Utilizatorul poate deschide din nou modalul dacă dorește să ajusteze ora
    setModalVisible(false);
  };

  /**
   * Gestionează schimbarea timpului pentru memento
   * IMPACT: Actualizează timpul de notificare pentru task
   * @param minutes Numărul de minute înainte de data scadentă când se va trimite notificarea
   */
  const handleReminderChange = (minutes: number) => {
    onDateTimeChange({ reminderMinutes: minutes });
  };

  /**
   * Formatează data pentru afișare
   * IMPACT: Determină cum este afișată data în interfață
   * @param date Data care trebuie formatată
   * @returns String formatat pentru afișare
   */
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

  /**
   * Formatează ora pentru afișare
   * IMPACT: Determină cum este afișată ora în interfață
   * @param date Data din care se extrage ora
   * @returns String formatat pentru afișare (ex: "18:00")
   */
  const formatTime = (date?: Date | string) => {
    if (!date) return '';
    
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      const hours = dateObj.getHours().toString().padStart(2, '0');
      const minutes = dateObj.getMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch (error) {
      console.error('Error formatting time:', error, date);
      return '';
    }
  };

  /**
   * Determină culoarea pentru data scadentă în funcție de urgență
   * IMPACT: Oferă indicii vizuale pentru utilizatorii cu ADHD despre urgența task-ului
   * @param date Data scadentă
   * @returns Obiectul de culoare din constanta ACCESSIBILITY
   */
  const getDueDateColor = (date?: Date | string) => {
    if (!date) return ACCESSIBILITY.COLORS.TEXT.SECONDARY;
    
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      const now = new Date();
      const diffHours = (dateObj.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      if (diffHours < 0) {
        // Termen depășit
        return ACCESSIBILITY.COLORS.STATES.ERROR;
      } else if (diffHours < 3) {
        // Mai puțin de 3 ore - urgent
        return ACCESSIBILITY.COLORS.STATES.WARNING;
      } else if (diffHours < 24) {
        // Mai puțin de 24 ore - atenție
        return 'rgba(234, 88, 12, 0.9)'; // Portocaliu
      }
      
      return ACCESSIBILITY.COLORS.TEXT.SECONDARY;
    } catch (error) {
      return ACCESSIBILITY.COLORS.TEXT.SECONDARY;
    }
  };

  return (
    <>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => {
          setModalVisible(true);
          // Dacă task-ul are deja o dată setată, deschidem direct selectorul de timp
          if (dueDate) {
            setShowTimePicker(true);
          }
        }}
        accessibilityRole="button"
        accessibilityLabel={t(TASK_TRANSLATIONS.BUTTONS.SET_DATE_TIME)}
      >
        <MaterialIcons
          name="event"
          size={24}
          color={isCompleted ? ACCESSIBILITY.COLORS.TEXT.SECONDARY : getDueDateColor(dueDate)}
        />
        {dueDate && (
          <View style={styles.dateTimeContainer}>
            <Text style={[
              styles.dateText, 
              isCompleted && styles.completedText,
              { color: isCompleted ? ACCESSIBILITY.COLORS.TEXT.SECONDARY : getDueDateColor(dueDate) }
            ]}>
              {formatDate(dueDate)}
            </Text>
            {formatTime(dueDate) && (
              <Text style={[
                styles.timeText, 
                isCompleted && styles.completedText,
                { color: isCompleted ? ACCESSIBILITY.COLORS.TEXT.SECONDARY : getDueDateColor(dueDate) }
              ]}>
                {formatTime(dueDate)}
              </Text>
            )}
          </View>
        )}
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          if (onClose) onClose();
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {/* Header pentru ecranul de calendar */}
            {!showTimePicker && (
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {t(TASK_TRANSLATIONS.DATE_TIME_SELECTOR.TITLE)}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    setModalVisible(false);
                    if (onClose) onClose();
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={t(TASK_TRANSLATIONS.BUTTONS.CLOSE)}
                >
                  <MaterialIcons
                    name="close"
                    size={24}
                    color={ACCESSIBILITY.COLORS.TEXT.PRIMARY}
                  />
                </TouchableOpacity>
              </View>
            )}
            
            {/* Header pentru ecranul de selectare a orei */}
            {showTimePicker && (
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={() => setShowTimePicker(false)}
                  accessibilityRole="button"
                  accessibilityLabel={t(TASK_TRANSLATIONS.BUTTONS.BACK)}
                >
                  <MaterialIcons
                    name="arrow-back"
                    size={24}
                    color={ACCESSIBILITY.COLORS.TEXT.PRIMARY}
                  />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>
                  {t(TASK_TRANSLATIONS.DATE_TIME_SELECTOR.TITLE)}
                </Text>
                <TouchableOpacity
                  style={styles.headerButton}
                  onPress={() => {
                    setModalVisible(false);
                    if (onClose) onClose();
                  }}
                  accessibilityRole="button"
                  accessibilityLabel={t(TASK_TRANSLATIONS.BUTTONS.CLOSE)}
                >
                  <MaterialIcons
                    name="close"
                    size={24}
                    color={ACCESSIBILITY.COLORS.TEXT.PRIMARY}
                  />
                </TouchableOpacity>
              </View>
            )}

            <TabBar activeTab={activeTab} onTabChange={setActiveTab} />

            {activeTab === 'date' ? (
              <>
                <QuickOptions onOptionSelect={handleQuickOptionSelect} />
                {showTimePicker ? (
                  <>
                    <TimePicker 
                      onTimeSelect={handleTimeSelect} 
                      reminderMinutes={reminderMinutes}
                      onReminderChange={handleReminderChange}
                      selectedDate={selectedDate}
                    />
                    <View style={styles.buttonContainer}>
                      <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => {
                          setModalVisible(false);
                          if (onClose) onClose();
                        }}
                        accessibilityRole="button"
                        accessibilityLabel={t(TASK_TRANSLATIONS.BUTTONS.OK)}
                      >
                        <MaterialIcons
                          name="check"
                          size={24}
                          color={ACCESSIBILITY.COLORS.STATES.SUCCESS}
                        />
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  <>
                    <CalendarView onDateSelect={handleDateSelect} />
                    <View style={styles.buttonContainer}>
                      {/* Eliminăm butonul de înapoi din ecranul de calendar - nu este necesar */}
                      <TouchableOpacity
                        style={styles.iconButton}
                        onPress={() => {
                          if (selectedDate) {
                            // Închide modalul direct dacă avem deja o dată selectată
                            setModalVisible(false);
                            if (onClose) onClose();
                          }
                        }}
                        accessibilityRole="button"
                        accessibilityLabel={t(TASK_TRANSLATIONS.BUTTONS.OK)}
                      >
                        <MaterialIcons
                          name="check"
                          size={24}
                          color={ACCESSIBILITY.COLORS.STATES.SUCCESS}
                        />
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </>
            ) : (
              <Text style={styles.comingSoon}>
                {t(TASK_TRANSLATIONS.DATE_TIME_SELECTOR.COMING_SOON)}
              </Text>
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
    padding: ACCESSIBILITY.SPACING.XS,
    borderRadius: ACCESSIBILITY.SPACING.XS,
  },
  dateTimeContainer: {
    marginLeft: ACCESSIBILITY.SPACING.XS,
  },
  dateText: {
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.SM,
    color: ACCESSIBILITY.COLORS.TEXT.SECONDARY,
    marginLeft: ACCESSIBILITY.SPACING.XS,
  },
  timeText: {
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.SM,
    fontWeight: ACCESSIBILITY.TYPOGRAPHY.WEIGHTS.MEDIUM,
    color: ACCESSIBILITY.COLORS.TEXT.SECONDARY,
    marginLeft: ACCESSIBILITY.SPACING.XS,
  },
  completedText: {
    textDecorationLine: 'line-through',
    fontStyle: 'italic',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: ACCESSIBILITY.COLORS.BACKGROUND.PRIMARY,
    borderRadius: ACCESSIBILITY.SPACING.SM,
    padding: ACCESSIBILITY.SPACING.MD,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ACCESSIBILITY.SPACING.MD,
  },
  headerButton: {
    padding: ACCESSIBILITY.SPACING.SM,
    borderRadius: ACCESSIBILITY.SPACING.SM,
  },
  modalTitle: {
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.LG,
    fontWeight: ACCESSIBILITY.TYPOGRAPHY.WEIGHTS.BOLD,
    color: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
    flex: 1,
    textAlign: 'center',
  },
  comingSoon: {
    textAlign: 'center',
    marginTop: ACCESSIBILITY.SPACING.LG,
    color: ACCESSIBILITY.COLORS.TEXT.SECONDARY,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: ACCESSIBILITY.SPACING.MD,
  },
  iconButton: {
    padding: ACCESSIBILITY.SPACING.SM,
    borderRadius: ACCESSIBILITY.SPACING.SM,
    marginLeft: ACCESSIBILITY.SPACING.SM,
  },
});
