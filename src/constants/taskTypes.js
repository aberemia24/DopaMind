export const TIME_PERIODS = {
  MORNING: {
    id: 'morning',
    label: 'Dimineață',
    icon: '🌅',
    timeFrame: '06:00 - 12:00',
    description: 'Perioada optimă pentru taskuri care necesită concentrare'
  },
  AFTERNOON: {
    id: 'afternoon',
    label: 'După-amiază',
    icon: '☀️',
    timeFrame: '12:00 - 18:00',
    description: 'Perioada bună pentru taskuri creative și colaborative'
  },
  EVENING: {
    id: 'evening',
    label: 'Seară',
    icon: '🌙',
    timeFrame: '18:00 - 23:00',
    description: 'Perioada potrivită pentru taskuri ușoare și relaxante'
  }
};

export const TASK_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed'
};

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
};

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
};
