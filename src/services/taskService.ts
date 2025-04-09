import { getDocs, query, collection, where, addDoc, updateDoc, deleteDoc, doc, FieldValue, deleteField, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
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
        console.log(`validateTaskData: dueDate este deja un obiect Date: ${convertedDate.toISOString()}`);
      } else if (typeof dueDate === 'string') {
        convertedDate = new Date(dueDate);
        console.log(`validateTaskData: dueDate convertit din string: ${dueDate} -> ${convertedDate.toISOString()}`);
      } else if (typeof dueDate === 'object' && dueDate !== null && 'seconds' in dueDate && 'nanoseconds' in dueDate) {
        // Timestamp Firestore
        const timestamp = dueDate as { seconds: number; nanoseconds: number };
        convertedDate = new Date(timestamp.seconds * 1000);
        console.log(`validateTaskData: dueDate convertit din Firestore timestamp: ${timestamp.seconds} -> ${convertedDate.toISOString()}`);
      } else if (typeof dueDate === 'number') {
        convertedDate = new Date(dueDate);
        console.log(`validateTaskData: dueDate convertit din număr: ${dueDate} -> ${convertedDate.toISOString()}`);
      } else {
        console.error(`validateTaskData: Format de dată invalid:`, dueDate);
        throw new Error('Invalid date format');
      }
      
      // Verificăm dacă data convertită este validă
      if (isNaN(convertedDate.getTime())) {
        console.error(`validateTaskData: Data convertită nu este validă:`, convertedDate);
        throw new Error('Invalid date value');
      }
      
      console.log(`validateTaskData: dueDate convertit cu succes:`, dueDate, `->`, convertedDate.toISOString(), 
                  `Este validă: ${!isNaN(convertedDate.getTime())}`);
      
      // Adăugăm data convertită la obiectul task
      convertedData.dueDate = convertedDate;
      
      // Verificăm și actualizăm perioada în funcție de data scadentă
      const correctPeriod = getTimePeriodFromDate(convertedDate);
      if (convertedData.period !== correctPeriod) {
        console.log(`validateTaskData: Actualizez perioada din ${convertedData.period} în ${correctPeriod} bazat pe dueDate`);
        convertedData.period = correctPeriod;
      }
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
 * @param task Task-ul care trebuie verificat
 * @returns true dacă task-ul are o dată scadentă în viitor, false în caz contrar
 */
