import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Vibration, AccessibilityInfo, Platform } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { 
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS
} from 'react-native-reanimated';
import { Task } from '../../../services/taskService';
import { TimePeriodKey } from '../../../constants/taskTypes';
import TaskItem from './TaskItem';
import { useTranslation } from 'react-i18next';
import { ACCESSIBILITY } from '../../../constants/accessibility';

/**
 * Interfața pentru zonele de drop
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
 */
interface TaskDraggableProps {
  task: Task;                     // Sarcina curentă
  dropZones: Array<DropZone>;     // Zonele de drop disponibile
  onDropTask: (taskId: string, newPeriodId: TimePeriodKey) => void; // Handler pentru drop reușit
  onDragStart?: () => void;       // Handler apelat când începe operațiunea de drag
  onDragEnd?: () => void;         // Handler apelat când se termină operațiunea de drag
  onDragOver?: (periodId: string, isOver: boolean) => void; // Handler pentru când sarcina este trasă peste o zonă
}

/**
 * Componenta TaskDraggable
 * Permite utilizatorului să tragă o sarcină între diferite perioade de timp
 */
const TaskDraggable: React.FC<TaskDraggableProps> = ({
  task,
  dropZones,
  onDropTask,
  onDragStart,
  onDragEnd,
  onDragOver
}) => {
  const { t } = useTranslation();
  
  // Determină dacă funcțiile de accesibilitate sunt activate
  const [isAccessibilityEnabled, setIsAccessibilityEnabled] = useState(false);
  
  // Inițializăm starea și referințele
  const [isDragging, setIsDragging] = useState(false);
  const [initialPosition, setInitialPosition] = useState({ x: 0, y: 0 });
  const [taskLayout, setTaskLayout] = useState({ width: 0, height: 0 });
  const viewRef = useRef<View>(null);
  
  // Variabile pentru animații
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);
  
  // Stilul animat pentru task
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value }
      ],
      opacity: opacity.value,
      zIndex: isDragging ? 1000 : 1,
    };
  });
  
  // Verifică funcțiile de accesibilitate
  useEffect(() => {
    AccessibilityInfo.isScreenReaderEnabled().then(
      screenReaderEnabled => {
        setIsAccessibilityEnabled(screenReaderEnabled);
      }
    );
    
    const listener = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      screenReaderEnabled => {
        setIsAccessibilityEnabled(screenReaderEnabled);
      }
    );
    
    return () => {
      listener.remove();
    };
  }, []);
  
  // Măsoară poziția sarcinii pentru detectarea zonelor de drop
  const measureTaskPosition = () => {
    console.log('Measuring task position');
    if (viewRef.current) {
      // Folosim setTimeout pentru a ne asigura că măsurarea se face după ce componenta este complet randată
      setTimeout(() => {
        viewRef.current?.measure((x, y, width, height, pageX, pageY) => {
          console.log('Task position measured:', { x, y, width, height, pageX, pageY });
          
          // Folosim coordonatele pageX și pageY pentru poziția inițială
          // Acestea sunt coordonatele absolute în raport cu pagina
          setInitialPosition({ x: pageX, y: pageY });
          setTaskLayout({ width, height });
          
          // Afișăm și dimensiunile minime recomandate pentru accesibilitate
          const minTouchTargetWidth = ACCESSIBILITY.TOUCH_TARGET.MIN_WIDTH;
          const minTouchTargetHeight = ACCESSIBILITY.TOUCH_TARGET.MIN_HEIGHT;
          console.log(`Minimum recommended touch target size: ${minTouchTargetWidth}x${minTouchTargetHeight}`);
          console.log(`Current task size: ${width}x${height}`);
          
          // Verificăm dacă task-ul respectă dimensiunile minime recomandate
          if (width < minTouchTargetWidth || height < minTouchTargetHeight) {
            console.warn('Task size is smaller than the recommended minimum touch target size');
          }
        });
      }, 100);
    } else {
      console.log('viewRef.current is null');
    }
  };
  
  // Măsurăm poziția task-ului la montare și când se schimbă task-ul
  useEffect(() => {
    console.log('Measuring task position on mount or task change');
    const timer = setTimeout(() => {
      measureTaskPosition();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [task.id]);
  
  // Re-măsoară și când se schimbă zonele de drop
  useEffect(() => {
    if (dropZones.length > 0) {
      console.log(`Drop zones updated: ${dropZones.length} zones available`);
      const timer = setTimeout(() => {
        measureTaskPosition();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [dropZones]);
  
  // Găsește dacă poziția este peste o zonă de drop
  const findDropZone = (x: number, y: number): DropZone | null => {
    if (!dropZones || dropZones.length === 0) {
      console.log('No drop zones available');
      return null;
    }
    
    console.log(`Finding drop zone for position: (${x}, ${y}), with ${dropZones.length} zones available`);
    
    // Afișăm toate zonele disponibile pentru debugging
    dropZones.forEach(zone => {
      console.log(`Available zone: ${zone.periodId}`, zone.layout);
    });
    
    // Calculează centrul sarcinii
    const taskCenterX = x + (taskLayout.width / 2);
    const taskCenterY = y + (taskLayout.height / 2);
    
    console.log(`Task center position: (${taskCenterX}, ${taskCenterY})`);
    
    // Sortăm zonele în funcție de distanța față de centrul task-ului
    // pentru a găsi cea mai apropiată zonă
    const sortedZones = [...dropZones].sort((a, b) => {
      const aCenter = {
        x: a.layout.x + a.layout.width / 2,
        y: a.layout.y + a.layout.height / 2
      };
      
      const bCenter = {
        x: b.layout.x + b.layout.width / 2,
        y: b.layout.y + b.layout.height / 2
      };
      
      // Calculăm distanța ponderată - dăm mai multă importanță apropierii pe axa Y
      const distanceToA = Math.abs(taskCenterY - aCenter.y);
      const distanceToB = Math.abs(taskCenterY - bCenter.y);
      
      return distanceToA - distanceToB;
    });
    
    console.log('Sorted zones by Y distance:', sortedZones.map(z => z.periodId));
    
    // Luăm prima zonă (cea mai apropiată pe axa Y)
    // Aceasta este o abordare simplificată care va permite mutarea task-urilor
    // între perioade chiar dacă coordonatele nu se aliniază perfect
    if (sortedZones.length > 0) {
      const closestZone = sortedZones[0];
      console.log(`Selected closest zone: ${closestZone.periodId}`);
      return closestZone;
    }
    
    return null;
  };
  
  // Funcție pentru a notifica despre drag over
  const updateDragOverState = (x: number, y: number) => {
    if (!onDragOver || !dropZones) return;
    
    console.log('Checking drop zones at position:', { x, y });
    console.log('Available drop zones:', dropZones.length);
    
    const currentDropZone = findDropZone(x, y);
    console.log('Current drop zone:', currentDropZone ? currentDropZone.periodId : 'none');
    
    // Notifică toate zonele despre starea de drag over
    dropZones.forEach(zone => {
      const isOverCurrentZone = currentDropZone !== null && 
                              zone.periodId === currentDropZone.periodId;
      
      console.log(`Zone ${zone.periodId} is over: ${isOverCurrentZone}`);
      onDragOver(zone.periodId, isOverCurrentZone);
    });
  };
  
  // Resetează valorile animației
  const resetAnimations = (runEndCallback = true) => {
    console.log('Resetting animations');
    // Folosim damping pentru a obține o animație mai naturală
    translateX.value = withSpring(0, { damping: 15 });
    translateY.value = withSpring(0, { damping: 15 });
    scale.value = withSpring(1);
    opacity.value = withTiming(1, { duration: 150 });
    
    if (runEndCallback && onDragEnd) {
      runOnJS(onDragEnd)();
    }
    
    runOnJS(setIsDragging)(false);
  };
  
  // Funcție pentru a începe operațiunea de drag
  const startDrag = () => {
    console.log('Starting drag operation');
    setIsDragging(true);
    
    // Afișăm zonele de drop disponibile pentru debugging
    console.log(`Drop zones available at start: ${dropZones.length}`);
    dropZones.forEach(zone => {
      console.log(`Zone ${zone.periodId}:`, zone.layout);
    });
    
    // Notificăm că a început operațiunea de drag
    if (onDragStart) {
      onDragStart();
    }
    
    // Aplicăm un efect de scalare pentru a indica că task-ul este selectat
    scale.value = withTiming(1.03, { duration: 150 });
  };
  
  // Funcție pentru a finaliza operațiunea de drag
  const endDrag = (event: any) => {
    console.log('Ending drag operation');
    
    if (!isDragging) {
      console.log('Not dragging, ignoring end drag event');
      return;
    }
    
    // Calculăm poziția finală
    const finalX = initialPosition.x + (event?.translationX || 0);
    const finalY = initialPosition.y + (event?.translationY || 0);
    
    console.log(`Final position: (${finalX}, ${finalY})`);
    
    // Verificăm dacă suntem peste o zonă de drop validă
    const dropZone = findDropZone(finalX, finalY);
    console.log('Drop zone found:', dropZone ? dropZone.periodId : 'none');
    
    // Verificăm dacă am găsit o zonă de drop validă
    if (dropZone) {
      // Verificăm dacă zona de drop este diferită de perioada curentă a task-ului
      // sau dacă este aceeași perioadă (pentru reordonare)
      console.log(`Moving task ${task.id} to ${dropZone.periodId}`);
      Vibration.vibrate(100);
      
      opacity.value = withTiming(0, { duration: 150 }, () => {
        translateX.value = 0;
        translateY.value = 0;
        
        // Apelăm onDropTask chiar dacă este aceeași perioadă
        // Acest lucru va permite reordonarea în aceeași perioadă
        runOnJS(onDropTask)(task.id, dropZone.periodId);
        runOnJS(setIsDragging)(false);
        
        if (onDragEnd) {
          runOnJS(onDragEnd)();
        }
        
        opacity.value = 1;
      });
    } else {
      console.log('No valid drop zone found, resetting');
      resetAnimations();
    }
    
    // Resetăm starea de drag over pentru toate zonele
    if (onDragOver && dropZones) {
      dropZones.forEach(zone => {
        onDragOver(zone.periodId, false);
      });
    }
  };
  
  // Configurăm gesturile
  // Folosim o abordare simplificată pentru emulatoare
  
  // Gestul de apăsare lungă pentru începerea operațiunii de drag
  const longPressGesture = Gesture.LongPress()
    .minDuration(200) // Durata minimă pentru apăsare lungă (ms)
    .maxDistance(15)  // Distanța maximă permisă în timpul apăsării lungi
    .onStart(() => {
      console.log('LongPress started');
      runOnJS(startDrag)();
    });
  
  // Gestul de pan pentru mișcarea sarcinii
  const panGesture = Gesture.Pan()
    .activateAfterLongPress(200) // Activează pan doar după long press
    .minDistance(5)  // Distanța minimă pentru a activa pan-ul
    .onStart(() => {
      console.log('Pan gesture started');
      runOnJS(startDrag)();
    })
    .onUpdate((event) => {
      console.log(`Pan update: x=${event.translationX}, y=${event.translationY}`);
      
      // Restricționăm mișcarea doar pe axa Y (vertical)
      translateX.value = 0;
      translateY.value = event.translationY;
      
      // Calculăm poziția curentă a task-ului
      const currentX = initialPosition.x;
      const currentY = initialPosition.y + event.translationY;
      
      // Verificăm dacă suntem în apropierea unei zone de drop
      // și actualizăm starea de drag over
      runOnJS(updateDragOverState)(currentX, currentY);
    })
    .onEnd((event) => {
      console.log('Pan gesture ended');
      runOnJS(endDrag)(event);
    })
    .onFinalize(() => {
      console.log('Pan gesture finalized');
      if (isDragging) {
        runOnJS(resetAnimations)();
      }
    });
  
  // Combinăm gesturile într-un singur gest compus
  const gesture = Gesture.Simultaneous(longPressGesture, panGesture);
  
  // Nu activăm funcționalitatea de drag pentru utilizatorii de accesibilitate
  if (isAccessibilityEnabled) {
    return (
      <TaskItem
        task={task}
        onToggle={() => {}}
        onDelete={() => {}}
        onUpdate={() => {}}
      />
    );
  }
  
  return (
    <View 
      ref={viewRef} 
      collapsable={false}
      style={styles.wrapper}
      pointerEvents="box-none"
    >
      <GestureDetector gesture={gesture}>
        <Animated.View 
          style={[styles.container, animatedStyle]}
          accessibilityLabel={t('taskManagement.accessibility.draggableTask')}
          accessibilityHint={t('taskManagement.accessibility.dragHint')}
          accessibilityRole="button"
          accessible={true}
          pointerEvents="auto"
        >
          <TaskItem
            task={task}
            onToggle={() => {}}
            onDelete={() => {}}
            onUpdate={() => {}}
          />
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    minHeight: ACCESSIBILITY.TOUCH_TARGET.MIN_HEIGHT,
    position: 'relative',
  },
  container: {
    width: '100%',
    position: 'relative',
    zIndex: 1,
  }
});

export default TaskDraggable;
