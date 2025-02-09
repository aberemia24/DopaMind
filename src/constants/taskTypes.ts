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

export const TIME_PERIODS = {
  MORNING: {
    id: 'morning',
    label: 'morning',
    icon: '🌅',
    timeFrame: '06:00 - 12:00',
    description: 'morning'
  },
  AFTERNOON: {
    id: 'afternoon',
    label: 'afternoon',
    icon: '☀️',
    timeFrame: '12:00 - 18:00',
    description: 'afternoon'
  },
  EVENING: {
    id: 'evening',
    label: 'evening',
    icon: '🌙',
    timeFrame: '18:00 - 23:00',
    description: 'evening'
  }
} as const;

export type TimePeriodKey = keyof typeof TIME_PERIODS;

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
