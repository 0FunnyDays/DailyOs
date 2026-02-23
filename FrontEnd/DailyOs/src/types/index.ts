export type PayType = 'flat' | 'hourly';

export type Job = {
  id: string;
  name: string;
  payType: PayType;
  rate: number; // hourly: €/hr, flat: €/month
  daysPerWeek?: number; // hourly jobs only (average working days per week)
  daysPerMonth?: number; // flat jobs only (working days per month)
};

export type Shift = {
  id: string;
  startTime: string; // "HH:MM" 24h format
  endTime: string;   // "HH:MM" — may be earlier than startTime (crosses midnight)
  payType: PayType;
  payAmount: number; // for hourly: hourly rate. for flat: daily rate (from job) or 0 (use global)
  tips: number;
  jobId?: string;    // links to Job.id
  jobName?: string;  // snapshot of job name at time of shift
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
  focusTask?: string;
  topPriorities?: string[]; // up to 3 short priorities
  mustDo?: string;
  sleepHours?: number;
  sleepQuality?: 1 | 2 | 3 | 4 | 5;
  energyLevel?: 1 | 2 | 3 | 4 | 5;
  recoveryNote?: string;
  mood?: 'bad' | 'meh' | 'good' | 'great';
  winOfDay?: string;
  reflectionLine?: string;
  closedAt?: string; // ISO timestamp when day was explicitly closed
};

export type Project = {
  id: string;
  name: string;
  isFinished: boolean;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  finishedAt?: string; // ISO timestamp
  dailyNotes?: Record<string, string>; // keyed by YYYY-MM-DD
};

export type TravelTrip = {
  id: string;
  name: string;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  estimatedExpenses?: number; // local estimate (without ticket if user wants separate)
  actualExpenses?: number; // actual spending after return
  ticketPrice?: number; // ticket / transport booking price
  plansNote?: string; // what to do there
  remindersNote?: string; // things to remember
  isFinished: boolean;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  finishedAt?: string; // ISO timestamp
};

export type AppSettings = {
  dayResetHour: number;       // supports minutes as decimal hours (e.g. 4.5 = 04:30)
  currency: string;           // default '€'
  monthlyFlatSalary: number;  // legacy: monthly salary for flat-type shifts without a job
  workingDaysPerMonth: number; // used to calculate daily flat pay, default 22
  jobs: Job[];                // configured jobs
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

export type Page =
  | 'home'
  | 'about'
  | 'privacy'
  | 'contact'
  | 'priorities'
  | 'today'
  | 'dashboard'
  | 'projects'
  | 'travel'
  | 'sleep'
  | 'settings'
  | 'settings-work'
  | 'settings-gym'
  | 'profile'
  | 'gym';

// ── Gym types ──────────────────────────────────────────────────────────────

export type ProgramType = 'push-pull-legs' | 'bro-split' | 'full-body' | 'cardio' | 'calisthenics' | 'custom';

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
  projects?: Project[];
  travelTrips?: TravelTrip[];
};


