import { APP_TRANSLATIONS } from '../i18n/keys';

export const APP_NAME_KEY = APP_TRANSLATIONS.NAME;

export const TIME_OF_DAY = {
  MORNING: 'morning',
  AFTERNOON: 'afternoon',
  EVENING: 'evening',
} as const;

export const SCREEN_NAMES = {
  HOME: 'Home',
  TASKS: 'Tasks',
  SETTINGS: 'Settings',
} as const;
