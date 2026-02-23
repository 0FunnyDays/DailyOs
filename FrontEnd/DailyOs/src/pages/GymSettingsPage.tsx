import { useEffect, useState } from 'react';
import type { GymProgram, ProgramType, ExerciseTemplate } from '../types';
import { generateId } from '../utils/idUtils';
import {
  STRENGTH_EXERCISE_OPTIONS,
  CARDIO_EXERCISE_OPTIONS,
  CHEST_STRENGTH_EXERCISE_OPTIONS,
  BACK_STRENGTH_EXERCISE_OPTIONS,
  SHOULDERS_STRENGTH_EXERCISE_OPTIONS,
  ARMS_STRENGTH_EXERCISE_OPTIONS,
  PUSH_STRENGTH_EXERCISE_OPTIONS,
  PULL_STRENGTH_EXERCISE_OPTIONS,
  LEGS_STRENGTH_EXERCISE_OPTIONS,
} from '../data/gymExerciseOptions';
import '../styles/GymSettingsPage.css';

type GymSettingsPageProps = {
  gymProgram: GymProgram | null;
  onUpdateGymProgram: (p: GymProgram | null) => void;
};

const PROGRAM_LABELS: Record<ProgramType, string> = {
  'push-pull-legs': 'Push / Pull / Legs',
  'bro-split':      'Bro Split',
  'full-body':      'Full Body',
  'cardio':         'Cardio',
  'calisthenics':   'Calisthenics',
  'custom':         'Custom',
};

const DEFAULT_DAYS: Record<ProgramType, string[]> = {
  'push-pull-legs': ['Push A', 'Pull A', 'Legs A', 'Push B', 'Pull B', 'Legs B'],
  'bro-split':      ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs'],
  'full-body':      ['Full Body A', 'Full Body B', 'Full Body C'],
  'cardio':         ['Cardio A', 'Cardio B', 'Cardio C'],
  'calisthenics':   ['Push', 'Pull', 'Legs', 'Skills'],
  'custom':         ['Day 1', 'Day 2', 'Day 3'],
};

const STRENGTH_EXERCISES_DATALIST_ID = 'gym-strength-exercise-options';
const CHEST_STRENGTH_EXERCISES_DATALIST_ID = 'gym-chest-strength-exercise-options';
const BACK_STRENGTH_EXERCISES_DATALIST_ID = 'gym-back-strength-exercise-options';
const SHOULDERS_STRENGTH_EXERCISES_DATALIST_ID = 'gym-shoulders-strength-exercise-options';
const ARMS_STRENGTH_EXERCISES_DATALIST_ID = 'gym-arms-strength-exercise-options';
const PUSH_STRENGTH_EXERCISES_DATALIST_ID = 'gym-push-strength-exercise-options';
const PULL_STRENGTH_EXERCISES_DATALIST_ID = 'gym-pull-strength-exercise-options';
const LEGS_STRENGTH_EXERCISES_DATALIST_ID = 'gym-legs-strength-exercise-options';
const CARDIO_EXERCISES_DATALIST_ID = 'gym-cardio-exercise-options';

function getPplDayBucket(dayName: string): 'push' | 'pull' | 'legs' | null {
  const normalized = dayName.trim().toLowerCase();
  if (normalized.includes('push')) return 'push';
  if (normalized.includes('pull')) return 'pull';
  if (normalized.includes('leg')) return 'legs';
  return null;
}

function getBroSplitDayBucket(dayName: string): 'chest' | 'back' | 'shoulders' | 'arms' | 'legs' | null {
  const normalized = dayName.trim().toLowerCase();
  if (normalized.includes('chest') || normalized.includes('pec')) return 'chest';
  if (normalized.includes('back')) return 'back';
  if (normalized.includes('shoulder') || normalized.includes('delt')) return 'shoulders';
  if (
    normalized.includes('arm')
    || normalized.includes('bicep')
    || normalized.includes('tricep')
    || normalized.includes('forearm')
  ) return 'arms';
  if (
    normalized.includes('leg')
    || normalized.includes('quad')
    || normalized.includes('ham')
    || normalized.includes('glute')
    || normalized.includes('calf')
  ) return 'legs';
  return null;
}

