import type { AppSettings, DayData, Expense, Project, Shift, TravelTrip } from '../types';
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
    `todaystracker_days_${userId}`,
    {}
  );
  const [projects, setProjects] = useLocalStorage<Project[]>(
    `todaystracker_projects_${userId}`,
    []
  );
  const [travelTrips, setTravelTrips] = useLocalStorage<TravelTrip[]>(
    `todaystracker_travel_${userId}`,
    []
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
    updateSettings,
  };
}
