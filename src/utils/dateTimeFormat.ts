import { TFunction } from 'i18next';
import { DATE_TIME_TRANSLATIONS } from '../i18n/keys';

export interface TimeRange {
  start: string; // Format: "HH:mm"
  end: string;   // Format: "HH:mm"
}

export function formatTimeRange(t: TFunction, range: TimeRange): string {
  return t(DATE_TIME_TRANSLATIONS.TIME.FORMAT.RANGE, {
    start: formatTime(t, range.start),
    end: formatTime(t, range.end)
  });
}

export function formatTime(t: TFunction, time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const is24Hour = true; // TODO: Get this from user preferences

  if (is24Hour) {
    return t(DATE_TIME_TRANSLATIONS.TIME.FORMAT.SHORT, {
      hours: String(hours).padStart(2, '0'),
      minutes: String(minutes).padStart(2, '0')
    });
  }

  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  
  return t(DATE_TIME_TRANSLATIONS.TIME.FORMAT.LONG, {
    hours: String(hours12),
    minutes: String(minutes).padStart(2, '0'),
    period: t(period === 'AM' ? DATE_TIME_TRANSLATIONS.TIME.PERIOD.AM : DATE_TIME_TRANSLATIONS.TIME.PERIOD.PM)
  });
}

export function parseTimeRange(timeFrame: string): TimeRange {
  const [start, end] = timeFrame.split(' - ');
  return { start, end };
}

export function formatISODate(t: TFunction, isoString: string, format: 'short' | 'long' = 'short'): string {
  const date = new Date(isoString);
  const now = new Date();
  
  // Check if it's today, yesterday, or tomorrow
  const isToday = isSameDay(date, now);
  const isYesterday = isSameDay(date, new Date(now.setDate(now.getDate() - 1)));
  const isTomorrow = isSameDay(date, new Date(now.setDate(now.getDate() + 2)));
  
  if (isToday) {
    return t(DATE_TIME_TRANSLATIONS.DATE.FORMAT.RELATIVE.TODAY);
  }
  if (isYesterday) {
    return t(DATE_TIME_TRANSLATIONS.DATE.FORMAT.RELATIVE.YESTERDAY);
  }
  if (isTomorrow) {
    return t(DATE_TIME_TRANSLATIONS.DATE.FORMAT.RELATIVE.TOMORROW);
  }

  // For other dates, use the specified format
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();
  const weekday = date.getDay();

  const monthKeys = [
    'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
    'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'
  ] as const;

  const weekdayKeys = [
    'SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'
  ] as const;

  const monthKey = monthKeys[month];
  const weekdayKey = weekdayKeys[weekday];

  if (format === 'short') {
    return t(DATE_TIME_TRANSLATIONS.DATE.FORMAT.SHORT, {
      day,
      month: t(DATE_TIME_TRANSLATIONS.DATE.MONTH.SHORT[monthKey]),
      year
    });
  }

  return t(DATE_TIME_TRANSLATIONS.DATE.FORMAT.LONG, {
    weekday: t(DATE_TIME_TRANSLATIONS.DATE.WEEKDAY.LONG[weekdayKey]),
    day,
    month: t(DATE_TIME_TRANSLATIONS.DATE.MONTH.LONG[monthKey]),
    year
  });
}

export function formatRelativeTime(t: TFunction, isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    return t(DATE_TIME_TRANSLATIONS.DATE.FORMAT.RELATIVE.TODAY);
  }
  if (diffInDays === 1) {
    return t(DATE_TIME_TRANSLATIONS.DATE.FORMAT.RELATIVE.YESTERDAY);
  }
  if (diffInDays === -1) {
    return t(DATE_TIME_TRANSLATIONS.DATE.FORMAT.RELATIVE.TOMORROW);
  }

  if (diffInDays > 0) {
    return t(DATE_TIME_TRANSLATIONS.DATE.FORMAT.RELATIVE.DAYS.PAST, { count: diffInDays });
  }
  return t(DATE_TIME_TRANSLATIONS.DATE.FORMAT.RELATIVE.DAYS.FUTURE, { count: Math.abs(diffInDays) });
}

/**
 * Formatează un timestamp pentru mesaje de log
 * @param timestamp - Timestamp în milisecunde
 * @returns String formatat pentru log (ex: "2025-02-09 19:03:06")
 */
export function formatLogTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}
