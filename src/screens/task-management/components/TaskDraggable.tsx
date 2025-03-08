import React, { useRef, useState, useEffect } from 'react';
import { 
  View, 
  PanResponder, 
  Animated, 
  StyleSheet, 
  Vibration, 
  Dimensions,
  LayoutChangeEvent,
  AccessibilityInfo,
  findNodeHandle
} from 'react-native';
import { Task } from '../../../services/taskService';
import { TimePeriodKey } from '../../../constants/taskTypes';
import { ACCESSIBILITY } from '../../../constants/accessibility';
import { useTranslation } from 'react-i18next';

/**
 * Interfața pentru drop zones - reprezintă zonele unde se poate plasa un task
 * IMPACT: Definește structura de date necesară pentru a identifica zonele de drop
 */
interface DropZone {
  periodId: TimePeriodKey;
  layout: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

/**
 * Interfața Props pentru componenta TaskDraggable
 * IMPACT: Modificarea proprietăților obligatorii va necesita actualizări în toate utilizările componentei
 */
interface TaskDraggableProps {
  task: Task;                     // Task-ul curent
  children: React.ReactNode;      // Componenta copil (TaskItem) care va fi înfășurată
  dropZones: DropZone[];          // Zonele disponibile pentru drop
  onDragStart?: () => void;       // Handler apelat când începe operațiunea de drag
  onDragEnd?: () => void;         // Handler apelat când se termină operațiunea de drag (anulare)
  onDropInZone: (taskId: string, newPeriodId: TimePeriodKey) => void; // Handler pentru drop reușit
  onDragOver?: (taskId: string, isOver: boolean) => void; // Handler pentru când task-ul este tras deasupra unei zone
}

/**
 * Componenta TaskDraggable
 * Adaugă funcționalitatea de drag and drop unui task existent
 * 
 * IMPACT: Aceasta este o componentă wrapper care nu modifică funcționalitățile existente ale TaskItem
 */
const TaskDraggable: React.FC<TaskDraggableProps> = ({
  task,
  children,
  dropZones,
  onDragStart,
  onDragEnd,
  onDropInZone,
  onDragOver
}) => {
  const { t } = useTranslation();
  
  // Referințe pentru animație și poziție
  const viewRef = useRef<View>(null);
  const pan = useRef(new Animated.ValueXY()).current;
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  
  // Stări pentru tracking-ul operațiunii de drag
  const [isDragging, setIsDragging] = useState(false);
  const [initialPosition, setInitialPosition] = useState({ x: 0, y: 0 });
  const [taskLayout, setTaskLayout] = useState({ width: 0, height: 0 });
  const longPressTimeout = useRef<NodeJS.Timeout | null>(null);
  
  // Determin dacă utilizatorul are activate caracteristici de accesibilitate
  const [isAccessibilityEnabled, setIsAccessibilityEnabled] = useState(false);
  
  useEffect(() => {
    // Verifică dacă screen reader-ul este activ
    AccessibilityInfo.isScreenReaderEnabled().then(
      screenReaderEnabled => {
        setIsAccessibilityEnabled(screenReaderEnabled);
      }
    );
    
    // Adaugă listener pentru schimbări în starea screen reader-ului
    const listener = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      screenReaderEnabled => {
        setIsAccessibilityEnabled(screenReaderEnabled);
      }
    );
    
    return () => {
      // Curăță listener-ul
      listener.remove();
    };
  }, []);
  
