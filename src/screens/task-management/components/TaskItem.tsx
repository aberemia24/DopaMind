import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ACCESSIBILITY } from '../../../constants/accessibility';
import { DateTimeSelector } from './DateTimeSelector';
import type { Task } from '../../../services/taskService';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

/**
 * Interfața Props pentru componenta TaskItem
 * IMPACT: Adăugarea de proprietăți obligatorii va strica utilizările existente ale componentei
 * IMPACT: Adăugarea de proprietăți opționale nu va strica codul existent, dar necesită gestionare adecvată
 */
interface TaskItemProps {
  task: Task;                               // Obiectul task care conține toate datele sarcinii
  onToggle: () => void;                     // Handler pentru schimbarea stării de finalizare
  onDelete: () => void;                     // Handler pentru ștergerea sarcinii
  onUpdate: (updates: Partial<Task>) => void; // Handler pentru actualizarea parțială a sarcinii
  isCompact?: boolean;                      // Indică dacă sarcina ar trebui să fie afișată în mod compact
}

/**
 * Componenta TaskItem
 * Afișează o sarcină individuală cu opțiuni pentru finalizare, editare, ștergere și setare prioritate
 * 
 * IMPACT: Modificările aduse acestei componente vor afecta aspectul și comportamentul tuturor sarcinilor din aplicație
 */
