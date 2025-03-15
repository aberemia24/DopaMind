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
  Modal,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { Swipeable } from 'react-native-gesture-handler';

import { ACCESSIBILITY } from '../../../constants/accessibility';
import { Task } from '../../../services/taskService';
import { QUICK_DATE_OPTIONS } from '../../../constants/quickOptions';
import { getDayPeriod } from '../../../utils/daytime';
import TaskEditModal from './TaskEditModal';

/**
 * Interfața Props pentru componenta TaskItem
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
 */
const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggle,
  onDelete,
  onUpdate,
  isCompact = false,
}) => {
  // Stare pentru modul de editare a titlului
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title || '');
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Stare pentru afișarea menu-ului de amânare
  const [showPostponeMenu, setShowPostponeMenu] = useState(false);
  
  // Referință pentru animația de scalare
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  // Poziția TaskItem - folosită pentru poziționarea meniului de amânare
  const [taskPosition, setTaskPosition] = useState({ x: 0, y: 0, width: 0, height: 0 });
  
  // Inițializare hook pentru traduceri
  const { t, i18n } = useTranslation();

  // Referință pentru componenta Swipeable
  const swipeableRef = useRef<Swipeable>(null);
  
  // Referință pentru View-ul care conține task-ul
  const taskItemRef = useRef<View>(null);

  // Stare pentru animația de ștergere
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteAnim = useRef(new Animated.Value(1)).current;

  // Efecte pentru animația de ștergere
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

  // Referințe pentru gestionarea vibrațiilor
  const hasLeftVibrated = useRef(false);
  const hasRightVibrated = useRef(false);
  const leftDragListenerIdRef = useRef<string | null>(null);
  const rightDragListenerIdRef = useRef<string | null>(null);
  
  // Stocăm dragX într-o referință pentru curățare
  const leftDragXRef = useRef<Animated.AnimatedInterpolation<number> | null>(null);
  const rightDragXRef = useRef<Animated.AnimatedInterpolation<number> | null>(null);

  // Curățăm listener-ul când componenta se demontează
  useEffect(() => {
    return () => {
      // Asigurăm curățarea corectă a listener-ului pentru drag la stânga
      if (leftDragListenerIdRef.current && leftDragXRef.current) {
        leftDragXRef.current.removeListener(leftDragListenerIdRef.current);
      }
      
      // Asigurăm curățarea corectă a listener-ului pentru drag la dreapta
      if (rightDragListenerIdRef.current && rightDragXRef.current) {
        rightDragXRef.current.removeListener(rightDragListenerIdRef.current);
      }
    };
  }, []);
  
  /**
   * Actualizează poziția curentă a task-ului pentru plasarea corectă a meniului
   * Se apelează la prima randare și la modificări de layout
   */
  const measureTaskPosition = useCallback(() => {
    if (taskItemRef.current) {
      taskItemRef.current.measure((x, y, width, height, pageX, pageY) => {
        setTaskPosition({
          x: pageX,
          y: pageY,
          width,
          height
        });
      });
    }
  }, []);

  // Măsurăm poziția după prima randare și când se schimbă task-ul
  useEffect(() => {
    // Întârziem măsurarea pentru a permite randarea completă
    const timer = setTimeout(() => {
      measureTaskPosition();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [task.id, measureTaskPosition]);

  /**
   * Funcție pentru a monitoriza valoarea dragX spre stânga și a declanșa vibrația
   */
  const handleLeftDragXChange = useCallback((dragX: Animated.AnimatedInterpolation<number>) => {
    // Stocăm referința pentru curățare
    leftDragXRef.current = dragX;
    
    // Curățăm listener-ul anterior dacă există
    if (leftDragListenerIdRef.current && leftDragXRef.current) {
      leftDragXRef.current.removeListener(leftDragListenerIdRef.current);
    }
    
    // Adăugăm un nou listener
    const listenerId = dragX.addListener(({ value }) => {
      // Verificăm dacă valoarea este suficient de mică (tragere spre stânga)
      if (value <= -80 && !hasLeftVibrated.current) {
        Vibration.vibrate(50); // Vibrație scurtă
        hasLeftVibrated.current = true;
      } else if (value > -80) {
        hasLeftVibrated.current = false;
      }
    });
    
    // Salvăm ID-ul listener-ului pentru curățare ulterioară
    leftDragListenerIdRef.current = listenerId;
  }, []);

  /**
   * Funcție pentru a monitoriza valoarea dragX spre dreapta și a declanșa vibrația
   */
  const handleRightDragXChange = useCallback((dragX: Animated.AnimatedInterpolation<number>) => {
    // Stocăm referința pentru curățare
    rightDragXRef.current = dragX;
    
    // Curățăm listener-ul anterior dacă există
    if (rightDragListenerIdRef.current && rightDragXRef.current) {
      rightDragXRef.current.removeListener(rightDragListenerIdRef.current);
    }
    
    // Adăugăm un nou listener
    const listenerId = dragX.addListener(({ value }) => {
      // Verificăm dacă valoarea este suficient de mare (tragere spre dreapta)
      if (value >= 80 && !hasRightVibrated.current) {
        Vibration.vibrate(50); // Vibrație scurtă
        hasRightVibrated.current = true;
      } else if (value < 80) {
        hasRightVibrated.current = false;
      }
    });
    
    // Salvăm ID-ul listener-ului pentru curățare ulterioară
    rightDragListenerIdRef.current = listenerId;
  }, []);

  /**
   * Procesează finalizarea editării titlului
   */
  const handleSubmitEditing = () => {
    // Verificăm dacă titlul s-a schimbat și nu este gol
    const trimmedTitle = title.trim();
    if (trimmedTitle === '') {
      // Dacă titlul este gol, revenim la titlul original sau folosim "untitled task"
      setTitle(task.title || t('taskManagement.labels.untitledTask'));
      setIsEditing(false);
      return;
    }

    if (trimmedTitle !== task.title) {
      // Actualizăm titlul în baza de date
      onUpdate({ title: trimmedTitle });
      
      // Actualizăm starea locală pentru a reflecta imediat schimbarea
      setTitle(trimmedTitle);
      
      // Animație subtilă pentru feedback vizual
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 100,
          useNativeDriver: true
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true
        })
      ]).start();
      
      // Feedback haptic subtil pentru confirmare
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        Vibration.vibrate(20); // Vibrație foarte scurtă pentru feedback
      }
    }
    
    setIsEditing(false);
  };

  /**
   * Formatează data de finalizare a sarcinii într-un format localizat
   */
  const formatCompletionDate = () => {
    if (!task.completedAt) return '';
    
    const locale = i18n.language === 'ro' ? ro : undefined;
    return format(new Date(task.completedAt), 'dd MMM HH:mm', { locale });
  };

  /**
   * Formatează data scadentă a sarcinii într-un format localizat
   */
  const formatDueDate = () => {
    if (!task.dueDate) return '';
    
    const locale = i18n.language === 'ro' ? ro : undefined;
    return format(new Date(task.dueDate), 'dd MMM HH:mm', { locale });
  };

  /**
   * Gestionează confirmarea ștergerii unei sarcini
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
            closeSwipeable();
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
        closeSwipeable();
      }}
    );
  };

  // Stare pentru a urmări dacă swipe-ul a fost intenționat
  const [intentionalLeftSwipe, setIntentionalLeftSwipe] = useState(false);
  const [intentionalRightSwipe, setIntentionalRightSwipe] = useState(false);

  /**
   * Funcție pentru a închide swipeable și a reseta starea de swipe intenționat
   */
  const closeSwipeable = useCallback(() => {
    if (swipeableRef.current) {
      swipeableRef.current.close();
      // Resetăm starea de swipe intenționat după ce animația se încheie
      setTimeout(() => {
        setIntentionalLeftSwipe(false);
        setIntentionalRightSwipe(false);
      }, 300);
    }
  }, []);

  /**
   * Funcție pentru a gestiona swipe-ul spre stânga care depășește un anumit prag
   */
  const handleLeftSwipeWillOpen = useCallback(() => {
    // Marcăm swipe-ul ca fiind intenționat când se va deschide
    setIntentionalLeftSwipe(true);
  }, []);

  /**
   * Funcție pentru a gestiona swipe-ul spre dreapta care depășește un anumit prag
   */
  const handleRightSwipeWillOpen = useCallback(() => {
    // Marcăm swipe-ul ca fiind intenționat când se va deschide
    setIntentionalRightSwipe(true);
  }, []);

  /**
   * Funcție pentru a gestiona deschiderea swipe-ului spre stânga
   */
  const handleLeftSwipeOpen = useCallback(() => {
    // Declanșăm dialogul de confirmare doar dacă swipe-ul a fost intenționat
    if (intentionalLeftSwipe) {
      handleDeleteConfirmation();
    } else {
      // Dacă swipe-ul nu a fost intenționat, închidem swipe-ul
      closeSwipeable();
    }
  }, [intentionalLeftSwipe, handleDeleteConfirmation, closeSwipeable]);

  /**
   * Funcție pentru a gestiona deschiderea swipe-ului spre dreapta
   */
  const handleRightSwipeOpen = useCallback(() => {
    // Afișăm meniul de amânare doar dacă swipe-ul a fost intenționat
    if (intentionalRightSwipe) {
      // Măsurăm poziția task-ului pentru a poziționa corect meniul
      measureTaskPosition();
      // Afișăm meniul de amânare
      setShowPostponeMenu(true);
      // Închidem swipe-ul după ce am deschis meniul
      closeSwipeable();
    } else {
      // Dacă swipe-ul nu a fost intenționat, închidem swipe-ul
      closeSwipeable();
    }
  }, [intentionalRightSwipe, closeSwipeable, measureTaskPosition]);

  // Resetăm starea când componenta se montează sau când task-ul se schimbă
  useEffect(() => {
    setIntentionalLeftSwipe(false);
    setIntentionalRightSwipe(false);
  }, [task.id]);

  /**
   * Gestionează amânarea sarcinii cu opțiunea selectată
   */
  const handlePostpone = (option: 'TODAY_LATER' | 'TOMORROW' | 'WEEKEND' | 'NEXT_WEEK' | 'CUSTOM') => {
    let newDate: Date;
    
    const now = new Date();
    
    switch (option) {
      case 'TODAY_LATER':
        // Amână pentru mai târziu azi - în funcție de perioada curentă a task-ului
        if (task.period === 'MORNING') {
          // Dacă task-ul e dimineață, amână pentru după-amiază
          newDate = new Date();
          newDate.setHours(14, 0, 0, 0);
        } else if (task.period === 'AFTERNOON') {
          // Dacă task-ul e după-amiază, amână pentru seară
          newDate = new Date();
          newDate.setHours(19, 0, 0, 0);
        } else {
          // Dacă task-ul e seară, amână pentru mâine dimineață (nu ar trebui să ajungă aici)
          newDate = new Date();
          newDate.setDate(newDate.getDate() + 1);
          newDate.setHours(9, 0, 0, 0);
        }
        break;
        
      case 'TOMORROW':
        // Amână pentru mâine
        newDate = QUICK_DATE_OPTIONS.TOMORROW.getDate();
        break;
        
      case 'WEEKEND':
        // Amână pentru weekend
        newDate = QUICK_DATE_OPTIONS.WEEKEND.getDate();
        break;
        
      case 'NEXT_WEEK':
        // Amână pentru săptămâna viitoare
        newDate = QUICK_DATE_OPTIONS.NEXT_WEEK.getDate();
        break;
        
      case 'CUSTOM':
        // Deschide selectorul de dată și oră
        // Implementare viitoare
        return;
        
      default:
        newDate = new Date();
        break;
    }
    
    // Aplicăm actualizarea la task
    onUpdate({
      dueDate: newDate,
      period: getTaskPeriodFromDate(newDate)
    });
    
    // Afișăm mesaj de confirmare
    const formattedDate = format(newDate, 'dd MMMM, HH:mm', { locale: i18n.language === 'ro' ? ro : undefined });
    Alert.alert(
      t('taskManagement.alerts.postpone.title'),
      t('taskManagement.alerts.postpone.message', { date: formattedDate })
    );
    
    // Închidem meniul de amânare
    setShowPostponeMenu(false);
  };
  
  /**
   * Determină perioada de task din data specificată
   */
  const getTaskPeriodFromDate = (date: Date) => {
    const hours = date.getHours();
    
    if (hours >= 5 && hours < 12) {
      return 'MORNING';
    } else if (hours >= 12 && hours < 18) {
      return 'AFTERNOON';
    } else {
      return 'EVENING';
    }
  };

  /**
   * Deschide modalul de editare a task-ului
   */
  const handleOpenEditModal = () => {
    setShowEditModal(true);
  };

  /**
   * Închide modalul de editare a task-ului
   */
  const handleCloseEditModal = () => {
    setShowEditModal(false);
  };

  /**
   * Actualizează task-ul din modal
   */
  const handleUpdateFromModal = (taskId: string, updates: Partial<Task>) => {
    onUpdate(updates);
  };

  /**
   * Referință pentru detectarea double tap
   */
  const lastTapRef = useRef<number>(0);
  const doubleTapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Funcția pentru gestionarea double tap-ului
   */
  const handleTitlePress = (e: any) => {
    const now = new Date().getTime();
    const DOUBLE_PRESS_DELAY = 300; // 300ms între tap-uri
    
    if (lastTapRef.current && (now - lastTapRef.current) < DOUBLE_PRESS_DELAY) {
      // Double tap detectat - editare titlu
      e.stopPropagation(); // Prevenim propagarea tap-ului la card
      setIsEditing(true);
      lastTapRef.current = 0; // Resetăm timer-ul
      
      // Anulăm timeout-ul pentru single tap dacă există
      if (doubleTapTimeoutRef.current) {
        clearTimeout(doubleTapTimeoutRef.current);
        doubleTapTimeoutRef.current = null;
      }
    } else {
      // Primul tap - setăm timer-ul
      lastTapRef.current = now;
      
      // Anulăm orice timeout existent
      if (doubleTapTimeoutRef.current) {
        clearTimeout(doubleTapTimeoutRef.current);
      }
      
      // Setăm un nou timeout pentru single tap
      doubleTapTimeoutRef.current = setTimeout(() => {
        // Dacă nu a fost detectat un double tap, considerăm că este un single tap
        if (lastTapRef.current !== 0) {
          // Deschide modalul de editare la single tap
          handleOpenEditModal();
          lastTapRef.current = 0;
        }
      }, DOUBLE_PRESS_DELAY);
    }
  };

  /**
   * Renderizează acțiunile din dreapta (swipe stânga) pentru ștergere
   * 
   * @param progress Progresul animației de swipe (0-1)
   * @param dragX Distanța de tragere pe axa X
   */
  const renderRightActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
    // Lățime fixă pentru butonul de ștergere
    const width = 100;
    
    // Calculează opacitatea în funcție de progresul tragerii
    const opacity = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    // Calculează scara pentru efect de zoom
    const scale = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.8, 1],
    });

    // Monitorizăm dragX pentru a declanșa vibrația
    handleLeftDragXChange(dragX);

    return (
      <Animated.View
        style={[
          styles.deleteAction,
          {
            width,
            opacity,
            transform: [{ scale }],
          },
        ]}
      >
        <MaterialIcons
          name="delete-outline"
          size={24}
          color="white"
        />
        <Text style={styles.actionText}>{t('common.actions.delete')}</Text>
      </Animated.View>
    );
  };

  /**
   * Renderizează acțiunile din stânga (swipe dreapta) pentru amânare
   * 
   * @param progress Progresul animației de swipe (0-1)
   * @param dragX Distanța de tragere pe axa X
   */
  const renderLeftActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>) => {
    // Lățime fixă pentru butonul de amânare
    const width = 100;
    
    // Calculează opacitatea în funcție de progresul tragerii
    const opacity = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    // Calculează scara pentru efect de zoom
    const scale = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.8, 1],
    });

    // Monitorizăm dragX pentru a declanșa vibrația
    handleRightDragXChange(dragX);

    return (
      <Animated.View
        style={[
          styles.postponeAction,
          {
            width,
            opacity,
            transform: [{ scale }],
          },
        ]}
      >
        <MaterialIcons
          name="schedule"
          size={24}
          color="white"
        />
        <Text style={styles.actionText}>{t('taskManagement.actions.postpone')}</Text>
      </Animated.View>
    );
  };

  const renderPostponeMenu = () => {
    if (!showPostponeMenu) return null;

    return (
      <Modal
        transparent
        visible={showPostponeMenu}
        animationType="fade"
        onRequestClose={() => setShowPostponeMenu(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowPostponeMenu(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback onPress={e => e.stopPropagation()}>
              <View 
                style={[
                  styles.postponeMenu,
                  {
                    position: 'absolute',
                    top: taskPosition.y + taskPosition.height / 2,
                    left: taskPosition.x + 20,
                  }
                ]}
              >
                <Text style={styles.postponeMenuTitle}>{t('taskManagement.actions.postpone')}</Text>
                
                {/* Afișăm opțiunea "Mai târziu azi" doar dacă task-ul nu este în perioada de seară */}
                {task.period !== 'EVENING' && (
                  <TouchableOpacity 
                    style={styles.postponeMenuItem}
                    onPress={() => handlePostpone('TODAY_LATER')}
                  >
                    <MaterialIcons name="access-time" size={20} color={ACCESSIBILITY.COLORS.TEXT.PRIMARY} />
                    <Text style={styles.postponeMenuItemText}>{t('taskManagement.postpone.laterToday')}</Text>
                  </TouchableOpacity>
                )}
                
                <TouchableOpacity 
                  style={styles.postponeMenuItem}
                  onPress={() => handlePostpone('TOMORROW')}
                >
                  <MaterialIcons name="event" size={20} color={ACCESSIBILITY.COLORS.TEXT.PRIMARY} />
                  <Text style={styles.postponeMenuItemText}>{t('taskManagement.postpone.tomorrow')}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.postponeMenuItem}
                  onPress={() => handlePostpone('WEEKEND')}
                >
                  <MaterialIcons name="weekend" size={20} color={ACCESSIBILITY.COLORS.TEXT.PRIMARY} />
                  <Text style={styles.postponeMenuItemText}>{t('taskManagement.postpone.weekend')}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.postponeMenuItem}
                  onPress={() => handlePostpone('NEXT_WEEK')}
                >
                  <MaterialIcons name="event-note" size={20} color={ACCESSIBILITY.COLORS.TEXT.PRIMARY} />
                  <Text style={styles.postponeMenuItemText}>{t('taskManagement.postpone.nextWeek')}</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.postponeMenuItem}
                  onPress={() => handlePostpone('CUSTOM')}
                >
                  <MaterialIcons name="calendar-today" size={20} color={ACCESSIBILITY.COLORS.TEXT.PRIMARY} />
                  <Text style={styles.postponeMenuItemText}>{t('taskManagement.postpone.custom')}</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    );
  };

  return (
    <View ref={taskItemRef} onLayout={measureTaskPosition}>
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
          renderLeftActions={renderLeftActions}
          friction={2} // Rezistența la swipe redusă pentru o experiență mai fluidă
          overshootRight={false} // Previne depășirea limitei la dreapta
          overshootLeft={false} // Previne depășirea limitei la stânga
          rightThreshold={80} // Pragul pentru declanșarea acțiunii de ștergere (80px)
          leftThreshold={80} // Pragul pentru declanșarea acțiunii de amânare (80px)
          onSwipeableRightWillOpen={handleLeftSwipeWillOpen} // Marcăm swipe-ul la stânga ca fiind intenționat
          onSwipeableLeftWillOpen={handleRightSwipeWillOpen} // Marcăm swipe-ul la dreapta ca fiind intenționat
          onSwipeableRightOpen={handleLeftSwipeOpen} // Gestionăm deschiderea swipe-ului la stânga
          onSwipeableLeftOpen={handleRightSwipeOpen} // Gestionăm deschiderea swipe-ului la dreapta
          containerStyle={{ width: '100%' }}
        >
          <Animated.View 
            style={[
              styles.taskContainer,
              { transform: [{ scale: scaleAnim }] }
            ]}
          >
            {/* Wrapper TouchableOpacity pentru întregul card - deschide modalul de editare */}
            <TouchableOpacity 
              style={styles.taskContentContainer}
              onPress={handleOpenEditModal}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={t('taskManagement.accessibility.editTask') || 'Edit task'}
            >
              <View style={styles.taskContent}>
                {/* Checkbox pentru marcarea sarcinii ca finalizată/nefinalizată */}
                <TouchableOpacity
                  style={[
                    task.completed ? styles.completedCheckbox : styles.checkbox,
                    { zIndex: 2 } // Asigurăm că checkbox-ul primește tap-urile
                  ]}
                  onPress={(e) => {
                    e.stopPropagation(); // Prevenim propagarea tap-ului la card
                    onToggle();
                  }}
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
                          selectTextOnFocus
                          blurOnSubmit
                        />
                      ) : (
                        <TouchableOpacity
                          onPress={handleTitlePress}
                          accessibilityRole="button"
                          accessibilityLabel={t('taskManagement.accessibility.editTaskTitle') || 'Edit task title'}
                          accessibilityHint={t('taskManagement.accessibility.doubleTapToEditTitle') || 'Double tap to edit title'}
                        >
                          <Text
                            style={[
                              styles.title,
                              !task.title && styles.untitledTask,
                              task.isPriority && styles.priorityTitle
                            ]}
                            numberOfLines={2}
                            ellipsizeMode="tail"
                          >
                            {task.title || t('taskManagement.labels.untitledTask')}
                          </Text>
                        </TouchableOpacity>
                      )}
                      
                      {/* Indicator de prioritate (stea) */}
                      {!isEditing && (
                        <TouchableOpacity
                          style={styles.priorityButton}
                          onPress={(e) => {
                            e.stopPropagation(); // Prevenim propagarea tap-ului la card
                            onUpdate({ isPriority: !task.isPriority });
                          }}
                          accessibilityRole="button"
                          accessibilityLabel={
                            task.isPriority
                              ? t('taskManagement.accessibility.removePriority')
                              : t('taskManagement.accessibility.addPriority')
                          }
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
                  // Layout pentru task-uri completate
                  <View style={styles.completedContentContainer}>
                    {/* Afișează textul titlului */}
                    <TouchableOpacity
                      style={styles.titleContainer}
                      accessibilityRole="button"
                      accessibilityLabel={t('taskManagement.labels.viewTask')}
                    >
                      <Text style={[
                        styles.completedTitle,
                        !task.title && styles.untitledTask,
                        task.isPriority && styles.priorityCompletedTitle
                      ]}>
                        {task.title || t('taskManagement.labels.untitledTask')}
                      </Text>
                    </TouchableOpacity>

                    {/* Afișează data completării */}
                    {task.completedAt && (
                      <View style={styles.completionInfo}>
                        <Text style={styles.completionDate}>
                          {formatCompletionDate()}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </Animated.View>
        </Swipeable>
      </Animated.View>

      {renderPostponeMenu()}

      {/* Modalul de editare a task-ului */}
      <TaskEditModal
        visible={showEditModal}
        task={task}
        onClose={handleCloseEditModal}
        onUpdate={handleUpdateFromModal}
        onDelete={onDelete}
      />
    </View>
  );
};

/**
 * Stilurile componentei
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
  taskContainer: {
    flexDirection: 'row',            // Aranjează elementele pe orizontală
    alignItems: 'center',            // Centrează pe verticală
    flex: 1,                         // Ocupă tot spațiul disponibil
  },
  activeContentContainer: {
    flex: 1,                         // Ocupă tot spațiul disponibil
    flexDirection: 'column',         // Aranjează elementele pe verticală
    justifyContent: 'center',        // Centrează pe verticală
    paddingLeft: ACCESSIBILITY.SPACING.XS, // Spațiere la stânga
  },
  completedContentContainer: {
    flex: 1,                         // Ocupă tot spațiul disponibil
    flexDirection: 'column',         // Aranjează elementele pe verticală
    justifyContent: 'center',        // Centrează pe verticală
    paddingLeft: ACCESSIBILITY.SPACING.XS, // Spațiere la stânga
  },
  titleRow: {
    flexDirection: 'row',            // Aranjează elementele pe orizontală
    alignItems: 'center',            // Centrează pe verticală
    justifyContent: 'space-between', // Spațiază elementele uniform
  },
  titleContainer: {
    flex: 1,                         // Ocupă tot spațiul disponibil
    justifyContent: 'center',        // Centrează pe verticală
    minHeight: 28,                   // Înălțime minimă pentru accesibilitate
  },
  title: {
    fontSize: 14,                    // Dimensiunea fontului
    color: ACCESSIBILITY.COLORS.TEXT.PRIMARY,  // Culoarea principală a textului
  },
  completedTitle: {
    color: ACCESSIBILITY.COLORS.TEXT.SECONDARY,  // Culoare secundară - mai puțin accentuată
    fontSize: 13,                    // Font mic pentru textul finalizat
    textDecorationLine: 'line-through', // Adăugăm linie prin text pentru task-urile finalizate
    textDecorationStyle: 'solid',
    textDecorationColor: ACCESSIBILITY.COLORS.TEXT.SECONDARY,
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
  deleteAction: {
    backgroundColor: ACCESSIBILITY.COLORS.STATES.ERROR, // Roșu pentru acțiunea de ștergere
    justifyContent: 'center',        // Centrare pe verticală
    alignItems: 'center',            // Centrare pe orizontală
    width: 100,                      // Lățimea zonei de acțiune
    height: '100%',                  // Înălțimea completă
    flexDirection: 'row',            // Aranjează elementele pe orizontală
    borderTopRightRadius: ACCESSIBILITY.SPACING.SM,    // Colțuri rotunjite în dreapta
    borderBottomRightRadius: ACCESSIBILITY.SPACING.SM, // Colțuri rotunjite în dreapta
  },
  postponeAction: {
    backgroundColor: ACCESSIBILITY.COLORS.INTERACTIVE.PRIMARY, // Verde pentru acțiunea de amânare
    justifyContent: 'center',        // Centrare pe verticală
    alignItems: 'center',            // Centrare pe orizontală
    width: 100,                      // Lățimea zonei de acțiune
    height: '100%',                  // Înălțimea completă
    flexDirection: 'row',            // Aranjează elementele pe orizontală
    borderTopLeftRadius: ACCESSIBILITY.SPACING.SM,     // Colțuri rotunjite în stânga
    borderBottomLeftRadius: ACCESSIBILITY.SPACING.SM,  // Colțuri rotunjite în stânga
  },
  actionText: {
    color: 'white',                  // Text alb pentru contrast
    fontSize: 14,                    // Dimensiune font
    fontWeight: '600',               // Grosime font mărită pentru vizibilitate
    marginLeft: ACCESSIBILITY.SPACING.XS, // Spațiere la stânga
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  postponeMenu: {
    backgroundColor: ACCESSIBILITY.COLORS.BACKGROUND.PRIMARY,
    borderRadius: ACCESSIBILITY.SPACING.SM,
    padding: ACCESSIBILITY.SPACING.SM,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    maxWidth: 300, // Limităm lățimea meniului pentru a evita depășirea ecranului
  },
  postponeMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: ACCESSIBILITY.SPACING.SM,
    minHeight: ACCESSIBILITY.TOUCH_TARGET.MIN_HEIGHT, // Înălțime minimă pentru accesibilitate
    borderRadius: ACCESSIBILITY.SPACING.XS,
  },
  postponeMenuItemText: {
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.BASE,
    color: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
    marginLeft: ACCESSIBILITY.SPACING.SM,
  },
  postponeMenuTitle: {
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.BASE,
    color: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
    marginBottom: ACCESSIBILITY.SPACING.XS,
  },
  mainContent: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: ACCESSIBILITY.SPACING.SM,
  },
  taskContentContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: ACCESSIBILITY.TOUCH_TARGET.MIN_HEIGHT,
  },
  taskContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityButton: {
    padding: ACCESSIBILITY.SPACING.XS,
    borderRadius: ACCESSIBILITY.SPACING.XS,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// Adăugăm exportul implicit la sfârșitul fișierului
export default TaskItem;