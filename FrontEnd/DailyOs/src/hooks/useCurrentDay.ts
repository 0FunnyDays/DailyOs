import { useState, useEffect } from 'react';
import type { AppSettings } from '../types';
import { getCurrentDate } from '../utils/dateUtils';

export function useCurrentDay(settings: AppSettings): string {
  const [, setMinuteTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMinuteTick((tick) => tick + 1);
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  return getCurrentDate(settings.dayResetHour);
}
