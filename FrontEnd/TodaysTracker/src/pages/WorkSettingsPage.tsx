import type { AppSettings } from '../types';

type WorkSettingsPageProps = {
  settings: AppSettings;
  onUpdateSettings: (updates: Partial<AppSettings>) => void;
};

export function WorkSettingsPage({ settings, onUpdateSettings }: WorkSettingsPageProps) {
  const flatDailyPay = settings.workingDaysPerMonth > 0
    ? settings.monthlyFlatSalary / settings.workingDaysPerMonth
    : 0;

  return (
    <div className="page">
      <div className="page__header">
        <h1 className="page__title">Work Settings</h1>
      </div>

      <div className="page__content">
        <div className="settings-form">

          <div className="settings-form__group">
            <label className="settings-form__label" htmlFor="sf-salary">
              Monthly salary (flat shifts)
            </label>
            <input
              id="sf-salary"
              type="number"
              min={0}
              step={10}
              value={settings.monthlyFlatSalary}
              onChange={(e) => onUpdateSettings({ monthlyFlatSalary: parseFloat(e.target.value) || 0 })}
              className="field__input settings-form__input"
            />
            {settings.monthlyFlatSalary > 0 && (
              <p className="sidebar__setting-desc">
                Daily: {settings.currency}{flatDailyPay.toFixed(2)} ({settings.workingDaysPerMonth} days/mo)
              </p>
            )}
          </div>

          <div className="settings-form__group">
            <label className="settings-form__label" htmlFor="sf-days">
              Working days / month
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
          </div>

          <div className="settings-form__group">
            <label className="settings-form__label" htmlFor="sf-reset">
              Day resets at
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input
                id="sf-reset"
                type="number"
                min={0}
                max={23}
                value={settings.dayResetHour}
                onChange={(e) => {
                  const val = Math.min(23, Math.max(0, parseInt(e.target.value) || 0));
                  onUpdateSettings({ dayResetHour: val });
                }}
                className="field__input settings-form__input--sm"
              />
              <span style={{ color: 'var(--clr-text-muted)', fontSize: '13px' }}>:00</span>
            </div>
            <p className="sidebar__setting-desc">New day starts at this hour (default 4 AM)</p>
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
