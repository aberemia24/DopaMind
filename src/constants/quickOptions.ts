import { MaterialIcons } from '@expo/vector-icons';
import { DATE_TIME_TRANSLATIONS, TASK_MANAGEMENT_TRANSLATIONS } from '../i18n/keys';

// Constante pentru ID-uri
export const REMINDER_IDS = {
  FIVE_MIN: 'reminder_5min',
  FIFTEEN_MIN: 'reminder_15min',
  THIRTY_MIN: 'reminder_30min',
  ONE_HOUR: 'reminder_1hour'
} as const;

export const REPEAT_IDS = {
  DAILY: 'repeat_daily',
  WEEKLY: 'repeat_weekly',
  MONTHLY: 'repeat_monthly'
} as const;

export interface QuickDateOption {
  id: QuickDateOptionKey;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  titleKey: string;
  // Funcție care va returna data corespunzătoare opțiunii
  getDate: () => Date;
}

export type QuickDateOptionKey = 
  | 'TODAY' 
  | 'TOMORROW' 
  | 'TONIGHT' 
  | 'WEEKEND' 
  | 'NEXT_WEEK';

export const QUICK_DATE_OPTIONS: Record<QuickDateOptionKey, QuickDateOption> = {
  TODAY: {
    id: 'TODAY',
    label: 'today',
    icon: 'today',
    titleKey: 'taskManagement.quickOptions.date.today',
    getDate: () => new Date()
  },
  TOMORROW: {
    id: 'TOMORROW',
    label: 'tomorrow',
    icon: 'event',
    titleKey: 'taskManagement.quickOptions.date.tomorrow',
    getDate: () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    }
  },
  TONIGHT: {
    id: 'TONIGHT',
    label: 'tonight',
    icon: 'nights-stay',
    titleKey: 'taskManagement.quickOptions.date.tonight',
    getDate: () => {
      const tonight = new Date();
      tonight.setHours(20, 0, 0, 0);
      return tonight;
    }
  },
  WEEKEND: {
    id: 'WEEKEND',
    label: 'weekend',
    icon: 'weekend',
    titleKey: 'taskManagement.quickOptions.date.weekend',
    getDate: () => {
      const today = new Date();
      const daysUntilWeekend = 6 - today.getDay(); // 6 = Sâmbătă
      const weekend = new Date();
      weekend.setDate(today.getDate() + daysUntilWeekend);
      return weekend;
    }
  },
  NEXT_WEEK: {
    id: 'NEXT_WEEK',
    label: 'next_week',
    icon: 'event-note',
    titleKey: 'taskManagement.quickOptions.date.nextWeek',
    getDate: () => {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      return nextWeek;
    }
  }
} as const;

export type QuickTimeOption = {
  id: string;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  titleKey: string;
  timeKey: string;
};

export const QUICK_TIME_OPTIONS: QuickTimeOption[] = [
  {
    id: 'morning',
    label: 'morning',
    icon: 'wb-sunny',
    titleKey: 'taskManagement.quickOptions.time.morning',
    timeKey: DATE_TIME_TRANSLATIONS.TIME.DEFAULT.MORNING
  },
  {
    id: 'afternoon',
    label: 'afternoon',
    icon: 'wb-sunny',
    titleKey: 'taskManagement.quickOptions.time.afternoon',
    timeKey: DATE_TIME_TRANSLATIONS.TIME.DEFAULT.AFTERNOON
  },
  {
    id: 'evening',
    label: 'evening',
    icon: 'nights-stay',
    titleKey: 'taskManagement.quickOptions.time.evening',
    timeKey: DATE_TIME_TRANSLATIONS.TIME.DEFAULT.EVENING
  }
];

export interface QuickReminderOption {
  id: string;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  titleKey: string;
  minutes: number;
}

export const QUICK_REMINDER_OPTIONS: QuickReminderOption[] = [
  {
    id: REMINDER_IDS.FIVE_MIN,
    label: TASK_MANAGEMENT_TRANSLATIONS.QUICK_OPTIONS.REMINDER.FIVE_MIN,
    icon: 'alarm',
    titleKey: TASK_MANAGEMENT_TRANSLATIONS.QUICK_OPTIONS.REMINDER.FIVE_MIN,
    minutes: 5
  },
  {
    id: REMINDER_IDS.FIFTEEN_MIN,
    label: TASK_MANAGEMENT_TRANSLATIONS.QUICK_OPTIONS.REMINDER.FIFTEEN_MIN,
    icon: 'alarm',
    titleKey: TASK_MANAGEMENT_TRANSLATIONS.QUICK_OPTIONS.REMINDER.FIFTEEN_MIN,
    minutes: 15
  },
  {
    id: REMINDER_IDS.THIRTY_MIN,
    label: TASK_MANAGEMENT_TRANSLATIONS.QUICK_OPTIONS.REMINDER.THIRTY_MIN,
    icon: 'alarm',
    titleKey: TASK_MANAGEMENT_TRANSLATIONS.QUICK_OPTIONS.REMINDER.THIRTY_MIN,
    minutes: 30
  },
  {
    id: REMINDER_IDS.ONE_HOUR,
    label: TASK_MANAGEMENT_TRANSLATIONS.QUICK_OPTIONS.REMINDER.ONE_HOUR,
    icon: 'alarm',
    titleKey: TASK_MANAGEMENT_TRANSLATIONS.QUICK_OPTIONS.REMINDER.ONE_HOUR,
    minutes: 60
  }
];

export interface QuickRepeatOption {
  id: string;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  titleKey: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  interval: number;
}

export const QUICK_REPEAT_OPTIONS: QuickRepeatOption[] = [
  {
    id: REPEAT_IDS.DAILY,
    label: TASK_MANAGEMENT_TRANSLATIONS.QUICK_OPTIONS.REPEAT.DAILY,
    icon: 'repeat',
    titleKey: TASK_MANAGEMENT_TRANSLATIONS.QUICK_OPTIONS.REPEAT.DAILY,
    frequency: 'daily',
    interval: 1
  },
  {
    id: REPEAT_IDS.WEEKLY,
    label: TASK_MANAGEMENT_TRANSLATIONS.QUICK_OPTIONS.REPEAT.WEEKLY,
    icon: 'repeat',
    titleKey: TASK_MANAGEMENT_TRANSLATIONS.QUICK_OPTIONS.REPEAT.WEEKLY,
    frequency: 'weekly',
    interval: 1
  },
  {
    id: REPEAT_IDS.MONTHLY,
    label: TASK_MANAGEMENT_TRANSLATIONS.QUICK_OPTIONS.REPEAT.MONTHLY,
    icon: 'repeat',
    titleKey: TASK_MANAGEMENT_TRANSLATIONS.QUICK_OPTIONS.REPEAT.MONTHLY,
    frequency: 'monthly',
    interval: 1
  }
];
