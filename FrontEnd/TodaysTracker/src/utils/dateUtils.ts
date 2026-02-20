/**
 * Returns the current logical date as YYYY-MM-DD.
 * If the current hour is less than resetHour, we are still in "yesterday".
 * E.g. resetHour=4, time=02:30 → returns yesterday's date.
 */
export function getCurrentDate(resetHour: number): string {
  const now = new Date();
  if (now.getHours() < resetHour) {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    return toDateString(yesterday);
  }
  return toDateString(now);
}

function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Calculates the number of hours between two "HH:MM" time strings.
 * Handles midnight crossover: if endTime <= startTime (in minutes), adds 24h.
 */
export function calculateHours(startTime: string, endTime: string): number {
  const startMinutes = parseMinutes(startTime);
  const endMinutes = parseMinutes(endTime);
  let diff = endMinutes - startMinutes;
  if (diff <= 0) {
    diff += 24 * 60; // midnight crossover
  }
  return diff / 60;
}

function parseMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Formats a YYYY-MM-DD string into a human-readable date.
 * E.g. "2026-02-20" → "Friday, 20 February 2026"
 */
export function formatDateDisplay(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  // Use UTC to avoid timezone-shifting the date
  const date = new Date(Date.UTC(y, m - 1, d));
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}
