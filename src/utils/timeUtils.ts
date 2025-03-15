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

/**
 * Verifică dacă o dată este în viitor (mâine sau mai târziu)
 * 
 * @param date Data care trebuie verificată
 * @returns true dacă data este în viitor, false în caz contrar
 */
export const isDateInFuture = (date: Date | string | undefined): boolean => {
  if (!date) return false;
  
  try {
    // Convertim data la un obiect Date
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Obținem data curentă și resetăm ora la 00:00:00
    const today = new Date();
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    // Resetăm ora pentru data de verificat la 00:00:00 pentru a compara doar datele
    const checkDate = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
    
    // Comparăm datele folosind timestamp-uri
    return checkDate.getTime() > todayDate.getTime();
  } catch (error) {
    console.error('Error checking if date is in future:', error);
    return false;
  }
};