  // Configurăm PanResponder pentru a gestiona gesturile touch
  const panResponder = useRef(
    PanResponder.create({
      // Pentru a permite componenta copil (TaskItem) să proceseze restul gesturilor
      onMoveShouldSetPanResponderCapture: () => isDragging,
      
      // Începe drag-ul după o apăsare lungă
      onStartShouldSetPanResponder: () => false,
      onStartShouldSetPanResponderCapture: () => false,
      
      // Verifică mișcarea pentru a începe drag-ul după apăsarea lungă
      onMoveShouldSetPanResponder: (_, gestureState) => {
        if (isDragging) {
          // Permitem mișcarea doar dacă drag-ul a fost inițiat
          return Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2;
        }
        return false;
      },
      
      // Când utilizatorul începe să țină apăsat task-ul
      onPanResponderGrant: (_, __) => {
        // Inițiem un timer pentru apăsare lungă
        longPressTimeout.current = setTimeout(() => {
          // Apăsare lungă detectată, începem drag-ul
          setIsDragging(true);
          
          // Mărim elementul pentru a oferi feedback vizual
          Animated.parallel([
            Animated.spring(scale, {
              toValue: 1.05,
              friction: 5,
              useNativeDriver: true
            }),
            Animated.spring(opacity, {
              toValue: 0.8,
              friction: 5,
              useNativeDriver: true
            })
          ]).start();
          
          // Feedback haptic pentru a indica începerea drag-ului
          Vibration.vibrate(50); // Folosim o vibrație scurtă de 50ms pentru feedback
          
          // Apelăm handler-ul de început de drag dacă există
          if (onDragStart) {
            onDragStart();
          }
          
          // Măsurăm poziția inițială a task-ului pentru a reseta animația dacă e nevoie
          if (viewRef.current) {
            viewRef.current.measure((x, y, width, height, pageX, pageY) => {
              setInitialPosition({ x: pageX, y: pageY });
              setTaskLayout({ width, height });
            });
          }
        }, 300); // Reducem timpul la 300ms pentru o experiență mai responsivă
      },
      
      // Când utilizatorul mută task-ul
      onPanResponderMove: (_, gestureState) => {
        if (!isDragging) return;
        
        // Actualizăm poziția
        pan.setValue({
          x: initialPosition.x + gestureState.dx,
          y: initialPosition.y + gestureState.dy
        });
        
        // Verificăm dacă task-ul se află deasupra unei zone de drop
        const currentPosition = {
          x: initialPosition.x + gestureState.dx,
          y: initialPosition.y + gestureState.dy
        };
        
        // Găsim zona de drop actuală
        const currentDropZone = findDropZone(currentPosition);
        
        // Notificăm despre starea de drag over pentru toate zonele
        if (onDragOver && dropZones) {
          // Notificăm zonele că task-ul nu mai este deasupra lor
          dropZones.forEach(zone => {
            // Verificăm dacă zona este diferită de perioada actuală și dacă task-ul este deasupra ei
            const isOverCurrentZone = currentDropZone !== null && 
                                    zone.periodId === currentDropZone.periodId && 
                                    zone.periodId !== task.period;
            
            // Apelăm onDragOver cu ID-ul zonei și starea de "over"
            onDragOver(zone.periodId, isOverCurrentZone);
          });
        }
      },
      
      // Când utilizatorul termină operațiunea de drag
      onPanResponderRelease: (_, gestureState) => {
        if (!isDragging) return;
        
        // Verificăm dacă task-ul a fost eliberat într-o zonă de drop validă
        const dropPosition = {
          x: initialPosition.x + gestureState.dx,
          y: initialPosition.y + gestureState.dy
        };
        
        // Căutăm zona de drop
        const targetZone = findDropZone(dropPosition);
        
        // Animația de revenire la starea inițială (scală, opacitate)
        const resetAnimations = [
          Animated.spring(scale, {
            toValue: 1,
            friction: 5,
            useNativeDriver: true
          }),
          Animated.spring(opacity, {
            toValue: 1,
            friction: 5,
            useNativeDriver: true
          })
        ];
        
        // Verificăm dacă avem o zonă de drop validă
        if (targetZone && targetZone.periodId !== task.period) {
          // Adăugăm un feedback haptic suplimentar pentru drop reușit
          Vibration.vibrate(100);
          
          // Animație de succes - task-ul dispare cu efect de fade out
          Animated.timing(opacity, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true
          }).start(() => {
            // După ce animația s-a terminat, resetăm poziția
            pan.setValue({ x: 0, y: 0 });
            opacity.setValue(1);
            
            // Executăm acțiunea de mutare a task-ului
            onDropInZone(task.id, targetZone.periodId);
            
            // Resetăm starea de drag
            setIsDragging(false);
            
            // Notificăm părinte că s-a terminat operațiunea de drag
            if (onDragEnd) {
              onDragEnd();
            }
          });
        } else {
          // Animație de spring pentru revenirea la poziția inițială
          resetAnimations.push(
            Animated.spring(pan, {
              toValue: { x: 0, y: 0 },
              friction: 5,
              tension: 40,
              useNativeDriver: true
            })
          );
          
          // Executăm toate animațiile în paralel
          Animated.parallel(resetAnimations).start(() => {
            // Resetăm starea de drag
            setIsDragging(false);
            
            // Notificăm părinte că s-a terminat operațiunea de drag
            if (onDragEnd) {
              onDragEnd();
            }
          });
        }
        
        // Anulăm orice timer în curs
        if (longPressTimeout.current) {
          clearTimeout(longPressTimeout.current);
        }
      },
      
      // Anulăm drag-ul dacă utilizatorul își retrage degetul
      onPanResponderTerminate: () => {
        // Anulăm timeout-ul pentru apăsare lungă dacă există
        if (longPressTimeout.current) {
          clearTimeout(longPressTimeout.current);
          longPressTimeout.current = null;
        }
        
        if (isDragging) {
          // Resetăm poziția și animațiile
          Animated.parallel([
            Animated.spring(pan, {
              toValue: { x: 0, y: 0 },
              friction: 5,
              useNativeDriver: true
            }),
            Animated.spring(scale, {
              toValue: 1,
              friction: 5,
              useNativeDriver: true
            }),
            Animated.spring(opacity, {
              toValue: 1,
              friction: 5,
              useNativeDriver: true
            })
          ]).start(() => {
            setIsDragging(false);
            
            // Apelăm handler-ul de încheiere a drag-ului dacă există
            if (onDragEnd) {
              onDragEnd();
            }
          });
        }
      }
    })
  ).current;

  /**
   * Verifică dacă task-ul este într-o zonă de drop validă
   * 
   * IMPACT: Această funcție determină în ce perioadă va fi mutat task-ul
   * 
   * @param position Poziția curentă a task-ului
   * @returns Zona de drop găsită sau null dacă nu există nicio potrivire
   */
  const findDropZone = (position: { x: number, y: number }): DropZone | null => {
    if (!dropZones || dropZones.length === 0) return null;
    
    // Calculăm centrul task-ului
    const taskCenterX = position.x + (taskLayout.width / 2);
    const taskCenterY = position.y + (taskLayout.height / 2);
    
    // Adăugăm o marjă pentru a face drop-ul mai permisiv
    // Acest lucru ajută utilizatorii cu ADHD care ar putea avea dificultăți cu precizia
    const margin = 20; // marjă de 20 pixeli
    
    // Căutăm o zonă de drop validă
    const foundZone = dropZones.find(zone => {
      const { x, y, width, height } = zone.layout;
      
      // Verifică dacă centrul task-ului este în zona de drop (cu marjă)
      const isInXRange = taskCenterX >= (x - margin) && taskCenterX <= (x + width + margin);
      const isInYRange = taskCenterY >= (y - margin) && taskCenterY <= (y + height + margin);
      
      // Verifică suplimentar dacă o parte substanțială din task se află în zona de drop
      const taskOverlapThreshold = 0.3; // 30% din task trebuie să fie în zona
      const taskRight = position.x + taskLayout.width;
      const taskBottom = position.y + taskLayout.height;
      const zoneRight = x + width;
      const zoneBottom = y + height;
      
      // Calculează suprapunerea
      const overlapX = Math.max(0, Math.min(taskRight, zoneRight) - Math.max(position.x, x));
      const overlapY = Math.max(0, Math.min(taskBottom, zoneBottom) - Math.max(position.y, y));
      const overlapArea = overlapX * overlapY;
      const taskArea = taskLayout.width * taskLayout.height;
      const overlapRatio = overlapArea / taskArea;
      
      return (isInXRange && isInYRange) || (overlapRatio > taskOverlapThreshold);
    });
    
    return foundZone || null;
  };
  
  /**
   * Handler pentru măsurarea dimensiunilor task-ului
   * 
   * IMPACT: Dimensiunile sunt necesare pentru calcularea centrului task-ului când este tras
   */
  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setTaskLayout({ width, height });
  };
  
  // Nu activăm drag-and-drop dacă screen reader-ul este activ
  if (isAccessibilityEnabled) {
    // Returnăm doar copiii pentru utilizatorii cu screen reader
    return <View accessible={true}>{children}</View>;
  }
  
  // Returnăm componenta Animated.View cu proprietățile de animație și responder-ul
  return (
    <Animated.View
      ref={viewRef}
      {...panResponder.panHandlers}
      style={[
        styles.container,
        {
          transform: [
            { translateX: pan.x },
            { translateY: pan.y },
            { scale: scale }
          ],
          opacity: opacity,
          zIndex: isDragging ? 999 : 1,
        }
      ]}
      onLayout={handleLayout}
      accessibilityLabel={t('taskManagement.accessibility.draggableTask')}
      accessibilityHint={t('taskManagement.accessibility.dragHint')}
      accessibilityRole="button"
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  }
});

export default TaskDraggable;
