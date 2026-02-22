import { useState, useEffect, useRef } from 'react';
import type { ChangeEvent } from 'react';
import type { DayData, AppSettings, Shift, Expense } from '../../types';
import { calculateShiftPay, calculateDayTotals } from '../../utils/payUtils';
import { calculateHours } from '../../utils/dateUtils';
import '../../styles/DayView.css';

// ── Helpers ────────────────────────────────────────────────────────────────

function formatDuration(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function isValidTime(s: string): boolean {
  if (!/^\d{2}:\d{2}$/.test(s)) return false;
  const [h, m] = s.split(':').map(Number);
  return h >= 0 && h <= 23 && m >= 0 && m <= 59;
}

// ── TimeInput ──────────────────────────────────────────────────────────────

function TimeInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [raw, setRaw] = useState(value);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, '');
    let v: string;
    if (digits.length <= 2) {
      v = digits;
    } else {
      v = digits.slice(0, 2) + ':' + digits.slice(2, 4);
    }
    setRaw(v);
    if (isValidTime(v)) onChange(v);
  }

  function handleBlur() {
    if (raw !== '' && !isValidTime(raw)) {
      setRaw('');
      onChange('');
    }
  }

  return (
    <label className="dv-field">
      <span className="dv-field__label">{label}</span>
      <input
        type="text"
        value={raw}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="HH:MM"
        maxLength={5}
        className="dv-field__input dv-field__input--time"
      />
    </label>
  );
}

// ── NumberInput ─────────────────────────────────────────────────────────────

function NumberInput({ label, value, onChange, placeholder, min, step }: {
  label: string; value: string | number; onChange: (v: string) => void;
  placeholder?: string; min?: number; step?: number;
}) {
  return (
    <label className="dv-field">
      <span className="dv-field__label">{label}</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        min={min}
        step={step}
        className="dv-field__input"
      />
    </label>
  );
}

// ── ShiftCard ──────────────────────────────────────────────────────────────

function ShiftCard({ shift, currency, flatDailyPay, onUpdate, onRemove }: {
  shift: Shift; currency: string; flatDailyPay: number;
  onUpdate: (updates: Partial<Shift>) => void; onRemove: () => void;
}) {
  const [showTips, setShowTips] = useState(shift.tips > 0);

  const bothTimesSet = shift.startTime !== '' && shift.endTime !== '';
  const hours = bothTimesSet ? calculateHours(shift.startTime, shift.endTime) : null;

  const pay: number | null = shift.payType === 'flat'
    ? flatDailyPay
    : (bothTimesSet ? calculateShiftPay(shift, flatDailyPay) : null);

  function handleToggleTips() {
    if (showTips) {
      setShowTips(false);
      onUpdate({ tips: 0 });
    } else {
      setShowTips(true);
    }
  }

  return (
    <div className="dv-shift">
      {/* Time row */}
      <div className="dv-shift__time-row">
        <TimeInput label="Start" value={shift.startTime} onChange={(v) => onUpdate({ startTime: v })} />
        <TimeInput label="End" value={shift.endTime} onChange={(v) => onUpdate({ endTime: v })} />
        {bothTimesSet && hours !== null && (
          <div className="dv-shift__duration">
            <span className="dv-shift__duration-label">Duration</span>
            <span className="dv-shift__duration-value">{formatDuration(hours)}</span>
          </div>
        )}
      </div>

      {/* Pay row */}
      <div className="dv-shift__pay-row">
        <label className="dv-field">
          <span className="dv-field__label">Pay type</span>
          <select
            value={shift.payType}
            onChange={(e) => onUpdate({ payType: e.target.value as 'flat' | 'hourly' })}
            className="dv-field__select"
          >
            <option value="hourly">Hourly</option>
            <option value="flat">Flat</option>
          </select>
        </label>

        {shift.payType === 'flat' ? (
          <div className="dv-shift__flat-info">
            <span className="dv-shift__flat-label">Daily pay</span>
            <span className="dv-shift__flat-value">{currency}{flatDailyPay.toFixed(2)}</span>
          </div>
        ) : (
          <NumberInput
            label={`Rate (${currency}/hr)`}
            value={shift.payAmount === 0 ? '' : shift.payAmount}
            min={0}
            step={0.5}
            placeholder="0"
            onChange={(v) => onUpdate({ payAmount: parseFloat(v) || 0 })}
          />
        )}
      </div>

      {/* Tips */}
      <div className="dv-shift__tips-area">
        {!showTips ? (
          <button type="button" className="dv-btn dv-btn--ghost" onClick={handleToggleTips}>+ Had tips?</button>
        ) : (
          <div className="dv-shift__tips-row">
            <NumberInput
              label={`Tips (${currency})`}
              value={shift.tips === 0 ? '' : shift.tips}
              min={0}
              step={0.5}
              placeholder="0"
              onChange={(v) => onUpdate({ tips: parseFloat(v) || 0 })}
            />
            <button type="button" className="dv-btn dv-btn--ghost dv-shift__remove-tips" onClick={handleToggleTips} title="Remove tips">✕</button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="dv-shift__footer">
        {pay !== null ? (
          <div className="dv-shift__computed">
            <span className="dv-shift__computed-item">
              Pay: <span className="dv-shift__val--green">{currency}{pay.toFixed(2)}</span>
            </span>
            {shift.tips > 0 && (
              <span className="dv-shift__computed-item">
                Tips: <span className="dv-shift__val--yellow">{currency}{shift.tips.toFixed(2)}</span>
              </span>
            )}
          </div>
        ) : (
          <span className="dv-shift__hint">Set start and end time</span>
        )}
        <button type="button" className="dv-btn dv-btn--danger" onClick={onRemove}>Remove</button>
      </div>
    </div>
  );
}

// ── ExpenseRow ─────────────────────────────────────────────────────────────

function ExpenseRow({ expense, currency, onUpdate, onRemove }: {
  expense: Expense; currency: string;
  onUpdate: (updates: Partial<Expense>) => void; onRemove: () => void;
}) {
  return (
    <div className="dv-expense">
      <div className="dv-expense__amount-wrap">
        <span className="dv-expense__currency">{currency}</span>
        <input
          type="number"
          value={expense.amount === 0 ? '' : expense.amount}
          min={0}
          step={0.01}
          placeholder="0.00"
          onChange={(e) => onUpdate({ amount: parseFloat(e.target.value) || 0 })}
          className="dv-expense__amount"
        />
      </div>
      <input
        type="text"
        value={expense.description}
        placeholder="Description (e.g. lunch, transport)"
        onChange={(e) => onUpdate({ description: e.target.value })}
        className="dv-expense__desc"
      />
      <button type="button" className="dv-btn dv-btn--ghost" onClick={onRemove} title="Remove expense">✕</button>
    </div>
  );
}

// ── DayNote ────────────────────────────────────────────────────────────────

function DayNoteArea({ note, onUpdate }: { note: string; onUpdate: (note: string) => void }) {
  const [local, setLocal] = useState(note);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setLocal(note); }, [note]);

  function handleChange(e: ChangeEvent<HTMLTextAreaElement>) {
    const value = e.target.value;
    setLocal(value);
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = setTimeout(() => onUpdate(value), 300);
  }

  return (
    <section className="dv-section">
      <h2 className="dv-section__title">Notes</h2>
      <textarea
        className="dv-note__textarea"
        value={local}
        onChange={handleChange}
        placeholder="Notes for today..."
        rows={3}
      />
    </section>
  );
}

