import type {
  AppSettings,
  DayData,
  GymProgram,
  GymSession,
  Page,
} from "../types";
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
  currentDay: DayData;
  settings: AppSettings;
  gymProgram: GymProgram | null;
  gymSessions: Record<string, GymSession>;
  onNavigate: (page: Page) => void;
  onUpdateDayMeta: (updates: DayMetaUpdates) => void;
};

type MoodOption = {
  value: NonNullable<DayData["mood"]>;
  emoji: string;
  label: string;
};

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

function getSleepQualityLabel(level: DayData["sleepQuality"]): string {
  switch (level) {
    case 1:
      return "Poor";
    case 2:
      return "Low";
    case 3:
      return "Okay";
    case 4:
      return "Good";
    case 5:
      return "Great";
    default:
      return "Not set";
  }
}

function getEnergyLabel(level: DayData["energyLevel"]): string {
  switch (level) {
    case 1:
      return "Drained";
    case 2:
      return "Low";
    case 3:
      return "Stable";
    case 4:
      return "Good";
    case 5:
      return "High";
    default:
      return "Not set";
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

export function HomePage({
  currentDay,
  settings,
  gymProgram,
  gymSessions,
  onNavigate,
  onUpdateDayMeta,
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
    },
    {
      key: "money",
      emoji: "💰",
      label: "Money",
      value: formatMoney(settings.currency, totals.netEarnings, true),
      hint: "Net today",
      accent: totals.netEarnings > 0,
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
    },
    {
      key: "mood",
      emoji: "🧠",
      label: "Mood",
      value: mood ? `${mood.emoji} ${mood.label}` : "—",
      hint: mood ? "Set for today" : "Set it tonight",
    },
  ];

  const habitChecks = [
    {
      label: "Focus",
      done: hasDailyFocus,
    },
    {
      label: "Recovery",
      done: hasRecoveryData,
    },
    { label: "Work", done: currentDay.shifts.length > 0 },
    { label: "Money", done: currentDay.shifts.length > 0 || currentDay.expenses.length > 0 },
    { label: "Gym", done: Boolean(currentGymSession) },
    {
      label: "Reflect",
      done: Boolean(
        hasText(currentDay.reflectionLine) || hasText(currentDay.winOfDay),
      ),
    },
  ];
  const habitsDone = habitChecks.filter((h) => h.done).length;
  const habitsTotal = habitChecks.length;
  const habitsProgress = habitsTotal > 0 ? habitsDone / habitsTotal : 0;

  const gymStreak = computeGymStreak(gymSessions, currentDay.date);
  const gymLast7 = computeGymLast7(gymSessions, currentDay.date);
  const streakLabel = gymStreak === 1 ? "1 day" : `${gymStreak} days`;

  const ringRadius = 26;
  const ringCirc = 2 * Math.PI * ringRadius;
  const ringOffset = ringCirc * (1 - habitsProgress);

  const nowHour = new Date().getHours();
  const showEndOfDay = nowHour >= 19 || nowHour < settings.dayResetHour || Boolean(currentDay.closedAt);
  const isClosed = Boolean(currentDay.closedAt);

  const nextAction = (() => {
    if (!hasDailyFocus) {
      return {
        title: "Daily Focus",
        desc: "Set your main task and top priorities before the day gets noisy.",
        cta: "Open Priorities",
        onClick: () => onNavigate("priorities"),
      };
    }
    if (currentDay.shifts.length === 0 && currentDay.expenses.length === 0) {
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
    if (showEndOfDay && !isClosed) {
      return {
        title: "Close Day",
        desc: "Capture your win and reflection before you wrap up.",
        cta: "End of Day",
        onClick: () =>
          document.getElementById("home-end-of-day")?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          }),
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
      <section className="home__section" id="home-daily-focus">
        <div className="home__section-head">
          <h2 className="home__section-title">Daily Focus / Priorities</h2>
          <span className="home__section-kicker">
            {hasDailyFocus ? "Set" : "Set the day"}
          </span>
        </div>

        <div className="home__panel home__focus-panel">
          <div className="home__panel-head">
            <span className="home__panel-title">Today&apos;s Focus</span>
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
                  Open Priorities
                </button>
                <button
                  type="button"
                  className="home__ghost-btn"
                  onClick={() => onNavigate("today")}
                >
                  Open Work
                </button>
              </div>
            </>
          )}
        </div>
      </section>


      <section className="home__section" id="home-recovery">
        <div className="home__section-head">
          <h2 className="home__section-title">Energy / Recovery</h2>
          <span className="home__section-kicker">
            {hasRecoveryData ? "Tracked" : "Quick check-in"}
          </span>
        </div>

        <div className="home__panel home__recovery-panel">
          <div className="home__panel-head">
            <span className="home__panel-title">Recovery status</span>
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
                You haven&apos;t added sleep / recovery data for today yet.
              </p>
              <div className="home__focus-actions">
                <button
                  type="button"
                  className="home__ghost-btn"
                  onClick={() => onNavigate("sleep")}
                >
                  Open Sleep
                </button>
              </div>
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

              <div className="home__focus-actions">
                <button
                  type="button"
                  className="home__ghost-btn"
                  onClick={() => onNavigate("sleep")}
                >
                  Open Sleep
                </button>
              </div>
            </>
          )}
        </div>
      </section>
      <section className="home__section">
        <div className="home__section-head">
          <h2 className="home__section-title">Daily Snapshot</h2>
          <span className="home__section-kicker">
            {formatHours(workHours)} tracked
          </span>
        </div>
        <div className="home__snapshot">
          {snapshotItems.map((item) => (
            <div
              key={item.key}
              className={`home__snapshot-item${item.accent ? " home__snapshot-item--accent" : ""}`}
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
        </div>
      </section>

      <section className="home__section">
        <div className="home__section-head">
          <h2 className="home__section-title">Habits / Streaks</h2>
          <span className="home__section-kicker">Motivation</span>
        </div>
        <div className="home__motivation-grid">
          <div className="home__panel">
            <div className="home__panel-head">
              <span className="home__panel-title">🔥 Gym streak</span>
              <span className="home__panel-badge">{streakLabel}</span>
            </div>
            <p className="home__panel-value">{gymStreak > 0 ? streakLabel : "No streak yet"}</p>
            <p className="home__panel-subtle">
              {gymLast7}/7 days logged in the last week
            </p>
          </div>

          <div className="home__panel home__panel--ring">
            <div className="home__panel-head">
              <span className="home__panel-title">✅ Habits done</span>
              <span className="home__panel-badge">
                {habitsDone}/{habitsTotal}
              </span>
            </div>

            <div className="home__ring-wrap" aria-label={`Habits progress ${Math.round(habitsProgress * 100)} percent`}>
              <svg className="home__ring" viewBox="0 0 64 64" aria-hidden="true">
                <circle className="home__ring-track" cx="32" cy="32" r={ringRadius} />
                <circle
                  className="home__ring-progress"
                  cx="32"
                  cy="32"
                  r={ringRadius}
                  strokeDasharray={ringCirc}
                  strokeDashoffset={ringOffset}
                />
              </svg>
              <div className="home__ring-center">
                <strong>{Math.round(habitsProgress * 100)}%</strong>
                <span>today</span>
              </div>
            </div>

            <div className="home__chip-list">
              {habitChecks.map((habit) => (
                <span
                  key={habit.label}
                  className={`home__chip${habit.done ? " home__chip--done" : ""}`}
                >
                  {habit.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="home__section">
        <div className="home__section-head">
          <h2 className="home__section-title">Projects — Next Step</h2>
          <span className="home__section-kicker">Momentum</span>
        </div>
        <div className="home__next-step">
          <div className="home__next-step-label">Active Project</div>
          <div className="home__next-step-title">{nextAction.title}</div>
          <p className="home__next-step-desc">{nextAction.desc}</p>
          <button type="button" className="home__next-step-btn" onClick={nextAction.onClick}>
            {nextAction.cta}
          </button>
        </div>
      </section>

      {showEndOfDay && (
        <section className="home__section" id="home-end-of-day">
          <div className="home__section-head">
            <h2 className="home__section-title">End Of Day</h2>
            <span className="home__section-kicker">{isClosed ? "Closed" : "Evening mode"}</span>
          </div>

          <div className="home__panel home__endday">
            <div className="home__panel-head">
              <span className="home__panel-title">🌙 Wrap up</span>
              {isClosed && <span className="home__panel-badge">Closed</span>}
            </div>

            <label className="home__field">
              <span className="home__field-label">⭐ Win of the day</span>
              <input
                className="home__field-input"
                type="text"
                maxLength={120}
                placeholder="What went well today?"
                value={currentDay.winOfDay ?? ""}
                onChange={(e) => onUpdateDayMeta({ winOfDay: e.target.value })}
              />
            </label>

            <label className="home__field">
              <span className="home__field-label">✍️ 1-line reflection</span>
              <input
                className="home__field-input"
                type="text"
                maxLength={160}
                placeholder="Short reflection..."
                value={currentDay.reflectionLine ?? ""}
                onChange={(e) => onUpdateDayMeta({ reflectionLine: e.target.value })}
              />
            </label>

            <div className="home__field">
              <span className="home__field-label">🧠 Mood</span>
              <div className="home__mood-row" role="group" aria-label="Select mood">
                {MOOD_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`home__mood-btn${currentDay.mood === option.value ? " home__mood-btn--active" : ""}`}
                    onClick={() => onUpdateDayMeta({ mood: option.value })}
                    aria-pressed={currentDay.mood === option.value}
                    title={option.label}
                  >
                    <span aria-hidden="true">{option.emoji}</span>
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="home__endday-actions">
              <button
                type="button"
                className="home__next-step-btn"
                onClick={() =>
                  onUpdateDayMeta({ closedAt: isClosed ? undefined : new Date().toISOString() })
                }
              >
                {isClosed ? "Reopen Day" : "Close Day"}
              </button>
              <button
                type="button"
                className="home__ghost-btn"
                onClick={() => onNavigate("today")}
              >
                Open Today
              </button>
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
