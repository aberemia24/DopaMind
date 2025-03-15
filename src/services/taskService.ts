import { getDocs, query, collection, where, addDoc, updateDoc, deleteDoc, doc, FieldValue, deleteField } from 'firebase/firestore';
import { getFirebaseFirestore } from '../config/firebase';
import type { TimePeriodKey } from '../constants/taskTypes';
import { isDateInFuture, getTimePeriodFromDate } from '../utils/timeUtils';

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  isPriority: boolean;
  period: TimePeriodKey;
  userId: string;
  createdAt: number;
  updatedAt: number;
  completedAt?: number; // Data la care a fost completat task-ul
  dueDate?: Date; // Data scadentă a task-ului, convertită la Date în validateTaskData
  reminderMinutes?: number;
  repeat?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
  };
  notes?: string; // Note adiționale pentru task
  category?: string; // Categoria task-ului
}

// Interfață pentru datele primite de la Firestore înainte de validare și conversie
interface FirestoreTaskData {
  title: string;
  description?: string;
  completed: boolean;
  isPriority: boolean;
  period: TimePeriodKey;
  userId: string;
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
  dueDate?: Date | string | number | { seconds: number; nanoseconds: number };
  reminderMinutes?: number;
  repeat?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
  };
  notes?: string;
  category?: string;
}

// Tip pentru actualizări care permite și FieldValue pentru câmpurile care pot fi șterse
export type TaskUpdateData = {
  [K in keyof Omit<Task, 'id'>]?: K extends 'completedAt' ? Task[K] | FieldValue : Task[K];
};

export interface TasksByPeriod {
  MORNING: Task[];
  AFTERNOON: Task[];
  EVENING: Task[];
  COMPLETED: Task[];
  FUTURE: Task[];
}

type TaskData = Omit<Task, 'id'>;

const TASKS_COLLECTION = 'tasks';

/**
 * Validează datele unui task primite de la Firestore
 * @throws Error dacă datele nu sunt valide
 */
