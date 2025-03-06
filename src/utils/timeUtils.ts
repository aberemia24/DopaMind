import { TimePeriodKey } from '../constants/taskTypes';

/**
 * Determină perioada zilei în funcție de ora specificată
 * 
 * @param date Data pentru care se determină perioada
 * @returns Cheia perioadei corespunzătoare (MORNING, AFTERNOON, EVENING)
 */
export const getTimePeriodFromDate = (date: Date | string | undefined): TimePeriodKey => {
  if (!date) return 'MORNING'; // Valoare implicită
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const hours = dateObj.getHours();
    
    // Determinăm perioada în funcție de ora din zi
    if (hours >= 5 && hours < 12) {
      return 'MORNING';
    } else if (hours >= 12 && hours < 18) {
      return 'AFTERNOON';
    } else {
      return 'EVENING';
    }
  } catch (error) {
    console.error('Error determining time period:', error);
    return 'MORNING'; // Valoare implicită în caz de eroare
  }
};
