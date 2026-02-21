import { useState, useEffect, useRef, type ChangeEvent } from 'react';
import type { GymProgram, GymDayTemplate, GymSession, ExerciseLog, SetEntry, Page } from '../types';
import { generateId } from '../utils/idUtils';

type GymPageProps = {
  gymProgram: GymProgram | null;
  gymSessions: Record<string, GymSession>;
  currentDate: string;
  onUpsertSession: (date: string, session: GymSession) => void;
  onNavigate: (page: Page) => void;
};

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
      sets: [],
    })),
    note: '',
  };
}

export function GymPage({ gymProgram, gymSessions, currentDate, onUpsertSession, onNavigate }: GymPageProps) {
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null);
  const [session, setSession] = useState<GymSession | null>(null);
  const [noteLocal, setNoteLocal] = useState('');
  const noteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-save whenever session changes
  useEffect(() => {
    if (session) {
      onUpsertSession(currentDate, session);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, currentDate]);

  function selectDay(day: GymDayTemplate) {
    setSelectedDayId(day.id);
    const existing = gymSessions[currentDate];
    if (existing && existing.dayTemplateId === day.id) {
      setSession(existing);
      setNoteLocal(existing.note ?? '');
    } else {
      const fresh = buildFreshSession(currentDate, day);
      setSession(fresh);
      setNoteLocal('');
    }
  }

  // ── Set operations ────────────────────────────────────────────────────────

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

  function handleNoteChange(e: ChangeEvent<HTMLTextAreaElement>) {
    const val = e.target.value;
    setNoteLocal(val);
    if (noteTimer.current) clearTimeout(noteTimer.current);
    noteTimer.current = setTimeout(() => {
      setSession((prev) => prev ? { ...prev, note: val } : prev);
    }, 300);
  }

  // ── No program set up ─────────────────────────────────────────────────────

  if (!gymProgram || gymProgram.days.length === 0) {
    return (
      <div className="page">
        <div className="page__header">
          <h1 className="page__title">Gym</h1>
        </div>
        <div className="page__content">
          <div className="gym-empty">
            <p style={{ marginBottom: '16px' }}>No program set up yet.</p>
            <button className="btn btn--primary" onClick={() => onNavigate('settings')}>
              Go to Settings
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page__header">
        <h1 className="page__title">Gym — {currentDate}</h1>
      </div>

      <div className="page__content">

        {/* Day picker */}
        <div className="gym-day-picker">
          {gymProgram.days.map((day) => (
            <button
              key={day.id}
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
              <p style={{ color: 'var(--clr-text-muted)', fontSize: '13px', marginBottom: '16px' }}>
                No exercises in this day. Add some in Settings.
              </p>
            )}

            {session.exercises.map((ex: ExerciseLog) => (
              <div key={ex.id} className="gym-exercise">
                <div className="gym-exercise__header">
                  <span className="gym-exercise__name">{ex.name || 'Unnamed exercise'}</span>
                  <span className="gym-exercise__badge">
                    {ex.type === 'strength' ? 'Strength' : 'Cardio'}
                  </span>
                </div>

                <div className="gym-exercise__sets">
                  {ex.sets.map((set, idx) => (
                    <div key={set.id} className="gym-set">
                      <span className="gym-set__unit" style={{ color: 'var(--clr-text-dim)', minWidth: '28px' }}>
                        #{idx + 1}
                      </span>
                      <input
                        type="number"
                        min={0}
                        value={set.reps}
                        onChange={(e) => updateSet(ex.id, set.id, 'reps', parseFloat(e.target.value) || 0)}
                        className="gym-set__input"
                      />
                      <span className="gym-set__unit">reps</span>
                      <input
                        type="number"
                        min={0}
                        step={0.5}
                        value={set.weight}
                        onChange={(e) => updateSet(ex.id, set.id, 'weight', parseFloat(e.target.value) || 0)}
                        className="gym-set__input"
                      />
                      <span className="gym-set__unit">kg</span>
                      <button
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
                  className="gym-exercise__add-set"
                  onClick={() => addSet(ex.id)}
                >
                  + Add set
                </button>
              </div>
            ))}

            {/* Note */}
            <section className="day-note" style={{ marginTop: '16px' }}>
              <textarea
                className="day-note__textarea"
                value={noteLocal}
                onChange={handleNoteChange}
                placeholder="Session notes..."
                rows={3}
              />
            </section>
          </>
        )}

        {!session && (
          <p className="gym-empty" style={{ paddingTop: '32px' }}>
            Select a training day above to start logging.
          </p>
        )}

      </div>
    </div>
  );
}
