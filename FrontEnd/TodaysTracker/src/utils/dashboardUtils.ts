import type { DayData, DayTotals } from '../types';
import { calculateDayTotals } from './payUtils';

export type ChartDataPoint = {
  label: string;
  value: number;
  tooltip: string;
};

/** Generate array of YYYY-MM-DD strings between from and to (inclusive) */
export function getDateRangeBetween(from: string, to: string): string[] {
  const dates: string[] = [];
  const start = new Date(from + 'T00:00:00');
  const end = new Date(to + 'T00:00:00');

  const d = new Date(start);
  while (d <= end) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    dates.push(`${y}-${m}-${day}`);
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

/** Get YYYY-MM-DD for today */
export function todayStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Get YYYY-MM-DD for N days ago */
export function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - (n - 1));
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Compute per-day totals for a date range */
export function computeDailyTotals(
  days: Record<string, DayData>,
  dateKeys: string[],
  flatDailyPay: number,
): { date: string; totals: DayTotals }[] {
  return dateKeys.map((date) => {
    const day = days[date];
    if (!day || (day.shifts.length === 0 && day.expenses.length === 0)) {
      return { date, totals: { grossPay: 0, totalTips: 0, totalExpenses: 0, netEarnings: 0 } };
    }
    return { date, totals: calculateDayTotals(day, flatDailyPay) };
  });
}

/** Format a short date label like "Feb 15" */
function shortDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** Get ISO week start (Monday) for a date */
function weekStart(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
  d.setDate(diff);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

/** Group daily totals by week */
function groupByWeek(
  dailyTotals: { date: string; totals: DayTotals }[],
  currency: string,
): ChartDataPoint[] {
  const weeks = new Map<string, number>();

  for (const { date, totals } of dailyTotals) {
    const wk = weekStart(date);
    weeks.set(wk, (weeks.get(wk) ?? 0) + totals.netEarnings);
  }

  return Array.from(weeks.entries()).map(([wk, value]) => {
    const end = new Date(wk + 'T00:00:00');
    end.setDate(end.getDate() + 6);
    const label = `${shortDate(wk)}`;
    return {
      label,
      value: Math.round(value * 100) / 100,
      tooltip: `${shortDate(wk)} – ${shortDate(end.toISOString().slice(0, 10))}: ${currency}${value.toFixed(2)}`,
    };
  });
}

/** Group daily totals by month */
function groupByMonth(
  dailyTotals: { date: string; totals: DayTotals }[],
  currency: string,
): ChartDataPoint[] {
  const months = new Map<string, number>();

  for (const { date, totals } of dailyTotals) {
    const key = date.slice(0, 7); // YYYY-MM
    months.set(key, (months.get(key) ?? 0) + totals.netEarnings);
  }

  return Array.from(months.entries()).map(([key, value]) => {
    const d = new Date(key + '-01T00:00:00');
    const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    return {
      label,
      value: Math.round(value * 100) / 100,
      tooltip: `${label}: ${currency}${value.toFixed(2)}`,
    };
  });
}

/**
 * Choose the right grouping based on range length and return chart data.
 * ≤ 30 days: daily
 * 31–90 days: weekly
 * > 90 days: monthly
 */
export function getChartData(
  dailyTotals: { date: string; totals: DayTotals }[],
  currency: string,
): ChartDataPoint[] {
  const len = dailyTotals.length;

  if (len <= 30) {
    return dailyTotals.map(({ date, totals }) => ({
      label: shortDate(date),
      value: Math.round(totals.netEarnings * 100) / 100,
      tooltip: `${shortDate(date)}: ${currency}${totals.netEarnings.toFixed(2)}`,
    }));
  }

  if (len <= 90) {
    return groupByWeek(dailyTotals, currency);
  }

  return groupByMonth(dailyTotals, currency);
}

/** Get the earliest date key from days record, or fallback */
export function getEarliestDate(days: Record<string, DayData>): string {
  const keys = Object.keys(days).sort();
  return keys[0] ?? todayStr();
}
