import { useEffect, useRef, useState, type ChangeEvent } from "react";
import type {
  AppSettings,
  DayData,
  GymProgram,
  GymSession,
  Page,
} from "../types";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { calculateHours } from "../utils/dateUtils";
import { calculateDayTotals } from "../utils/payUtils";

type DayMetaUpdates = Partial<
  Pick<
    DayData,
    | "focusTask"
    | "topPriorities"
    | "mustDo"
    | "sleepHours"
    | "sleepQuality"
    | "energyLevel"
    | "recoveryNote"
    | "mood"
    | "winOfDay"
    | "reflectionLine"
    | "closedAt"
  >
>;

type HomePageProps = {
  userId: string;
  currentDay: DayData;
  hasAnyWorkEntries: boolean;
  onboardingModalDismissed: boolean;
  settings: AppSettings;
  gymProgram: GymProgram | null;
  gymSessions: Record<string, GymSession>;
  onNavigate: (page: Page) => void;
  onStartOnboardingSetup?: (
    screen: "work" | "gym",
    options?: { returnToModalScreen?: "work" | "gym" },
  ) => void;
  onboardingModalInitialScreen?: "work" | "gym" | null;
  onConsumeOnboardingModalInitialScreen?: () => void;
  onUpdateSettings: (updates: Partial<AppSettings>) => void;
  onDismissOnboardingModal: () => void;
  onUpdateDayMeta: (updates: DayMetaUpdates) => void;
};

type MoodOption = {
  value: NonNullable<DayData["mood"]>;
  emoji: string;
  label: string;
};

type OnboardingModalState = "active" | "dismissed" | "completed";
type OnboardingModalScreen = "work" | "gym";

const MOOD_OPTIONS: MoodOption[] = [
  { value: "bad", emoji: "😕", label: "Low" },
  { value: "meh", emoji: "🙂", label: "Okay" },
  { value: "good", emoji: "😄", label: "Good" },
  { value: "great", emoji: "🚀", label: "Great" },
];

function toDateKeyLocal(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDays(dateKey: string, delta: number): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + delta);
  return toDateKeyLocal(date);
}

function formatHours(hours: number): string {
  if (!Number.isFinite(hours) || hours <= 0) return "0h";
  const rounded = Math.round(hours * 10) / 10;
  return Number.isInteger(rounded) ? `${rounded}h` : `${rounded.toFixed(1)}h`;
}

function formatMoney(currency: string, amount: number, signed = false): string {
  const abs = Math.abs(amount);
  const base = `${currency}${abs.toFixed(2)}`;
  if (!signed) return base;
  const sign = amount > 0 ? "+" : amount < 0 ? "-" : "";
  return `${sign}${base}`;
}

function formatSleepHoursOption(hours: number): string {
  return Number.isInteger(hours) ? `${hours}h` : `${hours.toFixed(1)}h`;
}

