import type { GymProgram, ProgramType, ExerciseTemplate } from '../types';
import { generateId } from '../utils/idUtils';

type GymSettingsPageProps = {
  gymProgram: GymProgram | null;
  onUpdateGymProgram: (p: GymProgram | null) => void;
};

const PROGRAM_LABELS: Record<ProgramType, string> = {
  'push-pull-legs': 'Push / Pull / Legs',
  'full-body':      'Full Body',
  'cardio':         'Cardio',
  'custom':         'Custom',
};

export function GymSettingsPage({ gymProgram, onUpdateGymProgram }: GymSettingsPageProps) {

  function selectProgramType(type: ProgramType) {
    if (!gymProgram) {
      onUpdateGymProgram({
        programType: type,
        daysPerWeek: 3,
        days: Array.from({ length: 3 }, (_, i) => ({
          id: generateId(),
          name: `Day ${i + 1}`,
          exercises: [],
        })),
      });
    } else {
      onUpdateGymProgram({ ...gymProgram, programType: type });
    }
  }

  function setDaysPerWeek(count: number) {
    if (!gymProgram) return;
    const current = gymProgram.days;
    let days = [...current];
    if (count > current.length) {
      for (let i = current.length; i < count; i++) {
        days.push({ id: generateId(), name: `Day ${i + 1}`, exercises: [] });
      }
    } else {
      days = days.slice(0, count);
    }
    onUpdateGymProgram({ ...gymProgram, daysPerWeek: count, days });
  }

  function updateDayName(dayId: string, name: string) {
    if (!gymProgram) return;
    onUpdateGymProgram({
      ...gymProgram,
      days: gymProgram.days.map((d) => d.id === dayId ? { ...d, name } : d),
    });
  }

  function addExercise(dayId: string) {
    if (!gymProgram) return;
    const newEx: ExerciseTemplate = { id: generateId(), name: '', type: 'strength' };
    onUpdateGymProgram({
      ...gymProgram,
      days: gymProgram.days.map((d) =>
        d.id === dayId ? { ...d, exercises: [...d.exercises, newEx] } : d,
      ),
    });
  }

  function updateExerciseName(dayId: string, exId: string, name: string) {
    if (!gymProgram) return;
    onUpdateGymProgram({
      ...gymProgram,
      days: gymProgram.days.map((d) =>
        d.id === dayId
          ? { ...d, exercises: d.exercises.map((e) => e.id === exId ? { ...e, name } : e) }
          : d,
      ),
    });
  }

  function updateExerciseType(dayId: string, exId: string, type: 'strength' | 'cardio') {
    if (!gymProgram) return;
    onUpdateGymProgram({
      ...gymProgram,
      days: gymProgram.days.map((d) =>
        d.id === dayId
          ? { ...d, exercises: d.exercises.map((e) => e.id === exId ? { ...e, type } : e) }
          : d,
      ),
    });
  }

  function removeExercise(dayId: string, exId: string) {
    if (!gymProgram) return;
    onUpdateGymProgram({
      ...gymProgram,
      days: gymProgram.days.map((d) =>
        d.id === dayId
          ? { ...d, exercises: d.exercises.filter((e) => e.id !== exId) }
          : d,
      ),
    });
  }

  return (
    <div className="page">
      <div className="page__header">
        <h1 className="page__title">Gym Settings</h1>
      </div>

      <div className="page__content">
        <div className="settings-form">

          {/* Program type selector */}
          <div className="settings-form__group">
            <span className="settings-form__label">Split type</span>
            <div className="program-type-grid">
              {(Object.keys(PROGRAM_LABELS) as ProgramType[]).map((type) => (
                <button
                  key={type}
                  className={`program-type-btn${gymProgram?.programType === type ? ' program-type-btn--active' : ''}`}
                  onClick={() => selectProgramType(type)}
                >
                  {PROGRAM_LABELS[type]}
                </button>
              ))}
            </div>
          </div>

          {gymProgram && (
            <>
              <div className="settings-form__group">
                <label className="settings-form__label" htmlFor="sf-gym-days">
                  Training days / week
                </label>
                <input
                  id="sf-gym-days"
                  type="number"
                  min={1}
                  max={7}
                  value={gymProgram.daysPerWeek}
                  onChange={(e) => {
                    const val = Math.min(7, Math.max(1, parseInt(e.target.value) || 1));
                    setDaysPerWeek(val);
                  }}
                  className="field__input settings-form__input--sm"
                />
              </div>

              <div className="program-days-list">
                {gymProgram.days.map((day, di) => (
                  <div key={day.id} className="program-day">
                    <div className="program-day__header">
                      <span className="settings-form__label" style={{ marginBottom: 0, minWidth: 56 }}>
                        Day {di + 1}
                      </span>
                      <input
                        type="text"
                        value={day.name}
                        placeholder={`Day ${di + 1}`}
                        onChange={(e) => updateDayName(day.id, e.target.value)}
                        className="program-exercise-row__input"
                        style={{ fontWeight: 600 }}
                      />
                    </div>

                    <div className="program-day__exercises">
                      {day.exercises.map((ex) => (
                        <div key={ex.id} className="program-exercise-row">
                          <input
                            type="text"
                            value={ex.name}
                            placeholder="Exercise name"
                            onChange={(e) => updateExerciseName(day.id, ex.id, e.target.value)}
                            className="program-exercise-row__input"
                          />
                          <div className="program-exercise-row__type">
                            <button
                              className={ex.type === 'strength' ? 'active' : ''}
                              onClick={() => updateExerciseType(day.id, ex.id, 'strength')}
                            >
                              Strength
                            </button>
                            <button
                              className={ex.type === 'cardio' ? 'active' : ''}
                              onClick={() => updateExerciseType(day.id, ex.id, 'cardio')}
                            >
                              Cardio
                            </button>
                          </div>
                          <button
                            className="btn btn--ghost"
                            style={{ color: 'var(--clr-red)', padding: '4px 8px' }}
                            onClick={() => removeExercise(day.id, ex.id)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      className="btn btn--ghost"
                      style={{ marginTop: '8px', fontSize: '12px', color: 'var(--clr-accent)' }}
                      onClick={() => addExercise(day.id)}
                    >
                      + Add exercise
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}
