import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  TouchableWithoutFeedback,
  Platform,
  Vibration,
  Switch,
  ScrollView,
  Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { Task, TaskUpdateData } from '../../../services/taskService';
import { ACCESSIBILITY } from '../../../constants/accessibility';
import { DateTimeSelector } from './DateTimeSelector';

interface TaskEditModalProps {
  visible: boolean;
  task: Task | null;
  onClose: () => void;
  onUpdate: (taskId: string, updates: Partial<Task>) => void;
  onDelete?: (taskId: string) => void;
}

/**
 * Modal pentru editarea task-urilor
 */
const TaskEditModal: React.FC<TaskEditModalProps> = ({
  visible,
  task,
  onClose,
  onUpdate,
  onDelete
}) => {
  const { t, i18n } = useTranslation();
  const [title, setTitle] = useState(task?.title || '');
  const [notes, setNotes] = useState(task?.notes || '');
  const [category, setCategory] = useState(task?.category || '');
  const [isPriority, setIsPriority] = useState(task?.isPriority || false);
  const [dueDate, setDueDate] = useState<Date | null>(task?.dueDate ? new Date(task.dueDate) : null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateTimeModalVisible, setDateTimeModalVisible] = useState(false);

  // Inițializăm starea cu valorile task-ului curent când se deschide modalul
  useEffect(() => {
    if (task) {
      setTitle(task.title || t('taskManagement.labels.untitledTask'));
      setIsPriority(task.isPriority || false);
      setNotes(task.notes || '');
      setDueDate(task.dueDate ? new Date(task.dueDate) : null);
      setCategory(task.category || '');
    }
  }, [task, t]);

  // Funcție pentru a formata data scadentă pentru afișare
  const formatDueDate = () => {
    if (!dueDate) return t('taskManagement.labels.noDueDate');
    
    const locale = i18n.language === 'ro' ? ro : undefined;
    return format(dueDate, 'PPp', { locale });
  };

  // Funcție pentru a deschide/închide selectorul de dată
  const toggleDatePicker = () => {
    setShowDatePicker(!showDatePicker);
  };

  // Funcție pentru a seta data scadentă
  const handleDateTimeChange = (updates: Partial<Task>) => {
    if (updates.dueDate) {
      setDueDate(updates.dueDate);
    }
    setShowDatePicker(false);
  };

  // Funcție pentru a șterge data scadentă
  const handleClearDueDate = () => {
    setDueDate(null);
  };

  // Funcție pentru a confirma ștergerea task-ului
  const handleDeleteConfirm = () => {
    if (!task || !onDelete) return;

    Alert.alert(
      t('taskManagement.alerts.deleteTaskTitle'),
      t('taskManagement.alerts.deleteTaskMessage'),
      [
        {
          text: t('common.actions.cancel'),
          style: 'cancel'
        },
        {
          text: t('common.actions.delete'),
          onPress: () => {
            onDelete(task.id);
            onClose();
          },
          style: 'destructive'
        }
      ]
    );
  };

  // Funcție pentru a salva modificările
  const handleSave = () => {
    if (!task) return;

    const trimmedTitle = title.trim();
    const trimmedNotes = notes.trim();
    const trimmedCategory = category.trim();
    const updates: TaskUpdateData = {};

    // Verificăm dacă titlul s-a schimbat
    if (trimmedTitle !== task.title) {
      updates.title = trimmedTitle === '' ? t('taskManagement.labels.untitledTask') : trimmedTitle;
    }

    // Verificăm dacă prioritatea s-a schimbat
    if (isPriority !== task.isPriority) {
      updates.isPriority = isPriority;
    }

    // Verificăm dacă notele s-au schimbat
    if (trimmedNotes !== (task.notes || '')) {
      updates.notes = trimmedNotes;
    }

    // Verificăm dacă data scadentă s-a schimbat
    if ((task.dueDate && !dueDate) || (!task.dueDate && dueDate) || 
        (task.dueDate && dueDate && new Date(task.dueDate).getTime() !== dueDate.getTime())) {
      updates.dueDate = dueDate || undefined;
    }

    // Verificăm dacă categoria s-a schimbat
    if (trimmedCategory !== (task.category || '')) {
      updates.category = trimmedCategory;
    }

    // Dacă există modificări, le salvăm
    if (Object.keys(updates).length > 0) {
      // Convertim TaskUpdateData în Partial<Task> pentru a fi compatibil cu onUpdate
      const taskUpdates: Partial<Task> = {};
      
      // Copiem toate proprietățile din updates în taskUpdates
      Object.keys(updates).forEach(key => {
        taskUpdates[key as keyof Task] = updates[key as keyof TaskUpdateData] as any;
      });
      
      onUpdate(task.id, taskUpdates);
      
      // Feedback haptic subtil pentru confirmare
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        Vibration.vibrate(20);
      }
    }

    onClose();
  };

  // Funcție pentru a închide modalul fără a salva
  const handleCancel = () => {
    onClose();
  };

  // Dacă nu există un task, nu afișăm modalul
  if (!task) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <TouchableWithoutFeedback onPress={handleCancel}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
            <View style={styles.modalContainer}>
              <View style={styles.header}>
                <Text style={styles.headerTitle}>{t('taskManagement.modals.editTask')}</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={handleCancel}
                  accessibilityRole="button"
                  accessibilityLabel={t('common.actions.close')}
                >
                  <MaterialIcons name="close" size={24} color={ACCESSIBILITY.COLORS.TEXT.PRIMARY} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.scrollView}>
                <View style={styles.content}>
                  {/* Editare titlu */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>{t('taskManagement.labels.title')}</Text>
                    <TextInput
                      style={styles.input}
                      value={title}
                      onChangeText={setTitle}
                      placeholder={t('taskManagement.placeholders.taskTitle')}
                      autoCapitalize="sentences"
                    />
                  </View>

                  {/* Toggle prioritate */}
                  <View style={styles.switchContainer}>
                    <Text style={styles.label}>{t('taskManagement.labels.priority')}</Text>
                    <Switch
                      value={isPriority}
                      onValueChange={setIsPriority}
                      trackColor={{ false: ACCESSIBILITY.COLORS.BACKGROUND.SECONDARY, true: ACCESSIBILITY.COLORS.INTERACTIVE.PRIMARY }}
                      thumbColor={isPriority ? ACCESSIBILITY.COLORS.INTERACTIVE.PRIMARY_DARK : ACCESSIBILITY.COLORS.BACKGROUND.PRIMARY}
                      ios_backgroundColor={ACCESSIBILITY.COLORS.BACKGROUND.SECONDARY}
                    />
                  </View>

                  {/* Selector dată scadentă */}
                  <View style={styles.dateContainer}>
                    <Text style={styles.label}>{t('taskManagement.labels.dueDate')}</Text>
                    <TouchableOpacity 
                      style={styles.dateRow}
                      onPress={() => setDateTimeModalVisible(true)}
                      accessibilityRole="button"
                      accessibilityLabel={t('taskManagement.accessibility.selectDueDate')}
                    >
                      <View style={styles.dateButton}>
                        <MaterialIcons 
                          name="event" 
                          size={20} 
                          color={ACCESSIBILITY.COLORS.TEXT.SECONDARY} 
                          style={styles.dateIcon}
                        />
                        <Text style={styles.dateText}>
                          {formatDueDate()}
                        </Text>
                      </View>
                      
                      {dueDate && (
                        <TouchableOpacity
                          style={styles.clearDateButton}
                          onPress={(e) => {
                            e.stopPropagation(); // Prevenim propagarea tap-ului
                            handleClearDueDate();
                          }}
                          accessibilityRole="button"
                          accessibilityLabel={t('taskManagement.accessibility.clearDueDate')}
                        >
                          <MaterialIcons 
                            name="clear" 
                            size={20} 
                            color={ACCESSIBILITY.COLORS.TEXT.SECONDARY}
                          />
                        </TouchableOpacity>
                      )}
                    </TouchableOpacity>
                    
                    {dateTimeModalVisible && (
                      <View style={styles.datePickerContainer}>
                        <DateTimeSelector
                          dueDate={dueDate || undefined}
                          onDateTimeChange={handleDateTimeChange}
                          isCompleted={task.completed}
                          initialModalVisible={true}
                          onClose={() => setDateTimeModalVisible(false)}
                        />
                      </View>
                    )}
                  </View>

                  {/* Selector categorie */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>{t('taskManagement.labels.category')}</Text>
                    <TextInput
                      style={styles.input}
                      value={category}
                      onChangeText={setCategory}
                      placeholder={t('taskManagement.placeholders.category')}
                      autoCapitalize="sentences"
                    />
                  </View>

                  {/* Note/descriere */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.label}>{t('taskManagement.labels.notes')}</Text>
                    <TextInput
                      style={[styles.input, styles.notesInput]}
                      value={notes}
                      onChangeText={setNotes}
                      placeholder={t('taskManagement.placeholders.notes')}
                      multiline
                      textAlignVertical="top"
                      numberOfLines={4}
                    />
                  </View>
                </View>
              </ScrollView>

              <View style={styles.footer}>
                {onDelete && (
                  <TouchableOpacity
                    style={[styles.button, styles.deleteButton]}
                    onPress={handleDeleteConfirm}
                    accessibilityRole="button"
                    accessibilityLabel={t('common.actions.delete')}
                  >
                    <MaterialIcons name="delete" size={20} color={ACCESSIBILITY.COLORS.STATES.ERROR} />
                  </TouchableOpacity>
                )}
                
                <View style={styles.footerButtonsContainer}>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton]}
                    onPress={handleCancel}
                    accessibilityRole="button"
                    accessibilityLabel={t('common.actions.cancel')}
                  >
                    <Text style={styles.cancelButtonText}>{t('common.actions.cancel')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.saveButton]}
                    onPress={handleSave}
                    accessibilityRole="button"
                    accessibilityLabel={t('common.actions.save')}
                  >
                    <Text style={styles.saveButtonText}>{t('common.actions.save')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    backgroundColor: ACCESSIBILITY.COLORS.BACKGROUND.PRIMARY,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: ACCESSIBILITY.SPACING.MD,
    borderBottomWidth: 1,
    borderBottomColor: ACCESSIBILITY.COLORS.BORDER.LIGHT,
  },
  headerTitle: {
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.LG,
    fontWeight: 'bold',
    color: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
  },
  closeButton: {
    padding: ACCESSIBILITY.SPACING.SM,
    borderRadius: ACCESSIBILITY.SPACING.SM,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    maxHeight: '70%',
  },
  content: {
    padding: ACCESSIBILITY.SPACING.MD,
  },
  inputContainer: {
    marginBottom: ACCESSIBILITY.SPACING.MD,
  },
  label: {
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.MD,
    fontWeight: '500',
    color: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
    marginBottom: ACCESSIBILITY.SPACING.SM,
  },
  input: {
    borderWidth: 1,
    borderColor: ACCESSIBILITY.COLORS.BORDER.MEDIUM,
    borderRadius: 8,
    padding: ACCESSIBILITY.SPACING.MD,
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.MD,
    color: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
    backgroundColor: ACCESSIBILITY.COLORS.BACKGROUND.SECONDARY,
    minHeight: 44,
  },
  notesInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: ACCESSIBILITY.SPACING.MD,
  },
  dateContainer: {
    marginBottom: ACCESSIBILITY.SPACING.MD,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: ACCESSIBILITY.COLORS.BORDER.MEDIUM,
    borderRadius: 8,
    padding: ACCESSIBILITY.SPACING.MD,
    backgroundColor: ACCESSIBILITY.COLORS.BACKGROUND.SECONDARY,
    flex: 1,
    minHeight: 44,
  },
  dateIcon: {
    marginRight: ACCESSIBILITY.SPACING.SM,
  },
  dateText: {
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.MD,
    color: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
  },
  clearDateButton: {
    padding: ACCESSIBILITY.SPACING.SM,
    marginLeft: ACCESSIBILITY.SPACING.SM,
    borderRadius: ACCESSIBILITY.SPACING.SM,
    backgroundColor: ACCESSIBILITY.COLORS.BACKGROUND.SECONDARY,
    borderWidth: 1,
    borderColor: ACCESSIBILITY.COLORS.BORDER.MEDIUM,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerContainer: {
    marginTop: ACCESSIBILITY.SPACING.MD,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: ACCESSIBILITY.SPACING.MD,
    borderTopWidth: 1,
    borderTopColor: ACCESSIBILITY.COLORS.BORDER.LIGHT,
  },
  footerButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flex: 1,
  },
  button: {
    paddingVertical: ACCESSIBILITY.SPACING.SM,
    paddingHorizontal: ACCESSIBILITY.SPACING.MD,
    borderRadius: 8,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: ACCESSIBILITY.SPACING.SM,
  },
  cancelButton: {
    backgroundColor: ACCESSIBILITY.COLORS.BACKGROUND.SECONDARY,
    borderWidth: 1,
    borderColor: ACCESSIBILITY.COLORS.BORDER.MEDIUM,
  },
  saveButton: {
    backgroundColor: ACCESSIBILITY.COLORS.INTERACTIVE.PRIMARY,
  },
  deleteButton: {
    backgroundColor: ACCESSIBILITY.COLORS.BACKGROUND.SECONDARY,
    borderWidth: 1,
    borderColor: ACCESSIBILITY.COLORS.BORDER.MEDIUM,
  },
  cancelButtonText: {
    color: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.MD,
    fontWeight: '500',
  },
  saveButtonText: {
    color: ACCESSIBILITY.COLORS.TEXT.ON_INTERACTIVE,
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.MD,
    fontWeight: '500',
  },
});

export default TaskEditModal;
