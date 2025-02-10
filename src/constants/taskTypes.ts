import { MaterialIcons } from '@expo/vector-icons';

export interface TimePeriod {
  id: TimePeriodKey;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  timeFrame: string;
  description: string;
  titleKey: string;
}

interface TaskPriority {
  id: string;
  label: string;
  color: string;
}

interface TimeEstimate {
  id: string;
  label: string;
  icon: string;
}

export type TimePeriodKey = 'MORNING' | 'AFTERNOON' | 'EVENING';

export const TIME_PERIODS: Record<TimePeriodKey, TimePeriod> = {
  MORNING: {
    id: 'MORNING',
    label: 'morning',
    icon: 'wb-sunny',
    timeFrame: '06:00 - 12:00',
    description: 'morning',
    titleKey: 'taskManagement.periods.morning.title'
  },
  AFTERNOON: {
    id: 'AFTERNOON',
    label: 'afternoon',
    icon: 'wb-sunny',
    timeFrame: '12:00 - 18:00',
    description: 'afternoon',
    titleKey: 'taskManagement.periods.afternoon.title'
  },
  EVENING: {
    id: 'EVENING',
    label: 'evening',
    icon: 'nights-stay',
    timeFrame: '18:00 - 23:00',
    description: 'evening',
    titleKey: 'taskManagement.periods.evening.title'
  }
} as const;

export const TASK_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed'
} as const;

export type TaskStatus = typeof TASK_STATUS[keyof typeof TASK_STATUS];

export const TASK_PRIORITY = {
  LOW: {
    id: 'low',
    label: 'low',
    color: '#4CAF50'
  },
  MEDIUM: {
    id: 'medium',
    label: 'medium',
    color: '#FFC107'
  },
  HIGH: {
    id: 'high',
    label: 'high',
    color: '#F44336'
  }
} as const;

export type TaskPriorityKey = keyof typeof TASK_PRIORITY;

export const TIME_ESTIMATES = {
  QUICK: {
    id: 'quick',
    label: 'quick',
    icon: '⚡'
  },
  MEDIUM: {
    id: 'medium',
    label: 'medium',
    icon: '⏱️'
  },
  LONG: {
    id: 'long',
    label: 'long',
    icon: '🕰️'
  }
} as const;

export type TimeEstimateKey = keyof typeof TIME_ESTIMATES;
