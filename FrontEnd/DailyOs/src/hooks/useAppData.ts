import type { AppSettings, DayData, Expense, Job, PayType, Project, Shift, TravelTrip } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { generateId } from '../utils/idUtils';

const AVG_WEEKS_PER_MONTH = 52 / 12;

const DEFAULT_SETTINGS: AppSettings = {
  dayResetHour: 0,
  currency: '€',
  monthlyFlatSalary: 0,
  workingDaysPerMonth: 22,
  jobs: [],
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

type DayMetaUpdates = Partial<
  Pick<
    DayData,
    | 'focusTask'
    | 'topPriorities'
    | 'mustDo'
    | 'sleepHours'
    | 'sleepQuality'
    | 'energyLevel'
    | 'recoveryNote'
    | 'mood'
    | 'winOfDay'
    | 'reflectionLine'
    | 'closedAt'
  >
>;

export function useAppData(userId: string) {
  const [days, setDays] = useLocalStorage<Record<string, DayData>>(
    `dailyos_days_${userId}`,
    {}
  );
  const [projects, setProjects] = useLocalStorage<Project[]>(
    `dailyos_projects_${userId}`,
    []
  );
  const [travelTrips, setTravelTrips] = useLocalStorage<TravelTrip[]>(
    `dailyos_travel_${userId}`,
    []
  );
  const [settings, setSettings] = useLocalStorage<AppSettings>(
    `dailyos_settings_${userId}`,
    DEFAULT_SETTINGS
  );

  function getOrCreateDay(date: string): DayData {
    return days[date] ?? { date, shifts: [], expenses: [] };
  }

  function addShift(date: string, jobId?: string) {
    const day = getOrCreateDay(date);
    const job = jobId ? (settings.jobs ?? []).find((j) => j.id === jobId) : undefined;

    let shiftData: Omit<Shift, 'id'>;
    if (job) {
      const legacyFlatDaysFromWeek =
        job.daysPerWeek && job.daysPerWeek > 0
          ? job.daysPerWeek * AVG_WEEKS_PER_MONTH
          : 0;
      const flatMonthlyDays =
        job.payType === 'flat'
          ? (job.daysPerMonth && job.daysPerMonth > 0
              ? job.daysPerMonth
              : legacyFlatDaysFromWeek > 0
                ? legacyFlatDaysFromWeek
                : settings.workingDaysPerMonth)
          : 0;
      const dailyPay =
        job.payType === 'flat' && flatMonthlyDays > 0
          ? job.rate / flatMonthlyDays
          : 0;
      shiftData = {
        startTime: '',
        endTime: '',
        payType: job.payType,
        payAmount: job.payType === 'hourly' ? job.rate : dailyPay,
        tips: 0,
        jobId: job.id,
        jobName: job.name,
      };
    } else {
      shiftData = { ...DEFAULT_SHIFT };
    }

    const newShift: Shift = { id: generateId(), ...shiftData };
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

  function updateDayMeta(date: string, updates: DayMetaUpdates) {
    const day = getOrCreateDay(date);
    setDays({ ...days, [date]: { ...day, ...updates } });
  }

  function addProject(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;

    const now = new Date().toISOString();
    const newProject: Project = {
      id: generateId(),
      name: trimmed,
      isFinished: false,
      createdAt: now,
      updatedAt: now,
      dailyNotes: {},
    };

    setProjects([newProject, ...projects]);
  }

  function updateProject(projectId: string, updates: Partial<Pick<Project, 'name'>>) {
    const now = new Date().toISOString();
    setProjects(
      projects.map((project) => {
        if (project.id !== projectId) return project;

        const nextName = updates.name !== undefined ? updates.name.trim() : project.name;
        return {
          ...project,
          ...(updates.name !== undefined ? { name: nextName || project.name } : null),
          updatedAt: now,
        };
      })
    );
  }

  function setProjectDailyNote(projectId: string, date: string, note: string) {
    const now = new Date().toISOString();
    setProjects(
      projects.map((project) => {
        if (project.id !== projectId) return project;

        const currentNotes = project.dailyNotes ?? {};
        const nextNotes = { ...currentNotes };
        if (note.trim()) {
          nextNotes[date] = note;
        } else {
          delete nextNotes[date];
        }

        return {
          ...project,
          dailyNotes: nextNotes,
          updatedAt: now,
        };
      })
    );
  }

  function setProjectFinished(projectId: string, isFinished: boolean) {
    const now = new Date().toISOString();
    setProjects(
      projects.map((project) =>
        project.id !== projectId
          ? project
          : {
              ...project,
              isFinished,
              finishedAt: isFinished ? now : undefined,
              updatedAt: now,
            }
      )
    );
  }

  function addTravelTrip(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;

    const now = new Date().toISOString();
    const newTrip: TravelTrip = {
      id: generateId(),
      name: trimmed,
      isFinished: false,
      createdAt: now,
      updatedAt: now,
    };

    setTravelTrips([newTrip, ...travelTrips]);
  }

  function updateTravelTrip(
    tripId: string,
    updates: Partial<
      Pick<
        TravelTrip,
        | 'name'
        | 'startDate'
        | 'endDate'
        | 'estimatedExpenses'
        | 'actualExpenses'
        | 'ticketPrice'
        | 'plansNote'
        | 'remindersNote'
      >
    >
  ) {
    const now = new Date().toISOString();

    setTravelTrips(
      travelTrips.map((trip) => {
        if (trip.id !== tripId) return trip;

        const nextName =
          updates.name !== undefined ? updates.name.trim() || trip.name : trip.name;

        return {
          ...trip,
          ...updates,
          ...(updates.name !== undefined ? { name: nextName } : null),
          updatedAt: now,
        };
      })
    );
  }

  function setTravelTripFinished(tripId: string, isFinished: boolean) {
    const now = new Date().toISOString();
    setTravelTrips(
      travelTrips.map((trip) =>
        trip.id !== tripId
          ? trip
          : {
              ...trip,
              isFinished,
              finishedAt: isFinished ? now : undefined,
              updatedAt: now,
            }
      )
    );
  }

  function addJob(name: string, payType: PayType, rate: number, cadenceValue?: number) {
    const trimmed = name.trim();
    if (!trimmed) return;
    const newJob: Job = {
      id: generateId(),
      name: trimmed,
      payType,
      rate,
      ...(payType === 'flat'
        ? { daysPerMonth: Math.min(31, Math.max(1, cadenceValue ?? settings.workingDaysPerMonth ?? 22)) }
        : { daysPerWeek: Math.min(7, Math.max(1, cadenceValue ?? 5)) }),
    };
    setSettings({ ...settings, jobs: [...(settings.jobs ?? []), newJob] });
  }

  function updateJob(jobId: string, updates: Partial<Pick<Job, 'name' | 'payType' | 'rate' | 'daysPerWeek' | 'daysPerMonth'>>) {
    setSettings({
      ...settings,
      jobs: (settings.jobs ?? []).map((j) =>
        j.id !== jobId
          ? j
          : (() => {
              const next: Job = { ...j, ...updates };
              if (next.payType === 'hourly') {
                next.daysPerWeek = Math.min(7, Math.max(1, next.daysPerWeek ?? 5));
                next.daysPerMonth = undefined;
              } else {
                next.daysPerMonth = Math.min(
                  31,
                  Math.max(
                    1,
                    next.daysPerMonth ??
                      (j.daysPerWeek && j.daysPerWeek > 0
                        ? Math.round(j.daysPerWeek * AVG_WEEKS_PER_MONTH)
                        : settings.workingDaysPerMonth || 22)
                  )
                );
                next.daysPerWeek = undefined;
              }
              return next;
            })()
      ),
    });
  }

  function removeJob(jobId: string) {
    setSettings({
      ...settings,
      jobs: (settings.jobs ?? []).filter((j) => j.id !== jobId),
    });
  }

  function updateSettings(updates: Partial<AppSettings>) {
    setSettings({ ...settings, ...updates });
  }

  return {
    days,
    projects,
    travelTrips,
    settings,
    getOrCreateDay,
    addShift,
    updateShift,
    removeShift,
    addExpense,
    updateExpense,
    removeExpense,
    updateDayNote,
    updateDayMeta,
    addProject,
    updateProject,
    setProjectDailyNote,
    setProjectFinished,
    addTravelTrip,
    updateTravelTrip,
    setTravelTripFinished,
    addJob,
    updateJob,
    removeJob,
    updateSettings,
  };
}
