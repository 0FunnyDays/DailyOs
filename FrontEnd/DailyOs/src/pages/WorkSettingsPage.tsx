import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import type { AppSettings, Job, PayType } from '../types';
import '../styles/WorkSettingsPage.css';

type WorkSettingsPageProps = {
  settings: AppSettings;
  onUpdateSettings: (updates: Partial<AppSettings>) => void;
  onAddJob: (name: string, payType: PayType, rate: number, cadenceValue?: number) => void;
  onUpdateJob: (
    jobId: string,
    updates: Partial<Pick<Job, 'name' | 'payType' | 'rate' | 'daysPerWeek' | 'daysPerMonth'>>,
  ) => void;
  onRemoveJob: (jobId: string) => void;
};

function sanitizeDecimalDraft(value: string): string {
  let result = '';
  let hasSeparator = false;

  for (const char of value) {
    if (/\d/.test(char)) {
      result += char;
      continue;
    }
    if ((char === ',' || char === '.') && !hasSeparator) {
      result += char;
      hasSeparator = true;
    }
  }

  return result;
}

function parseLocaleDecimal(value: string): number {
  const normalized = sanitizeDecimalDraft(value).replace(',', '.');
  if (!normalized || normalized === '.') return 0;
  return parseFloat(normalized) || 0;
}

function formatLocaleDecimal(value: number): string {
  if (!Number.isFinite(value) || value === 0) return '';
  return String(value).replace('.', ',');
}

function formatResetTime(resetHour: number): string {
  const safe = Number.isFinite(resetHour) ? resetHour : 4;
  const totalMinutes = Math.min(23 * 60 + 59, Math.max(0, Math.round(safe * 60)));
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function parseResetTime(value: string): number | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h < 0 || h > 23 || m < 0 || m > 59) return null;
  return Math.round((h * 60 + m)) / 60;
}

function sanitizeTimeDraft(value: string): string {
  const filtered = value.replace(/[^\d:]/g, '');
  let result = '';
  let hasColon = false;

  for (const char of filtered) {
    if (/\d/.test(char)) {
      result += char;
      continue;
    }
    if (char === ':' && !hasColon) {
      result += char;
      hasColon = true;
    }
  }

  if (hasColon) {
    const [hours = '', minutes = ''] = result.split(':');
    return `${hours.slice(0, 2)}:${minutes.slice(0, 2)}`;
  }

  const digitsOnly = result.slice(0, 4);
  if (digitsOnly.length > 2) {
    return `${digitsOnly.slice(0, 2)}:${digitsOnly.slice(2)}`;
  }
  return digitsOnly;
}

function DecimalTextInput({
  value,
  onCommit,
  placeholder,
  className,
  ariaLabel,
}: {
  value: number;
  onCommit: (next: number) => void;
  placeholder: string;
  className: string;
  ariaLabel: string;
}) {
  const [raw, setRaw] = useState(formatLocaleDecimal(value));
  const isFocusedRef = useRef(false);

  useEffect(() => {
    if (isFocusedRef.current) return;
    setRaw(formatLocaleDecimal(value));
  }, [value]);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const nextRaw = sanitizeDecimalDraft(e.target.value);
    setRaw(nextRaw);

    if (nextRaw === '') {
      onCommit(0);
      return;
    }

    if (nextRaw.endsWith(',') || nextRaw.endsWith('.')) return;
    onCommit(parseLocaleDecimal(nextRaw));
  }

  function handleBlur() {
    isFocusedRef.current = false;
    const parsed = parseLocaleDecimal(raw);
    onCommit(parsed);
    setRaw(formatLocaleDecimal(parsed));
  }

  return (
    <input
      type="text"
      inputMode="decimal"
      value={raw}
      onFocus={() => {
        isFocusedRef.current = true;
      }}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={className}
      aria-label={ariaLabel}
    />
  );
}

