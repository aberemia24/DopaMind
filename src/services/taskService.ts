import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs } from 'firebase/firestore';
import { getFirebaseFirestore } from '../config/firebase';
import { TimePeriodKey } from '../constants/taskTypes';
import { TaskTagKey } from '../constants/taskTags';

const COLLECTION_NAME = 'tasks';

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  userId: string;
  periodId: TimePeriodKey;
  tags?: TaskTagKey[];
  estimatedTime?: number;
  actualTime?: number;
  createdAt: string;
  updatedAt?: string;
  isPriority?: boolean;
}

type TaskInput = Omit<Task, 'id' | 'userId' | 'periodId' | 'createdAt' | 'updatedAt'>;
type TaskUpdate = Partial<Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>;
type TasksByPeriod = Record<TimePeriodKey, Task[]>;

export const fetchTasks = async (userId: string): Promise<TasksByPeriod> => {
  try {
    const db = getFirebaseFirestore();
    const tasksQuery = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(tasksQuery);
    const tasks: TasksByPeriod = {
      MORNING: [],
      AFTERNOON: [],
      EVENING: []
    };

    querySnapshot.forEach((doc) => {
      const task = { id: doc.id, ...doc.data() } as Task;
      tasks[task.periodId].push(task);
    });

    return tasks;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

export const addTask = async (
  userId: string, 
  periodId: TimePeriodKey, 
  task: TaskInput
): Promise<Task> => {
  try {
    const db = getFirebaseFirestore();
    const taskData = {
      ...task,
      userId,
      periodId,
      createdAt: new Date().toISOString()
    };
    
    const docRef = await addDoc(collection(db, COLLECTION_NAME), taskData);
    return { id: docRef.id, ...taskData } as Task;
  } catch (error) {
    console.error('Error adding task:', error);
    throw error;
  }
};

export const updateTask = async (taskId: string, updates: TaskUpdate): Promise<Task> => {
  try {
    const db = getFirebaseFirestore();
    const taskRef = doc(db, COLLECTION_NAME, taskId);
    const updateData = {
      ...updates,
      updatedAt: new Date().toISOString()
    };
    await updateDoc(taskRef, updateData);
    return { id: taskId, ...updates } as Task;
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

export const deleteTask = async (taskId: string): Promise<string> => {
  try {
    const db = getFirebaseFirestore();
    await deleteDoc(doc(db, COLLECTION_NAME, taskId));
    return taskId;
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};