const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggle,
  onDelete,
  onUpdate,
  isCompact = false,
}) => {
  // Stare pentru modul de editare a titlului
  // IMPACT: Controlează dacă titlul sarcinii poate fi editat
  const [isEditing, setIsEditing] = useState(false);
  
  // Stare pentru textul titlului în timpul editării
  // IMPACT: Păstrează valoarea temporară a titlului înainte de confirmare
  const [title, setTitle] = useState(task.title);
  
  // Inițializare hook pentru traduceri
  const { t, i18n } = useTranslation();

  /**
   * Procesează finalizarea editării titlului
   * IMPACT: Trimite actualizarea doar dacă titlul s-a schimbat efectiv
   * IMPACT: Modificarea ar putea afecta modul în care title-urile sunt salvate
   */
  const handleSubmitEditing = () => {
    if (title.trim() !== task.title) {
      onUpdate({ title: title.trim() });
    }
    setIsEditing(false);
  };

  /**
   * Formatează data de finalizare a sarcinii într-un format localizat
   * IMPACT: Afectează modul în care este afișată data de finalizare
   * IMPACT: Utilizează localizarea corectă în funcție de limba selectată (ro sau default)
   * @returns String formatat cu data completării sau string gol dacă nu există
   */
  const formatCompletionDate = () => {
    if (!task.completedAt) return '';
    
    const locale = i18n.language === 'ro' ? ro : undefined;
    return format(new Date(task.completedAt), 'dd MMM HH:mm', { locale });
  };

  /**
   * Determină stilurile containerului în funcție de starea sarcinii
   * 
   * IMPACT: Modificarea acestei logici va afecta aspectul vizual al sarcinii
   * IMPACT: Ordinea aplicării stilurilor este importantă pentru a asigura prioritatea corectă
   */
  const containerStyle = [
    styles.container,
    isCompact && styles.containerCompact,
    task.completed && (isCompact ? styles.completedContainerCompact : styles.completedContainer),
    task.isPriority && !task.completed && styles.priorityContainer,
    task.isPriority && task.completed && styles.priorityCompletedContainer,
  ];

  /**
   * Determină stilurile pentru checkbox în funcție de starea task-ului
   * IMPACT: Afectează dimensiunea și aspectul checkbox-ului
   */
  const checkboxStyle = [
    styles.checkbox,
    task.completed ? styles.completedCheckbox : null,
  ];

  /**
   * Determină stilurile pentru container-ul de conținut
   * IMPACT: Afectează layoutul și spațierea în interiorul sarcinii
   */
  const contentContainerStyle = [
    styles.contentContainer,
    task.completed ? styles.completedContentContainer : null,
  ];

  /**
   * Determină stilurile titlului în funcție de starea sarcinii
   * 
   * IMPACT: Modificarea acestei logici va afecta aspectul vizual al titlului sarcinii
   * IMPACT: Ordinea aplicării stilurilor este importantă pentru a asigura prioritatea corectă
   */
  const titleStyle = [
    styles.title,
    task.completed && styles.completedTitle,
    !task.title && styles.untitledTask,
    task.isPriority && !task.completed && styles.priorityTitle,
    task.isPriority && task.completed && styles.priorityCompletedTitle,
  ];

  return (
    <View style={containerStyle}>
      {/* Checkbox pentru marcarea sarcinii ca finalizată/nefinalizată
          IMPACT: Controlează funcționalitatea principală a sarcinii */}
      <TouchableOpacity
        style={checkboxStyle}
        onPress={onToggle}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: task.completed }}
        accessibilityLabel={task.title || t('taskManagement.labels.untitledTask')}
      >
        <MaterialIcons
          name={task.completed ? 'check-box' : 'check-box-outline-blank'}
          size={task.completed ? 16 : 24}
          color={ACCESSIBILITY.COLORS.TEXT.SECONDARY}
        />
      </TouchableOpacity>

      <View style={contentContainerStyle}>
        {/* Afișează fie un input de editare, fie textul titlului
             IMPACT: Controlează modul în care utilizatorul poate edita titlul */}
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            onBlur={handleSubmitEditing}
            onSubmitEditing={handleSubmitEditing}
            autoFocus
            accessibilityLabel={t('taskManagement.labels.editTask')}
          />
        ) : (
          <TouchableOpacity
            style={styles.titleContainer}
            onPress={() => !task.completed && setIsEditing(true)}
            accessibilityRole="button"
            accessibilityLabel={t('taskManagement.labels.editTask')}
          >
            <Text style={titleStyle}>
              {task.title || t('taskManagement.labels.untitledTask')}
            </Text>
          </TouchableOpacity>
        )}

        {/* Afișează butoanele de acțiune sau data completării, în funcție de starea sarcinii
             IMPACT: Determină opțiunile disponibile utilizatorului pentru fiecare sarcină */}
        {!task.completed ? (
          <View style={styles.actions}>
            {/* Buton pentru marcarea sarcinii ca prioritară/non-prioritară
                 IMPACT: Controlează funcționalitatea de prioritizare */}
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onUpdate({ isPriority: !task.isPriority })}
              accessibilityRole="button"
              accessibilityLabel={t(
                task.isPriority
                  ? 'taskManagement.buttons.removePriority'
                  : 'taskManagement.buttons.addPriority'
              )}
            >
              <MaterialIcons
                name={task.isPriority ? 'star' : 'star-outline'}
                size={24}
                color={task.isPriority 
                  ? (task.completed ? ACCESSIBILITY.COLORS.TEXT.SECONDARY : 'rgba(234, 88, 12, 0.9)') 
                  : ACCESSIBILITY.COLORS.TEXT.SECONDARY}
              />
            </TouchableOpacity>

            {/* Selector pentru dată și timp
                 IMPACT: Permite utilizatorului să seteze termenul limită și reamintirile */}
            <DateTimeSelector
              dueDate={task.dueDate}
              reminderMinutes={task.reminderMinutes}
              onDateTimeChange={(updates) => onUpdate(updates)}
              isCompleted={task.completed}
            />

            {/* Buton pentru ștergerea sarcinii
                 IMPACT: Controlează capacitatea utilizatorului de a șterge sarcina */}
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={onDelete}
              accessibilityRole="button"
              accessibilityLabel={t('taskManagement.buttons.deleteTask')}
            >
              <MaterialIcons
                name="delete-outline"
                size={24}
                color={ACCESSIBILITY.COLORS.STATES.ERROR}
              />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.completionInfo}>
            <Text style={styles.completionDate}>
              {formatCompletionDate()}
            </Text>
            
            {/* DateTimeSelector a fost eliminat pentru sarcinile completate conform cerințelor */}
          </View>
        )}
      </View>
    </View>
  );
};

