import type { DayData, AppSettings, Shift, Expense } from '../../types';
import { ShiftSection } from '../ShiftSection/ShiftSection';
import { ExpenseSection } from '../ExpenseSection/ExpenseSection';
import { DaySummary } from '../DaySummary/DaySummary';
import { DayNote } from '../DayNote/DayNote';

type DayViewProps = {
  day: DayData;
  settings: AppSettings;
  onAddShift: () => void;
  onUpdateShift: (shiftId: string, updates: Partial<Shift>) => void;
  onRemoveShift: (shiftId: string) => void;
  onAddExpense: () => void;
  onUpdateExpense: (expenseId: string, updates: Partial<Expense>) => void;
  onRemoveExpense: (expenseId: string) => void;
  onUpdateNote: (note: string) => void;
};

export function DayView({
  day,
  settings,
  onAddShift,
  onUpdateShift,
  onRemoveShift,
  onAddExpense,
  onUpdateExpense,
  onRemoveExpense,
  onUpdateNote,
}: DayViewProps) {
  const flatDailyPay = settings.workingDaysPerMonth > 0
    ? settings.monthlyFlatSalary / settings.workingDaysPerMonth
    : 0;

  return (
    <div className="day-view">
      <ShiftSection
        shifts={day.shifts}
        currency={settings.currency}
        flatDailyPay={flatDailyPay}
        onAdd={onAddShift}
        onUpdate={onUpdateShift}
        onRemove={onRemoveShift}
      />

      <div className="day-view__divider" />

      <ExpenseSection
        expenses={day.expenses}
        currency={settings.currency}
        onAdd={onAddExpense}
        onUpdate={onUpdateExpense}
        onRemove={onRemoveExpense}
      />

      <div className="day-view__divider" />

      <DayNote note={day.note ?? ''} onUpdate={onUpdateNote} />

      <div className="day-view__divider" />

      <DaySummary day={day} currency={settings.currency} flatDailyPay={flatDailyPay} />
    </div>
  );
}