// ── DaySummary ─────────────────────────────────────────────────────────────

function DaySummaryCard({ day, currency, flatDailyPay }: {
  day: DayData; currency: string; flatDailyPay: number;
}) {
  const { grossPay, totalTips, totalExpenses, netEarnings } = calculateDayTotals(day, flatDailyPay);

  const netClass =
    netEarnings > 0 ? 'dv-summary__net--positive' :
    netEarnings < 0 ? 'dv-summary__net--negative' :
    '';

  return (
    <section className="dv-section">
      <h2 className="dv-section__title">Summary</h2>
      <div className="dv-summary">
        <div className="dv-summary__row">
          <span className="dv-summary__label">Gross Pay</span>
          <span className="dv-summary__value dv-summary__value--green">{currency}{grossPay.toFixed(2)}</span>
        </div>
        <div className="dv-summary__row">
          <span className="dv-summary__label">Tips</span>
          <span className="dv-summary__value dv-summary__value--yellow">{currency}{totalTips.toFixed(2)}</span>
        </div>
        <div className="dv-summary__row">
          <span className="dv-summary__label">Expenses</span>
          <span className="dv-summary__value dv-summary__value--red">−{currency}{totalExpenses.toFixed(2)}</span>
        </div>
        <div className="dv-summary__divider" />
        <div className="dv-summary__row dv-summary__row--net">
          <span className="dv-summary__label">Net Earnings</span>
          <span className={`dv-summary__value dv-summary__value--bold ${netClass}`}>{currency}{netEarnings.toFixed(2)}</span>
        </div>
      </div>
    </section>
  );
}

// ── DayView (main export) ──────────────────────────────────────────────────

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
  day, settings,
  onAddShift, onUpdateShift, onRemoveShift,
  onAddExpense, onUpdateExpense, onRemoveExpense,
  onUpdateNote,
}: DayViewProps) {
  const flatDailyPay = settings.workingDaysPerMonth > 0
    ? settings.monthlyFlatSalary / settings.workingDaysPerMonth
    : 0;

  const cur = settings.currency;

  return (
    <div className="day-view">
      {/* Shifts */}
      <section className="dv-section">
        <div className="dv-section__header">
          <h2 className="dv-section__title">Shifts</h2>
          <button type="button" className="dv-btn dv-btn--primary" onClick={onAddShift}>+ Add Shift</button>
        </div>
        {day.shifts.length === 0 ? (
          <p className="dv-section__empty">No shifts yet. Add one to start tracking.</p>
        ) : (
          <div className="dv-section__list">
            {day.shifts.map((shift) => (
              <ShiftCard
                key={shift.id}
                shift={shift}
                currency={cur}
                flatDailyPay={flatDailyPay}
                onUpdate={(updates) => onUpdateShift(shift.id, updates)}
                onRemove={() => onRemoveShift(shift.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Expenses */}
      <section className="dv-section">
        <div className="dv-section__header">
          <h2 className="dv-section__title">Expenses</h2>
          <button type="button" className="dv-btn dv-btn--secondary" onClick={onAddExpense}>+ Add Expense</button>
        </div>
        {day.expenses.length === 0 ? (
          <p className="dv-section__empty">No expenses recorded for today.</p>
        ) : (
          <div className="dv-section__list">
            {day.expenses.map((expense) => (
              <ExpenseRow
                key={expense.id}
                expense={expense}
                currency={cur}
                onUpdate={(updates) => onUpdateExpense(expense.id, updates)}
                onRemove={() => onRemoveExpense(expense.id)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Notes */}
      <DayNoteArea note={day.note ?? ''} onUpdate={onUpdateNote} />

      {/* Summary */}
      <DaySummaryCard day={day} currency={cur} flatDailyPay={flatDailyPay} />
    </div>
  );
}