const validateTaskData = (data: unknown): Task => {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid task data: data must be an object');
  }

  const {
    title,
    description,
    completed,
    isPriority,
    period,
    userId,
    createdAt,
    updatedAt,
    dueDate,
    reminderMinutes,
    repeat,
    completedAt,
    notes,
    category
  } = data as Record<string, unknown>;

  if (typeof title !== 'string' || !title) {
    throw new Error('Invalid task data: title must be a non-empty string');
  }

  if (description !== undefined && typeof description !== 'string') {
    throw new Error('Invalid task data: description must be a string if present');
  }

  if (typeof completed !== 'boolean') {
    throw new Error('Invalid task data: completed must be a boolean');
  }

  if (typeof isPriority !== 'boolean') {
    throw new Error('Invalid task data: isPriority must be a boolean');
  }

  if (typeof period !== 'string' || !period) {
    throw new Error('Invalid task data: period must be a non-empty string');
  }

  if (typeof userId !== 'string' || !userId) {
    throw new Error('Invalid task data: userId must be a non-empty string');
  }

  if (typeof createdAt !== 'number' || !Number.isFinite(createdAt)) {
    throw new Error('Invalid task data: createdAt must be a valid timestamp');
  }

  if (typeof updatedAt !== 'number' || !Number.isFinite(updatedAt)) {
    throw new Error('Invalid task data: updatedAt must be a valid timestamp');
  }

  let convertedData: Task = {
    id: (data as { id?: string }).id || '', // ID va fi setat mai târziu
    title: title as string,
    description: description as string | undefined,
    completed: completed as boolean,
    isPriority: isPriority as boolean,
    period: period as TimePeriodKey,
    userId: userId as string,
    createdAt: createdAt as number,
    updatedAt: updatedAt as number,
  };

  if (dueDate !== undefined) {
    try {
      let convertedDate: Date;
      
      // Convertim dueDate la un obiect Date valid indiferent de formatul său
      if (dueDate instanceof Date) {
        convertedDate = dueDate;
      } else if (typeof dueDate === 'string') {
        convertedDate = new Date(dueDate);
      } else if (typeof dueDate === 'object' && dueDate !== null && 'seconds' in dueDate && 'nanoseconds' in dueDate) {
        // Timestamp Firestore
        const timestamp = dueDate as { seconds: number; nanoseconds: number };
        convertedDate = new Date(timestamp.seconds * 1000);
      } else if (typeof dueDate === 'number') {
        convertedDate = new Date(dueDate);
      } else {
        throw new Error('Invalid date format');
      }
      
      // Verificăm dacă data convertită este validă
      if (isNaN(convertedDate.getTime())) {
        throw new Error('Invalid date value');
      }
      
      // Adăugăm data convertită la obiectul task
      convertedData.dueDate = convertedDate;
    } catch (error) {
      console.error('Error converting dueDate:', error, dueDate);
      throw new Error('Invalid task data: dueDate must be a valid date format if present');
    }
  }

  if (reminderMinutes !== undefined && (typeof reminderMinutes !== 'number' || !Number.isFinite(reminderMinutes))) {
    throw new Error('Invalid task data: reminderMinutes must be a valid number if present');
  } else if (reminderMinutes !== undefined) {
    convertedData.reminderMinutes = reminderMinutes as number;
  }

  if (completedAt !== undefined && (typeof completedAt !== 'number' || !Number.isFinite(completedAt))) {
    throw new Error('Invalid task data: completedAt must be a valid timestamp if present');
  } else if (completedAt !== undefined) {
    convertedData.completedAt = completedAt as number;
  }

  if (repeat !== undefined) {
    if (typeof repeat !== 'object' || repeat === null) {
      throw new Error('Invalid task data: repeat must be an object if present');
    }

    const { frequency, interval } = repeat as Record<string, unknown>;

    if (typeof frequency !== 'string' || !['daily', 'weekly', 'monthly'].includes(frequency)) {
      throw new Error('Invalid task data: repeat.frequency must be one of: daily, weekly, monthly');
    }

    if (typeof interval !== 'number' || !Number.isFinite(interval) || interval <= 0) {
      throw new Error('Invalid task data: repeat.interval must be a positive number');
    }

    convertedData.repeat = {
      frequency: frequency as 'daily' | 'weekly' | 'monthly',
      interval: interval as number
    };
  }

  if (notes !== undefined && typeof notes !== 'string') {
    throw new Error('Invalid task data: notes must be a string if present');
  } else if (notes !== undefined) {
    convertedData.notes = notes as string;
  }

  if (category !== undefined && typeof category !== 'string') {
    throw new Error('Invalid task data: category must be a string if present');
  } else if (category !== undefined) {
    convertedData.category = category as string;
  }

  return convertedData;
};

/**
 * Verifică dacă un task are o dată scadentă în viitor
 */
const isFutureTask = (task: Task): boolean => {
  if (!task.dueDate) return false;
  
  try {
    // Utilizăm funcția isDateInFuture pentru a verifica dacă data este în viitor
    const isFuture = isDateInFuture(task.dueDate);
    
    // Logging pentru debugging
    console.log(`Task ${task.id} - ${task.title}`);
    console.log(`Due date: ${task.dueDate instanceof Date ? task.dueDate.toISOString() : 'Invalid Date'}`);
    console.log(`Is future: ${isFuture}`);
    
    return isFuture;
  } catch (error) {
    console.error(`Error checking if task ${task.id} is future:`, error);
    return false;
  }
};

/**
 * Preia task-urile unui utilizator grupate pe perioade
 */
