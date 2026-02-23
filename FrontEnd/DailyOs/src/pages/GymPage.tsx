import { useState, useEffect, useRef, type ChangeEvent } from 'react';
import type { GymProgram, GymDayTemplate, GymSession, ExerciseLog, SetEntry, Page } from '../types';
import { generateId } from '../utils/idUtils';
import { PageGuideModal, usePageGuide } from '../components/PageGuideModal/PageGuideModal';
import '../styles/GymPage.css';

type GymPageProps = {
  userId: string;
  gymProgram: GymProgram | null;
  gymSessions: Record<string, GymSession>;
  currentDate: string;
  onUpsertSession: (date: string, session: GymSession) => void;
  onNavigate: (page: Page) => void;
};

const DEFAULT_SETS_PER_EXERCISE = 3;

function buildDefaultSets(): SetEntry[] {
  return Array.from({ length: DEFAULT_SETS_PER_EXERCISE }, () => ({
    id: generateId(),
    reps: 0,
    weight: 0,
  }));
}

function buildFreshSession(date: string, day: GymDayTemplate): GymSession {
  return {
    date,
    dayTemplateId: day.id,
    dayName: day.name,
    exercises: day.exercises.map((ex) => ({
      id: generateId(),
      templateId: ex.id,
      name: ex.name,
      type: ex.type,
      sets: ex.type === 'cardio' ? [] : buildDefaultSets(),
      ...(ex.type === 'cardio' ? { distanceKm: 0, durationMinutes: 0 } : null),
    })),
    note: '',
  };
}

function getCardioDurationParts(totalMinutes?: number): { hours: number; minutes: number } {
  const safe = Math.max(0, Math.floor(totalMinutes ?? 0));
  return {
    hours: Math.floor(safe / 60),
    minutes: safe % 60,
  };
}

const GYM_GUIDE_STEPS = [
  {
    title: "Pick today's training day",
    text: "Tap one of the day buttons at the top (e.g. Push, Pull, Legs). This loads the exercises from your program.",
  },
  {
    title: "Log your sets",
    text: "For each exercise, enter reps and weight per set. Use the + button to add extra sets.",
  },
  {
    title: "Cardio exercises",
    text: "Cardio logs use distance (km) and duration (hours + minutes) instead of sets.",
  },
  {
    title: "Auto-save",
    text: "Everything saves automatically as you type — no save button needed.",
  },
  {
    title: "Start / end time (24h)",
    text: "You can also track when you started and finished your workout using 24h format (for example 18:30 to 20:00).",
  },
];

