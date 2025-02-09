import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Task } from '../services/taskService';
import { fetchTasks, addTask as addTaskToDb, updateTask as updateTaskInDb, deleteTask as deleteTaskFromDb } from '../services/taskService';
import { taskCacheService } from '../services/taskCacheService';
import type { TimePeriodKey } from '../constants/taskTypes';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';

interface TasksByPeriod {
  MORNING: Task[];
  AFTERNOON: Task[];
  EVENING: Task[];
}

interface TaskContextType {
  tasks: TasksByPeriod;
  loading: boolean;
  error: string | null;
  addTask: (periodId: TimePeriodKey, task: Task) => Promise<void>;
  updateTask: (periodId: TimePeriodKey, taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (periodId: TimePeriodKey, taskId: string) => Promise<void>;
  toggleTask: (periodId: TimePeriodKey, taskId: string) => Promise<void>;
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
  const { t } = useTranslation();
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

  // Încarcă task-urile la montarea componentei și când se schimbă user-ul
  useEffect(() => {
    refreshTasks();
  }, [refreshTasks]);

  const addTask = useCallback(async (periodId: TimePeriodKey, task: Task) => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      // Salvează în DB
      const addedTask = await addTaskToDb(user.uid, periodId, task);
      
      // Actualizează state-ul local
      setTasks(prev => ({
        ...prev,
        [periodId]: [...prev[periodId], addedTask]
      }));

      // Actualizează cache-ul
      await taskCacheService.addTaskToCache(periodId, addedTask);
    } catch (err) {
      console.error('Error adding task:', err);
      setError(t('taskManagement.errors.addTask'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.uid, t]);

  const updateTask = useCallback(async (
    periodId: TimePeriodKey,
    taskId: string,
    updates: Partial<Task>
  ) => {
    try {
      setLoading(true);
      // Actualizează în DB
      const updatedTask = await updateTaskInDb(taskId, updates);
      
      // Actualizează state-ul local
      setTasks(prev => ({
        ...prev,
        [periodId]: prev[periodId].map(task =>
          task.id === taskId ? { ...task, ...updatedTask } : task
        )
      }));

      // Actualizează cache-ul
      await taskCacheService.updateTaskInCache(periodId, taskId, updatedTask);
    } catch (err) {
      console.error('Error updating task:', err);
      setError(t('taskManagement.errors.updateTask'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [t]);

  const deleteTask = useCallback(async (periodId: TimePeriodKey, taskId: string) => {
    try {
      setLoading(true);
      // Șterge din DB
      await deleteTaskFromDb(taskId);
      
      // Actualizează state-ul local
      setTasks(prev => ({
        ...prev,
        [periodId]: prev[periodId].filter(task => task.id !== taskId)
      }));

      // Actualizează cache-ul
      await taskCacheService.deleteTaskFromCache(periodId, taskId);
    } catch (err) {
      console.error('Error deleting task:', err);
      setError(t('taskManagement.errors.deleteTask'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [t]);

  const toggleTask = useCallback(async (periodId: TimePeriodKey, taskId: string) => {
    try {
      setLoading(true);
      const currentTask = tasks[periodId].find(task => task.id === taskId);
      if (!currentTask) throw new Error('Task not found');

      const updates = { completed: !currentTask.completed };
      await updateTask(periodId, taskId, updates);
    } catch (err) {
      console.error('Error toggling task:', err);
      setError(t('taskManagement.errors.toggleTask'));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [tasks, updateTask, t]);

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        error,
        addTask,
        updateTask,
        deleteTask,
        toggleTask,
        refreshTasks
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};