export const fetchTasks = async (userId: string): Promise<TasksByPeriod> => {
  try {
    console.log('Începe fetchTasks pentru userId:', userId);
    const db = getFirebaseFirestore();
    const tasksQuery = query(
      collection(db, TASKS_COLLECTION),
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(tasksQuery);
    console.log(`S-au găsit ${querySnapshot.size} taskuri în total`);
    
    const result: TasksByPeriod = {
      MORNING: [],
      AFTERNOON: [],
      EVENING: [],
      COMPLETED: [],
      FUTURE: []
    };

    // Procesăm fiecare task și îl adăugăm în categoria corespunzătoare
    querySnapshot.forEach((doc) => {
      try {
        const validatedData = validateTaskData(doc.data());
        const task: Task = {
          ...validatedData,
          id: doc.id
        };
        
        console.log(`Procesez task: ${task.id} - ${task.title}`);
        console.log(`Period: ${task.period}, Completed: ${task.completed}`);
        console.log(`DueDate: ${task.dueDate instanceof Date ? task.dueDate.toISOString() : 'undefined'}`);
        
        // Verificăm mai întâi dacă task-ul este completat
        if (task.completed) {
          console.log(`Task ${task.id} adăugat în COMPLETED`);
          result.COMPLETED.push(task);
          return; // Continuăm cu următorul task
        } 
        
        // Apoi verificăm dacă task-ul are o dată în viitor
        const isTaskInFuture = isFutureTask(task);
        console.log(`Task ${task.id} este în viitor: ${isTaskInFuture}`);
        
        if (isTaskInFuture) {
          console.log(`Task ${task.id} mutat în FUTURE: ${task.title}`);
          result.FUTURE.push(task);
        } else {
          // Dacă nu este completat și nu are o dată în viitor, îl punem în perioada corespunzătoare
          console.log(`Task ${task.id} adăugat în ${task.period}`);
          result[task.period].push(task);
        }
      } catch (error) {
        console.error(`Error processing task ${doc.id}:`, error);
        // Continuăm cu următorul task în caz de eroare
      }
    });

    // Afișăm distribuția finală a taskurilor pentru debugging
    console.log('Distribuția finală a taskurilor:');
    console.log(`MORNING: ${result.MORNING.length}`);
    console.log(`AFTERNOON: ${result.AFTERNOON.length}`);
    console.log(`EVENING: ${result.EVENING.length}`);
    console.log(`COMPLETED: ${result.COMPLETED.length}`);
    console.log(`FUTURE: ${result.FUTURE.length}`);

    return result;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

/**
 * Adaugă un task nou
 */
export const addTask = async (taskData: Omit<Task, 'id'>): Promise<Task> => {
  try {
    const db = getFirebaseFirestore();
    
    // Asigurăm că perioada este setată corect în funcție de dueDate
    if (taskData.dueDate) {
      const correctPeriod = getTimePeriodFromDate(taskData.dueDate);
      
      // Actualizăm perioada doar dacă este diferită de cea existentă
      if (taskData.period !== correctPeriod) {
        console.log(`Corectare perioadă task nou: ${taskData.period} -> ${correctPeriod}`);
        taskData.period = correctPeriod;
      }
    }
    
    const docRef = await addDoc(collection(db, TASKS_COLLECTION), taskData);
    
    // Creăm un nou obiect Task combinând datele validate cu id-ul generat
    const newTask: Task = {
      ...taskData,
      id: docRef.id
    };
    
    return newTask;
  } catch (error) {
    console.error('Error adding task:', error);
    throw error;
  }
};

/**
 * Actualizează un task existent
 */
export const updateTask = async (
  taskId: string,
  updates: TaskUpdateData
): Promise<void> => {
  try {
    const db = getFirebaseFirestore();
    const taskRef = doc(db, TASKS_COLLECTION, taskId);
    
    // Procesăm câmpurile null pentru a le transforma în deleteField()
    const processedUpdates = { ...updates };
    
    // Verificăm dacă titlul este gol și îl înlocuim cu "untitled task"
    if (processedUpdates.title !== undefined && processedUpdates.title.trim() === '') {
      processedUpdates.title = 'untitled task';
    }
    
    // Verificăm dacă completedAt este null sau undefined și îl înlocuim cu deleteField()
    if (processedUpdates.completedAt === null || processedUpdates.completedAt === undefined) {
      processedUpdates.completedAt = deleteField();
    }
    
    // Dacă se actualizează dueDate, actualizăm și perioada în funcție de dată
    if (processedUpdates.dueDate !== undefined && processedUpdates.dueDate !== null) {
      // Determinăm perioada corectă în funcție de dueDate
      const period = getTimePeriodFromDate(processedUpdates.dueDate);
      processedUpdates.period = period;
      
      console.log(`Actualizare task ${taskId} - dueDate: ${processedUpdates.dueDate}, period: ${period}`);
    }
    
    await updateDoc(taskRef, {
      ...processedUpdates,
      updatedAt: Date.now()
    });
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

/**
 * Șterge un task
 */
export const deleteTask = async (taskId: string): Promise<void> => {
  try {
    const db = getFirebaseFirestore();
    const taskRef = doc(db, TASKS_COLLECTION, taskId);
    await deleteDoc(taskRef);
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};
