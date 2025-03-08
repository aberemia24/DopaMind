import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Vibration,
  Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { Swipeable } from 'react-native-gesture-handler';

import { ACCESSIBILITY } from '../../../constants/accessibility';
import { Task } from '../../../services/taskService';
import { DateTimeSelector } from './DateTimeSelector';

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

  // Referință pentru componenta Swipeable
  const swipeableRef = useRef<Swipeable>(null);

  // Stare pentru animația de ștergere
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteAnim = useRef(new Animated.Value(1)).current;

  // Efect pentru animația de ștergere
  useEffect(() => {
    if (isDeleting) {
      Animated.timing(deleteAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        onDelete();
      });
    }
  }, [isDeleting, onDelete]);

  // Referință pentru a urmări dacă s-a declanșat deja vibrația
  const hasVibrated = useRef(false);
  const listenerIdRef = useRef<string | null>(null);

  // Curățăm listener-ul când componenta se demontează
  useEffect(() => {
    return () => {
      if (listenerIdRef.current) {
        // Asigurăm curățarea corectă a listener-ului
        // Nu putem apela removeListener direct aici deoarece nu avem acces la obiectul dragX
        listenerIdRef.current = null;
      }
    };
  }, []);

  // Funcție pentru a monitoriza valoarea dragX și a declanșa vibrația
  const handleDragXChange = (dragX: Animated.AnimatedInterpolation<number>) => {
    // Curățăm listener-ul anterior dacă există
    if (listenerIdRef.current) {
      dragX.removeListener(listenerIdRef.current);
    }
    
    // Adăugăm un nou listener
    const listenerId = dragX.addListener(({ value }) => {
      // Verificăm dacă valoarea este suficient de mică (tragere spre stânga)
      // Declanșăm vibrația doar când utilizatorul trage mai mult de 50% din lățimea butonului
      if (value <= -80 && !hasVibrated.current) {
        Vibration.vibrate(50); // Vibrație scurtă
        hasVibrated.current = true;
      } else if (value > -80) {
        hasVibrated.current = false;
      }
    });
    
    // Salvăm ID-ul listener-ului pentru curățare ulterioară
    listenerIdRef.current = listenerId;
  };

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
   * Formatează data scadentă a sarcinii într-un format localizat
   * IMPACT: Afectează modul în care este afișată data scadentă
   * IMPACT: Utilizează localizarea corectă în funcție de limba selectată (ro sau default)
   * @returns String formatat cu data scadentă sau string gol dacă nu există
   */
  const formatDueDate = () => {
    if (!task.dueDate) return '';
    
    const locale = i18n.language === 'ro' ? ro : undefined;
    return format(new Date(task.dueDate), 'dd MMM HH:mm', { locale });
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

  /**
   * Gestionează confirmarea ștergerii unei sarcini
   * IMPACT: Afectează modul în care utilizatorul poate șterge o sarcină
   */
  const handleDeleteConfirmation = () => {
    Alert.alert(
      t('taskManagement.alerts.deleteConfirm.title'),
      t('taskManagement.alerts.deleteConfirm.message'),
      [
        {
          text: t('common.actions.cancel'),
          style: 'cancel',
          onPress: () => {
            // Închide swipe-ul când utilizatorul anulează ștergerea
            if (swipeableRef.current) {
              swipeableRef.current.close();
            }
          }
        },
        {
          text: t('common.actions.delete'),
          onPress: () => setIsDeleting(true),
          style: 'destructive',
        },
      ],
      { cancelable: true, onDismiss: () => {
        // Închide swipe-ul și când utilizatorul apasă în afara dialogului
        if (swipeableRef.current) {
          swipeableRef.current.close();
        }
      }}
    );
  };

  // Stare pentru a urmări dacă swipe-ul a fost intenționat
  const [intentionalSwipe, setIntentionalSwipe] = useState(false);

  // Funcție pentru a gestiona swipe-ul care depășește un anumit prag
  const handleSwipeWillOpen = useCallback(() => {
    // Marcăm swipe-ul ca fiind intenționat când se va deschide
    setIntentionalSwipe(true);
  }, []);

  // Funcție modificată pentru a gestiona deschiderea swipe-ului
  const handleSwipeOpen = useCallback(() => {
    // Declanșăm dialogul de confirmare doar dacă swipe-ul a fost intenționat
    if (intentionalSwipe) {
      handleDeleteConfirmation();
    } else {
      // Dacă swipe-ul nu a fost intenționat, închidem swipe-ul
      if (swipeableRef.current) {
        swipeableRef.current.close();
      }
    }
  }, [intentionalSwipe]);

  // Resetăm starea când componenta se montează sau când task-ul se schimbă
  useEffect(() => {
    setIntentionalSwipe(false);
  }, [task.id]);

  /**
   * Renderizează acțiunile din dreapta (swipe stânga) pentru ștergere
   * 
   * @param progress Progresul animației de swipe (0-1)
   * @param dragX Distanța de tragere pe axa X
   */
  const renderRightActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
    // Calculează transformarea pe baza tragerii
    const trans = dragX.interpolate({
      inputRange: [-100, -50, 0],
      outputRange: [0, 50, 100],
      extrapolate: 'clamp',
    });
    
    // Calculează opacitatea în funcție de progresul tragerii
    const opacity = progress.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 0.5, 1],
    });

    // Calculează scara pentru efect de zoom
    const scale = progress.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.8, 0.9, 1],
    });

    // Calculează rotația pentru iconița de ștergere
    const rotate = progress.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    // Calculează culoarea de fundal în funcție de progres
    const backgroundColor = progress.interpolate({
      inputRange: [0, 1],
      outputRange: ['rgba(220, 38, 38, 0.8)', 'rgba(220, 38, 38, 1)'],
    });

    // Monitorizăm dragX pentru a declanșa vibrația
    handleDragXChange(dragX);

    return (
      <Animated.View
        style={[
          styles.deleteAction,
          {
            transform: [
              { translateX: trans },
              { scale: scale }
            ],
            opacity,
            backgroundColor,
          },
        ]}
      >
        <Animated.View style={{ transform: [{ rotate }] }}>
          <MaterialIcons
            name="delete-outline"
            size={24}
            color="white"
          />
        </Animated.View>
        <Text style={styles.deleteActionText}>{t('common.actions.delete')}</Text>
      </Animated.View>
    );
  };

  return (
    <Animated.View
      style={[
        styles.container,
        isCompact && styles.containerCompact,
        task.completed && (isCompact ? styles.completedContainerCompact : styles.completedContainer),
        task.isPriority && !task.completed && styles.priorityContainer,
        task.isPriority && task.completed && styles.priorityCompletedContainer,
        {
          opacity: deleteAnim,
          transform: [
            {
              scale: deleteAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            },
          ],
        },
      ]}
    >
      <Swipeable
        ref={swipeableRef}
        renderRightActions={renderRightActions}
        rightThreshold={0.6} // Pragul pentru declanșarea acțiunii (60% din lățimea cardului)
        friction={2.5} // Rezistența la swipe
        overshootFriction={10} // Limitează cât de mult poate fi tras card-ul peste limită
        onSwipeableOpen={handleSwipeOpen} // Folosim noua funcție pentru a gestiona deschiderea
        onSwipeableRightWillOpen={handleSwipeWillOpen} // Marcăm swipe-ul ca fiind intenționat
        containerStyle={{ width: '100%' }}
      >
        <View style={styles.taskContainer}>
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

          {!task.completed ? (
            // Layout pentru task-uri active (necompletate)
            <View style={styles.activeContentContainer}>
              {/* Primul rând: Titlu și stea de prioritate */}
              <View style={styles.titleRow}>
                {/* Afișează fie un input de editare, fie textul titlului */}
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
                    onPress={() => setIsEditing(true)}
                    accessibilityRole="button"
                    accessibilityLabel={t('taskManagement.labels.editTask')}
                  >
                    <Text style={titleStyle}>
                      {task.title || t('taskManagement.labels.untitledTask')}
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Indicator de prioritate (stea) */}
                {!isEditing && (
                  <TouchableOpacity
                    style={styles.priorityIndicator}
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
                      size={20}
                      color={task.isPriority 
                        ? 'rgba(234, 88, 12, 0.9)' 
                        : ACCESSIBILITY.COLORS.TEXT.SECONDARY}
                    />
                  </TouchableOpacity>
                )}
              </View>

              {/* Al doilea rând: Data/ora scadentă (opțional) */}
              {task.dueDate && (
                <View style={styles.dueDateContainer}>
                  <MaterialIcons
                    name="schedule"
                    size={14}
                    color={ACCESSIBILITY.COLORS.TEXT.SECONDARY}
                    style={styles.dueDateIcon}
                  />
                  <Text style={styles.dueDate}>
                    {formatDueDate()}
                  </Text>
                </View>
              )}
            </View>
          ) : (
            // Layout pentru task-uri completate (păstrăm așa cum este)
            <View style={contentContainerStyle}>
              {/* Afișează textul titlului */}
              <TouchableOpacity
                style={styles.titleContainer}
                accessibilityRole="button"
                accessibilityLabel={t('taskManagement.labels.viewTask')}
              >
                <Text style={titleStyle}>
                  {task.title || t('taskManagement.labels.untitledTask')}
                </Text>
              </TouchableOpacity>

              {/* Afișează data completării */}
              <View style={styles.completionInfo}>
                <Text style={styles.completionDate}>
                  {formatCompletionDate()}
                </Text>
              </View>
            </View>
          )}
        </View>
      </Swipeable>
    </Animated.View>
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
    marginHorizontal: 0,             // Eliminăm marginea orizontală pentru a ocupa tot spațiul disponibil
    marginVertical: ACCESSIBILITY.SPACING.XXS,               // Spațierea verticală externă
    width: '100%',                   // Asigurăm că ocupă toată lățimea disponibilă
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
    height: 30,                      // Înălțime fixă redusă
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
  activeContentContainer: {
    flex: 1,                         // Ocupă tot spațiul disponibil
    flexDirection: 'column',         // Aranjează elementele pe verticală
    justifyContent: 'center',        // Centrează pe verticală
    paddingLeft: ACCESSIBILITY.SPACING.XS, // Spațiere la stânga
  },
  titleContainer: {
    flex: 1,                         // Ocupă tot spațiul disponibil
    justifyContent: 'center',        // Centrează pe verticală
    minHeight: ACCESSIBILITY.TOUCH_TARGET.MIN_HEIGHT,  // Înălțime minimă pentru accesibilitate
  },
  titleRow: {
    flexDirection: 'row',            // Aranjează elementele pe orizontală
    alignItems: 'center',            // Centrează pe verticală
    justifyContent: 'space-between', // Spațiază elementele uniform
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
  dueDateContainer: {
    flexDirection: 'row',            // Aranjează elementele pe orizontală
    alignItems: 'center',            // Centrează pe verticală
    marginTop: 2,                    // Spațiere deasupra datei scadente
  },
  dueDateIcon: {
    marginRight: 4,                  // Spațiere între icon și text
  },
  dueDate: {
    fontSize: 12,                    // Dimensiune font mai mică
    color: ACCESSIBILITY.COLORS.TEXT.SECONDARY, // Culoare secundară
  },
  priorityIndicator: {
    width: 28,                       // Lățime mai mică pentru indicator
    height: 28,                      // Înălțime mai mică pentru indicator
    justifyContent: 'center',        // Centrare pe verticală
    alignItems: 'center',            // Centrare pe orizontală
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
  taskContainer: {
    flexDirection: 'row',            // Aranjează elementele pe orizontală
    alignItems: 'center',            // Centrează pe verticală
    flex: 1,                         // Ocupă tot spațiul disponibil
  },
  deleteAction: {
    backgroundColor: '#DC2626',      // Roșu pentru acțiunea de ștergere
    justifyContent: 'center',        // Centrare pe verticală
    alignItems: 'center',            // Centrare pe orizontală
    width: 100,                      // Lățimea zonei de acțiune
    height: '100%',                  // Înălțimea completă
    flexDirection: 'row',            // Aranjează elementele pe orizontală
    borderTopRightRadius: ACCESSIBILITY.SPACING.SM,    // Colțuri rotunjite în dreapta
    borderBottomRightRadius: ACCESSIBILITY.SPACING.SM, // Colțuri rotunjite în dreapta
  },
  deleteActionText: {
    color: 'white',                  // Text alb pentru contrast
    fontSize: 14,                    // Dimensiune font
    fontWeight: '600',               // Grosime font mărită pentru vizibilitate
    marginLeft: ACCESSIBILITY.SPACING.XS, // Spațiere la stânga
  },
});

export default TaskItem;