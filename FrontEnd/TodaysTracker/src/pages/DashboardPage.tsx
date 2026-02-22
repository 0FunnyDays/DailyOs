import { useState, useMemo, useCallback } from 'react';
import type { DayData, AppSettings, GymSession } from '../types';
import { calculateHours } from '../utils/dateUtils';
import { calculateDayTotals } from '../utils/payUtils';
import {
  getDateRangeBetween,
  computeDailyTotals,
  getChartData,
  todayStr,
  daysAgo,
  getEarliestDate,
} from '../utils/dashboardUtils';

import { DateRangePicker } from '../components/shared/DateRangePicker';
import type { DateRange, DateRangePreset } from '../components/shared/DateRangePicker';
import { StatCard } from '../components/shared/StatCard';
import { BarChart } from '../components/shared/BarChart';
import { BreakdownBar } from '../components/shared/BreakdownBar';
import '../styles/Dashboard.css';

type DashboardPageProps = {
  days: Record<string, DayData>;
  settings: AppSettings;
};

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

function presetToRange(preset: DateRangePreset, days: Record<string, DayData>): DateRange {
  const to = todayStr();
  switch (preset) {
    case '7d': return { from: daysAgo(7), to };
    case '30d': return { from: daysAgo(30), to };
    case '3m': return { from: daysAgo(90), to };
    case '1y': return { from: daysAgo(365), to };
    case 'all': return { from: getEarliestDate(days), to };
  }
}

// SVG Icons
const ClockIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);

const DollarIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const TipsIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z" />
  </svg>
);

const NetIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="20" x2="12" y2="4" /><polyline points="6 10 12 4 18 10" />
  </svg>
);

export function DashboardPage({ days, settings }: DashboardPageProps) {
  const flatDailyPay = settings.workingDaysPerMonth > 0
    ? settings.monthlyFlatSalary / settings.workingDaysPerMonth
    : 0;

  const [activePreset, setActivePreset] = useState<DateRangePreset | null>('7d');
  const [dateRange, setDateRange] = useState<DateRange>(() => presetToRange('7d', days));

  const handlePresetChange = useCallback((preset: DateRangePreset) => {
    setActivePreset(preset);
    setDateRange(presetToRange(preset, days));
  }, [days]);

  const handleCustomRange = useCallback((range: DateRange) => {
    setActivePreset(null);
    setDateRange(range);
  }, []);

  const cur = settings.currency;

  // Computed data
  const dateKeys = useMemo(() => getDateRangeBetween(dateRange.from, dateRange.to), [dateRange]);
  const stats = useMemo(() => computeStats(days, dateKeys, flatDailyPay), [days, dateKeys, flatDailyPay]);
  const dailyTotals = useMemo(() => computeDailyTotals(days, dateKeys, flatDailyPay), [days, dateKeys, flatDailyPay]);
  const chartData = useMemo(() => getChartData(dailyTotals, cur), [dailyTotals, cur]);

  const breakdownSegments = useMemo(() => [
    { label: 'Pay', value: stats.totalGross, color: 'var(--clr-green)' },
    { label: 'Tips', value: stats.totalTips, color: 'var(--clr-yellow)' },
    { label: 'Expenses', value: stats.totalExpenses, color: 'var(--clr-red)' },
  ], [stats]);

  return (
    <div className="dashboard">
      <h2 className="dashboard__title">Dashboard</h2>

      <DateRangePicker
        value={dateRange}
        onChange={handleCustomRange}
        activePreset={activePreset}
        onPresetChange={handlePresetChange}
      />

      {/* Summary cards */}
      <section>
        <h3 className="dashboard__section-title">Summary</h3>
        <div className="dashboard__cards">
          <StatCard
            icon={ClockIcon}
            label="Hours Worked"
            value={`${stats.totalHours}h`}
            variant="blue"
          />
          <StatCard
            icon={DollarIcon}
            label="Gross Pay"
            value={`${cur}${stats.totalGross.toFixed(2)}`}
            variant="green"
          />
          <StatCard
            icon={TipsIcon}
            label="Tips"
            value={`${cur}${stats.totalTips.toFixed(2)}`}
            variant="amber"
          />
          <StatCard
            icon={NetIcon}
            label="Net Earnings"
            value={`${cur}${stats.netEarnings.toFixed(2)}`}
            variant="accent"
          />
        </div>
      </section>

      {/* Earnings chart */}
      <section>
        <h3 className="dashboard__section-title">Earnings Over Time</h3>
        <div className="dashboard__chart-card">
          <BarChart data={chartData} />
        </div>
      </section>

      {/* Breakdown */}
      <section>
        <h3 className="dashboard__section-title">Breakdown</h3>
        <div className="dashboard__breakdown-card">
          <BreakdownBar segments={breakdownSegments} currency={cur} />
        </div>
      </section>
    </div>
  );
}
