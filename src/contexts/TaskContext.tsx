import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Task, TasksByPeriod } from '../services/taskService';
import { fetchTasks, addTask as addTaskToDb, updateTask as updateTaskInDb, deleteTask as deleteTaskFromDb } from '../services/taskService';
import { taskCacheService } from '../services/taskCacheService';
import type { TimePeriodKey } from '../constants/taskTypes';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { useAuth } from './auth';

interface TaskContextType {
  tasks: TasksByPeriod;
  loading: boolean;
  error: string | null;
  addTask: (task: Omit<Task, 'id' | 'userId'>) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Omit<Task, 'id' | 'userId'>>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  toggleTask: (taskId: string) => Promise<void>;
  refreshTasks: () => Promise<void>;
}

const TaskContext = createContext<TaskContextType | null>(null);

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within a TaskProvider');
  }
  return context;
};

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { t }: { t: TFunction } = useTranslation();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TasksByPeriod>({
    MORNING: [],
    AFTERNOON: [],
    EVENING: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshTasks = useCallback(async () => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      // Încearcă să încarce din cache
      const cachedTasks = await taskCacheService.getTasks();
      if (cachedTasks) {
        setTasks(cachedTasks);
        setLoading(false);
        return;
      }

      // Dacă nu există în cache, încarcă de la server
      const fetchedTasks = await fetchTasks(user.uid);
      setTasks(fetchedTasks);
      
      // Salvează în cache
      await taskCacheService.setTasks(fetchedTasks);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(t('taskManagement.errors.fetchTasks'));
    } finally {
      setLoading(false);
    }
  }, [user?.uid, t]);

  useEffect(() => {
    refreshTasks();
  }, [refreshTasks]);

  const addTask = useCallback<TaskContextType['addTask']>(async (taskData: Omit<Task, 'id' | 'userId'>) => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      const fullTaskData = {
        ...taskData,
        userId: user.uid,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      // Salvează în DB
      const addedTask = await addTaskToDb(fullTaskData);
      
      // Actualizează state-ul local
      setTasks(prev => ({
        ...prev,
        [addedTask.period]: [...prev[addedTask.period], addedTask]
      }));

      // Actualizează cache-ul
      await taskCacheService.addTaskToCache(addedTask.period, addedTask);
    } catch (err) {
      console.error('Error adding task:', err);
      setError(t('taskManagement.errors.addTask'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.uid, t]);

  const updateTask = useCallback<TaskContextType['updateTask']>(async (taskId: string, updates: Partial<Omit<Task, 'id' | 'userId'>>) => {
    try {
      setLoading(true);
      // Actualizează în DB
      await updateTaskInDb(taskId, updates);
      
      // Găsește task-ul curent pentru a determina perioada
      let currentPeriod: TimePeriodKey | null = null;
      let updatedTask: Task | null = null;

      for (const [period, taskList] of Object.entries(tasks)) {
        const task = taskList.find((t: Task) => t.id === taskId);
        if (task) {
          currentPeriod = period as TimePeriodKey;
          updatedTask = { ...task, ...updates };
          break;
        }
      }

      if (!currentPeriod || !updatedTask) {
        throw new Error('Task not found');
      }

      // Actualizează state-ul local
      setTasks(prev => ({
        ...prev,
        [currentPeriod!]: prev[currentPeriod!].map(task =>
          task.id === taskId ? updatedTask! : task
        )
      }));

      // Actualizează cache-ul
      await taskCacheService.updateTaskInCache(currentPeriod, taskId, updatedTask);
    } catch (err) {
      console.error('Error updating task:', err);
      setError(t('taskManagement.errors.updateTask'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [tasks, t]);

  const deleteTask = useCallback<TaskContextType['deleteTask']>(async (taskId: string) => {
    try {
      setLoading(true);
      // Găsește perioada task-ului
      let taskPeriod: TimePeriodKey | null = null;
      for (const [period, taskList] of Object.entries(tasks)) {
        if (taskList.some((t: Task) => t.id === taskId)) {
          taskPeriod = period as TimePeriodKey;
          break;
        }
      }

      if (!taskPeriod) {
        throw new Error('Task not found');
      }

      // Șterge din DB
      await deleteTaskFromDb(taskId);
      
      // Actualizează state-ul local
      setTasks(prev => ({
        ...prev,
        [taskPeriod!]: prev[taskPeriod!].filter(task => task.id !== taskId)
      }));

      // Actualizează cache-ul
      await taskCacheService.deleteTaskFromCache(taskPeriod, taskId);
    } catch (err) {
      console.error('Error deleting task:', err);
      setError(t('taskManagement.errors.deleteTask'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [tasks, t]);

  const toggleTask = useCallback<TaskContextType['toggleTask']>(async (taskId: string) => {
    // Găsește task-ul curent
    let currentTask: Task | null = null;
    for (const taskList of Object.values(tasks)) {
      currentTask = taskList.find((t: Task) => t.id === taskId) ?? null;
      if (currentTask) break;
    }

    if (!currentTask) {
      throw new Error('Task not found');
    }

    // Actualizează completarea task-ului
    await updateTask(taskId, {
      completed: !currentTask.completed,
      updatedAt: Date.now()
    });
  }, [tasks, updateTask]);

  const value = {
    tasks,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    refreshTasks
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};

export default TaskProvider;
