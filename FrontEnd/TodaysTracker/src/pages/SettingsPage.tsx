import type { Page } from '../types';

type SettingsPageProps = {
  onNavigate: (page: Page) => void;
};

export function SettingsPage({ onNavigate }: SettingsPageProps) {
  return (
    <div className="page">
      <div className="page__header">
        <h1 className="page__title">Settings</h1>
      </div>

      <div className="page__content">
        <div className="settings-hub">

          <button className="settings-hub__card" onClick={() => onNavigate('settings-work')}>
            <span className="settings-hub__icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
              </svg>
            </span>
            <span className="settings-hub__text">
              <span className="settings-hub__title">Work Settings</span>
              <span className="settings-hub__desc">Salary, hours, currency, theme</span>
            </span>
            <span className="settings-hub__arrow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </span>
          </button>

          <button className="settings-hub__card" onClick={() => onNavigate('settings-gym')}>
            <span className="settings-hub__icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6.5 6.5h11" />
                <path d="M6.5 17.5h11" />
                <path d="M3 9.5v5" />
                <path d="M21 9.5v5" />
                <path d="M1 11v2" />
                <path d="M23 11v2" />
              </svg>
            </span>
            <span className="settings-hub__text">
              <span className="settings-hub__title">Gym Settings</span>
              <span className="settings-hub__desc">Program, days, exercises</span>
            </span>
            <span className="settings-hub__arrow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </span>
          </button>

        </div>
      </div>
    </div>
  );
}
