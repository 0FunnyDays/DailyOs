import { useState, useEffect } from 'react';
import type { AppSettings } from '../types';
import { getCurrentDate } from '../utils/dateUtils';

export function useCurrentDay(settings: AppSettings): string {
  const [currentDate, setCurrentDate] = useState(() =>
    getCurrentDate(settings.dayResetHour)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(getCurrentDate(settings.dayResetHour));
    }, 60_000);
    return () => clearInterval(interval);
  }, [settings.dayResetHour]);

  // Also recompute immediately when resetHour changes
  useEffect(() => {
    setCurrentDate(getCurrentDate(settings.dayResetHour));
  }, [settings.dayResetHour]);

  return currentDate;
}