function Time24TextInput({
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
  const [raw, setRaw] = useState(formatResetTime(value));
  const isFocusedRef = useRef(false);

  useEffect(() => {
    if (isFocusedRef.current) return;
    setRaw(formatResetTime(value));
  }, [value]);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const nextRaw = sanitizeTimeDraft(e.target.value);
    setRaw(nextRaw);

    const parsed = parseResetTime(nextRaw);
    if (parsed !== null) {
      onCommit(parsed);
    }
  }

  function commitOrReset() {
    const parsed = parseResetTime(raw);
    if (parsed === null) {
      setRaw(formatResetTime(value));
      return;
    }
    onCommit(parsed);
    setRaw(formatResetTime(parsed));
  }

  return (
    <input
      id={id}
      type="text"
      inputMode="numeric"
      placeholder="04:30"
      value={raw}
      onFocus={() => {
        isFocusedRef.current = true;
      }}
      onChange={handleChange}
      onBlur={() => {
        isFocusedRef.current = false;
        commitOrReset();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          (e.currentTarget as HTMLInputElement).blur();
        }
      }}
      className={className}
      aria-label={ariaLabel}
    />
  );
}

export function WorkSettingsPage({
  settings,
  onUpdateSettings,
  onAddJob,
  onUpdateJob,
  onRemoveJob,
}: WorkSettingsPageProps) {
  const flatDailyPay = settings.workingDaysPerMonth > 0
    ? settings.monthlyFlatSalary / settings.workingDaysPerMonth
    : 0;

  const [newJobName, setNewJobName] = useState('');
  const [newJobType, setNewJobType] = useState<PayType>('hourly');
  const [newJobRate, setNewJobRate] = useState('');
  const [newHourlyDaysPerWeek, setNewHourlyDaysPerWeek] = useState('5');
  const [newFlatDaysPerMonth, setNewFlatDaysPerMonth] = useState('22');

  const jobs = settings.jobs ?? [];
  const hasJobs = jobs.length > 0;
  const showLegacyFlatSalary = settings.monthlyFlatSalary > 0;
  const showWorkingDaysPerMonth = settings.monthlyFlatSalary > 0;

  function handleAddJob() {
    const name = newJobName.trim();
    const rate = parseLocaleDecimal(newJobRate);
    const cadenceValue =
      newJobType === 'flat'
        ? Math.min(31, Math.max(1, parseFloat(newFlatDaysPerMonth) || 22))
        : Math.min(7, Math.max(1, parseFloat(newHourlyDaysPerWeek) || 5));

    if (!name) return;

    onAddJob(name, newJobType, rate, cadenceValue);
    setNewJobName('');
    setNewJobRate('');
    setNewHourlyDaysPerWeek('5');
    setNewFlatDaysPerMonth('22');
  }

  return (
    <div className="page work-settings-page">
      <div className="page__header work-settings-page__header">
        <div className="work-settings-page__title-wrap">
          <h1 className="page__title">Work Settings</h1>
          <p className="work-settings-page__subtitle">
            Save your jobs once, then add shifts faster from the Work page.
          </p>
        </div>
      </div>

      <div className="page__content work-settings-page__content">
        <section className="ws-jobs" aria-labelledby="ws-jobs-title">
          <div className="ws-jobs__head">
            <div className="ws-jobs__head-copy">
              <h2 id="ws-jobs-title" className="ws-jobs__title">Your Jobs</h2>
            </div>
            <span className="ws-jobs__count">{jobs.length} configured</span>
          </div>

          {jobs.length > 0 && (
            <div className="ws-jobs__list">
              {jobs.map((job) => {
                const isFlat = job.payType === 'flat';
                return (
                  <div key={job.id} className="ws-job-card">
                    <div className="ws-job-card__info">
                      <input
                        type="text"
                        value={job.name}
                        onChange={(e) => onUpdateJob(job.id, { name: e.target.value })}
                        className="ws-job-card__name"
                        aria-label="Job name"
                      />

                      <div className="ws-job-card__meta">
                        <span className={`ws-job-card__badge ws-job-card__badge--${job.payType}`}>
                          {job.payType}
                        </span>
                        <span className="ws-job-card__rate-summary">
                          {isFlat
                            ? `${settings.currency}${formatLocaleDecimal(job.rate) || '0'}/mo${job.daysPerMonth ? ` • ${job.daysPerMonth}d/mo` : ''}`
                            : `${settings.currency}${formatLocaleDecimal(job.rate) || '0'}/hr${job.daysPerWeek ? ` • ${job.daysPerWeek}d/wk` : ''}`}
                        </span>
                      </div>
                    </div>

                    <div className="ws-job-card__controls">
                      <div className="ws-job-card__type-toggle">
                        <button
                          type="button"
                          className={`ws-job-card__type-btn${job.payType === 'hourly' ? ' ws-job-card__type-btn--active' : ''}`}
                          onClick={() => onUpdateJob(job.id, { payType: 'hourly' })}
                        >
                          Hourly
                        </button>
                        <button
                          type="button"
                          className={`ws-job-card__type-btn${job.payType === 'flat' ? ' ws-job-card__type-btn--active' : ''}`}
                          onClick={() => onUpdateJob(job.id, { payType: 'flat' })}
                        >
                          Flat
                        </button>
                      </div>

                      <div className="ws-job-card__mini-field">
                        <span className="ws-job-card__mini-label">Rate</span>
                        <DecimalTextInput
                          value={job.rate}
                          onCommit={(next) => onUpdateJob(job.id, { rate: next })}
                          placeholder={isFlat ? `${settings.currency}/mo` : `${settings.currency}/hr`}
                          className="ws-job-card__rate-input"
                          ariaLabel="Rate"
                        />
                      </div>

                      <div className="ws-job-card__mini-field">
                        <span className="ws-job-card__mini-label">{isFlat ? 'Days/month' : 'Days/week'}</span>
                        <input
                          type="number"
                          min={1}
                          max={isFlat ? 31 : 7}
                          step={1}
                          value={isFlat ? (job.daysPerMonth ?? 22) : (job.daysPerWeek ?? 5)}
                          onChange={(e) =>
                            onUpdateJob(
                              job.id,
                              isFlat
                                ? { daysPerMonth: Math.min(31, Math.max(1, parseInt(e.target.value) || 1)) }
                                : { daysPerWeek: Math.min(7, Math.max(1, parseInt(e.target.value) || 1)) },
                            )
                          }
                          placeholder={isFlat ? 'days/mo' : 'days/wk'}
                          className="ws-job-card__days-input"
                          aria-label={isFlat ? 'Working days per month' : 'Working days per week'}
                        />
                      </div>

                      <button
                        type="button"
                        className="ws-job-card__remove"
                        onClick={() => onRemoveJob(job.id)}
                        title="Remove job"
                        aria-label={`Remove ${job.name || 'job'}`}
                      >
                        x
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="ws-jobs__add" aria-label="Add a new job">
            <div className="ws-jobs__add-head">
              <h3 className="ws-jobs__add-title">Add Job</h3>
            </div>

            <input
              type="text"
              value={newJobName}
              onChange={(e) => setNewJobName(e.target.value)}
              placeholder="Job name (e.g. Cafe, Office)"
              className="ws-jobs__add-name"
              onKeyDown={(e) => e.key === 'Enter' && handleAddJob()}
            />

            <div className="ws-jobs__add-type">
              <button
                type="button"
                className={`ws-jobs__type-btn${newJobType === 'hourly' ? ' ws-jobs__type-btn--active' : ''}`}
                onClick={() => setNewJobType('hourly')}
              >
                Hourly
              </button>
              <button
                type="button"
                className={`ws-jobs__type-btn${newJobType === 'flat' ? ' ws-jobs__type-btn--active' : ''}`}
                onClick={() => setNewJobType('flat')}
              >
                Flat
              </button>
            </div>

            <div className="ws-jobs__mini-field">
              <span className="ws-jobs__mini-label">Rate</span>
              <input
                type="text"
                inputMode="decimal"
                value={newJobRate}
                onChange={(e) => setNewJobRate(sanitizeDecimalDraft(e.target.value))}
                placeholder={newJobType === 'hourly' ? `${settings.currency}/hr` : `${settings.currency}/mo`}
                className="ws-jobs__add-rate"
                onKeyDown={(e) => e.key === 'Enter' && handleAddJob()}
                aria-label="Rate"
              />
            </div>

            <div className="ws-jobs__mini-field">
              <span className="ws-jobs__mini-label">{newJobType === 'flat' ? 'Days/month' : 'Days/week'}</span>
              <input
                type="number"
                min={1}
                max={newJobType === 'flat' ? 31 : 7}
                step={1}
                value={newJobType === 'flat' ? newFlatDaysPerMonth : newHourlyDaysPerWeek}
                onChange={(e) =>
                  newJobType === 'flat'
                    ? setNewFlatDaysPerMonth(e.target.value)
                    : setNewHourlyDaysPerWeek(e.target.value)
                }
                placeholder={newJobType === 'flat' ? 'days/mo' : 'days/wk'}
                className="ws-jobs__add-days"
                onKeyDown={(e) => e.key === 'Enter' && handleAddJob()}
                aria-label={newJobType === 'flat' ? 'Working days per month' : 'Working days per week'}
              />
            </div>

            <button
              type="button"
              className="ws-jobs__add-btn"
              onClick={handleAddJob}
              disabled={!newJobName.trim()}
            >
              Add Job
            </button>
          </div>

          <p className="ws-jobs__helper">
            Hourly jobs use <strong>days/week</strong>. Flat jobs use <strong>days/month</strong>.
          </p>

          {jobs.length === 0 && (
            <div className="ws-jobs__empty">
              <p className="ws-jobs__empty-title">No jobs configured yet</p>
              <p className="ws-jobs__empty-text">
                Add your first job to unlock quick shift creation in the Work page.
              </p>
            </div>
          )}
        </section>

        <div className="settings-form work-settings-page__form">
          <div className="work-settings-page__section-head">
            <h2 className="work-settings-page__section-title">General</h2>
            <p className="work-settings-page__section-text">Currency, day reset</p>
          </div>

          {hasJobs && (
            <p className="work-settings-page__legacy-note">
              Saved jobs now control hourly and flat pay. The old monthly salary field is only a fallback for manual flat shifts.
            </p>
          )}

          {showLegacyFlatSalary && (
            <div className="settings-form__group">
              <label className="settings-form__label" htmlFor="sf-salary">
                {hasJobs ? 'Fallback monthly salary (legacy)' : 'Monthly salary (flat shifts)'}
              </label>
              <DecimalTextInput
                value={settings.monthlyFlatSalary}
                onCommit={(next) => onUpdateSettings({ monthlyFlatSalary: next })}
                placeholder={`${settings.currency}`}
                className="field__input settings-form__input"
                ariaLabel="Monthly salary"
              />
              {settings.monthlyFlatSalary > 0 && (
                <p className="sidebar__setting-desc">
                  Daily: {settings.currency}{flatDailyPay.toFixed(2).replace('.', ',')} ({settings.workingDaysPerMonth} days/mo)
                </p>
              )}
            </div>
          )}

          {showWorkingDaysPerMonth && (
            <div className="settings-form__group">
              <label className="settings-form__label" htmlFor="sf-days">
                {hasJobs ? 'Working days / month (legacy fallback)' : 'Working days / month (flat jobs)'}
              </label>
              <input
                id="sf-days"
                type="number"
                min={1}
                max={31}
                value={settings.workingDaysPerMonth}
                onChange={(e) => {
                  const val = Math.min(31, Math.max(1, parseInt(e.target.value) || 1));
                  onUpdateSettings({ workingDaysPerMonth: val });
                }}
                className="field__input settings-form__input--sm"
              />
              <p className="sidebar__setting-desc">
                {hasJobs
                  ? 'Used only for older/manual flat shifts that do not use a saved flat job.'
                  : 'Used to convert flat monthly pay into daily pay. Hourly jobs ignore this.'}
              </p>
            </div>
          )}

          <div className="settings-form__group">
            <label className="settings-form__label" htmlFor="sf-reset">
              Day resets at
            </label>
            <div className="work-settings__reset-row">
              <Time24TextInput
                id="sf-reset"
                value={settings.dayResetHour}
                onCommit={(next) => onUpdateSettings({ dayResetHour: next })}
                className="field__input settings-form__input--sm work-settings__reset-time"
                ariaLabel="Day reset time (24-hour format)"
              />
              <span className="work-settings__reset-badge" aria-hidden="true">24h</span>
            </div>
            <p className="sidebar__setting-desc">Use 24-hour format (e.g. 09:00, 21:00). Example reset: 04:30.</p>
          </div>

          <div className="settings-form__group">
            <label className="settings-form__label" htmlFor="sf-currency">
              Currency symbol
            </label>
            <input
              id="sf-currency"
              type="text"
              maxLength={3}
              value={settings.currency}
              onChange={(e) => onUpdateSettings({ currency: e.target.value || '€' })}
              className="field__input settings-form__input--sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
