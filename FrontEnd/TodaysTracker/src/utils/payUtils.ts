import type { Shift, DayData, DayTotals } from '../types';
import { calculateHours } from './dateUtils';

/**
 * Calculate pay for a single shift.
 * - flat:   returns the pre-computed daily flat pay (monthly salary / working days)
 * - hourly: returns hours worked × hourly rate
 */
export function calculateShiftPay(shift: Shift, flatDailyPay: number): number {
  if (shift.payType === 'flat') {
    return flatDailyPay;
  }
  if (!shift.startTime || !shift.endTime) return 0;
  const hours = calculateHours(shift.startTime, shift.endTime);
  return hours * shift.payAmount;
}

export function calculateDayTotals(day: DayData, flatDailyPay: number): DayTotals {
  const grossPay = day.shifts.reduce((sum, s) => sum + calculateShiftPay(s, flatDailyPay), 0);
  const totalTips = day.shifts.reduce((sum, s) => sum + (s.tips || 0), 0);
  const totalExpenses = day.expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const netEarnings = grossPay + totalTips - totalExpenses;
  return { grossPay, totalTips, totalExpenses, netEarnings };
}
