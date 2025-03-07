export interface User {
  id: string;
  email: string | null;
  displayName: string | null;
}

import { TimePeriodKey } from '../constants/taskTypes';

export interface Task {
  id: string;
  title: string;
  description?: string;
  timeOfDay?: 'morning' | 'afternoon' | 'evening';
  completed: boolean;
  isPriority: boolean;
  period?: TimePeriodKey;
  userId?: string;
  createdAt: Date | number;
  updatedAt?: number;
  completedAt?: number;
  dueDate?: Date;
  reminderMinutes?: number;
  repeat?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
  };
}
