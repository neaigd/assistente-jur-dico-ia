
import { AiSuggestedTask } from '../types';

export const generateGoogleCalendarLink = (task: AiSuggestedTask): string => {
  const text = encodeURIComponent(task.descricao);
  let datesParam = '';

  if (task.prazoSugerido) {
    // Assuming prazoSugerido is YYYY-MM-DD
    // Google Calendar needs YYYYMMDDTHHMMSSZ/YYYYMMDDTHHMMSSZ for specific times
    // or YYYYMMDD/YYYYMMDD for all-day events.
    // We'll make it an all-day event for simplicity for the deadline day.
    const datePart = task.prazoSugerido.replace(/-/g, '');
    
    // Create a date object from prazoSugerido to correctly format it
    const deadlineDate = new Date(task.prazoSugerido + 'T00:00:00'); // Treat as local time start of day
    
    // For an all-day event, Google Calendar expects the end date to be the day *after* the event if it's a single day event.
    // So, if prazoSugerido is YYYY-MM-DD, the event is for that day.
    // The 'dates' parameter for a single all-day event is YYYYMMDD/YYYYMMDD (start/end where end is exclusive for multi-day, or same for single day).
    // Let's use a single day.
    const nextDay = new Date(deadlineDate);
    nextDay.setDate(deadlineDate.getDate() + 1);
    
    const startDateString = `${deadlineDate.getFullYear()}${(deadlineDate.getMonth() + 1).toString().padStart(2, '0')}${deadlineDate.getDate().toString().padStart(2, '0')}`;
    const endDateString = `${nextDay.getFullYear()}${(nextDay.getMonth() + 1).toString().padStart(2, '0')}${nextDay.getDate().toString().padStart(2, '0')}`;

    datesParam = `&dates=${startDateString}/${endDateString}`;
  }

  const details = encodeURIComponent(
    `Prioridade: ${task.prioridade}\nTarefa sugerida pelo Assistente Jurídico IA.`
  );

  return `https://www.google.com/calendar/render?action=TEMPLATE&text=${text}${datesParam}&details=${details}`;
};
    