const isFutureTask = (task: Task): boolean => {
  if (!task.dueDate) return false;
  
  try {
    // Folosim aceeași logică ca în getTimePeriodFromDate
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Asigurăm-ne că avem un obiect Date valid
    const taskDateObj = task.dueDate instanceof Date ? task.dueDate : new Date(task.dueDate);
    const taskDate = new Date(taskDateObj.getFullYear(), taskDateObj.getMonth(), taskDateObj.getDate());
    
    // Logging pentru debugging
    console.log(`isFutureTask: Task ${task.id} - ${task.title}`);
    console.log(`isFutureTask: Comparing dates - Task date: ${taskDate.toISOString()}, Today: ${today.toISOString()}`);
    console.log(`isFutureTask: Task timestamp: ${taskDate.getTime()}, Today timestamp: ${today.getTime()}`);
    
    // Comparăm datele folosind timestamp-uri
    const isFuture = taskDate.getTime() > today.getTime();
    console.log(`isFutureTask: Is future: ${isFuture}`);
    
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
    querySnapshot.forEach((docSnapshot) => {
      try {
        const validatedData = validateTaskData(docSnapshot.data());
        const task: Task = {
          ...validatedData,
          id: docSnapshot.id
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
        
        // Verificăm dacă perioada este deja setată corect
        const correctPeriod = getTimePeriodFromDate(task.dueDate);
        console.log(`Task ${task.id} - perioada curentă: ${task.period}, perioada corectă: ${correctPeriod}`);
        
        // Dacă perioada nu este corectă, o actualizăm în baza de date
        if (task.period !== correctPeriod) {
          console.log(`Corectez perioada pentru task ${task.id} din ${task.period} în ${correctPeriod}`);
          // Actualizăm task-ul local
          task.period = correctPeriod;
          
          // Actualizăm și în baza de date (fără a aștepta completarea actualizării)
          const taskRef = doc(db, TASKS_COLLECTION, task.id);
          updateDoc(taskRef, { period: correctPeriod })
            .then(() => console.log(`Perioada actualizată cu succes pentru task ${task.id}`))
            .catch(err => console.error(`Eroare la actualizarea perioadei pentru task ${task.id}:`, err));
        }
        
        // Adăugăm task-ul în categoria corespunzătoare bazată pe perioada corectă
        if (correctPeriod === 'FUTURE') {
          console.log(`Task ${task.id} adăugat în FUTURE`);
          result.FUTURE.push(task);
        } else {
          console.log(`Task ${task.id} adăugat în ${correctPeriod}`);
          result[correctPeriod].push(task);
        }
      } catch (error) {
        console.error(`Error processing task ${docSnapshot.id}:`, error);
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
    
    // Validăm și procesăm datele task-ului
    const validatedData = { ...taskData };
    
    // Dacă task-ul are o dată scadentă, ne asigurăm că perioada este setată corect
    if (validatedData.dueDate) {
      console.log(`addTask: Task cu dueDate: ${validatedData.dueDate instanceof Date ? 
        validatedData.dueDate.toISOString() : 'Format necunoscut'}`);
      
      // Ne asigurăm că dueDate este un obiect Date valid
      let dateObj: Date;
      if (validatedData.dueDate instanceof Date) {
        dateObj = validatedData.dueDate;
      } else if (typeof validatedData.dueDate === 'string') {
        dateObj = new Date(validatedData.dueDate);
      } else if (typeof validatedData.dueDate === 'number') {
        dateObj = new Date(validatedData.dueDate);
      } else if (typeof validatedData.dueDate === 'object' && validatedData.dueDate !== null && 
                 'seconds' in validatedData.dueDate && 'nanoseconds' in validatedData.dueDate) {
        // Timestamp Firestore
        const timestamp = validatedData.dueDate as unknown as { seconds: number; nanoseconds: number };
        dateObj = new Date(timestamp.seconds * 1000);
      } else {
        console.error('addTask: Format de dată invalid:', validatedData.dueDate);
        throw new Error('Invalid date format');
      }
      
      // Verificăm dacă data este validă
      if (isNaN(dateObj.getTime())) {
        console.error('addTask: Data convertită nu este validă:', dateObj);
        throw new Error('Invalid date value');
      }
      
      // Actualizăm dueDate cu obiectul Date valid
      validatedData.dueDate = dateObj;
      console.log(`addTask: dueDate după conversie: ${dateObj.toISOString()}`);
      
      // Determinăm perioada corectă în funcție de dueDate
      const correctPeriod = getTimePeriodFromDate(dateObj);
      console.log(`addTask: Perioada determinată: ${correctPeriod}, perioada actuală: ${validatedData.period}`);
      
      // Actualizăm perioada dacă este necesar
      if (validatedData.period !== correctPeriod) {
        console.log(`addTask: Actualizez perioada din ${validatedData.period} în ${correctPeriod}`);
        validatedData.period = correctPeriod;
      }
    }
    
    const docRef = await addDoc(collection(db, TASKS_COLLECTION), validatedData);
    
    // Creăm un nou obiect Task combinând datele validate cu id-ul generat
    const newTask: Task = {
      ...validatedData,
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
      // Log dueDate înainte de conversie
      console.log(`updateTask: dueDate înainte de procesare:`, processedUpdates.dueDate);
      
      // Ne asigurăm că dueDate este un obiect Date valid
      let dateObj: Date;
      if (processedUpdates.dueDate instanceof Date) {
        dateObj = processedUpdates.dueDate;
      } else if (typeof processedUpdates.dueDate === 'string') {
        dateObj = new Date(processedUpdates.dueDate);
      } else if (typeof processedUpdates.dueDate === 'number') {
        dateObj = new Date(processedUpdates.dueDate);
      } else if (typeof processedUpdates.dueDate === 'object' && processedUpdates.dueDate !== null && 
                 'seconds' in processedUpdates.dueDate && 'nanoseconds' in processedUpdates.dueDate) {
        // Timestamp Firestore
        const timestamp = processedUpdates.dueDate as unknown as { seconds: number; nanoseconds: number };
        dateObj = new Date(timestamp.seconds * 1000);
      } else {
        console.error('updateTask: Format de dată invalid:', processedUpdates.dueDate);
        throw new Error('Invalid date format');
      }
      
      // Verificăm dacă data este validă
      if (isNaN(dateObj.getTime())) {
        console.error('updateTask: Data convertită nu este validă:', dateObj);
        throw new Error('Invalid date value');
      }
      
      // Actualizăm dueDate cu obiectul Date valid
      processedUpdates.dueDate = dateObj;
      console.log(`updateTask: dueDate după conversie:`, dateObj.toISOString());
      
      // Determinăm perioada corectă în funcție de dueDate
      const period = getTimePeriodFromDate(dateObj);
      console.log(`updateTask: perioada determinată: ${period}`);
      
      processedUpdates.period = period;
      console.log(`updateTask: Actualizare task ${taskId} - dueDate: ${dateObj.toISOString()}, period: ${period}`);
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
