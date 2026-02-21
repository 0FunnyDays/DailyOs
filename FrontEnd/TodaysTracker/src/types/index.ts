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
  note?: string; // free text daily note
};

export type AppSettings = {
  dayResetHour: number;       // 0–23, default 4
  currency: string;           // default '€'
  monthlyFlatSalary: number;  // monthly salary for flat-type shifts, default 0
  workingDaysPerMonth: number; // used to calculate daily flat pay, default 22
  theme: 'dark' | 'light';   // default 'dark'
};

export type DayTotals = {
  grossPay: number;
  totalTips: number;
  totalExpenses: number;
  netEarnings: number;
};

export type User = {
  id: string;
  username: string;
  passwordHash: string; // SHA-256 hex
  avatar: string | null; // base64 data URL
  createdAt: string;
};

export type Session = {
  userId: string;
  username: string;
};

export type Page = 'home' | 'today' | 'dashboard' | 'settings' | 'settings-work' | 'settings-gym' | 'profile' | 'gym';

// ── Gym types ──────────────────────────────────────────────────────────────

export type ProgramType = 'push-pull-legs' | 'bro-split' | 'full-body' | 'cardio' | 'custom';

export type ExerciseTemplate = {
  id: string;
  name: string;
  type: 'strength' | 'cardio';
};

export type GymDayTemplate = {
  id: string;
  name: string;
  exercises: ExerciseTemplate[];
};

export type GymProgram = {
  programType: ProgramType;
  daysPerWeek: number;
  days: GymDayTemplate[];
};

export type SetEntry = {
  id: string;
  reps: number;
  weight: number; // kg
};

export type ExerciseLog = {
  id: string;
  templateId: string;
  name: string;
  type: 'strength' | 'cardio';
  sets: SetEntry[];
  distanceKm?: number; // for cardio (future)
};

export type GymSession = {
  date: string;
  dayTemplateId: string;
  dayName: string;
  exercises: ExerciseLog[];
  note?: string;
};

export type StorageSchema = {
  days: Record<string, DayData>;
  settings: AppSettings;
};
