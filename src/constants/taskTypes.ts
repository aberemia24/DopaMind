import { useTranslation } from 'react-i18next';

export interface TimePeriod {
  id: string;
  label: string;
  icon: string;
  timeFrame: string;
  description: string;
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

export const getTimePeriods = (t: ReturnType<typeof useTranslation>['t']) => ({
  MORNING: {
    id: 'morning',
    label: t('timePeriods.morning.label'),
    icon: '🌅',
    timeFrame: t('timePeriods.morning.timeFrame'),
    description: t('timePeriods.morning.description')
  },
  AFTERNOON: {
    id: 'afternoon',
    label: t('timePeriods.afternoon.label'),
    icon: '☀️',
    timeFrame: t('timePeriods.afternoon.timeFrame'),
    description: t('timePeriods.afternoon.description')
  },
  EVENING: {
    id: 'evening',
    label: t('timePeriods.evening.label'),
    icon: '🌙',
    timeFrame: t('timePeriods.evening.timeFrame'),
    description: t('timePeriods.evening.description')
  }
});

export type TimePeriodKey = 'MORNING' | 'AFTERNOON' | 'EVENING';

export const TASK_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed'
} as const;

export type TaskStatus = typeof TASK_STATUS[keyof typeof TASK_STATUS];

export const TASK_PRIORITY = {
  LOW: {
    id: 'low',
    label: 'Scăzută',
    color: '#10B981' // Green
  },
  MEDIUM: {
    id: 'medium',
    label: 'Medie',
    color: '#F59E0B' // Yellow
  },
  HIGH: {
    id: 'high',
    label: 'Ridicată',
    color: '#EF4444' // Red
  }
} as const;

export type TaskPriorityKey = keyof typeof TASK_PRIORITY;

export const TIME_ESTIMATES = {
  QUICK: {
    id: 'quick',
    label: '< 30 min',
    icon: '⚡'
  },
  MEDIUM: {
    id: 'medium',
    label: '30-60 min',
    icon: '⏱️'
  },
  LONG: {
    id: 'long',
    label: '> 60 min',
    icon: '🕒'
  }
} as const;

export type TimeEstimateKey = keyof typeof TIME_ESTIMATES;
