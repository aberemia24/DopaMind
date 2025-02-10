interface TaskTag {
  id: string;
  label: string;
  color: string;
  icon: string;
}

import { TASK_MANAGEMENT_TRANSLATIONS } from '../i18n/keys';

export const TASK_TAGS = {
  QUICK_WIN: {
    id: 'quick_win',
    label: TASK_MANAGEMENT_TRANSLATIONS.TAGS.QUICK_WIN,
    color: '#4CAF50',
    icon: 'flash-on'
  },
  IMPORTANT: {
    id: 'important',
    label: TASK_MANAGEMENT_TRANSLATIONS.TAGS.IMPORTANT,
    color: '#F44336',
    icon: 'priority-high'
  },
  URGENT: {
    id: 'urgent',
    label: TASK_MANAGEMENT_TRANSLATIONS.TAGS.URGENT,
    color: '#FF9800',
    icon: 'alarm'
  },
  LATER: {
    id: 'later',
    label: TASK_MANAGEMENT_TRANSLATIONS.TAGS.LATER,
    color: '#9E9E9E',
    icon: 'schedule'
  }
} as const;

export type TaskTagKey = keyof typeof TASK_TAGS;