export function GymSettingsPage({ gymProgram, onUpdateGymProgram }: GymSettingsPageProps) {
  const [daysPerWeekInput, setDaysPerWeekInput] = useState(
    gymProgram ? String(gymProgram.daysPerWeek) : '',
  );

  useEffect(() => {
    setDaysPerWeekInput(gymProgram ? String(gymProgram.daysPerWeek) : '');
  }, [gymProgram]);

  function selectProgramType(type: ProgramType) {
    const dayNames = DEFAULT_DAYS[type];
    if (!gymProgram) {
      onUpdateGymProgram({
        programType: type,
        daysPerWeek: dayNames.length,
        days: dayNames.map((name) => ({
          id: generateId(),
          name,
          exercises: [],
        })),
      });
    } else {
      // Switching type: rebuild days with new defaults
      onUpdateGymProgram({
        ...gymProgram,
        programType: type,
        daysPerWeek: dayNames.length,
        days: dayNames.map((name) => ({
          id: generateId(),
          name,
          exercises: [],
        })),
      });
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

  function commitDaysPerWeek(raw: string) {
    if (!gymProgram) return;
    const parsed = parseInt(raw, 10);
    const next = Math.min(7, Math.max(1, Number.isFinite(parsed) ? parsed : gymProgram.daysPerWeek));
    setDaysPerWeekInput(String(next));
    if (next !== gymProgram.daysPerWeek) {
      setDaysPerWeek(next);
    }
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
    const day = gymProgram.days.find((d) => d.id === dayId);
    const inferredType: ExerciseTemplate['type'] =
      gymProgram.programType === 'cardio' || (day && getPplDayBucket(day.name) === null && day.name.toLowerCase().includes('cardio'))
        ? 'cardio'
        : 'strength';
    const newEx: ExerciseTemplate = { id: generateId(), name: '', type: inferredType };
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

  function getExerciseSuggestionsDatalistId(dayName: string, exType: ExerciseTemplate['type']): string {
    if (exType === 'cardio') return CARDIO_EXERCISES_DATALIST_ID;

    if (gymProgram?.programType === 'push-pull-legs') {
      const pplBucket = getPplDayBucket(dayName);
      if (pplBucket === 'push') return PUSH_STRENGTH_EXERCISES_DATALIST_ID;
      if (pplBucket === 'pull') return PULL_STRENGTH_EXERCISES_DATALIST_ID;
      if (pplBucket === 'legs') return LEGS_STRENGTH_EXERCISES_DATALIST_ID;
    }

    if (gymProgram?.programType === 'bro-split') {
      const broBucket = getBroSplitDayBucket(dayName);
      if (broBucket === 'chest') return CHEST_STRENGTH_EXERCISES_DATALIST_ID;
      if (broBucket === 'back') return BACK_STRENGTH_EXERCISES_DATALIST_ID;
      if (broBucket === 'shoulders') return SHOULDERS_STRENGTH_EXERCISES_DATALIST_ID;
      if (broBucket === 'arms') return ARMS_STRENGTH_EXERCISES_DATALIST_ID;
      if (broBucket === 'legs') return LEGS_STRENGTH_EXERCISES_DATALIST_ID;
    }

    const fallbackPplBucket = getPplDayBucket(dayName);
    if (fallbackPplBucket === 'push') return PUSH_STRENGTH_EXERCISES_DATALIST_ID;
    if (fallbackPplBucket === 'pull') return PULL_STRENGTH_EXERCISES_DATALIST_ID;
    if (fallbackPplBucket === 'legs') return LEGS_STRENGTH_EXERCISES_DATALIST_ID;

    const fallbackBroBucket = getBroSplitDayBucket(dayName);
    if (fallbackBroBucket === 'chest') return CHEST_STRENGTH_EXERCISES_DATALIST_ID;
    if (fallbackBroBucket === 'back') return BACK_STRENGTH_EXERCISES_DATALIST_ID;
    if (fallbackBroBucket === 'shoulders') return SHOULDERS_STRENGTH_EXERCISES_DATALIST_ID;
    if (fallbackBroBucket === 'arms') return ARMS_STRENGTH_EXERCISES_DATALIST_ID;
    if (fallbackBroBucket === 'legs') return LEGS_STRENGTH_EXERCISES_DATALIST_ID;

    return STRENGTH_EXERCISES_DATALIST_ID;
  }

  function getExercisePlaceholder(dayName: string, exType: ExerciseTemplate['type']): string {
    if (exType === 'cardio') return 'Search or type cardio exercise';

    if (gymProgram?.programType === 'push-pull-legs') {
      const pplBucket = getPplDayBucket(dayName);
      if (pplBucket === 'push') return 'Search or type push exercise';
      if (pplBucket === 'pull') return 'Search or type pull exercise';
      if (pplBucket === 'legs') return 'Search or type legs exercise';
    }

    if (gymProgram?.programType === 'bro-split') {
      const broBucket = getBroSplitDayBucket(dayName);
      if (broBucket === 'chest') return 'Search or type chest exercise';
      if (broBucket === 'back') return 'Search or type back exercise';
      if (broBucket === 'shoulders') return 'Search or type shoulders exercise';
      if (broBucket === 'arms') return 'Search or type arms exercise';
      if (broBucket === 'legs') return 'Search or type legs exercise';
    }

    return 'Search or type strength exercise';
  }

  return (
    <div className="page gym-settings-page">
      <div className="page__header gym-settings-page__header">
        <h1 className="page__title">Gym Settings</h1>
      </div>

      <div className="page__content gym-settings-page__content">
        <div className="settings-form gym-settings-page__form">

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
                  value={daysPerWeekInput}
                  onChange={(e) => setDaysPerWeekInput(e.target.value)}
                  onFocus={(e) => e.currentTarget.select()}
                  onBlur={(e) => commitDaysPerWeek(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      commitDaysPerWeek(e.currentTarget.value);
                      e.currentTarget.blur();
                    }
                  }}
                  className="field__input settings-form__input--sm"
                />
              </div>

              <div className="program-days-list">
                {gymProgram.days.map((day, di) => (
                  <div key={day.id} className="program-day">
                    <div className="program-day__header">
                      <span className="settings-form__label gym-settings__day-label">
                        Day {di + 1}
                      </span>
                      <input
                        type="text"
                        value={day.name}
                        placeholder={`Day ${di + 1}`}
                        onChange={(e) => updateDayName(day.id, e.target.value)}
                        className="program-exercise-row__input gym-settings__day-name-input"
                      />
                    </div>

                    <div className="program-day__exercises">
                      {day.exercises.map((ex) => (
                        <div key={ex.id} className="program-exercise-row">
                          <input
                            type="text"
                            value={ex.name}
                            placeholder={getExercisePlaceholder(day.name, ex.type)}
                            onChange={(e) => updateExerciseName(day.id, ex.id, e.target.value)}
                            className="program-exercise-row__input"
                            list={getExerciseSuggestionsDatalistId(day.name, ex.type)}
                            autoComplete="off"
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
                            className="btn btn--ghost gym-settings__remove-btn"
                            onClick={() => removeExercise(day.id, ex.id)}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      className="btn btn--ghost gym-settings__add-exercise-btn"
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

      <datalist id={STRENGTH_EXERCISES_DATALIST_ID}>
        {STRENGTH_EXERCISE_OPTIONS.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>
      <datalist id={CHEST_STRENGTH_EXERCISES_DATALIST_ID}>
        {CHEST_STRENGTH_EXERCISE_OPTIONS.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>
      <datalist id={BACK_STRENGTH_EXERCISES_DATALIST_ID}>
        {BACK_STRENGTH_EXERCISE_OPTIONS.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>
      <datalist id={SHOULDERS_STRENGTH_EXERCISES_DATALIST_ID}>
        {SHOULDERS_STRENGTH_EXERCISE_OPTIONS.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>
      <datalist id={ARMS_STRENGTH_EXERCISES_DATALIST_ID}>
        {ARMS_STRENGTH_EXERCISE_OPTIONS.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>
      <datalist id={PUSH_STRENGTH_EXERCISES_DATALIST_ID}>
        {PUSH_STRENGTH_EXERCISE_OPTIONS.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>
      <datalist id={PULL_STRENGTH_EXERCISES_DATALIST_ID}>
        {PULL_STRENGTH_EXERCISE_OPTIONS.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>
      <datalist id={LEGS_STRENGTH_EXERCISES_DATALIST_ID}>
        {LEGS_STRENGTH_EXERCISE_OPTIONS.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>
      <datalist id={CARDIO_EXERCISES_DATALIST_ID}>
        {CARDIO_EXERCISE_OPTIONS.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>
    </div>
  );
}
