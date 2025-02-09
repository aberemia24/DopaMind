import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Task, TasksByPeriod } from './taskService';
import { TimePeriodKey } from '../constants/taskTypes';

const TASKS_CACHE_KEY = '@tasks_cache';
const CACHE_EXPIRY_KEY = '@tasks_cache_expiry';
const CACHE_DURATION = 1000 * 60 * 30; // 30 minute cache duration

interface CacheData {
  tasks: TasksByPeriod;
  timestamp: number;
}

export const taskCacheService = {
  async setTasks(tasks: TasksByPeriod): Promise<void> {
    try {
      const cacheData: CacheData = {
        tasks,
        timestamp: Date.now()
      };
      await AsyncStorage.setItem(TASKS_CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error caching tasks:', error);
    }
  },

  async getTasks(): Promise<TasksByPeriod | null> {
    try {
      const cacheJson = await AsyncStorage.getItem(TASKS_CACHE_KEY);
      if (!cacheJson) return null;

      const cache: CacheData = JSON.parse(cacheJson);
      const isExpired = Date.now() - cache.timestamp > CACHE_DURATION;
      
      if (isExpired) {
        await this.clearCache();
        return null;
      }

      return cache.tasks;
    } catch (error) {
      console.error('Error reading tasks cache:', error);
      return null;
    }
  },

  async updateTaskInCache(
    periodId: TimePeriodKey,
    taskId: string,
    updates: Partial<Task>
  ): Promise<void> {
    try {
      const tasks = await this.getTasks();
      if (!tasks) return;

      const updatedTasks = {
        ...tasks,
        [periodId]: tasks[periodId].map((task: Task) =>
          task.id === taskId ? { ...task, ...updates } : task
        )
      };

      await this.setTasks(updatedTasks);
    } catch (error) {
      console.error('Error updating task in cache:', error);
    }
  },

  async addTaskToCache(periodId: TimePeriodKey, task: Task): Promise<void> {
    try {
      const tasks = await this.getTasks();
      if (!tasks) return;

      const updatedTasks = {
        ...tasks,
        [periodId]: [...tasks[periodId], task]
      };

      await this.setTasks(updatedTasks);
    } catch (error) {
      console.error('Error adding task to cache:', error);
    }
  },

  async deleteTaskFromCache(
    periodId: TimePeriodKey,
    taskId: string
  ): Promise<void> {
    try {
      const tasks = await this.getTasks();
      if (!tasks) return;

      const updatedTasks = {
        ...tasks,
        [periodId]: tasks[periodId].filter((task: Task) => task.id !== taskId)
      };

      await this.setTasks(updatedTasks);
    } catch (error) {
      console.error('Error deleting task from cache:', error);
    }
  },

  async clearCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem(TASKS_CACHE_KEY);
    } catch (error) {
      console.error('Error clearing tasks cache:', error);
    }
  }
};
