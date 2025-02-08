import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs } from 'firebase/firestore';
import { getFirebaseFirestore } from '../config/firebase';

const COLLECTION_NAME = 'tasks';

export const fetchTasks = async (userId) => {
  try {
    const db = getFirebaseFirestore();
    const tasksQuery = query(
      collection(db, COLLECTION_NAME),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(tasksQuery);
    const tasks = {
      morning: [],
      afternoon: [],
      evening: []
    };

    querySnapshot.forEach((doc) => {
      const task = { id: doc.id, ...doc.data() };
      tasks[task.periodId].push(task);
    });

    return tasks;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

export const addTask = async (userId, periodId, task) => {
  try {
    const db = getFirebaseFirestore();
    const taskData = {
      ...task,
      userId,
      periodId,
      createdAt: new Date().toISOString()
    };
    
    const docRef = await addDoc(collection(db, COLLECTION_NAME), taskData);
    return { id: docRef.id, ...taskData };
  } catch (error) {
    console.error('Error adding task:', error);
    throw error;
  }
};

export const updateTask = async (taskId, updates) => {
  try {
    const db = getFirebaseFirestore();
    const taskRef = doc(db, COLLECTION_NAME, taskId);
    await updateDoc(taskRef, {
      ...updates,
      updatedAt: new Date().toISOString()
    });
    return { id: taskId, ...updates };
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

export const deleteTask = async (taskId) => {
  try {
    const db = getFirebaseFirestore();
    await deleteDoc(doc(db, COLLECTION_NAME, taskId));
    return taskId;
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};
