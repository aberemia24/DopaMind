import { MaterialIcons } from '@expo/vector-icons';
import { DATE_TIME_TRANSLATIONS } from '../i18n/keys';
import { Task } from '../types/task';

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

export type TimePeriodKey = 'MORNING' | 'AFTERNOON' | 'EVENING' | 'COMPLETED' | 'FUTURE';

export const TIME_PERIODS: Record<TimePeriodKey, TimePeriod> = {
  MORNING: {
    id: 'MORNING',
    label: DATE_TIME_TRANSLATIONS.TIME.RANGES.MORNING,
    icon: 'wb-twilight',
    timeFrame: '06:00 - 12:00',
    description: DATE_TIME_TRANSLATIONS.TIME.RANGES.MORNING,
    titleKey: 'taskManagement.periods.morning.title'
  },
  AFTERNOON: {
    id: 'AFTERNOON',
    label: DATE_TIME_TRANSLATIONS.TIME.RANGES.AFTERNOON,
    icon: 'wb-sunny',
    timeFrame: '12:00 - 18:00',
    description: DATE_TIME_TRANSLATIONS.TIME.RANGES.AFTERNOON,
    titleKey: 'taskManagement.periods.afternoon.title'
  },
  EVENING: {
    id: 'EVENING',
    label: DATE_TIME_TRANSLATIONS.TIME.RANGES.EVENING,
    icon: 'nights-stay',
    timeFrame: '18:00 - 23:00',
    description: DATE_TIME_TRANSLATIONS.TIME.RANGES.EVENING,
    titleKey: 'taskManagement.periods.evening.title'
  },
  COMPLETED: {
    id: 'COMPLETED',
    label: 'Completed',
    icon: 'check-circle',
    timeFrame: '',
    description: 'Completed tasks',
    titleKey: 'taskManagement.periods.completed.title'
  },
  FUTURE: {
    id: 'FUTURE',
    label: 'Future Tasks',
    icon: 'event',
    timeFrame: '',
    description: 'Tasks scheduled for future dates',
    titleKey: 'taskManagement.periods.future.title'
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

export interface TasksByPeriod {
  MORNING: Task[];
  AFTERNOON: Task[];
  EVENING: Task[];
  COMPLETED: Task[];
  FUTURE: Task[];
}
