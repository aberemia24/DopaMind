import { TimePeriodKey } from '../constants/taskTypes';

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate?: string;
  completed: boolean;
  completedAt?: number;
  period: TimePeriodKey;
  userId: string;
  priority?: string;
  timeEstimate?: string;
}
