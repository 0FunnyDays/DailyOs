import type { AppSettings, DayData, Expense, Shift } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { generateId } from '../utils/idUtils';

const DEFAULT_SETTINGS: AppSettings = {
  dayResetHour: 4,
  currency: '€',
  monthlyFlatSalary: 0,
  workingDaysPerMonth: 22,
  theme: 'dark',
};

const DEFAULT_SHIFT: Omit<Shift, 'id'> = {
  startTime: '',
  endTime: '',
  payType: 'hourly',
  payAmount: 0,
  tips: 0,
};

const DEFAULT_EXPENSE: Omit<Expense, 'id'> = {
  amount: 0,
  description: '',
};

export function useAppData(userId: string) {
  const [days, setDays] = useLocalStorage<Record<string, DayData>>(
    `todaystracker_days_${userId}`,
    {}
  );
  const [settings, setSettings] = useLocalStorage<AppSettings>(
    `todaystracker_settings_${userId}`,
    DEFAULT_SETTINGS
  );

  function getOrCreateDay(date: string): DayData {
    return days[date] ?? { date, shifts: [], expenses: [] };
  }

  function addShift(date: string) {
    const day = getOrCreateDay(date);
    const newShift: Shift = { id: generateId(), ...DEFAULT_SHIFT };
    setDays({ ...days, [date]: { ...day, shifts: [...day.shifts, newShift] } });
  }

  function updateShift(date: string, shiftId: string, updates: Partial<Shift>) {
    const day = getOrCreateDay(date);
    setDays({
      ...days,
      [date]: {
        ...day,
        shifts: day.shifts.map((s) =>
          s.id === shiftId ? { ...s, ...updates } : s
        ),
      },
    });
  }

  function removeShift(date: string, shiftId: string) {
    const day = getOrCreateDay(date);
    setDays({
      ...days,
      [date]: { ...day, shifts: day.shifts.filter((s) => s.id !== shiftId) },
    });
  }

  function addExpense(date: string) {
    const day = getOrCreateDay(date);
    const newExpense: Expense = { id: generateId(), ...DEFAULT_EXPENSE };
    setDays({
      ...days,
      [date]: { ...day, expenses: [...day.expenses, newExpense] },
    });
  }

  function updateExpense(date: string, expenseId: string, updates: Partial<Expense>) {
    const day = getOrCreateDay(date);
    setDays({
      ...days,
      [date]: {
        ...day,
        expenses: day.expenses.map((e) =>
          e.id === expenseId ? { ...e, ...updates } : e
        ),
      },
    });
  }

  function removeExpense(date: string, expenseId: string) {
    const day = getOrCreateDay(date);
    setDays({
      ...days,
      [date]: {
        ...day,
        expenses: day.expenses.filter((e) => e.id !== expenseId),
      },
    });
  }

  function updateDayNote(date: string, note: string) {
    const day = getOrCreateDay(date);
    setDays({ ...days, [date]: { ...day, note } });
  }

  function updateSettings(updates: Partial<AppSettings>) {
    setSettings({ ...settings, ...updates });
  }

  return {
    days,
    settings,
    getOrCreateDay,
    addShift,
    updateShift,
    removeShift,
    addExpense,
    updateExpense,
    removeExpense,
    updateDayNote,
    updateSettings,
  };
}
