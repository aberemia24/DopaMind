import { getDocs, query, collection, where, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { getFirebaseFirestore } from '../config/firebase';
import type { TimePeriodKey } from '../constants/taskTypes';

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
}

export interface TasksByPeriod {
  MORNING: Task[];
  AFTERNOON: Task[];
  EVENING: Task[];
}

interface TaskData extends Omit<Task, 'id'> {
  // Toate câmpurile din Task exceptând id, care este adăugat de Firestore
}

const TASKS_COLLECTION = 'tasks';

/**
 * Validează datele unui task primite de la Firestore
 * @throws Error dacă datele nu sunt valide
 */
const validateTaskData = (data: unknown): TaskData => {
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
    updatedAt
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

  if (!['MORNING', 'AFTERNOON', 'EVENING'].includes(period as string)) {
    throw new Error('Invalid task data: invalid period');
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

  return {
    title,
    description,
    completed,
    isPriority,
    period: period as TimePeriodKey,
    userId,
    createdAt,
    updatedAt
  };
};

/**
 * Preia task-urile unui utilizator grupate pe perioade
 */
export const fetchTasks = async (userId: string): Promise<TasksByPeriod> => {
  try {
    const db = getFirebaseFirestore();
    const tasksQuery = query(
      collection(db, TASKS_COLLECTION),
      where('userId', '==', userId)
    );

    const querySnapshot = await getDocs(tasksQuery);
    const result: TasksByPeriod = {
      MORNING: [],
      AFTERNOON: [],
      EVENING: []
    };

    querySnapshot.forEach((doc) => {
      try {
        const validatedData = validateTaskData(doc.data());
        const task: Task = {
          id: doc.id,
          ...validatedData
        };
        result[task.period].push(task);
      } catch (error) {
        console.error(`Error processing task ${doc.id}:`, error);
        // Continuăm cu următorul task în caz de eroare
      }
    });

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
    const docRef = await addDoc(collection(db, TASKS_COLLECTION), taskData);
    return {
      id: docRef.id,
      ...taskData
    };
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
  updates: Partial<Omit<Task, 'id'>>
): Promise<void> => {
  try {
    const db = getFirebaseFirestore();
    const taskRef = doc(db, TASKS_COLLECTION, taskId);
    await updateDoc(taskRef, {
      ...updates,
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
