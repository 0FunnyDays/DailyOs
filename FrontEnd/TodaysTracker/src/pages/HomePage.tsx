import type { Page, Session, DayData, AppSettings } from "../types";
import { formatDateDisplay } from "../utils/dateUtils";
import { calculateDayTotals } from "../utils/payUtils";

type HomePageProps = {
  session: Session;
  currentDay: DayData;
  settings: AppSettings;
  onNavigate: (page: Page) => void;
};

export function HomePage({ session, currentDay, settings, onNavigate }: HomePageProps) {
  const flatDailyPay = settings.monthlyFlatSalary / (settings.workingDaysPerMonth || 22);
  const totals = calculateDayTotals(currentDay, flatDailyPay);
  const hasShifts = currentDay.shifts.length > 0;
  const hasExpenses = currentDay.expenses.length > 0;

  return (
    <div className="home">
      {/* Greeting */}
      <div className="home__hero">
        <h1 className="home__greeting">
          Welcome back, <span className="home__username">{session.username}</span>
        </h1>
        <p className="home__date">{formatDateDisplay(currentDay.date)}</p>
      </div>

      {/* Today's summary */}
      <section className="home__summary">
        <h2 className="home__section-title">Today</h2>
        <div className="home__stats">
          <div className="home__stat">
            <span className="home__stat-value">{settings.currency}{totals.grossPay.toFixed(2)}</span>
            <span className="home__stat-label">Earnings</span>
          </div>
          <div className="home__stat">
            <span className="home__stat-value">{settings.currency}{totals.totalTips.toFixed(2)}</span>
            <span className="home__stat-label">Tips</span>
          </div>
          <div className="home__stat">
            <span className="home__stat-value">{settings.currency}{totals.totalExpenses.toFixed(2)}</span>
            <span className="home__stat-label">Expenses</span>
          </div>
          <div className="home__stat home__stat--accent">
            <span className="home__stat-value">{settings.currency}{totals.netEarnings.toFixed(2)}</span>
            <span className="home__stat-label">Net</span>
          </div>
        </div>
        {!hasShifts && !hasExpenses && (
          <p className="home__empty">No shifts or expenses logged yet today.</p>
        )}
      </section>

      {/* Quick access */}
      <section>
        <h2 className="home__section-title">Quick access</h2>
        <div className="home__cards">
          <button type="button" className="home__card" onClick={() => onNavigate("today")}>
            <div className="home__card-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div className="home__card-text">
              <span className="home__card-title">Work</span>
              <span className="home__card-desc">Log shifts, tips & expenses</span>
            </div>
            <span className="home__card-arrow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </span>
          </button>

          <button type="button" className="home__card" onClick={() => onNavigate("dashboard")}>
            <div className="home__card-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
                <line x1="2" y1="20" x2="22" y2="20" />
              </svg>
            </div>
            <div className="home__card-text">
              <span className="home__card-title">Dashboard</span>
              <span className="home__card-desc">Weekly & monthly stats</span>
            </div>
            <span className="home__card-arrow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </span>
          </button>

          <button type="button" className="home__card" onClick={() => onNavigate("gym")}>
            <div className="home__card-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6.5 6.5h11" />
                <path d="M6.5 17.5h11" />
                <path d="M3 9.5v5" />
                <path d="M21 9.5v5" />
                <path d="M1 11v2" />
                <path d="M23 11v2" />
              </svg>
            </div>
            <div className="home__card-text">
              <span className="home__card-title">Gym</span>
              <span className="home__card-desc">Log your workout</span>
            </div>
            <span className="home__card-arrow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </span>
          </button>

          <button type="button" className="home__card" onClick={() => onNavigate("settings")}>
            <div className="home__card-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </div>
            <div className="home__card-text">
              <span className="home__card-title">Settings</span>
              <span className="home__card-desc">Work, gym & app preferences</span>
            </div>
            <span className="home__card-arrow">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </span>
          </button>
        </div>
      </section>
    </div>
  );
}
