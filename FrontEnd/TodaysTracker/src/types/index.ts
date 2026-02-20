export type PayType = 'flat' | 'hourly';

export type Shift = {
  id: string;
  startTime: string; // "HH:MM" 24h format
  endTime: string;   // "HH:MM" — may be earlier than startTime (crosses midnight)
  payType: PayType;
  payAmount: number; // for hourly: hourly rate. for flat: ignored (calculated from settings)
  tips: number;
};

export type Expense = {
  id: string;
  amount: number;
  description: string;
};

export type DayData = {
  date: string; // YYYY-MM-DD
  shifts: Shift[];
  expenses: Expense[];
};

export type AppSettings = {
  dayResetHour: number;       // 0–23, default 4
  currency: string;           // default '€'
  monthlyFlatSalary: number;  // monthly salary for flat-type shifts, default 0
  workingDaysPerMonth: number; // used to calculate daily flat pay, default 22
};

export type DayTotals = {
  grossPay: number;
  totalTips: number;
  totalExpenses: number;
  netEarnings: number;
};

export type StorageSchema = {
  days: Record<string, DayData>;
  settings: AppSettings;
};
