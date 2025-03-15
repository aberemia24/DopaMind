import { TimePeriodKey } from '../constants/taskTypes';

/**
 * Determină perioada zilei în funcție de ora specificată
 * 
 * @param date Data pentru care se determină perioada
 * @returns Cheia perioadei corespunzătoare (MORNING, AFTERNOON, EVENING, FUTURE)
 */
export const getTimePeriodFromDate = (date: Date | string | undefined): TimePeriodKey => {
  if (!date) return 'MORNING'; // Valoare implicită
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Verificăm mai întâi dacă data este în viitor (altă zi)
    const today = new Date();
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const checkDate = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
    
    console.log(`getTimePeriodFromDate: Data verificată: ${dateObj.toISOString()}`);
    console.log(`getTimePeriodFromDate: Data curentă: ${today.toISOString()}`);
    console.log(`getTimePeriodFromDate: Data verificată (doar data): ${checkDate.toISOString()}`);
    console.log(`getTimePeriodFromDate: Data curentă (doar data): ${todayDate.toISOString()}`);
    console.log(`getTimePeriodFromDate: Timestamp verificat: ${checkDate.getTime()}, Timestamp curent: ${todayDate.getTime()}`);
    console.log(`getTimePeriodFromDate: Este în viitor: ${checkDate.getTime() > todayDate.getTime()}`);
    
    if (checkDate.getTime() > todayDate.getTime()) {
      console.log(`getTimePeriodFromDate: Returnez FUTURE pentru data ${dateObj.toISOString()}`);
      return 'FUTURE';
    }
    
    // Dacă nu este în viitor, determinăm perioada în funcție de ora din zi
    const hours = dateObj.getHours();
    
    console.log(`getTimePeriodFromDate: Ora din zi: ${hours}`);
    
    if (hours >= 5 && hours < 12) {
      console.log(`getTimePeriodFromDate: Returnez MORNING pentru data ${dateObj.toISOString()}`);
      return 'MORNING';
    } else if (hours >= 12 && hours < 18) {
      console.log(`getTimePeriodFromDate: Returnez AFTERNOON pentru data ${dateObj.toISOString()}`);
      return 'AFTERNOON';
    } else {
      console.log(`getTimePeriodFromDate: Returnez EVENING pentru data ${dateObj.toISOString()}`);
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
