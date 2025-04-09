import React, { useState, useCallback, useEffect, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform,
  Alert,
  TouchableOpacity,
  Text,
  ToastAndroid
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialIcons } from '@expo/vector-icons';
import TimeSection from './components/TimeSection';
import TaskFilter, { FilterOption } from './components/TaskFilter';
import TaskItem from './components/TaskItem'; // Import TaskItem component
import { TIME_PERIODS, type TimePeriodKey } from '../../constants/taskTypes';
import { useTaskContext } from '../../contexts/TaskContext';
import { ACCESSIBILITY } from '../../constants/accessibility';
import { useAuth } from '../../contexts/auth';
import type { Task } from '../../services/taskService';
import { getDayTimeColors } from '../../utils/daytime';
import TodayDate from '../../components/TodayDate';

// Interfață pentru zonele de drop
interface DropZone {
  periodId: TimePeriodKey;
  layout: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

const TaskManagementScreen: React.FC = () => {
  const { logout, user, isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const { tasks, loading, error, addTask, updateTask, deleteTask, toggleTask } = useTaskContext();
  const [currentFilter, setCurrentFilter] = useState<FilterOption>('all');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dayTimeColors = getDayTimeColors();
  
  // State pentru zonele de drop - necesar pentru funcționalitatea de drag and drop
  const [dropZones, setDropZones] = useState<DropZone[]>([]);
  
  // Dezactivăm scrollarea când este activă o operațiune de drag
  const [isScrollEnabled, setIsScrollEnabled] = useState(true);
  
  // Referință la ScrollView pentru a controla scrollarea
  const scrollViewRef = useRef<ScrollView>(null);

  // Timeout pentru debounce
  const scrollDebounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Stocăm offset-ul curent al ScrollView
  const [scrollOffset, setScrollOffset] = useState(0);

  // Monitorizăm starea de autentificare 
  useEffect(() => {
    if (!isAuthenticated && isLoggingOut) {
      // Handle logout completion
    }
  }, [isAuthenticated, isLoggingOut]);

  // Adăugăm un helper pentru depanare
  const logTasksInfo = useCallback(() => {
    console.log('--- Tasks Info ---');
    console.log(`MORNING: ${tasks.MORNING.length} tasks`);
    console.log(`AFTERNOON: ${tasks.AFTERNOON.length} tasks`);
    console.log(`EVENING: ${tasks.EVENING.length} tasks`);
    console.log(`COMPLETED: ${tasks.COMPLETED.length} tasks`);
    console.log(`FUTURE: ${tasks.FUTURE.length} tasks`);
    
    // Log detaliat pentru task-urile din FUTURE
    console.log('FUTURE tasks details:');
    tasks.FUTURE.forEach(task => {
      console.log(`- Task ${task.id}: ${task.title}`);
      console.log(`  Due date: ${task.dueDate instanceof Date ? task.dueDate.toISOString() : task.dueDate}`);
      console.log(`  Period: ${task.period}`);
    });
    
    // Verifică dacă există task-uri cu date viitoare care nu sunt în FUTURE
    console.log('Tasks with future dates NOT in FUTURE category:');
    [...tasks.MORNING, ...tasks.AFTERNOON, ...tasks.EVENING].forEach(task => {
      if (task.dueDate) {
        const dateObj = task.dueDate instanceof Date ? task.dueDate : new Date(task.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const taskDate = new Date(dateObj);
        taskDate.setHours(0, 0, 0, 0);
        
        if (taskDate.getTime() > today.getTime()) {
          console.log(`- Task ${task.id}: ${task.title} in ${task.period}`);
          console.log(`  Due date: ${dateObj.toISOString()}`);
        }
      }
    });
  }, [tasks]);

  // Apelăm funcția de log când task-urile sunt încărcate
  useEffect(() => {
    if (!loading) {
      logTasksInfo();
    }
  }, [tasks, loading, logTasksInfo]);

  // Verifică și corectează distribuția taskurilor
  const validateTaskDistribution = useCallback(() => {
    if (loading) return;
    
    // Verificăm dacă există task-uri cu date viitoare care nu sunt în secțiunea FUTURE
    const misplacedTasks = [...tasks.MORNING, ...tasks.AFTERNOON, ...tasks.EVENING].filter(task => {
      if (!task.dueDate) return false;
      
      const dateObj = task.dueDate instanceof Date ? task.dueDate : new Date(task.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const taskDate = new Date(dateObj);
      taskDate.setHours(0, 0, 0, 0);
      
      return taskDate.getTime() > today.getTime();
    });
    
    // Dacă există task-uri plasate greșit, le actualizăm
    if (misplacedTasks.length > 0) {
      console.log(`S-au găsit ${misplacedTasks.length} task-uri cu date viitoare plasate în secțiuni greșite`);
      
      // Actualizăm fiecare task
      misplacedTasks.forEach(task => {
        console.log(`Corectez perioada pentru task ${task.id} din ${task.period} în FUTURE`);
        updateTask(task.id, { 
          period: 'FUTURE',
          updatedAt: Date.now()
        }).catch(err => {
          console.error(`Eroare la actualizarea perioadei pentru task ${task.id}:`, err);
        });
      });
    }
  }, [tasks, loading, updateTask]);
  
  // Verificăm distribuția taskurilor când se încarcă sau se modifică
  useEffect(() => {
    validateTaskDistribution();
  }, [tasks, validateTaskDistribution]);

  useEffect(() => {
    // Această funcție va fi apelată la fiecare randare și la modificarea task-urilor
    // pentru a se asigura că zonele de drop sunt mereu actualizate
    const updateDropZones = () => {
      // Forțăm măsurarea din nou a tuturor secțiunilor
      console.log("Forțăm actualizarea zonelor de drop");
      setDropZones([]); // Resetăm zonele pentru a forța reînregistrarea
    };
    
    // Se asigură că zonele de drop sunt actualizate la modificările taskurilor
    updateDropZones();
    
    return () => {
      // Funcția de cleanup
    };
  }, [tasks]);

  const filterTasks = (taskList: Task[]): Task[] => {
    switch (currentFilter) {
      case 'active':
        return taskList.filter(task => !task.completed);
      case 'completed':
        return taskList.filter(task => task.completed);
      case 'priority':
        return taskList.filter(task => task.isPriority);
      case 'all':
        // Modificare: task-urile completate apar în tab-ul "All", dar vor fi afișate separat
        return taskList;
      default:
        return taskList;
    }
  };

  const getFilterCounts = () => {
    const allTasks = [...tasks.MORNING, ...tasks.AFTERNOON, ...tasks.EVENING];
    return {
      all: allTasks.length,
      active: allTasks.filter(task => !task.completed).length,
      completed: allTasks.filter(task => task.completed).length,
      priority: allTasks.filter(task => task.isPriority).length
    };
  };

  const getActiveTasksCountForPeriod = (periodId: TimePeriodKey): number => {
    if (periodId === 'COMPLETED') return 0; // Nu există task-uri active în secțiunea COMPLETED
    return tasks[periodId].filter(task => !task.completed).length;
  };

  const getAllCompletedTasks = (): Task[] => {
    // Colectăm toate task-urile completate din toate perioadele (cu excepția COMPLETED)
    return [...tasks.MORNING, ...tasks.AFTERNOON, ...tasks.EVENING].filter(task => task.completed);
  };

  // Adăugăm task-urile completate în obiectul tasks pentru a fi folosite cu TimeSection
  const tasksWithCompleted = {
    ...tasks,
    COMPLETED: getAllCompletedTasks()
  };

  const showSoftLimitWarning = (periodId: TimePeriodKey, onConfirm: () => void): void => {
    if (getActiveTasksCountForPeriod(periodId) >= 3) {
      Alert.alert(
        t('taskManagement.alerts.softLimit.title'),
        t('taskManagement.alerts.softLimit.message'),
        [
          {
            text: t('taskManagement.alerts.softLimit.cancel'),
            style: "cancel"
          },
          {
            text: t('taskManagement.alerts.softLimit.confirm'),
            onPress: onConfirm
          }
        ]
      );
    } else {
      onConfirm();
    }
  };

  const handleAddTask = async (periodId: TimePeriodKey) => {
    if (!user?.uid) {
      Alert.alert(
        t('common.error'),
        t('taskManagement.errors.notAuthenticated')
      );
      return;
    }

    showSoftLimitWarning(periodId, async () => {
      const newTask = {
        title: '',
        completed: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isPriority: false,
        period: periodId,
        userId: user.uid
      };

      try {
        await addTask(newTask);
      } catch (error) {
        Alert.alert(
          t('common.error'),
          t('taskManagement.errors.addTask')
        );
      }
    });
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      // Nu mai avem nevoie de nicio logică de navigare
      // Navigarea se face automat prin schimbarea lui isAuthenticated
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoggingOut(false);
    }
  };

  /**
   * Înregistrează o zonă de drop pentru a permite plasarea task-urilor
   * @param periodId ID-ul perioadei care va fi înregistrată ca zonă de drop
   * @param layout Dimensiunile și poziția zonei de drop
   */
  const registerDropZone = useCallback((periodId: TimePeriodKey, layout: { x: number, y: number, width: number, height: number }) => {
    console.log(`Registering drop zone for ${periodId}:`, layout);
    
    // Adăugăm o validare suplimentară pentru a ne asigura că valorile sunt valide
    if (layout.width <= 0 || layout.height <= 0) {
      console.log(`Invalid layout for ${periodId}, skipping registration`);
      return;
    }
    
    // Ajustăm coordonatele pentru a ține cont de scroll
    // Folosim scrollOffset pentru a ajusta coordonatele y
    const adjustedLayout = {
      ...layout,
      y: layout.y + scrollOffset
    };
    
    console.log(`Adjusted layout for ${periodId}:`, adjustedLayout);
    console.log(`Current scroll offset: ${scrollOffset}`);
    
    // Înregistrăm zona de drop
    setDropZones(prev => {
      // Verificăm dacă zona este deja înregistrată pentru a evita duplicatele
      const existingZoneIndex = prev.findIndex(zone => zone.periodId === periodId);
      
      if (existingZoneIndex !== -1) {
        // Actualizăm zona existentă
        const updatedZones = [...prev];
        updatedZones[existingZoneIndex] = { periodId, layout: adjustedLayout };
        console.log(`Registered drop zone for ${periodId}:`, adjustedLayout);
        return updatedZones;
      } else {
        // Adăugăm o zonă nouă
        console.log(`Registered drop zone for ${periodId}:`, adjustedLayout);
        return [...prev, { periodId, layout: adjustedLayout }];
      }
    });
  }, [scrollOffset]);
  
  /**
   * Deînregistrează o zonă de drop
   * @param periodId ID-ul perioadei care va fi deînregistrată
   */
  const unregisterDropZone = useCallback((periodId: TimePeriodKey) => {
    setDropZones(prev => prev.filter(zone => zone.periodId !== periodId));
  }, []);

  const handleMoveTask = useCallback(async (taskId: string, toPeriodId: TimePeriodKey) => {
    try {
      const taskToMove = [...tasks.MORNING, ...tasks.AFTERNOON, ...tasks.EVENING]
        .find(task => task.id === taskId);
      
      if (!taskToMove) return;
      
      // Chiar dacă task-ul este deja în aceeași perioadă, permitem mutarea
      // pentru a implementa reordonarea în viitor
      
      // Actualizăm task-ul cu noua perioadă și un timestamp actualizat
      await updateTask(taskId, { 
        period: toPeriodId,
        updatedAt: Date.now()
      });
      
      // Afișăm un mesaj de succes doar dacă perioada s-a schimbat
      if (taskToMove.period !== toPeriodId) {
        const periodName = t(TIME_PERIODS[toPeriodId].titleKey);
        
        if (Platform.OS === 'android') {
          ToastAndroid.show(
            t('taskManagement.success.taskMoved', { period: periodName.toLowerCase() }),
            ToastAndroid.SHORT
          );
        } else {
          // Pentru iOS am putea folosi o bibliotecă de notificări sau un alert
          // Dar pentru simplitate, nu afișăm nimic momentan
        }
      }
    } catch (error) {
      console.error('Failed to move task:', error);
      Alert.alert(
        t('common.error'),
        t('taskManagement.errors.updateTaskError')
      );
    }
  }, [tasks, updateTask, t]);

  const handleDragStart = useCallback(() => {
    setIsScrollEnabled(false);
    
    // Măsurăm din nou zonele de drop pentru a ne asigura că sunt actualizate
    if (scrollViewRef.current) {
      // Folosim un cast pentru a accesa proprietatea contentOffset
      const scrollView = scrollViewRef.current as any;
      const currentOffset = scrollView._scrollView?.contentOffset?.y || 0;
      setScrollOffset(currentOffset);
    }
  }, []);

  const handleDragEnd = useCallback(() => {
    // Adăugăm un mic delay pentru a evita scrollarea accidentală imediat după drop
    setTimeout(() => {
      setIsScrollEnabled(true);
    }, 100);
  }, []);

  /**
   * Handler pentru ScrollView pentru a preveni conflictele între scroll și drag
   * Această funcție ajută la o experiență de utilizare mai fluidă
   */
  const handleScroll = useCallback((event: { nativeEvent: { contentOffset: { y: number } } }) => {
    // Actualizăm offset-ul de scroll
    const newOffset = event.nativeEvent.contentOffset.y;
    setScrollOffset(newOffset);
    console.log(`Scroll offset updated: ${newOffset}`);
    
    // Actualizăm zonele de drop doar dacă nu este în curs o operațiune de drag
    if (isScrollEnabled) {
      // Folosim un debounce pentru a nu actualiza prea des
      if (scrollDebounceTimeout.current) {
        clearTimeout(scrollDebounceTimeout.current);
      }
      
      scrollDebounceTimeout.current = setTimeout(() => {
        // Resetăm zonele de drop pentru a forța reînregistrarea
        console.log("Resetăm zonele de drop după scroll");
        setDropZones([]);
      }, 150); // Debounce de 150ms
    }
  }, [isScrollEnabled]);

  const hasFutureTasks = tasks.FUTURE.length > 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { borderBottomColor: dayTimeColors.PRIMARY }]}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>{t('taskManagement.title')}</Text>
          <TodayDate />
        </View>
      </View>
      
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          scrollEnabled={isScrollEnabled}
          onScroll={handleScroll}
          scrollEventThrottle={16} // Optimizare pentru performanță - 60fps
        >
          <TaskFilter
            currentFilter={currentFilter}
            onFilterChange={setCurrentFilter}
            counts={getFilterCounts()}
          />
          
          {/* Afișăm categoriile de perioade doar dacă nu suntem în tab-ul "completed" */}
          {currentFilter !== 'completed' && Object.entries(TIME_PERIODS)
            .filter(([id]) => id !== 'COMPLETED' && id !== 'FUTURE') // Excludem secțiunile COMPLETED și FUTURE din ciclul normal
            .map(([id, period]) => (
              <TimeSection
                key={id}
                period={period}
                tasks={filterTasks(tasks[id as TimePeriodKey])}
                onAddTask={() => handleAddTask(id as TimePeriodKey)}
                onToggleTask={toggleTask}
                onDeleteTask={deleteTask}
                onUpdateTask={(taskId, updates) => updateTask(taskId, updates as Partial<Omit<Task, 'id' | 'userId'>>)}
                dropZones={dropZones}
                onDropTask={handleMoveTask}
                registerDropZone={registerDropZone}
                unregisterDropZone={unregisterDropZone}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              />
          ))}

          {/* Secțiunea Future Tasks cu delimitator */}
          {currentFilter !== 'completed' && (
            <>
              <View style={[styles.sectionSeparator, { marginTop: ACCESSIBILITY.SPACING.MD, marginBottom: ACCESSIBILITY.SPACING.MD }]} />
              <TimeSection
                key="FUTURE"
                period={TIME_PERIODS.FUTURE}
                tasks={filterTasks(tasks.FUTURE)}
                onAddTask={() => handleAddTask('FUTURE')}
                onToggleTask={toggleTask}
                onDeleteTask={deleteTask}
                onUpdateTask={(taskId, updates) => updateTask(taskId, updates as Partial<Omit<Task, 'id' | 'userId'>>)}
                dropZones={dropZones}
                onDropTask={handleMoveTask}
                registerDropZone={registerDropZone}
                unregisterDropZone={unregisterDropZone}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              />
            </>
          )}

          {/* Secțiunea pentru task-urile completate - folosind componenta TimeSection */}
          {(currentFilter === 'completed' || (currentFilter === 'all' && getAllCompletedTasks().length > 0)) && (
            <TimeSection
              key="COMPLETED"
              period={TIME_PERIODS.COMPLETED}
              tasks={tasksWithCompleted.COMPLETED}
              onAddTask={() => {}} // Nu permitem adăugarea de task-uri direct în secțiunea completate
              onToggleTask={toggleTask}
              onDeleteTask={deleteTask}
              onUpdateTask={(taskId, updates) => updateTask(taskId, updates as Partial<Omit<Task, 'id' | 'userId'>>)}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ACCESSIBILITY.COLORS.BACKGROUND.PRIMARY,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: ACCESSIBILITY.SPACING.MD,
    paddingTop: ACCESSIBILITY.SPACING.XL,
    paddingBottom: ACCESSIBILITY.SPACING.SM,
    borderBottomWidth: 2,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,
  },
  titleContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.XL,
    fontWeight: ACCESSIBILITY.TYPOGRAPHY.WEIGHTS.BOLD,
    color: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
    letterSpacing: 0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signOutButton: {
    width: ACCESSIBILITY.TOUCH_TARGET.MIN_WIDTH,
    height: ACCESSIBILITY.TOUCH_TARGET.MIN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: ACCESSIBILITY.SPACING.MD,
  },
  completedTasksSection: {
    marginTop: ACCESSIBILITY.SPACING.MD,
  },
  completedTasksHeader: {
    borderBottomWidth: 1,
    borderBottomColor: ACCESSIBILITY.COLORS.INTERACTIVE.SECONDARY,
    paddingBottom: ACCESSIBILITY.SPACING.SM,
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedTasksTitle: {
    fontSize: ACCESSIBILITY.TYPOGRAPHY.SIZES.LG,
    fontWeight: ACCESSIBILITY.TYPOGRAPHY.WEIGHTS.SEMIBOLD,
    color: ACCESSIBILITY.COLORS.TEXT.PRIMARY,
    marginLeft: ACCESSIBILITY.SPACING.SM,
  },
  completedTasksList: {
    marginTop: ACCESSIBILITY.SPACING.SM,
  },
  completedTaskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: ACCESSIBILITY.SPACING.SM,
  },
  periodIconContainer: {
    marginRight: ACCESSIBILITY.SPACING.SM,
  },
  taskItemContainer: {
    flex: 1,
  },
  sectionSeparator: {
    borderBottomWidth: 2,
    borderBottomColor: ACCESSIBILITY.COLORS.INTERACTIVE.SECONDARY,
    paddingBottom: ACCESSIBILITY.SPACING.SM,
    marginBottom: ACCESSIBILITY.SPACING.SM,
  },
});

export default TaskManagementScreen;
