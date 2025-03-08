import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, LayoutAnimation, Platform, UIManager, findNodeHandle } from 'react-native';
import { useTranslation } from 'react-i18next';
import TaskItem from './TaskItem';
import TaskDraggable from './TaskDraggable';
import { MaterialIcons } from '@expo/vector-icons';
import { ACCESSIBILITY } from '../../../constants/accessibility';
import type { Task } from '../../../services/taskService';
import type { TimePeriod, TimePeriodKey } from '../../../constants/taskTypes';
import { getDayTimeColors } from '../../../utils/daytime';

// Stiluri pentru efectul de highlight pentru zonele de drop
const dropZoneHighlightStyles = StyleSheet.create({
  highlight: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    borderWidth: 2,
    borderRadius: 12,
    borderStyle: 'dashed',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',  // Accent color cu opacitate scăzută
    zIndex: 1,
  }
});

// Activăm LayoutAnimation pentru Android - Necesar pentru ca animațiile să funcționeze pe Android
// IMPACT: Dacă este eliminat, animațiile nu vor funcționa pe Android, dar vor funcționa în continuare pe iOS
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/**
 * Interfața Props pentru componenta TimeSection
 * IMPACT: Adăugarea de proprietăți obligatorii va strica utilizările existente ale componentei
 * IMPACT: Adăugarea de proprietăți opționale nu va strica codul existent, dar necesită gestionare adecvată
 */
interface TimeSectionProps {
  period: TimePeriod;          // Perioada de timp (dimineață, după-amiază, seară)
  tasks: Task[];               // Lista de sarcini pentru această perioadă
  onAddTask: () => void;        // Handler pentru adăugarea unei noi sarcini
  onToggleTask: (taskId: string) => void;  // Handler pentru schimbarea stării de finalizare a unei sarcini
  onDeleteTask: (taskId: string) => void;  // Handler pentru ștergerea unei sarcini
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;  // Handler pentru actualizarea unei sarcini
  dropZones?: Array<{periodId: TimePeriodKey, layout: {x: number, y: number, width: number, height: number}}>;  // Zonele disponibile pentru drag and drop
  onDropTask?: (taskId: string, newPeriodId: TimePeriodKey) => void;  // Handler pentru mutarea unei sarcini în altă perioadă
  registerDropZone?: (periodId: TimePeriodKey, layout: { x: number, y: number, width: number, height: number }) => void; // Înregistrează zona în care pot fi plasate sarcinile trase
  unregisterDropZone?: (periodId: TimePeriodKey) => void; // Deînregistrează zona de drop
  onDragStart?: () => void;  // Handler pentru începerea operațiunii de drag
  onDragEnd?: () => void;    // Handler pentru terminarea operațiunii de drag
}

/**
 * Componenta TimeSection
 * Afișează o secțiune pliabilă pentru o perioadă specifică de timp cu sarcinile sale
 * 
 * IMPACT: Aceasta este o componentă de complexitate ridicată cu animații și randare condițională
 * IMPACT: Schimbările în comportamentul său de bază vor afecta întregul flux UI de gestionare a sarcinilor
 */
