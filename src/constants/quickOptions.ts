import { MaterialIcons } from '@expo/vector-icons';

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
    icon: 'event_note',
    titleKey: 'taskManagement.quickOptions.date.nextWeek',
    getDate: () => {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      return nextWeek;
    }
  }
} as const;

export interface QuickTimeOption {
  id: string;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  titleKey: string;
  time: string; // Format: "HH:mm"
}

export const QUICK_TIME_OPTIONS: QuickTimeOption[] = [
  {
    id: 'morning',
    label: 'morning',
    icon: 'wb-sunny',
    titleKey: 'taskManagement.quickOptions.time.morning',
    time: '09:00'
  },
  {
    id: 'afternoon',
    label: 'afternoon',
    icon: 'wb-sunny',
    titleKey: 'taskManagement.quickOptions.time.afternoon',
    time: '14:00'
  },
  {
    id: 'evening',
    label: 'evening',
    icon: 'nights-stay',
    titleKey: 'taskManagement.quickOptions.time.evening',
    time: '20:00'
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
    id: '5min',
    label: '5 minutes before',
    icon: 'notifications',
    titleKey: 'taskManagement.quickOptions.reminder.fiveMin',
    minutes: 5
  },
  {
    id: '15min',
    label: '15 minutes before',
    icon: 'notifications',
    titleKey: 'taskManagement.quickOptions.reminder.fifteenMin',
    minutes: 15
  },
  {
    id: '30min',
    label: '30 minutes before',
    icon: 'notifications',
    titleKey: 'taskManagement.quickOptions.reminder.thirtyMin',
    minutes: 30
  },
  {
    id: '1hour',
    label: '1 hour before',
    icon: 'notifications',
    titleKey: 'taskManagement.quickOptions.reminder.oneHour',
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
    id: 'daily',
    label: 'Every day',
    icon: 'repeat',
    titleKey: 'taskManagement.quickOptions.repeat.daily',
    frequency: 'daily',
    interval: 1
  },
  {
    id: 'weekly',
    label: 'Every week',
    icon: 'repeat',
    titleKey: 'taskManagement.quickOptions.repeat.weekly',
    frequency: 'weekly',
    interval: 1
  },
  {
    id: 'monthly',
    label: 'Every month',
    icon: 'repeat',
    titleKey: 'taskManagement.quickOptions.repeat.monthly',
    frequency: 'monthly',
    interval: 1
  }
];