/**
 * Stilurile componentei
 * IMPACT: Modificarea acestor stiluri va afecta aspectul vizual al tuturor sarcinilor
 */
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',            // Aranjează elementele pe orizontală
    alignItems: 'center',            // Centrează elementele pe verticală
    paddingVertical: 4,              // Spațierea verticală internă
    minHeight: 36,                   // Înălțimea minimă pentru accesibilitate
    backgroundColor: ACCESSIBILITY.COLORS.BACKGROUND.PRIMARY,
    borderRadius: ACCESSIBILITY.SPACING.SM,  // Colțuri rotunjite
    borderWidth: 1,                  // Grosimea bordurii
    borderColor: 'rgba(0,0,0,0.1)',  // Culoarea bordurii - semi-transparentă
    marginHorizontal: ACCESSIBILITY.SPACING.S,  // Spațierea orizontală externă - CONTROLEAZĂ LĂȚIMEA
    marginVertical: ACCESSIBILITY.SPACING.XXS,               // Spațierea verticală externă
  },
  containerCompact: {
    marginHorizontal: ACCESSIBILITY.SPACING.XS,  // Spațierea orizontală externă redusă
  },
  completedContainer: {
    opacity: 0.9,                    // Ușor transparent pentru a indica finalizarea
    backgroundColor: 'rgba(0,0,0,0.02)', 
    borderColor: 'rgba(0,0,0,0.08)', // Bordură mai puțin vizibilă
  },
  completedContainerCompact: {
    paddingVertical: 2,              // Spațiere verticală redusă
    minHeight: 30,                   // Înălțime minimă redusă
    height: 30,                      // Înălțime fixă
    marginVertical: 2,               // Spațiere verticală externă
    borderWidth: 1,                  // Grosimea bordurii
    borderRadius: 4,                 // Colțuri mai puțin rotunjite
    borderColor: 'rgba(0,0,0,0.1)',  // Culoarea bordurii
  },
  priorityContainer: {
    borderWidth: 1,                  // Bordură completă pentru task-urile prioritare
    borderColor: 'rgba(234, 88, 12, 0.4)',  // Portocaliu subtil pentru border
    borderLeftWidth: 4,              // Bordură stângă mai groasă pentru sarcini prioritare
    borderLeftColor: 'rgba(234, 88, 12, 0.8)', // Portocaliu mai intens pentru border-ul din stânga
    backgroundColor: 'rgba(254, 215, 170, 0.15)',  // Fundal foarte subtil portocaliu
    borderRadius: 6,                 // Colțuri rotunjite pentru a evidenția task-ul
  },
  priorityCompletedContainer: {
    borderLeftWidth: 3,              // Bordură stângă mai groasă pentru sarcini prioritare completate
    borderLeftColor: 'rgba(234, 88, 12, 0.5)', // Portocaliu mai vizibil pentru border-ul din stânga
    backgroundColor: 'rgba(254, 215, 170, 0.15)',  // Fundal mai vizibil, la fel ca la cele active dar mai transparent
    borderColor: 'rgba(234, 88, 12, 0.2)',  // Bordură completă ușor colorată
  },
  checkbox: {
    width: 36,                       // Lățimea zonei de checkbox
    height: 36,                      // Înălțimea zonei de checkbox
    justifyContent: 'center',        // Centrare pe verticală
    alignItems: 'center',            // Centrare pe orizontală
  },
  completedCheckbox: {
    width: 28,                       // Lățime redusă pentru checkbox-uri ale sarcinilor complete
    height: 28,                      // Înălțime redusă
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 2,                   // Marjă stânga adăugată
  },
  contentContainer: {
    flex: 1,                         // Ocupă tot spațiul disponibil
    flexDirection: 'row',            // Aranjează elementele pe orizontală
    justifyContent: 'space-between', // Spațiază elementele uniform
    alignItems: 'center',            // Centrează elementele pe verticală
  },
  completedContentContainer: {
    paddingVertical: 0,              // Elimină spațierea verticală
    height: 30,                      // Înălțime fixă redusă
  },
  titleContainer: {
    flex: 1,                         // Ocupă tot spațiul disponibil
    justifyContent: 'center',        // Centrează pe verticală
    minHeight: ACCESSIBILITY.TOUCH_TARGET.MIN_HEIGHT,  // Înălțime minimă pentru accesibilitate
  },
  title: {
    fontSize: 14,                    // Dimensiunea fontului
    color: ACCESSIBILITY.COLORS.TEXT.PRIMARY,  // Culoarea principală a textului
  },
  completedTitle: {
    color: ACCESSIBILITY.COLORS.TEXT.SECONDARY,  // Culoare secundară - mai puțin accentuată
    fontSize: 13,                    // Font mic pentru textul finalizat
    lineHeight: 18,                  // Spațiere între linii
  },
  priorityTitle: {
    fontWeight: ACCESSIBILITY.TYPOGRAPHY.WEIGHTS.MEDIUM, // Un pic mai gros pentru task-urile prioritare
    color: ACCESSIBILITY.COLORS.TEXT.PRIMARY,  // Menține culoarea principală pentru text
  },
  priorityCompletedTitle: {
    color: ACCESSIBILITY.COLORS.TEXT.SECONDARY,  // Culoare secundară - mai puțin accentuată
    fontStyle: 'italic',             // Stil italic
  },
  untitledTask: {
    fontStyle: 'italic',             // Stil italic pentru sarcinile fără titlu
    color: ACCESSIBILITY.COLORS.TEXT.SECONDARY,  // Culoare secundară
  },
  input: {
    flex: 1,                         // Ocupă tot spațiul disponibil
    fontSize: 14,                    // Dimensiunea fontului
    color: ACCESSIBILITY.COLORS.TEXT.PRIMARY,  // Culoarea textului
    minHeight: 36,                   // Înălțime minimă
    paddingHorizontal: ACCESSIBILITY.SPACING.SM,  // Spațiere orizontală internă
  },
  actions: {
    flexDirection: 'row',            // Aranjează acțiunile pe orizontală
    alignItems: 'center',            // Centrează pe verticală
    justifyContent: 'flex-end',      // Aliniază la dreapta
  },
  actionButton: {
    width: 36,                       // Lățimea butonului
    height: 36,                      // Înălțimea butonului
    justifyContent: 'center',        // Centrare pe verticală
    alignItems: 'center',            // Centrare pe orizontală
    borderRadius: ACCESSIBILITY.SPACING.SM,  // Colțuri rotunjite
  },
  deleteButton: {
    width: 36,                       // Lățimea butonului
    height: 36,                      // Înălțimea butonului
    justifyContent: 'center',        // Centrare pe verticală
    alignItems: 'center',            // Centrare pe orizontală
    borderRadius: ACCESSIBILITY.SPACING.SM,  // Colțuri rotunjite
    marginLeft: ACCESSIBILITY.SPACING.XXS,   // Spațiere suplimentară în stânga
  },
  completionInfo: {
    flexDirection: 'row',            // Aranjează elementele pe orizontală
    alignItems: 'center',            // Centrează elementele pe verticală
    marginTop: 4,                    // Spațiere deasupra informațiilor de completare
    flexWrap: 'wrap',                // Permite elementelor să treacă pe linia următoare dacă nu este suficient spațiu
    justifyContent: 'flex-start',    // Aliniază elementele la stânga
    gap: ACCESSIBILITY.SPACING.XS,   // Spațiere uniformă între elemente
  },
  completionDate: {
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.SM,  // Dimensiunea fontului mai mică pentru informații secundare
    color: ACCESSIBILITY.COLORS.TEXT.SECONDARY,   // Culoare secundară - mai puțin accentuată
    fontStyle: 'italic',             // Stil italic
    marginRight: ACCESSIBILITY.SPACING.XS,        // Spațiere între data completării și alte elemente
  },
});

export default TaskItem;