const TimeSection: React.FC<TimeSectionProps> = ({
  period,
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onUpdateTask,
  dropZones = [],
  onDropTask,
  registerDropZone,
  unregisterDropZone,
  onDragStart,
  onDragEnd
}) => {
  const { t } = useTranslation(); // Inițializarea hook-ului de traducere pentru internaționalizare
  
  // Stare pentru a urmări dacă secțiunea este expandată sau restrânsă
  // IMPACT: Valoarea implicită controlează dacă secțiunile sunt deschise sau închise la randarea inițială
  const [isExpanded, setIsExpanded] = useState(true);
  
  // Referință pentru a măsura poziția secțiunii
  const sectionRef = useRef<View>(null);
  
  // Stare pentru a urmări dacă această secțiune este o zonă de drop activă
  const [isActiveDropZone, setIsActiveDropZone] = useState(false);
  
  // Stare pentru a urmări dacă este în curs de drag
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Funcție pentru măsurarea și înregistrarea zonei de drop
  const measureAndRegisterDropZone = useCallback(() => {
    if (registerDropZone && sectionRef.current && isExpanded) {
      // Ensure we're using the correct method for measurement
      sectionRef.current.measure((x, y, width, height) => {
        // Only register if we have valid measurements
        if (width > 0 && height > 0) {
          registerDropZone(period.id, { x, y, width, height });
          // Log for debugging
          console.log(`Registered drop zone for ${period.id}:`, { x, y, width, height });
        }
      });
    }
  }, [period.id, registerDropZone, isExpanded]);

  // Măsurăm și înregistrăm zona de drop la montare și când se modifică expandarea
  useEffect(() => {
    // Adăugăm un delay pentru a permite randarea completă
    const timer = setTimeout(() => {
      measureAndRegisterDropZone();
    }, 300);
    
    // Adăugăm un interval pentru a asigura că zona este măsurată periodic
    // Acest lucru ajută la rezolvarea problemelor de timing
    const intervalId = setInterval(() => {
      if (isExpanded) {
        measureAndRegisterDropZone();
      }
    }, 2000);
    
    // Curățăm zona de drop la demontare
    return () => {
      clearTimeout(timer);
      clearInterval(intervalId);
      // Dacă există o funcție de deînregistrare, o apelăm
      if (unregisterDropZone) {
        unregisterDropZone(period.id);
      }
    };
  }, [isExpanded, period.id, unregisterDropZone, measureAndRegisterDropZone]); // Adăugăm measureAndRegisterDropZone ca dependență
  
  // Obținem culorile specifice acestei perioade de timp
  const periodColors = getPeriodColors();
  
  /**
   * Obține culorile specifice perioadei curente de timp din constantele de accesibilitate
   * IMPACT: Utilizat în toată componenta pentru consistență vizuală
   * IMPACT: Schimbarea acestei funcții afectează întreaga schemă de culori a componentei
   * @returns Obiect cu culorile specifice perioadei
   */
  function getPeriodColors() {
    switch (period.id) {
      case 'MORNING':
        return ACCESSIBILITY.COLORS.DAYTIME.MORNING;
      case 'AFTERNOON':
        return ACCESSIBILITY.COLORS.DAYTIME.AFTERNOON;
      case 'EVENING':
        return ACCESSIBILITY.COLORS.DAYTIME.EVENING;
      case 'COMPLETED':
        return {
          PRIMARY: 'rgba(0,0,0,0.05)',
          SECONDARY: 'rgba(0,0,0,0.1)',
          BORDER: 'rgba(0,0,0,0.2)',
          ICON: ACCESSIBILITY.COLORS.TEXT.SECONDARY
        };
      default:
        return ACCESSIBILITY.COLORS.DAYTIME.MORNING; // Valoare implicită de siguranță
    }
  }
  
  /**
   * Separăm sarcinile active de cele completate
   * IMPACT: Această logică determină ce sarcini sunt afișate în secțiunea principală vs. cea de "completate"
   * IMPACT: Modificarea acestei logici va schimba modul în care sarcinile sunt grupate și afișate
   */
  const activeTasks = period.id === 'COMPLETED' ? tasks : tasks.filter(task => !task.completed);
  const completedTasks = period.id === 'COMPLETED' ? [] : tasks.filter(task => task.completed);
  
  /**
   * Determină stilurile dinamice pentru containerul listei de sarcini în funcție de prezența sarcinilor
   * IMPACT: Afectează spațierea și aspectul vizual al secțiunii
   * @returns Obiect cu stiluri pentru containerul listei de sarcini
   */
  const getTaskListContainerStyle = () => {
    const baseStyle = {
      backgroundColor: 'transparent',
      paddingHorizontal: ACCESSIBILITY.SPACING.XS,
      borderWidth: 0,
      shadowOpacity: 0,
      elevation: 0,
    };
    
    // Reducem padding-ul vertical când nu există sarcini active
    return {
      ...baseStyle,
      paddingVertical: activeTasks.length === 0 ? 0 : ACCESSIBILITY.SPACING.XS,
    };
  };
  
  /**
   * Activează animația și comută starea de expandare a secțiunii
   * IMPACT: Animația face interfața mai fluidă și mai prietenoasă
   * IMPACT: Eliminarea acestei funcții ar face tranziția de expandare/restrângere bruscă
   */
  const toggleExpand = () => {
    // Configurăm animația înainte de a schimba starea
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded(!isExpanded);
  };

  /**
   * Actualizează o sarcină când este marcată ca finalizată sau nefinalizată
   * IMPACT: Adaugă/elimină timestamp-ul de finalizare când starea sarcinii se schimbă
   * IMPACT: Modificarea acestei funcții afectează modul în care sunt înregistrate completările
   * @param taskId ID-ul sarcinii care trebuie actualizată
   */
  const handleToggleTask = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      // Dacă sarcina este marcată ca finalizată, adăugăm timestamp-ul curent
      if (!task.completed) {
        onUpdateTask(taskId, { 
          completed: true, 
          completedAt: Date.now() 
        });
      } else {
        onUpdateTask(taskId, { 
          completed: false, 
          completedAt: undefined // Folosim undefined în loc de null
        });
      }
    }
  };

  // Handler pentru evenimente de drag
  const handleDragStart = useCallback(() => {
    if (onDragStart) onDragStart();
  }, [onDragStart]);

  const handleDragEnd = useCallback(() => {
    setIsDragOver(false);
    if (onDragEnd) onDragEnd();
  }, [onDragEnd]);

  /**
   * Gestionează evenimentele de drag-over pentru această secțiune
   * @param periodId ID-ul perioadei peste care se face drag
   * @param isOver Dacă task-ul este deasupra acestei zone
   */
  const handleDragOver = useCallback((periodId: string, isOver: boolean) => {
    if (periodId === period.id) {
      setIsDragOver(isOver);
    }
  }, [period.id]);

  // Începe randarea componentei
  return (
    <View style={styles.container} ref={sectionRef}>
      {/* Spațiu între categorii */}
      <View style={styles.categorySpacing} />
      
      {/* Separator între secțiuni - afișat doar înainte de secțiunea COMPLETED
          IMPACT: Elimină/adaugă separatorul vizual pentru secțiunea completată */}
      {period.id === 'COMPLETED' && (
        <View style={styles.sectionSeparator} />
      )}
      
      {/* Containerul principal cu bordură colorată
          IMPACT: Utilizează culorile specifice perioadei pentru bordură */}
      <View style={[styles.sectionContainer, { borderLeftColor: periodColors.BORDER }, isDragOver && dropZoneHighlightStyles.highlight]}>
        {/* Header-ul secțiunii - este mereu vizibil
            IMPACT: Acest TouchableOpacity controlează expandarea/restrângerea întregii secțiuni */}
        <TouchableOpacity
          activeOpacity={0.7} // Reduce opacitatea la apăsare pentru feedback vizual
          onPress={toggleExpand}
          accessibilityRole="button"
          accessibilityLabel={isExpanded ? 
            t('taskManagement.buttons.collapseSection', { section: t(period.titleKey) }) : 
            t('taskManagement.buttons.expandSection', { section: t(period.titleKey) })
          }
          accessibilityHint={isExpanded ? 
            t('taskManagement.accessibility.collapseHint') : 
            t('taskManagement.accessibility.expandHintText')
          }
        >
          <View style={[
            styles.headerCard, 
            period.id === 'COMPLETED' && styles.completedSectionHeader
          ]}>
            <View style={styles.titleContainer}>
              {/* Iconița perioadei - diferită pentru secțiunea "Completate"
                  IMPACT: Oferă indiciu vizual pentru tipul perioadei */}
              <MaterialIcons 
                name={period.id === 'COMPLETED' ? 'check-circle' : period.icon} 
                size={20} 
                color={period.id === 'COMPLETED' ? '#34C759' : periodColors.ICON} 
              />
              {/* Titlul perioadei 
                  IMPACT: Folosește cheile de traducere pentru a afișa textul corect în limba curentă */}
              <Text style={[
                styles.title,
                period.id === 'COMPLETED' && styles.completedSectionTitle
              ]}>
                {t(period.titleKey)}
              </Text>
              {/* Numărul de sarcini din perioadă 
                  IMPACT: Indică utilizatorului câte sarcini sunt în această secțiune */}
              <Text style={styles.taskCount}>
                ({activeTasks.length})
              </Text>
            </View>
            <View style={styles.actionContainer}>
              {/* Afișăm butonul de adăugare doar pentru secțiunile care nu sunt COMPLETED
                  IMPACT: Restricționează adăugarea de sarcini direct în secțiunea "Completate" */}
              {period.id !== 'COMPLETED' && (
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation(); // Previne propagarea evenimentului la părinte - important pentru a nu declanșa toggleExpand
                    onAddTask();
                  }}
                  style={styles.addButton}
                  accessibilityRole="button"
                  accessibilityLabel={t('taskManagement.buttons.addTask')}
                >
                  <MaterialIcons 
                    name="add" 
                    size={20} 
                    color={ACCESSIBILITY.COLORS.INTERACTIVE.PRIMARY} 
                  />
                </TouchableOpacity>
              )}
              {/* Indicator vizual pentru starea de expandare/restrângere
                  IMPACT: Oferă feedback vizual utilizatorului despre starea secțiunii */}
              <MaterialIcons 
                name={isExpanded ? "expand-more" : "expand-less"} 
                size={20} 
                color={ACCESSIBILITY.COLORS.TEXT.SECONDARY} 
              />
            </View>
          </View>
        </TouchableOpacity>

        {/* Container pentru lista de sarcini - vizibil doar când isExpanded este true
            IMPACT: Controlează vizibilitatea întregii liste de sarcini */}
        {isExpanded && (
          <View style={getTaskListContainerStyle()}>
            {/* Sarcinile active 
                IMPACT: Condiția determină dacă se afișează lista de sarcini sau mesajul "nicio sarcină" */}
            {activeTasks.length > 0 ? (
              <View style={styles.taskList}>
                {/* Mapează fiecare sarcină la o componentă TaskItem cu TaskDraggable
                    IMPACT: Randează lista dinamică de sarcini cu handleri specifici */}
                {activeTasks.map((task) => (
                  <View key={task.id} style={[
                    styles.taskItemWrapper,
                    period.id === 'COMPLETED' && styles.completedTaskItemWrapper
                  ]}>
                    {period.id !== 'COMPLETED' && onDropTask && dropZones ? (
                      // Aplicăm TaskDraggable doar pentru sarcinile care nu sunt completate
                      <TaskDraggable 
                        task={task}
                        dropZones={dropZones}
                        onDropTask={onDropTask}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onDragOver={handleDragOver}
                      />
                    ) : (
                      // Pentru sarcinile completate, nu aplicăm funcționalitatea de drag and drop
                      <TaskItem
                        task={task}
                        onToggle={() => handleToggleTask(task.id)}
                        onDelete={() => onDeleteTask(task.id)}
                        onUpdate={(updates: Partial<Task>) => onUpdateTask(task.id, updates)}
                      />
                    )}
                  </View>
                ))}
              </View>
            ) : (
              /* Stare de gol - afișată când nu există sarcini
                 IMPACT: Oferă feedback utilizatorului când nu există sarcini în secțiune */
              <View style={[styles.emptyState, period.id !== 'COMPLETED' && styles.compactEmptyState]}>
                <Text style={styles.emptyStateText}>
                  {t('taskManagement.labels.noTasksForPeriod')}
                </Text>
              </View>
            )}
            
            {/* Sarcinile completate - nu le mai afișăm în secțiunile individuale
                IMPACT: Această secțiune este dezactivată (false &&) - dacă ar fi activată, ar afișa sarcinile completate în fiecare secțiune */}
            {false && period.id !== 'COMPLETED' && completedTasks.length > 0 && (
              <>
                <View style={styles.completedTasksHeader}>
                  <Text style={styles.completedTasksTitle}>
                    {t('taskManagement.filters.completedTasks')}
                  </Text>
                  <Text style={[styles.taskCount, styles.completedTasksTitle]}>
                    ({completedTasks.length})
                  </Text>
                </View>
                <View style={styles.completedTasksList}>
                  {completedTasks.map((task) => (
                    <View key={task.id} style={[styles.taskItemWrapper, styles.completedTaskItemWrapper]}>
                      <TaskItem
                        task={task}
                        onToggle={() => handleToggleTask(task.id)}
                        onDelete={() => onDeleteTask(task.id)}
                        onUpdate={(updates: Partial<Task>) => onUpdateTask(task.id, updates)}
                      />
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

/**
 * Stilurile componentei
 * IMPACT: Modificarea dimensiunilor, culorilor sau spațierilor va afecta aspectul întregii componente
 * IMPACT: Folosește constante din ACCESSIBILITY pentru consistență cu restul aplicației
 */
const styles = StyleSheet.create({
  container: {
    marginBottom: ACCESSIBILITY.SPACING.SM_MD, // Folosește valoarea intermediară pentru spațierea dintre secțiuni
  },
  categorySpacing: {
    height: 2, // Spațiere vizuală mică între categorii
  },
  sectionContainer: {
    marginHorizontal: ACCESSIBILITY.SPACING.SM,
    borderLeftWidth: 4,   // Bordura de culoare din stânga - indicator vizual pentru perioadă
    borderRadius: ACCESSIBILITY.SPACING.SM,
    overflow: 'hidden',   // Forțează colțurile rotunjite să taie conținutul intern
    backgroundColor: ACCESSIBILITY.COLORS.BACKGROUND.PRIMARY,
    // Umbre pentru întreaga secțiune - adaugă adâncime vizuală
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,  // Echivalentul umbrei pentru Android
  },
  headerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: ACCESSIBILITY.SPACING.BASE,
    paddingVertical: 6,
  },
  completedSectionHeader: {
    backgroundColor: 'rgba(0,0,0,0.03)',  // Fundal ușor colorat pentru a diferenția secțiunea completată
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ACCESSIBILITY.SPACING.SM,  // Spațiere între elementele container-ului titlului
  },
  title: {
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.BASE,
    fontWeight: ACCESSIBILITY.TYPOGRAPHY.WEIGHTS.MEDIUM,
    color: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
  },
  completedSectionTitle: {
    color: ACCESSIBILITY.COLORS.TEXT.SECONDARY,  // Culoare distinctă pentru titlul secțiunii completate
    fontWeight: ACCESSIBILITY.TYPOGRAPHY.WEIGHTS.MEDIUM,
  },
  taskCount: {
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.SM,
    color: ACCESSIBILITY.COLORS.TEXT.SECONDARY,
    marginLeft: ACCESSIBILITY.SPACING.XS,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButton: {
    width: ACCESSIBILITY.TOUCH_TARGET.MIN_WIDTH,  // Dimensiune minimă pentru a fi ușor de apăsat
    height: ACCESSIBILITY.TOUCH_TARGET.MIN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskListContainer: {
    backgroundColor: 'transparent',
    paddingHorizontal: ACCESSIBILITY.SPACING.XS,
    paddingVertical: ACCESSIBILITY.SPACING.XS,
    // Fără umbră sau border - pentru un aspect mai curat
    borderWidth: 0,
    shadowOpacity: 0,
    elevation: 0,
  },
  taskList: {
    paddingTop: 0,
    paddingBottom: ACCESSIBILITY.SPACING.XS,
    backgroundColor: 'transparent',
  },
  taskItemWrapper: {
    margin: 0,
    padding: 0,
    borderRadius: 0,
    backgroundColor: 'transparent',
    width: '100%',  // Asigurăm că ocupă toată lățimea disponibilă
  },
  completedTaskItemWrapper: {
    margin: 0,
    padding: 0,
    marginBottom: 0.7,  // Spațiere mică între sarcinile completate
  },
  completedTasksHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 4,
    paddingHorizontal: ACCESSIBILITY.SPACING.SM,
    marginTop: 4,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(0,0,0,0.1)',  // Separator vizual subtil
  },
  completedTasksTitle: {
    fontSize: 12,
    fontWeight: ACCESSIBILITY.TYPOGRAPHY.WEIGHTS.MEDIUM,
    color: ACCESSIBILITY.COLORS.TEXT.SECONDARY,
  },
  completedTasksList: {
    backgroundColor: 'transparent',
    paddingVertical: 4,
    paddingHorizontal: ACCESSIBILITY.SPACING.XS,
    marginTop: 0,
  },
  emptyState: {
    padding: ACCESSIBILITY.SPACING.XS,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 30, // Înălțime minimă, suficientă pentru accesibilitate
  },
  compactEmptyState: {
    minHeight: 24, // Înălțime minimă și mai redusă pentru secțiunile non-COMPLETED
    paddingVertical: 2,
  },
  emptyStateText: {
    color: ACCESSIBILITY.COLORS.TEXT.SECONDARY,
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.SM,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  sectionSeparator: {
    height: 2,
    backgroundColor: 'rgba(0,0,0,0.15)',
    marginHorizontal: ACCESSIBILITY.SPACING.SM,
    marginTop: ACCESSIBILITY.SPACING.SM_MD,
    marginBottom: ACCESSIBILITY.SPACING.MD,
  }
});

export default TimeSection;