function getCurrentTime(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

function parseTime24(value: string): string | null {
  const match = /^(\d{2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function sanitizeTime24Draft(value: string): string {
  const filtered = value.replace(/[^\d:]/g, '');
  let result = '';
  let hasColon = false;

  for (const char of filtered) {
    if (/\d/.test(char)) {
      result += char;
      continue;
    }
    if (char === ':' && !hasColon) {
      result += ':';
      hasColon = true;
    }
  }

  if (hasColon) {
    const [hours = '', minutes = ''] = result.split(':');
    return `${hours.slice(0, 2)}:${minutes.slice(0, 2)}`;
  }

  const digits = result.slice(0, 4);
  if (digits.length > 2) {
    return `${digits.slice(0, 2)}:${digits.slice(2)}`;
  }
  return digits;
}

function Time24TextInput({
  value,
  onCommit,
  className,
  ariaLabel,
  disabled,
  placeholder = '00:00',
}: {
  value?: string;
  onCommit: (next?: string) => void;
  className: string;
  ariaLabel: string;
  disabled?: boolean;
  placeholder?: string;
}) {
  const [raw, setRaw] = useState(value ?? '');
  const isFocusedRef = useRef(false);

  useEffect(() => {
    if (isFocusedRef.current) return;
    setRaw(value ?? '');
  }, [value]);

  function commit(nextRaw: string) {
    const trimmed = nextRaw.trim();
    if (!trimmed) {
      setRaw('');
      onCommit(undefined);
      return;
    }

    const parsed = parseTime24(trimmed);
    if (!parsed) {
      setRaw(value ?? '');
      return;
    }

    setRaw(parsed);
    onCommit(parsed);
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      value={raw}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
      aria-label={ariaLabel}
      onFocus={(e) => {
        isFocusedRef.current = true;
        e.currentTarget.select();
      }}
      onChange={(e) => {
        const next = sanitizeTime24Draft(e.target.value);
        setRaw(next);

        if (next.length < 5) return;
        const parsed = parseTime24(next);
        if (parsed) onCommit(parsed);
      }}
      onBlur={(e) => {
        isFocusedRef.current = false;
        commit(e.target.value);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          commit(raw);
          e.currentTarget.blur();
        }
      }}
    />
  );
}

export function GymPage({ userId, gymProgram, gymSessions, currentDate, onUpsertSession, onNavigate }: GymPageProps) {
  const guide = usePageGuide(userId, "gym");
  const [sessionDate, setSessionDate] = useState(currentDate);
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [session, setSession] = useState<GymSession | null>(null);
  const [noteLocal, setNoteLocal] = useState('');
  const noteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-save whenever session changes
  useEffect(() => {
    if (session) {
      onUpsertSession(sessionDate, session);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, sessionDate]);

  function selectDay(day: GymDayTemplate) {
    setSelectedDayId(day.id);
    const existing = gymSessions[sessionDate];
    if (existing && existing.dayTemplateId === day.id) {
      setSession(existing);
      setNoteLocal(existing.note ?? '');
    } else {
      const fresh = buildFreshSession(sessionDate, day);
      fresh.startedAt = getCurrentTime();
      setSession(fresh);
      setNoteLocal('');
    }
  }

  function handleDateChange(e: ChangeEvent<HTMLInputElement>) {
    const newDate = e.target.value;
    setSessionDate(newDate);
    // Reset selection — user needs to pick a day for the new date
    setSelectedDayId(null);
    setSession(null);
    setNoteLocal('');
  }

  function updateSessionClock(field: 'startedAt' | 'finishedAt', next?: string) {
    setSession((prev) => prev ? { ...prev, [field]: next } : prev);
  }

  // Set operations

  function addSet(exerciseId: string) {
    if (!session) return;
    const newSet: SetEntry = { id: generateId(), reps: 0, weight: 0 };
    setSession({
      ...session,
      exercises: session.exercises.map((ex) =>
        ex.id === exerciseId ? { ...ex, sets: [...ex.sets, newSet] } : ex,
      ),
    });
  }

  function removeSet(exerciseId: string, setId: string) {
    if (!session) return;
    setSession({
      ...session,
      exercises: session.exercises.map((ex) =>
        ex.id === exerciseId ? { ...ex, sets: ex.sets.filter((s) => s.id !== setId) } : ex,
      ),
    });
  }

  function updateSet(exerciseId: string, setId: string, field: 'reps' | 'weight', value: number) {
    if (!session) return;
    setSession({
      ...session,
      exercises: session.exercises.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              sets: ex.sets.map((s) => s.id === setId ? { ...s, [field]: value } : s),
            }
          : ex,
      ),
    });
  }

  function updateCardioDistance(exerciseId: string, value: number) {
    if (!session) return;
    setSession({
      ...session,
      exercises: session.exercises.map((ex) =>
        ex.id === exerciseId ? { ...ex, distanceKm: value } : ex,
      ),
    });
  }

  function updateCardioDuration(exerciseId: string, part: 'hours' | 'minutes', rawValue: number) {
    if (!session) return;
    setSession({
      ...session,
      exercises: session.exercises.map((ex) => {
        if (ex.id !== exerciseId) return ex;
        const current = getCardioDurationParts(ex.durationMinutes);
        const nextHours = part === 'hours'
          ? Math.max(0, Math.floor(rawValue))
          : current.hours;
        const nextMinutes = part === 'minutes'
          ? Math.min(59, Math.max(0, Math.floor(rawValue)))
          : current.minutes;
        return { ...ex, durationMinutes: (nextHours * 60) + nextMinutes };
      }),
    });
  }

  function handleNoteChange(e: ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value;
    setNoteLocal(val);
    if (noteTimer.current) clearTimeout(noteTimer.current);
    noteTimer.current = setTimeout(() => {
      setSession((prev) => prev ? { ...prev, note: val } : prev);
    }, 300);
  }

  // No program set up

  if (!gymProgram || gymProgram.days.length === 0) {
    return (
      <div className="page gym-page">
        <div className="page__header gym-page__header">
          <h1 className="page__title">Gym</h1>
        </div>
        <div className="page__content gym-page__content">
          <div className="gym-empty">
            <p className="gym-empty__message">No program set up yet.</p>
            <button type="button" className="btn btn--primary" onClick={() => onNavigate('settings-gym')}>
              Go to Settings
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page gym-page">
      <PageGuideModal
        userId={userId}
        pageKey="gym"
        title="Gym / Training"
        description="Log your workout sessions. Pick a training day from your program, then fill in sets, reps, and weight."
        steps={GYM_GUIDE_STEPS}
        isOpen={guide.isOpen}
        onClose={guide.dismiss}
      />
      <div className="page__header gym-page__header">
        <h1 className="page__title">Gym</h1>
        <button type="button" className="page-guide-trigger" onClick={guide.reopen}>
          <span className="page-guide-trigger__icon" aria-hidden="true">?</span>
          How it works
        </button>
      </div>

      <div className="gym-datetime">
        <label className="gym-datetime__field">
          <span className="gym-datetime__label">Date</span>
          <input
            type="date"
            className="gym-datetime__input"
            value={sessionDate}
            onChange={handleDateChange}
          />
        </label>
        <label className="gym-datetime__field">
          <span className="gym-datetime__label">Start time (24h)</span>
          <Time24TextInput
            className="gym-datetime__input"
            value={session?.startedAt}
            onCommit={(next) => updateSessionClock('startedAt', next)}
            disabled={!session}
            ariaLabel="Workout start time (24-hour format)"
          />
        </label>
        <label className="gym-datetime__field">
          <span className="gym-datetime__label">End time (24h)</span>
          <Time24TextInput
            className="gym-datetime__input"
            value={session?.finishedAt}
            onCommit={(next) => updateSessionClock('finishedAt', next)}
            disabled={!session}
            ariaLabel="Workout end time (24-hour format)"
          />
        </label>
      </div>

      <div className="page__content gym-page__content">

        {/* Day picker */}
        <div className="gym-day-picker">
          {gymProgram.days.map((day) => (
            <button
              key={day.id}
              type="button"
              className={`gym-day-btn${selectedDayId === day.id ? ' gym-day-btn--active' : ''}`}
              onClick={() => selectDay(day)}
            >
              {day.name}
            </button>
          ))}
        </div>

        {/* Session content */}
        {session && (
          <>
            {session.exercises.length === 0 && (
              <p className="gym-empty__hint">
                No exercises in this day. Add some in Settings.
              </p>
            )}

            {session.exercises.map((ex: ExerciseLog) => (
              <div key={ex.id} className="gym-exercise">
                <div className="gym-exercise__header">
                  <span className="gym-exercise__name">{ex.name || 'Unnamed exercise'}</span>
                  <span className={`gym-exercise__badge gym-exercise__badge--${ex.type}`}>
                    {ex.type === 'strength' ? 'Strength' : 'Cardio'}
                  </span>
                </div>

                {ex.type === 'cardio' ? (
                  <div className="gym-cardio">
                    <div className="gym-cardio__grid">
                      <label className="gym-cardio__field gym-cardio__field--distance">
                        <span className="gym-cardio__label">Distance</span>
                        <div className="gym-cardio__input-wrap">
                          <input
                            type="number"
                            min={0}
                            step={0.1}
                            value={ex.distanceKm ?? 0}
                            aria-label={`${ex.name || 'Cardio exercise'} distance in kilometers`}
                            onChange={(e) => updateCardioDistance(ex.id, parseFloat(e.target.value) || 0)}
                            className="gym-cardio__input"
                          />
                          <span className="gym-cardio__unit">km</span>
                        </div>
                      </label>

                      <label className="gym-cardio__field gym-cardio__field--duration">
                        <span className="gym-cardio__label">Duration</span>
                        <div className="gym-cardio__duration-wrap">
                          <input
                            type="number"
                            min={0}
                            step={1}
                            value={getCardioDurationParts(ex.durationMinutes).hours}
                            aria-label={`${ex.name || 'Cardio exercise'} duration hours`}
                            onChange={(e) => updateCardioDuration(ex.id, 'hours', parseFloat(e.target.value) || 0)}
                            className="gym-cardio__input"
                          />
                          <span className="gym-cardio__unit">h</span>
                          <input
                            type="number"
                            min={0}
                            max={59}
                            step={1}
                            value={getCardioDurationParts(ex.durationMinutes).minutes}
                            aria-label={`${ex.name || 'Cardio exercise'} duration minutes`}
                            onChange={(e) => updateCardioDuration(ex.id, 'minutes', parseFloat(e.target.value) || 0)}
                            className="gym-cardio__input"
                          />
                          <span className="gym-cardio__unit">min</span>
                        </div>
                      </label>
                    </div>
                    <p className="gym-cardio__hint">
                      Example: 10 km in 2h 0min.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="gym-exercise__sets">
                      {ex.sets.map((set, idx) => (
                        <div key={set.id} className="gym-set">
                          <span className="gym-set__unit gym-set__unit--index">
                            #{idx + 1}
                          </span>
                          <input
                            type="number"
                            min={0}
                            value={set.reps}
                            aria-label={`${ex.name || 'Exercise'} set ${idx + 1} reps`}
                            onChange={(e) => updateSet(ex.id, set.id, 'reps', parseFloat(e.target.value) || 0)}
                            className="gym-set__input"
                          />
                          <span className="gym-set__unit">reps</span>
                          <input
                            type="number"
                            min={0}
                            step={0.5}
                            value={set.weight}
                            aria-label={`${ex.name || 'Exercise'} set ${idx + 1} weight in kilograms`}
                            onChange={(e) => updateSet(ex.id, set.id, 'weight', parseFloat(e.target.value) || 0)}
                            className="gym-set__input"
                          />
                          <span className="gym-set__unit">kg</span>
                          <button
                            type="button"
                            className="gym-set__remove"
                            onClick={() => removeSet(ex.id, set.id)}
                            title="Remove set"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      className="gym-exercise__add-set"
                      onClick={() => addSet(ex.id)}
                    >
                      + Add set
                    </button>
                  </>
                )}
              </div>
            ))}

            {/* Note */}
            <section className="day-note gym-note">
              <textarea
                className="day-note__textarea"
                value={noteLocal}
                aria-label="Session notes"
                onChange={handleNoteChange}
                placeholder="Session notes..."
                rows={3}
              />
            </section>
          </>
        )}

        {!session && (
          <p className="gym-empty gym-empty--spaced">
            Select a training day above to start logging.
          </p>
        )}

      </div>
    </div>
  );
}
