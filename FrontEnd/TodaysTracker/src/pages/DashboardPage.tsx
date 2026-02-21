import { useMemo } from 'react';
import type { DayData, AppSettings } from '../types';
import { calculateHours } from '../utils/dateUtils';
import { calculateDayTotals } from '../utils/payUtils';

type DashboardPageProps = {
  days: Record<string, DayData>;
  settings: AppSettings;
};

function getDateRange(daysBack: number): string[] {
  const dates: string[] = [];
  const now = new Date();
  for (let i = 0; i < daysBack; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    dates.push(`${y}-${m}-${day}`);
  }
  return dates;
}

function computeStats(days: Record<string, DayData>, dateKeys: string[], flatDailyPay: number) {
  let totalHours = 0;
  let totalGross = 0;
  let totalTips = 0;
  let totalExpenses = 0;
  let daysWorked = 0;

  for (const key of dateKeys) {
    const day = days[key];
    if (!day || day.shifts.length === 0) continue;
    daysWorked++;

    for (const s of day.shifts) {
      if (s.startTime && s.endTime) {
        totalHours += calculateHours(s.startTime, s.endTime);
      }
    }

    const totals = calculateDayTotals(day, flatDailyPay);
    totalGross += totals.grossPay;
    totalTips += totals.totalTips;
    totalExpenses += totals.totalExpenses;
  }

  return {
    totalHours: Math.round(totalHours * 10) / 10,
    totalGross: Math.round(totalGross * 100) / 100,
    totalTips: Math.round(totalTips * 100) / 100,
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    netEarnings: Math.round((totalGross + totalTips - totalExpenses) * 100) / 100,
    daysWorked,
  };
}

export function DashboardPage({ days, settings }: DashboardPageProps) {
  const flatDailyPay = settings.workingDaysPerMonth > 0
    ? settings.monthlyFlatSalary / settings.workingDaysPerMonth
    : 0;

  const weekDates = useMemo(() => getDateRange(7), []);
  const monthDates = useMemo(() => getDateRange(30), []);

  const weekStats = useMemo(() => computeStats(days, weekDates, flatDailyPay), [days, weekDates, flatDailyPay]);
  const monthStats = useMemo(() => computeStats(days, monthDates, flatDailyPay), [days, monthDates, flatDailyPay]);

  const cur = settings.currency;

  return (
    <div className="dashboard">
      <h2 className="dashboard__title">Dashboard</h2>

      {/* Weekly stats */}
      <h3 className="dashboard__section-title">Last 7 days</h3>
      <div className="dashboard__cards">
        <StatCard label="Hours Worked" value={`${weekStats.totalHours}h`} variant="blue" />
        <StatCard label="Gross Pay" value={`${cur}${weekStats.totalGross.toFixed(2)}`} variant="green" />
        <StatCard label="Tips" value={`${cur}${weekStats.totalTips.toFixed(2)}`} variant="amber" />
        <StatCard label="Expenses" value={`${cur}${weekStats.totalExpenses.toFixed(2)}`} variant="red" />
        <StatCard label="Net Earnings" value={`${cur}${weekStats.netEarnings.toFixed(2)}`} variant="accent" />
        <StatCard label="Days Worked" value={`${weekStats.daysWorked}`} variant="purple" />
      </div>

      {/* Monthly stats */}
      <h3 className="dashboard__section-title">Last 30 days</h3>
      <div className="dashboard__cards">
        <StatCard label="Hours Worked" value={`${monthStats.totalHours}h`} variant="blue" />
        <StatCard label="Gross Pay" value={`${cur}${monthStats.totalGross.toFixed(2)}`} variant="green" />
        <StatCard label="Tips" value={`${cur}${monthStats.totalTips.toFixed(2)}`} variant="amber" />
        <StatCard label="Expenses" value={`${cur}${monthStats.totalExpenses.toFixed(2)}`} variant="red" />
        <StatCard label="Net Earnings" value={`${cur}${monthStats.netEarnings.toFixed(2)}`} variant="accent" />
        <StatCard label="Days Worked" value={`${monthStats.daysWorked}`} variant="purple" />
      </div>
    </div>
  );
}

type StatCardProps = {
  label: string;
  value: string;
  variant: 'blue' | 'green' | 'amber' | 'red' | 'accent' | 'purple';
};

function StatCard({ label, value, variant }: StatCardProps) {
  return (
    <div className={`stat-card stat-card--${variant}`}>
      <span className="stat-card__label">{label}</span>
      <span className="stat-card__value">{value}</span>
    </div>
  );
}
