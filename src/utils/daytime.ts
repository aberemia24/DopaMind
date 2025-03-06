import { ACCESSIBILITY } from '../constants/accessibility';

export type DayPeriod = 'morning' | 'afternoon' | 'evening';

export const getDayPeriod = (): DayPeriod => {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    return 'morning';
  } else if (hour >= 12 && hour < 18) {
    return 'afternoon';
  } else {
    return 'evening';
  }
};

export const getDayTimeColors = () => {
  const period = getDayPeriod();
  
  switch (period) {
    case 'morning':
      return ACCESSIBILITY.COLORS.DAYTIME.MORNING;
    case 'afternoon':
      return ACCESSIBILITY.COLORS.DAYTIME.AFTERNOON;
    case 'evening':
      return ACCESSIBILITY.COLORS.DAYTIME.EVENING;
    default:
      return ACCESSIBILITY.COLORS.DAYTIME.MORNING; // Valoare implicită pentru siguranță
  }
};
