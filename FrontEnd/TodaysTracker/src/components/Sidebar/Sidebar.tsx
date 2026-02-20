import type { DayData, AppSettings } from '../../types';
import { calculateDayTotals } from '../../utils/payUtils';
import { calculateHours } from '../../utils/dateUtils';

type SidebarProps = {
  isOpen: boolean;
  onToggle: () => void;
  currentDay: DayData;
  settings: AppSettings;
  onUpdateSettings: (updates: Partial<AppSettings>) => void;
};

function formatHours(totalHours: number): string {
  const h = Math.floor(totalHours);
  const m = Math.round((totalHours - h) * 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function Sidebar({ isOpen, onToggle, currentDay, settings, onUpdateSettings }: SidebarProps) {
  const flatDailyPay = settings.workingDaysPerMonth > 0
    ? settings.monthlyFlatSalary / settings.workingDaysPerMonth
    : 0;

  const totals = calculateDayTotals(currentDay, flatDailyPay);
  const totalHours = currentDay.shifts
    .filter((s) => s.startTime && s.endTime)
    .reduce((sum, s) => sum + calculateHours(s.startTime, s.endTime), 0);

  const collapsed = !isOpen;

  return (
    <aside className={`sidebar${collapsed ? ' sidebar--collapsed' : ''}`}>
      {/* Header */}
      <div className="sidebar__header">
        {isOpen && <span className="sidebar__logo">TodaysTracker</span>}
        <button className="sidebar__toggle" onClick={onToggle} title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}>
          {isOpen ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          )}
        </button>
      </div>

      {/* Scrollable body */}
      <div className="sidebar__body">
        {/* Navigation */}
        <nav className="sidebar__nav">
          <div className="sidebar__nav-item sidebar__nav-item--active">
            <span className="sidebar__nav-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </span>
            {isOpen && <span className="sidebar__nav-label">Today</span>}
          </div>

          <div className="sidebar__nav-item sidebar__nav-item--disabled" title="Coming soon">
            <span className="sidebar__nav-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
                <line x1="2" y1="20" x2="22" y2="20" />
              </svg>
            </span>
            {isOpen && <span className="sidebar__nav-label">Dashboard</span>}
            {isOpen && <span className="sidebar__nav-badge">Soon</span>}
          </div>
        </nav>

        {/* Stats — only when expanded */}
        {isOpen && (
          <>
            <div className="sidebar__divider" />
            <div className="sidebar__section">
              <p className="sidebar__section-title">Today</p>
              <div className="sidebar__stats">
                <div className="sidebar__stat-row">
                  <span className="sidebar__stat-label">Hours worked</span>
                  <span className="sidebar__stat-value">
                    {totalHours > 0 ? formatHours(totalHours) : '—'}
                  </span>
                </div>
                <div className="sidebar__stat-row">
                  <span className="sidebar__stat-label">Earnings</span>
                  <span className="sidebar__stat-value sidebar__stat-value--green">
                    {settings.currency}{(totals.grossPay + totals.totalTips).toFixed(2)}
                  </span>
                </div>
                <div className="sidebar__stat-row">
                  <span className="sidebar__stat-label">Expenses</span>
                  <span className="sidebar__stat-value sidebar__stat-value--red">
                    {settings.currency}{totals.totalExpenses.toFixed(2)}
                  </span>
                </div>
                <div className="sidebar__stat-row">
                  <span className="sidebar__stat-label">Net</span>
                  <span className={`sidebar__stat-value${totals.netEarnings >= 0 ? ' sidebar__stat-value--green' : ' sidebar__stat-value--red'}`}>
                    {settings.currency}{totals.netEarnings.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Settings — only when expanded */}
        {isOpen && (
          <>
            <div className="sidebar__divider" />
            <div className="sidebar__section">
              <p className="sidebar__section-title">Settings</p>
              <div className="sidebar__settings">

                <label className="sidebar__setting">
                  <span className="sidebar__setting-label">Monthly salary (flat)</span>
                  <input
                    type="number"
                    min={0}
                    step={10}
                    value={settings.monthlyFlatSalary}
                    onChange={(e) => onUpdateSettings({ monthlyFlatSalary: parseFloat(e.target.value) || 0 })}
                    className="sidebar__input sidebar__input--medium"
                  />
                  {settings.monthlyFlatSalary > 0 && (
                    <span className="sidebar__setting-desc">
                      Daily: {settings.currency}{flatDailyPay.toFixed(2)} ({settings.workingDaysPerMonth} days/mo)
                    </span>
                  )}
                </label>

                <label className="sidebar__setting">
                  <span className="sidebar__setting-label">Working days / month</span>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={settings.workingDaysPerMonth}
                    onChange={(e) => {
                      const val = Math.min(31, Math.max(1, parseInt(e.target.value) || 1));
                      onUpdateSettings({ workingDaysPerMonth: val });
                    }}
                    className="sidebar__input sidebar__input--small"
                  />
                </label>

                <label className="sidebar__setting">
                  <span className="sidebar__setting-label">Day resets at</span>
                  <div className="sidebar__setting-row">
                    <input
                      type="number"
                      min={0}
                      max={23}
                      value={settings.dayResetHour}
                      onChange={(e) => {
                        const val = Math.min(23, Math.max(0, parseInt(e.target.value) || 0));
                        onUpdateSettings({ dayResetHour: val });
                      }}
                      className="sidebar__input sidebar__input--small"
                    />
                    <span className="sidebar__setting-hint">:00</span>
                  </div>
                  <span className="sidebar__setting-desc">
                    New day starts at this hour (default 4 AM)
                  </span>
                </label>

                <label className="sidebar__setting">
                  <span className="sidebar__setting-label">Currency symbol</span>
                  <input
                    type="text"
                    maxLength={3}
                    value={settings.currency}
                    onChange={(e) => onUpdateSettings({ currency: e.target.value || '€' })}
                    className="sidebar__input sidebar__input--small"
                  />
                </label>

              </div>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
