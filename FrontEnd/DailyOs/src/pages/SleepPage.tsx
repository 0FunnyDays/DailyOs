import { useEffect, useState } from "react";
import type { DayData, Page } from "../types";

type SleepMetaUpdates = Partial<
  Pick<DayData, "sleepHours" | "sleepQuality" | "energyLevel" | "recoveryNote">
>;

type SleepPageProps = {
  currentDate: string;
  days: Record<string, DayData>;
  onUpdateDayMeta: (date: string, updates: SleepMetaUpdates) => void;
  onNavigate: (page: Page) => void;
};

const LEVEL_SCALE = [1, 2, 3, 4, 5] as const;
const SLEEP_HOUR_QUICK_OPTIONS = [5, 6, 7, 8, 9] as const;

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

function toLocalDate(dateKey: string): Date {
  const [y, m, d] = dateKey.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatSleepHours(hours: number | undefined): string {
  if (typeof hours !== "number" || !Number.isFinite(hours)) return "Not set";
  return Number.isInteger(hours) ? `${hours}h` : `${hours.toFixed(1)}h`;
}

function formatDisplayDate(dateKey: string): string {
  return toLocalDate(dateKey).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatShortDate(dateKey: string): string {
  return toLocalDate(dateKey).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function avg(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function formatAvgHours(value: number | null): string {
  if (value === null) return "—";
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? `${rounded}h` : `${rounded.toFixed(1)}h`;
}

function formatAvgScore(value: number | null): string {
  if (value === null) return "—";
  return `${value.toFixed(1)}/5`;
}

function isDefinedNumber(value: number | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isScaleValue(
  value: DayData["sleepQuality"] | DayData["energyLevel"],
): value is 1 | 2 | 3 | 4 | 5 {
  return typeof value === "number";
}

function hasRecoveryEntry(value: DayData | undefined): boolean {
  if (!value) return false;
  return typeof value.sleepHours === "number"
    || typeof value.sleepQuality === "number"
    || typeof value.energyLevel === "number"
    || Boolean(value.recoveryNote?.trim());
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

export function SleepPage({ currentDate, days, onUpdateDayMeta, onNavigate }: SleepPageProps) {
  const [selectedDate, setSelectedDate] = useState(currentDate);

  const day: DayData = days[selectedDate] ?? {
    date: selectedDate,
    shifts: [],
    expenses: [],
  };

  const isToday = selectedDate === currentDate;

  const [sleepHoursInput, setSleepHoursInput] = useState(
    typeof day.sleepHours === "number" ? String(day.sleepHours) : "",
  );

  useEffect(() => {
    setSleepHoursInput(typeof day.sleepHours === "number" ? String(day.sleepHours) : "");
  }, [day.sleepHours, selectedDate]);

  function parseSleepHours(raw: string): number | undefined | null {
    const trimmed = raw.trim();
    if (trimmed === "") return undefined;

    const colonMatch = /^(\d{1,2}):(\d{1,2})$/.exec(trimmed);
    if (colonMatch) {
      const hours = Number(colonMatch[1]);
      const minutes = Number(colonMatch[2]);
      if (!Number.isFinite(hours) || !Number.isFinite(minutes) || minutes < 0 || minutes >= 60) {
        return null;
      }

      const total = hours + minutes / 60;
      return Math.max(0, Math.min(24, Math.round(total * 4) / 4));
    }

    const normalized = trimmed.replace(",", ".");
    const parsed = Number(normalized);
    if (!Number.isFinite(parsed)) return null;
    return Math.max(0, Math.min(24, Math.round(parsed * 4) / 4));
  }

  function formatSleepHoursInput(value: number | undefined): string {
    if (typeof value !== "number") return "";
    return Number.isInteger(value) ? String(value) : String(value);
  }

  function commitSleepHours(raw: string) {
    const parsed = parseSleepHours(raw);
    if (parsed === null) {
      setSleepHoursInput(formatSleepHoursInput(day.sleepHours));
      return;
    }

    setSleepHoursInput(formatSleepHoursInput(parsed));
    onUpdateDayMeta(selectedDate, { sleepHours: parsed });
  }

  const last7Dates = Array.from({ length: 7 }, (_, index) => addDays(selectedDate, -(6 - index)));
  const last14Dates = Array.from({ length: 14 }, (_, index) => addDays(selectedDate, -(13 - index)));
  const last30Dates = Array.from({ length: 30 }, (_, index) => addDays(selectedDate, -(29 - index)));

  const last7Days = last7Dates.map((dateKey) => days[dateKey]).filter(Boolean) as DayData[];
  const last30Days = last30Dates.map((dateKey) => days[dateKey]).filter(Boolean) as DayData[];

  const last7Sleep = last7Days
    .map((entry) => entry.sleepHours)
    .filter(isDefinedNumber);
  const last30Sleep = last30Days
    .map((entry) => entry.sleepHours)
    .filter(isDefinedNumber);
  const last7Quality = last7Days
    .map((entry) => entry.sleepQuality)
    .filter(isScaleValue);
  const last7Energy = last7Days
    .map((entry) => entry.energyLevel)
    .filter(isScaleValue);

  const logged7 = last7Dates.filter((dateKey) => hasRecoveryEntry(days[dateKey])).length;
  const logged30 = last30Dates.filter((dateKey) => hasRecoveryEntry(days[dateKey])).length;

  let recoveryStreak = 0;
  for (let i = 0; i < 60; i += 1) {
    const dateKey = addDays(selectedDate, -i);
    if (!hasRecoveryEntry(days[dateKey])) break;
    recoveryStreak += 1;
  }

  const trendPoints = last14Dates.map((dateKey) => {
    const entry = days[dateKey];
    const sleepHours = typeof entry?.sleepHours === "number" ? entry.sleepHours : undefined;
    const energy = typeof entry?.energyLevel === "number" ? entry.energyLevel : undefined;
    const quality = typeof entry?.sleepQuality === "number" ? entry.sleepQuality : undefined;
    const label = toLocalDate(dateKey).toLocaleDateString(undefined, { weekday: "short" }).slice(0, 1);
    return {
      dateKey,
      label,
      sleepHours,
      energy,
      quality,
      logged: hasRecoveryEntry(entry),
    };
  });

  const trendMaxHours = Math.max(
    8,
    ...trendPoints
      .map((point) => point.sleepHours ?? 0)
      .filter((value) => Number.isFinite(value)),
  );

  const avgSleep7 = avg(last7Sleep);
  const avgSleep30 = avg(last30Sleep);
  const avgQuality7 = avg(last7Quality);
  const avgEnergy7 = avg(last7Energy);

  const energyOnGoodSleep = avg(
    last30Days
      .filter(
        (entry) => typeof entry.sleepHours === "number"
          && entry.sleepHours >= 7
          && typeof entry.energyLevel === "number",
      )
      .map((entry) => entry.energyLevel)
      .filter(isScaleValue),
  );
  const energyOnShortSleep = avg(
    last30Days
      .filter(
        (entry) => typeof entry.sleepHours === "number"
          && entry.sleepHours < 7
          && typeof entry.energyLevel === "number",
      )
      .map((entry) => entry.energyLevel)
      .filter(isScaleValue),
  );

  const recentNotes = last14Dates
    .map((dateKey) => ({ dateKey, note: days[dateKey]?.recoveryNote?.trim() ?? "" }))
    .filter((item) => item.note.length > 0)
    .slice(-3)
    .reverse();

  const analyticsInsight = (() => {
    if (logged7 === 0 && logged30 === 0) {
      return "No recovery history yet. Start logging sleep and energy for a few days to unlock trends.";
    }

    if (avgSleep7 !== null && avgSleep30 !== null) {
      const diff = Math.round((avgSleep7 - avgSleep30) * 10) / 10;
      if (Math.abs(diff) >= 0.3) {
        return diff > 0
          ? `Your last 7 days are up by ${diff.toFixed(1)}h vs your 30-day sleep average.`
          : `Your last 7 days are down by ${Math.abs(diff).toFixed(1)}h vs your 30-day sleep average.`;
      }
    }

    if (energyOnGoodSleep !== null && energyOnShortSleep !== null) {
      const delta = Math.round((energyOnGoodSleep - energyOnShortSleep) * 10) / 10;
      if (Math.abs(delta) >= 0.4) {
        return delta > 0
          ? `Energy is ${delta.toFixed(1)} points higher on days with 7h+ sleep.`
          : `Energy looks similar regardless of sleep length right now.`;
      }
    }

    return `You logged recovery on ${logged7}/7 days this week. Keep the streak going for cleaner trends.`;
  })();
  const noteCharCount = (day.recoveryNote ?? "").length;
  const formattedSelectedDate = formatDisplayDate(selectedDate);

  return (
    <section className="page-renderer__section">
      <div className="home__section-head">
        <h1 className="page-renderer__title" style={{ marginBottom: 0 }}>Sleep / Recovery</h1>
      </div>

      <p className="page-renderer__subtitle" style={{ marginBottom: 0 }}>
        Log your sleep and recovery in a few taps.
      </p>

      {/* Date picker */}
      <div className="sleep-page__date-picker" style={{ marginTop: 12 }}>
        <div className="sleep-page__date-nav">
          <button
            type="button"
            className="sleep-page__date-arrow"
            onClick={() => setSelectedDate(addDays(selectedDate, -1))}
            aria-label="Previous day"
          >
            ‹
          </button>
          <span className="sleep-page__date-pill">{formattedSelectedDate}</span>
          <button
            type="button"
            className="sleep-page__date-arrow"
            onClick={() => {
              if (!isToday) setSelectedDate(addDays(selectedDate, 1));
            }}
            disabled={isToday}
            aria-label="Next day"
          >
            ›
          </button>
          {!isToday && (
            <button
              type="button"
              className="sleep-page__today-btn"
              onClick={() => setSelectedDate(currentDate)}
            >
              Today
            </button>
          )}
        </div>
      </div>

      <div className="home__panel home__recovery-panel sleep-page__checkin-panel" style={{ marginTop: 8 }}>
        <div className="home__panel-head">
          <span className="home__panel-title">
            {isToday ? "Today's" : formatShortDate(selectedDate)} recovery check-in
          </span>
          <span className="home__panel-badge">
            {typeof day.energyLevel === "number" ? `${day.energyLevel}/5 energy` : "Not set"}
          </span>
        </div>

        <div className="sleep-page__today-summary" aria-label="Current recovery values">
          <div className="sleep-page__today-pill">
            <span className="sleep-page__today-pill-label">Sleep</span>
            <strong className="sleep-page__today-pill-value">{formatSleepHours(day.sleepHours)}</strong>
          </div>
          <div className="sleep-page__today-pill">
            <span className="sleep-page__today-pill-label">Quality</span>
            <strong className="sleep-page__today-pill-value">{getSleepQualityLabel(day.sleepQuality)}</strong>
          </div>
          <div className="sleep-page__today-pill">
            <span className="sleep-page__today-pill-label">Energy</span>
            <strong className="sleep-page__today-pill-value">{getEnergyLabel(day.energyLevel)}</strong>
          </div>
        </div>

        <div className="sleep-page__checkin-layout">
          <div className="sleep-page__checkin-left">
            <div className="home__recovery-grid">
              <label className="home__field sleep-page__hours-field">
                <span className="home__field-label">Sleep (hours)</span>
                <input
                  className="home__field-input"
                  type="text"
                  inputMode="decimal"
                  placeholder="Ex: 7.5 or 7:30"
                  value={sleepHoursInput}
                  onChange={(e) => setSleepHoursInput(e.target.value)}
                  onBlur={(e) => commitSleepHours(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      commitSleepHours(e.currentTarget.value);
                      e.currentTarget.blur();
                    }
                  }}
                />
                <div className="sleep-page__quick-hours" role="group" aria-label="Quick sleep hour options">
                  {SLEEP_HOUR_QUICK_OPTIONS.map((hours) => {
                    const isActive = day.sleepHours === hours;
                    return (
                      <button
                        key={`sleep-hour-${hours}`}
                        type="button"
                        className={`sleep-page__quick-hour-btn${isActive ? " sleep-page__quick-hour-btn--active" : ""}`}
                        onClick={() => commitSleepHours(isActive ? "" : String(hours))}
                        aria-pressed={isActive ? "true" : "false"}
                      >
                        {hours}h
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    className="sleep-page__quick-hour-btn sleep-page__quick-hour-btn--ghost"
                    onClick={() => commitSleepHours("")}
                  >
                    Clear
                  </button>
                </div>
              </label>

              <div className="home__field sleep-page__scale-field">
                <span className="home__field-label">Sleep quality</span>
                <div className="home__level-group">
                  <div className="home__level-row sleep-page__level-row" role="group" aria-label="Sleep quality">
                    {LEVEL_SCALE.map((level) => (
                      <button
                        key={`sleep-quality-${level}`}
                        type="button"
                        className={`home__level-btn sleep-page__level-btn${day.sleepQuality === level ? " home__level-btn--active" : ""}`}
                        onClick={() =>
                          onUpdateDayMeta(selectedDate, {
                            sleepQuality: day.sleepQuality === level ? undefined : level,
                          })
                        }
                        aria-pressed={day.sleepQuality === level ? "true" : "false"}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                  <span className="home__level-hint">{getSleepQualityLabel(day.sleepQuality)}</span>
                </div>
              </div>
            </div>

            <div className="home__field sleep-page__scale-field">
              <span className="home__field-label">Energy level</span>
              <div className="home__level-group">
                <div className="home__level-row sleep-page__level-row" role="group" aria-label="Energy level">
                  {LEVEL_SCALE.map((level) => (
                    <button
                      key={`energy-level-${level}`}
                      type="button"
                      className={`home__level-btn sleep-page__level-btn${day.energyLevel === level ? " home__level-btn--active" : ""}`}
                      onClick={() =>
                        onUpdateDayMeta(selectedDate, {
                          energyLevel: day.energyLevel === level ? undefined : level,
                        })
                      }
                      aria-pressed={day.energyLevel === level ? "true" : "false"}
                    >
                      {level}
                    </button>
                  ))}
                </div>
                <span className="home__level-hint">{getEnergyLabel(day.energyLevel)}</span>
              </div>
            </div>
          </div>

          <div className="sleep-page__checkin-right">
            <label className="home__field sleep-page__note-field">
              <span className="home__field-label">Recovery note</span>
              <textarea
                className="home__field-input sleep-page__note-input"
                maxLength={140}
                rows={3}
                placeholder="Ex: slept late, low energy after lunch..."
                value={day.recoveryNote ?? ""}
                onChange={(e) =>
                  onUpdateDayMeta(selectedDate, {
                    recoveryNote: e.target.value || undefined,
                  })
                }
              />
              <div className="sleep-page__field-foot">
                <span className="sleep-page__field-help">Optional note: stress, naps, meal timing, training fatigue.</span>
                <span className="sleep-page__char-count" aria-live="polite">{noteCharCount}/140</span>
              </div>
            </label>
          </div>
        </div>

        <div className="home__focus-actions sleep-page__actions">
          <button type="button" className="home__ghost-btn" onClick={() => onNavigate("home")}>
            Back to Home
          </button>
          <button type="button" className="home__ghost-btn" onClick={() => onNavigate("gym")}>
            Open Gym
          </button>
        </div>
      </div>

      <div className="sleep-page__analytics-grid">
        <section className="home__panel sleep-page__analytics-panel">
          <div className="home__panel-head">
            <span className="home__panel-title">Recovery overview</span>
            <span className="home__panel-badge">Week: {logged7}/7 logged</span>
          </div>

          <div className="sleep-page__stats-grid">
            <div className="home__recovery-stat">
              <span className="home__recovery-stat-label">{isToday ? "Today" : formatShortDate(selectedDate)} sleep</span>
              <strong className="home__recovery-stat-value">{formatSleepHours(day.sleepHours)}</strong>
            </div>
            <div className="home__recovery-stat">
              <span className="home__recovery-stat-label">7d avg sleep</span>
              <strong className="home__recovery-stat-value">{formatAvgHours(avgSleep7)}</strong>
            </div>
            <div className="home__recovery-stat">
              <span className="home__recovery-stat-label">30d avg sleep</span>
              <strong className="home__recovery-stat-value">{formatAvgHours(avgSleep30)}</strong>
            </div>
            <div className="home__recovery-stat">
              <span className="home__recovery-stat-label">Recovery streak</span>
              <strong className="home__recovery-stat-value">
                {recoveryStreak > 0 ? `${recoveryStreak}d` : "0d"}
              </strong>
            </div>
            <div className="home__recovery-stat">
              <span className="home__recovery-stat-label">7d sleep quality</span>
              <strong className="home__recovery-stat-value">{formatAvgScore(avgQuality7)}</strong>
            </div>
            <div className="home__recovery-stat">
              <span className="home__recovery-stat-label">7d energy</span>
              <strong className="home__recovery-stat-value">{formatAvgScore(avgEnergy7)}</strong>
            </div>
          </div>

          <p className="home__panel-subtle sleep-page__insight">{analyticsInsight}</p>
          <p className="sleep-page__meta-line">
            30-day coverage: <strong>{logged30}/30</strong>
          </p>
        </section>

        <section className="home__panel sleep-page__analytics-panel">
          <div className="home__panel-head">
            <span className="home__panel-title">Last 14 Days</span>
            <span className="home__panel-badge">Sleep trend</span>
          </div>

          <div className="sleep-page__trend-legend" aria-hidden="true">
            <span className="sleep-page__trend-legend-item">
              <span className="sleep-page__trend-legend-dot sleep-page__trend-legend-dot--low" />
              Low energy
            </span>
            <span className="sleep-page__trend-legend-item">
              <span className="sleep-page__trend-legend-dot sleep-page__trend-legend-dot--mid" />
              Medium
            </span>
            <span className="sleep-page__trend-legend-item">
              <span className="sleep-page__trend-legend-dot sleep-page__trend-legend-dot--high" />
              High energy
            </span>
            <span className="sleep-page__trend-legend-item">
              <span className="sleep-page__trend-legend-dot sleep-page__trend-legend-dot--today" />
              Selected
            </span>
          </div>

          <div className="sleep-page__trend" role="img" aria-label="Sleep hours trend for the last 14 days">
            {trendPoints.map((point) => {
              const heightPct = point.sleepHours
                ? Math.max(8, Math.round((point.sleepHours / trendMaxHours) * 100))
                : 8;
              const tone =
                typeof point.energy === "number"
                  ? point.energy >= 4
                    ? "high"
                    : point.energy <= 2
                      ? "low"
                      : "mid"
                  : "none";

              return (
                <div key={point.dateKey} className="sleep-page__trend-col">
                  <span className="sleep-page__trend-value">
                    {typeof point.sleepHours === "number" ? formatSleepHours(point.sleepHours) : "—"}
                  </span>
                  <div className="sleep-page__trend-bar-wrap">
                    <span
                      className={`sleep-page__trend-bar sleep-page__trend-bar--${tone}${
                        point.dateKey === selectedDate ? " sleep-page__trend-bar--today" : ""
                      }${!point.logged ? " sleep-page__trend-bar--empty" : ""}`}
                      style={{ height: `${heightPct}%` }}
                      title={`${point.dateKey} | ${typeof point.sleepHours === "number" ? formatSleepHours(point.sleepHours) : "No sleep hours"}${typeof point.energy === "number" ? ` | Energy ${point.energy}/5` : ""}${typeof point.quality === "number" ? ` | Quality ${point.quality}/5` : ""}`}
                    />
                  </div>
                  <span className="sleep-page__trend-label">{point.label}</span>
                </div>
              );
            })}
          </div>

          {recentNotes.length > 0 ? (
            <div className="sleep-page__notes-list">
              <span className="home__field-label">Recent recovery notes</span>
              {recentNotes.map((item) => (
                <div key={item.dateKey} className="sleep-page__note-item">
                  <span className="sleep-page__note-date">{formatShortDate(item.dateKey)}</span>
                  <span className="sleep-page__note-text">{item.note}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="home__panel-subtle">No recovery notes in the last 14 days.</p>
          )}
        </section>
      </div>
    </section>
  );
}
