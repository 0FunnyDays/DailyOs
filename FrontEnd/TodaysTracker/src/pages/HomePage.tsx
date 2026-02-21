import type { Page, Session, DayData, AppSettings } from '../types';
import { calculateDayTotals } from '../utils/payUtils';
import { calculateHours } from '../utils/dateUtils';

type HomePageProps = {
  session: Session;
  currentDay: DayData;
  settings: AppSettings;
  onNavigate: (page: Page) => void;
};

export function HomePage({ session, currentDay, settings, onNavigate }: HomePageProps) {
  const flatDailyPay = settings.workingDaysPerMonth > 0
    ? settings.monthlyFlatSalary / settings.workingDaysPerMonth
    : 0;

  const totals = calculateDayTotals(currentDay, flatDailyPay);
  const totalHours = currentDay.shifts.reduce((sum, s) => {
    if (s.startTime && s.endTime) return sum + calculateHours(s.startTime, s.endTime);
    return sum;
  }, 0);

  return (
    <div className="home">
      <h1 className="home__greeting">
        Welcome back, <span className="home__username">{session.username}</span>
      </h1>
      <p className="home__date">{currentDay.date}</p>

      {/* Today's quick stats */}
      <div className="home__stats">
        <div className="home__stat">
          <span className="home__stat-value">{Math.round(totalHours * 10) / 10}h</span>
          <span className="home__stat-label">Hours today</span>
        </div>
        <div className="home__stat">
          <span className="home__stat-value">{settings.currency}{totals.netEarnings.toFixed(2)}</span>
          <span className="home__stat-label">Net earnings</span>
        </div>
        <div className="home__stat">
          <span className="home__stat-value">{currentDay.shifts.length}</span>
          <span className="home__stat-label">Shifts</span>
        </div>
      </div>

      {/* Quick access cards */}
      <h2 className="home__section-title">Quick access</h2>
      <div className="home__cards">
        <button className="home__card" onClick={() => onNavigate('today')}>
          <div className="home__card-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="home__card-text">
            <span className="home__card-title">Work</span>
            <span className="home__card-desc">Log shifts, tips & expenses</span>
          </div>
          <span className="home__card-arrow">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
          </span>
        </button>

        <button className="home__card" onClick={() => onNavigate('dashboard')}>
          <div className="home__card-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /><line x1="2" y1="20" x2="22" y2="20" />
            </svg>
          </div>
          <div className="home__card-text">
            <span className="home__card-title">Dashboard</span>
            <span className="home__card-desc">Weekly & monthly stats</span>
          </div>
          <span className="home__card-arrow">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
          </span>
        </button>

        <button className="home__card" onClick={() => onNavigate('gym')}>
          <div className="home__card-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6.5 6.5h11" /><path d="M6.5 17.5h11" /><path d="M3 9.5v5" /><path d="M21 9.5v5" /><path d="M1 11v2" /><path d="M23 11v2" />
            </svg>
          </div>
          <div className="home__card-text">
            <span className="home__card-title">Gym</span>
            <span className="home__card-desc">Log your workout</span>
          </div>
          <span className="home__card-arrow">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
          </span>
        </button>

        <button className="home__card" onClick={() => onNavigate('settings')}>
          <div className="home__card-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </div>
          <div className="home__card-text">
            <span className="home__card-title">Settings</span>
            <span className="home__card-desc">Work, gym & app preferences</span>
          </div>
          <span className="home__card-arrow">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
          </span>
        </button>
      </div>
    </div>
  );
}