function formatResetTimeInput(resetHour: number): string {
  const safe = Number.isFinite(resetHour) ? resetHour : 0;
  const totalMinutes = Math.min(23 * 60 + 59, Math.max(0, Math.round(safe * 60)));
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function parseResetTimeInput(value: string): number | null {
  const match = /^(\d{2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return (h * 60 + m) / 60;
}

function sanitizeResetTimeDraft(value: string): string {
  const filtered = value.replace(/[^\d:]/g, "");
  let result = "";
  let hasColon = false;

  for (const char of filtered) {
    if (/\d/.test(char)) {
      result += char;
      continue;
    }
    if (char === ":" && !hasColon) {
      result += char;
      hasColon = true;
    }
  }

  if (hasColon) {
    const [hours = "", minutes = ""] = result.split(":");
    return `${hours.slice(0, 2)}:${minutes.slice(0, 2)}`;
  }

  const digitsOnly = result.slice(0, 4);
  if (digitsOnly.length > 2) {
    return `${digitsOnly.slice(0, 2)}:${digitsOnly.slice(2)}`;
  }
  return digitsOnly;
}

function OnboardingTime24Input({
  id,
  value,
  onCommit,
  className,
  ariaLabel,
}: {
  id: string;
  value: number;
  onCommit: (next: number) => void;
  className: string;
  ariaLabel: string;
}) {
  const [raw, setRaw] = useState(formatResetTimeInput(value));
  const isFocusedRef = useRef(false);

  useEffect(() => {
    if (isFocusedRef.current) return;
    setRaw(formatResetTimeInput(value));
  }, [value]);

  function commit(nextRaw: string) {
    const parsed = parseResetTimeInput(nextRaw);
    if (parsed === null) {
      setRaw(formatResetTimeInput(value));
      return;
    }
    onCommit(parsed);
    setRaw(formatResetTimeInput(parsed));
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const nextRaw = sanitizeResetTimeDraft(e.target.value);
    setRaw(nextRaw);

    if (nextRaw.length < 5) return;
    const parsed = parseResetTimeInput(nextRaw);
    if (parsed !== null) {
      onCommit(parsed);
    }
  }

  return (
    <input
      id={id}
      type="text"
      inputMode="numeric"
      placeholder="00:00"
      value={raw}
      onFocus={(e) => {
        isFocusedRef.current = true;
        e.currentTarget.select();
      }}
      onChange={handleChange}
      onBlur={(e) => {
        isFocusedRef.current = false;
        commit(e.target.value);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          commit(raw);
          e.currentTarget.blur();
        }
      }}
      className={className}
      aria-label={ariaLabel}
    />
  );
}

function getSleepQualityLabel(level: DayData["sleepQuality"]): string {
  switch (level) {
    case 1: return "Poor";
    case 2: return "Low";
    case 3: return "Okay";
    case 4: return "Good";
    case 5: return "Great";
    default: return "Not set";
  }
}

function getEnergyLabel(level: DayData["energyLevel"]): string {
  switch (level) {
    case 1: return "Drained";
    case 2: return "Low";
    case 3: return "Stable";
    case 4: return "Good";
    case 5: return "High";
    default: return "Not set";
  }
}

function computeGymStreak(gymSessions: Record<string, GymSession>, currentDate: string): number {
  const keys = Object.keys(gymSessions).filter((k) => k <= currentDate).sort();
  const latest = keys.at(-1);
  if (!latest) return 0;

  const set = new Set(keys);
  let streak = 0;
  let cursor = latest;
  while (set.has(cursor)) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

function computeGymLast7(gymSessions: Record<string, GymSession>, currentDate: string): number {
  let count = 0;
  for (let i = 0; i < 7; i += 1) {
    if (gymSessions[addDays(currentDate, -i)]) count += 1;
  }
  return count;
}

function hasText(value: string | undefined | null): boolean {
  return Boolean(value && value.trim());
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatDisplayDate(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function HomePage({
  userId,
  currentDay,
  hasAnyWorkEntries,
  onboardingModalDismissed,
  settings,
  gymProgram,
  gymSessions,
  onNavigate,
  onStartOnboardingSetup,
  onboardingModalInitialScreen,
  onConsumeOnboardingModalInitialScreen,
  onUpdateSettings,
  onDismissOnboardingModal,
}: HomePageProps) {
  const flatDailyPay = settings.monthlyFlatSalary / (settings.workingDaysPerMonth || 22);
  const totals = calculateDayTotals(currentDay, flatDailyPay);
  const currentGymSession = gymSessions[currentDay.date];

  const workHours = currentDay.shifts.reduce((sum, shift) => {
    if (!shift.startTime || !shift.endTime) return sum;
    return sum + calculateHours(shift.startTime, shift.endTime);
  }, 0);
  const workTargetHours = 8;
  const workProgress = Math.min(1, workHours / workTargetHours);

  const mood = MOOD_OPTIONS.find((m) => m.value === currentDay.mood) ?? null;
  const focusTask = currentDay.focusTask ?? "";
  const mustDo = currentDay.mustDo ?? "";
  const recoveryNote = currentDay.recoveryNote ?? "";
  const sleepHoursDisplay =
    typeof currentDay.sleepHours === "number"
      ? formatSleepHoursOption(currentDay.sleepHours)
      : "Not set";
  const sleepQualityDisplay = getSleepQualityLabel(currentDay.sleepQuality);
  const energyDisplay = getEnergyLabel(currentDay.energyLevel);
  const priorityInputs = Array.from(
    { length: 3 },
    (_, index) => currentDay.topPriorities?.[index] ?? "",
  );
  const filledPriorities = priorityInputs
    .map((value, index) => ({ value, index }))
    .filter((item) => hasText(item.value));
  const hasFocusTask = hasText(focusTask);
  const hasMustDo = hasText(mustDo);
  const hasDailyFocus = hasText(focusTask)
    || hasText(mustDo)
    || priorityInputs.some((value) => hasText(value));
  const hasRecoveryData = typeof currentDay.sleepHours === "number"
    || typeof currentDay.sleepQuality === "number"
    || typeof currentDay.energyLevel === "number"
    || hasText(recoveryNote);
  const recoveryCards = [
    typeof currentDay.sleepHours === "number"
      ? { key: "sleep", label: "Sleep", value: sleepHoursDisplay, note: false }
      : null,
    typeof currentDay.sleepQuality === "number"
      ? { key: "quality", label: "Quality", value: sleepQualityDisplay, note: false }
      : null,
    typeof currentDay.energyLevel === "number"
      ? {
          key: "energy",
          label: "Energy",
          value: `${currentDay.energyLevel}/5 - ${energyDisplay}`,
          note: false,
        }
      : null,
    hasText(recoveryNote)
      ? { key: "note", label: "Recovery note", value: recoveryNote, note: true }
      : null,
  ].filter(Boolean) as Array<{
    key: string;
    label: string;
    value: string;
    note: boolean;
  }>;

  const snapshotItems = [
    {
      key: "work",
      emoji: "💼",
      label: "Work",
      value: `${formatHours(workHours)} / ${workTargetHours}h`,
      hint:
        currentDay.shifts.length > 0
          ? `${currentDay.shifts.length} shift${currentDay.shifts.length === 1 ? "" : "s"}`
          : "No shifts yet",
      color: "blue" as const,
    },
    {
      key: "money",
      emoji: "💰",
      label: "Money",
      value: formatMoney(settings.currency, totals.netEarnings, true),
      hint: "Net today",
      accent: totals.netEarnings > 0,
      color: "green" as const,
    },
    {
      key: "gym",
      emoji: "🏋️",
      label: "Gym",
      value: currentGymSession ? currentGymSession.dayName : "Rest",
      hint: currentGymSession
        ? `${currentGymSession.exercises.length} exercises`
        : gymProgram && gymProgram.days.length > 0
          ? `${gymProgram.daysPerWeek || gymProgram.days.length} day program`
          : "No program",
      color: "purple" as const,
    },
    {
      key: "mood",
      emoji: "🧠",
      label: "Mood",
      value: mood ? `${mood.emoji} ${mood.label}` : "—",
      hint: mood ? "Set for today" : "Set it tonight",
      color: "accent" as const,
    },
  ];

  const habitChecks = [
    { label: "Focus", done: hasDailyFocus },
    { label: "Recovery", done: hasRecoveryData },
    { label: "Work", done: currentDay.shifts.length > 0 },
    { label: "Money", done: currentDay.shifts.length > 0 || currentDay.expenses.length > 0 },
    { label: "Gym", done: Boolean(currentGymSession) },
    {
      label: "Reflect",
      done: Boolean(hasText(currentDay.reflectionLine) || hasText(currentDay.winOfDay)),
    },
  ];
  const habitsDone = habitChecks.filter((h) => h.done).length;
  const habitsTotal = habitChecks.length;
  const habitsProgress = habitsTotal > 0 ? habitsDone / habitsTotal : 0;

  const gymStreak = computeGymStreak(gymSessions, currentDay.date);
  const gymLast7 = computeGymLast7(gymSessions, currentDay.date);
  const streakLabel = gymStreak === 1 ? "1 day" : `${gymStreak} days`;
  const hasWorkSetup =
    (settings.jobs?.length ?? 0) > 0 || settings.monthlyFlatSalary > 0;
  const hasWorkActivityToday =
    currentDay.shifts.length > 0 || currentDay.expenses.length > 0;
  const hasAnyGymEntries = Object.keys(gymSessions).length > 0;
  const hasGymProgramSetup = Boolean(gymProgram && gymProgram.days.length > 0);
  const hasCoreOnboardingGoal = hasAnyWorkEntries || hasAnyGymEntries;

  const ringRadius = 18;
  const ringCirc = 2 * Math.PI * ringRadius;
  const ringOffset = ringCirc * (1 - habitsProgress);

  const onboardingCoreTotal = 1;
  const onboardingCoreDone = hasCoreOnboardingGoal ? 1 : 0;
  const showOnboardingGuide = onboardingCoreDone < onboardingCoreTotal;
  const hasOnboardingSaveSignal = hasCoreOnboardingGoal;
  const [onboardingModalState, setOnboardingModalState] =
    useLocalStorage<OnboardingModalState>(
      `dailyos_home_onboarding_modal_${userId}`,
      "active",
    );
  const [onboardingModalScreen, setOnboardingModalScreen] =
    useState<OnboardingModalScreen>("work");
  const wasOnboardingModalVisibleRef = useRef(false);
  const onboardingWizardScreens = [
    {
      key: "work" as const,
      label: "Work",
      desc: "Shifts, expenses, reset time",
      done: hasAnyWorkEntries,
    },
    {
      key: "gym" as const,
      label: "Gym",
      desc: "Program and training logs",
      done: hasAnyGymEntries,
    },
  ] as const;
  const showOnboardingModal =
    showOnboardingGuide
    && onboardingModalState !== "completed"
    && !hasOnboardingSaveSignal
    && !onboardingModalDismissed;
  const hasOnboardingSetupProgress =
    hasWorkSetup || hasGymProgramSetup || settings.dayResetHour !== 0;
  const onboardingDismissLabel = hasOnboardingSetupProgress
    ? "Done for now"
    : "I don't need this";

  useEffect(() => {
    if (onboardingModalState === "dismissed") {
      setOnboardingModalState("active");
    }
  }, [onboardingModalState, setOnboardingModalState]);

  useEffect(() => {
    if (showOnboardingModal && !wasOnboardingModalVisibleRef.current) {
      setOnboardingModalScreen(onboardingModalInitialScreen ?? "work");
      onConsumeOnboardingModalInitialScreen?.();
    }

    wasOnboardingModalVisibleRef.current = showOnboardingModal;
  }, [
    onboardingModalInitialScreen,
    onConsumeOnboardingModalInitialScreen,
    showOnboardingModal,
  ]);

  useEffect(() => {
    if (!showOnboardingGuide || hasOnboardingSaveSignal) {
      setOnboardingModalState("completed");
    }
  }, [
    hasOnboardingSaveSignal,
    onboardingModalState,
    setOnboardingModalState,
    showOnboardingGuide,
  ]);

  const nextAction = (() => {
    if (!hasWorkSetup) {
      return {
        title: "Work Setup",
        desc: "Add a job or monthly salary first so work logs and earnings make sense.",
        cta: "Open Work Settings",
        onClick: () => onNavigate("settings-work" as Page),
      };
    }
    if (!hasDailyFocus) {
      return {
        title: "Daily Focus",
        desc: "Set your main task and top priorities before the day gets noisy.",
        cta: "Open Priorities",
        onClick: () => onNavigate("priorities"),
      };
    }
    if (!hasWorkActivityToday) {
      return {
        title: "Work Log",
        desc: "Start today by logging your first shift or expense.",
        cta: "Open Today",
        onClick: () => onNavigate("today" as Page),
      };
    }
    if (!currentGymSession) {
      return {
        title: "Gym",
        desc: "Log today's session or check your training plan.",
        cta: "Open Gym",
        onClick: () => onNavigate("gym" as Page),
      };
    }
    return {
      title: "Dashboard",
      desc: "Review trends and compare this week with the last one.",
      cta: "Open Dashboard",
      onClick: () => onNavigate("dashboard" as Page),
    };
  })();

  return (
    <div className="home">
      {showOnboardingModal && (
        <div className="home__onboarding-modal-backdrop" role="presentation">
          <section
            className="home__onboarding-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="home-onboarding-modal-title"
          >
            <div className="home__onboarding-modal-head">
              <div className="home__onboarding-kicker">First-time setup</div>
              <h2 id="home-onboarding-modal-title" className="home__onboarding-modal-title">
                Pick what you want to set up first.
              </h2>
              <p className="home__onboarding-modal-desc">
                Quick note: your data stays on this device/browser. If you want to keep seeing
                the same data, open Daily Os from the same app/browser each time (for example,
                Chrome on your phone).
              </p>
            </div>

            <div className="home__onboarding-modal-progress">
              <span>{onboardingCoreDone}/{onboardingCoreTotal} core goal done</span>
              <span className="home__onboarding-modal-step-pill">
                Step {onboardingModalScreen === "work" ? "1" : "2"} / 2
              </span>
            </div>

            <div className="home__onboarding-flow-tabs" role="tablist" aria-label="Onboarding steps">
              {onboardingWizardScreens.map((screen, index) => (
                <button
                  key={screen.key}
                  type="button"
                  role="tab"
                  aria-selected={onboardingModalScreen === screen.key}
                  className={`home__onboarding-flow-tab${
                    onboardingModalScreen === screen.key ? " home__onboarding-flow-tab--active" : ""
                  }${screen.done ? " home__onboarding-flow-tab--done" : ""}`}
                  onClick={() => setOnboardingModalScreen(screen.key)}
                >
                  <span className="home__onboarding-flow-tab-index" aria-hidden="true">
                    {screen.done ? "✓" : index + 1}
                  </span>
                  <span className="home__onboarding-flow-tab-text">
                    <strong>{screen.label}</strong>
                    <span>{screen.desc}</span>
                  </span>
                </button>
              ))}
            </div>

            {onboardingModalScreen === "work" ? (
              <section className="home__onboarding-flow-panel" aria-label="Work onboarding">
                <div className="home__onboarding-flow-panel-head">
                  <h3 className="home__onboarding-flow-panel-title">How Work / Shift tracking works</h3>
                  <p className="home__onboarding-flow-panel-desc">
                    First set your pay/job info, then log shifts and expenses in the Work page.
                    Daily Os uses that to calculate your daily totals.
                  </p>
                </div>

                <div className="home__onboarding-guide-grid">
                  <div className="home__onboarding-guide-card">
                    <span className="home__onboarding-guide-card-index">1</span>
                    <div className="home__onboarding-guide-card-copy">
                      <div className="home__onboarding-guide-card-title">Work Settings</div>
                      <p className="home__onboarding-guide-card-text">
                        Add your job (hourly or monthly) so earnings are calculated correctly.
                      </p>
                    </div>
                  </div>
                  <div className="home__onboarding-guide-card">
                    <span className="home__onboarding-guide-card-index">2</span>
                    <div className="home__onboarding-guide-card-copy">
                      <div className="home__onboarding-guide-card-title">Work (Today)</div>
                      <p className="home__onboarding-guide-card-text">
                        Log a shift or expense. One saved entry is enough to complete the core goal.
                      </p>
                    </div>
                  </div>
                  <div className="home__onboarding-guide-card">
                    <span className="home__onboarding-guide-card-index">3</span>
                    <div className="home__onboarding-guide-card-copy">
                      <div className="home__onboarding-guide-card-title">Priorities (optional)</div>
                      <p className="home__onboarding-guide-card-text">
                        Add your focus for today so Home and Dashboard feel more useful.
                      </p>
                    </div>
                  </div>
                </div>

                <section className="home__onboarding-reset" aria-label="Day reset time">
                  <div className="home__onboarding-reset__copy">
                    <div className="home__onboarding-reset__title">When should your day reset?</div>
                    <p className="home__onboarding-reset__desc">
                      Default is <strong>00:00</strong> (midnight). If you work night shift, your
                      "work day" may end later, so you can move the reset time (for example
                      <strong> 04:00</strong> or <strong>06:00</strong>) to keep entries in the
                      correct day.
                    </p>
                  </div>

                  <div className="home__onboarding-reset__controls">
                    <label className="home__onboarding-reset__label" htmlFor="home-onboarding-reset-time">
                      Day resets at
                    </label>
                    <div className="home__onboarding-reset__input-wrap">
                      <OnboardingTime24Input
                        id="home-onboarding-reset-time"
                        value={settings.dayResetHour}
                        onCommit={(next) => onUpdateSettings({ dayResetHour: next })}
                        className="home__onboarding-reset__input"
                        ariaLabel="Day reset time"
                      />
                      <span className="home__onboarding-reset__badge" aria-hidden="true">
                        24h
                      </span>
                    </div>
                  </div>
                </section>
              </section>
            ) : (
              <section className="home__onboarding-flow-panel" aria-label="Gym onboarding">
                <div className="home__onboarding-flow-panel-head">
                  <h3 className="home__onboarding-flow-panel-title">How Gym / Training works</h3>
                  <p className="home__onboarding-flow-panel-desc">
                    First create your program in Gym Settings, then use Gym to log today's training
                    session.
                  </p>
                </div>

                <div className="home__onboarding-guide-grid">
                  <div className="home__onboarding-guide-card">
                    <span className="home__onboarding-guide-card-index">1</span>
                    <div className="home__onboarding-guide-card-copy">
                      <div className="home__onboarding-guide-card-title">Gym Settings</div>
                      <p className="home__onboarding-guide-card-text">
                        Pick a split and add exercises to each day (strength or cardio).
                      </p>
                    </div>
                  </div>
                  <div className="home__onboarding-guide-card">
                    <span className="home__onboarding-guide-card-index">2</span>
                    <div className="home__onboarding-guide-card-copy">
                      <div className="home__onboarding-guide-card-title">Gym page</div>
                      <p className="home__onboarding-guide-card-text">
                        Choose today's training day and log your workout. Saves happen automatically.
                      </p>
                    </div>
                  </div>
                  <div className="home__onboarding-guide-card">
                    <span className="home__onboarding-guide-card-index">3</span>
                    <div className="home__onboarding-guide-card-copy">
                      <div className="home__onboarding-guide-card-title">Cardio support</div>
                      <p className="home__onboarding-guide-card-text">
                        Cardio logs use distance + duration (for example 10 km in 2h).
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            <div className="home__onboarding-modal-actions">
              {onboardingModalScreen === "work" ? (
                <>
                  <button
                    type="button"
                    className="home__next-step-btn"
                    onClick={() => {
                      if (onStartOnboardingSetup) {
                        onStartOnboardingSetup("work", {
                          returnToModalScreen: hasWorkSetup ? "work" : "gym",
                        });
                        return;
                      }
                      onNavigate("settings-work");
                    }}
                  >
                    {hasWorkSetup ? "Edit Work Setup" : "Set up now"}
                  </button>
                  <button
                    type="button"
                    className="home__ghost-btn"
                    onClick={() => setOnboardingModalScreen("gym")}
                  >
                    Next: Gym
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="home__next-step-btn"
                    onClick={() => {
                      if (onStartOnboardingSetup) {
                        onStartOnboardingSetup("gym", {
                          returnToModalScreen: "gym",
                        });
                        return;
                      }
                      onNavigate("settings-gym");
                    }}
                  >
                    {hasGymProgramSetup ? "Edit Gym Setup" : "Set up now"}
                  </button>
                  <button
                    type="button"
                    className="home__ghost-btn"
                    onClick={() => setOnboardingModalScreen("work")}
                  >
                    Back to Work
                  </button>
                </>
              )}
              <button
                type="button"
                className={`home__ghost-btn${
                  hasOnboardingSetupProgress ? " home__ghost-btn--done" : ""
                }`}
                onClick={onDismissOnboardingModal}
              >
                {onboardingDismissLabel}
              </button>
            </div>
          </section>
        </div>
      )}
      {/* Hero */}
      <section className="home__hero">
        <div className="home__hero-text">
          <h1 className="home__hero-greeting">{getGreeting()}</h1>
          <span className="home__hero-date">{formatDisplayDate(currentDay.date)}</span>
        </div>
        <div className="home__hero-progress" aria-label={`Habits: ${habitsDone} of ${habitsTotal} done`}>
          <svg className="home__hero-ring" viewBox="0 0 48 48" aria-hidden="true">
            <circle className="home__ring-track" cx="24" cy="24" r={ringRadius} />
            <circle
              className="home__ring-progress"
              cx="24"
              cy="24"
              r={ringRadius}
              strokeDasharray={ringCirc}
              strokeDashoffset={ringOffset}
            />
          </svg>
          <span className="home__hero-progress-label">
            <strong>{habitsDone}/{habitsTotal}</strong>
            <span>done</span>
          </span>
        </div>
      </section>

      {/* Snapshot strip */}

      <section className="home__snapshot">
        {snapshotItems.map((item) => (
          <div
            key={item.key}
            className={`home__snapshot-item home__snapshot-item--${item.color}${item.accent ? " home__snapshot-item--accent" : ""}`}
          >
            <div className="home__snapshot-top">
              <span className="home__snapshot-emoji" aria-hidden="true">
                {item.emoji}
              </span>
              <span className="home__snapshot-label">{item.label}</span>
            </div>
            <div className="home__snapshot-value">{item.value}</div>
            <div className="home__snapshot-hint">{item.hint}</div>
            {item.key === "work" && (
              <div className="home__mini-bar" aria-hidden="true">
                <span
                  className="home__mini-bar-fill"
                  style={{ width: `${Math.round(workProgress * 100)}%` }}
                />
              </div>
            )}
          </div>
        ))}
      </section>

      {/* Two-column grid */}
      <div className="home__grid">
        {/* Left: Focus + Next Step */}
        <div className="home__grid-main">
          <section className="home__panel home__focus-panel">
            <div className="home__panel-head">
              <span className="home__panel-title">Daily Focus</span>
              <span className="home__panel-badge">
                {filledPriorities.length}/3 priorities
              </span>
            </div>

            {!hasDailyFocus ? (
              <>
                <p className="home__panel-subtle">
                  You haven&apos;t set priorities for today yet.
                </p>
                <div className="home__focus-actions">
                  <button
                    type="button"
                    className="home__ghost-btn"
                    onClick={() => onNavigate("priorities")}
                  >
                    Open Priorities
                  </button>
                </div>
              </>
            ) : (
              <>
                {(hasFocusTask || hasMustDo) && (
                  <div className="home__focus-summary-grid">
                    {hasFocusTask && (
                      <div className="home__focus-summary-card">
                        <span className="home__focus-summary-label">Main task</span>
                        <strong className="home__focus-summary-value">{focusTask}</strong>
                      </div>
                    )}
                    {hasMustDo && (
                      <div className="home__focus-summary-card home__focus-summary-card--mustdo">
                        <span className="home__focus-summary-label">If nothing else, do this</span>
                        <strong className="home__focus-summary-value">{mustDo}</strong>
                      </div>
                    )}
                  </div>
                )}

                {filledPriorities.length > 0 ? (
                  <div className="home__field">
                    <span className="home__field-label">Top priorities</span>
                    <div className="home__priority-list">
                      {filledPriorities.map(({ value, index }) => (
                        <div key={index} className="home__priority-row home__priority-row--readonly">
                          <span className="home__priority-index" aria-hidden="true">
                            {index + 1}
                          </span>
                          <div className="home__priority-text">{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="home__panel-subtle">No top priorities added yet.</p>
                )}

                <div className="home__focus-actions">
                  <button
                    type="button"
                    className="home__ghost-btn"
                    onClick={() => onNavigate("priorities")}
                  >
                    Edit Priorities
                  </button>
                </div>
              </>
            )}
          </section>

          <div className="home__next-step">
            <div className="home__next-step-label">Next step</div>
            <div className="home__next-step-title">{nextAction.title}</div>
            <p className="home__next-step-desc">{nextAction.desc}</p>
            <button type="button" className="home__next-step-btn" onClick={nextAction.onClick}>
              {nextAction.cta}
            </button>
          </div>
        </div>

        {/* Right: Recovery + Habits */}
        <div className="home__grid-side">
          <section className="home__panel home__recovery-panel">
            <div className="home__panel-head">
              <span className="home__panel-title">Recovery</span>
              <span className="home__panel-badge">
                {typeof currentDay.energyLevel === "number"
                  ? `${currentDay.energyLevel}/5 energy`
                  : hasRecoveryData
                    ? "Tracked"
                    : "Not set"}
              </span>
            </div>

            {!hasRecoveryData ? (
              <>
                <p className="home__panel-subtle">
                  No sleep / recovery data yet.
                </p>
                <button
                  type="button"
                  className="home__ghost-btn"
                  onClick={() => onNavigate("sleep")}
                >
                  Open Sleep
                </button>
              </>
            ) : (
              <>
                <div className="home__recovery-stats">
                  {recoveryCards.map((card) => (
                    <div key={card.key} className="home__recovery-stat">
                      <span className="home__recovery-stat-label">{card.label}</span>
                      <strong
                        className={`home__recovery-stat-value${
                          card.note ? " home__recovery-stat-value--note" : ""
                        }`}
                      >
                        {card.value}
                      </strong>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  className="home__ghost-btn"
                  onClick={() => onNavigate("sleep")}
                >
                  Open Sleep
                </button>
              </>
            )}
          </section>

          <section className="home__panel">
            <div className="home__panel-head">
              <span className="home__panel-title">Habits & Streaks</span>
              <span className="home__panel-badge">{gymStreak > 0 ? `${streakLabel} streak` : "No streak"}</span>
            </div>

            <div className="home__chip-list">
              {habitChecks.map((habit) => (
                <span
                  key={habit.label}
                  className={`home__chip${habit.done ? " home__chip--done" : ""}`}
                >
                  {habit.done ? "✓ " : ""}{habit.label}
                </span>
              ))}
            </div>

            <p className="home__panel-subtle">
              {gymLast7}/7 gym days this week
              {gymStreak > 0 && <> • {streakLabel} streak</>}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
