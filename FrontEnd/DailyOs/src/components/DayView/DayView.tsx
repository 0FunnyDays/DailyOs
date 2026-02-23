import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import type {
  AppSettings,
  DayData,
  DayTotals,
  Expense,
  Shift,
} from "../../types";
import { calculateDayTotals, calculateShiftPay } from "../../utils/payUtils";
import { calculateHours } from "../../utils/dateUtils";
import "../../styles/DayView.css";

function formatDuration(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function formatTimeDraft(digits: string): string {
  if (digits.length <= 2) return digits;
  if (digits.length === 3) return `${digits.slice(0, 1)}:${digits.slice(1, 3)}`;
  return `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
}

function normalizeTimeInput(value: string): string | null {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length === 0) return "";

  let hours: number;
  let minutes: number;

  if (digits.length === 1) {
    hours = Number(digits);
    minutes = 0;
  } else if (digits.length === 2) {
    hours = Number(digits);
    minutes = 0;
  } else if (digits.length === 3) {
    hours = Number(digits.slice(0, 1));
    minutes = Number(digits.slice(1, 3));
  } else {
    hours = Number(digits.slice(0, 2));
    minutes = Number(digits.slice(2, 4));
  }

  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function formatMoney(currency: string, amount: number, signed = false): string {
  const abs = Math.abs(amount);
  const base = `${currency}${abs.toFixed(2)}`;
  if (!signed) return base;
  if (amount > 0) return `+${base}`;
  if (amount < 0) return `-${base}`;
  return base;
}

function sumTrackedHours(shifts: Shift[]): number {
  return shifts.reduce((sum, shift) => {
    if (!shift.startTime || !shift.endTime) return sum;
    return sum + calculateHours(shift.startTime, shift.endTime);
  }, 0);
}

function TimeInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [raw, setRaw] = useState(value);

  useEffect(() => {
    setRaw(value);
  }, [value]);

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 4);
    const next = formatTimeDraft(digits);

    setRaw(next);
    if (next === "") {
      onChange("");
      return;
    }
    const normalized = normalizeTimeInput(next);
    if (normalized && digits.length === 4) onChange(normalized);
  }

  function handleBlur() {
    const normalized = normalizeTimeInput(raw);
    if (normalized === null) {
      setRaw("");
      onChange("");
      return;
    }
    setRaw(normalized);
    onChange(normalized);
  }

  return (
    <label className="dv-field">
      <span className="dv-field__label">{label}</span>
      <input
        type="text"
        inputMode="numeric"
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

function NumberInput({
  label,
  value,
  onChange,
  placeholder,
  min,
  step,
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  placeholder?: string;
  min?: number;
  step?: number;
}) {
  return (
    <label className="dv-field">
      <span className="dv-field__label">{label}</span>
      <input
        type="number"
        inputMode="decimal"
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

function ShiftCard({
  shift,
  index,
  currency,
  flatDailyPay,
  onUpdate,
  onRemove,
}: {
  shift: Shift;
  index: number;
  currency: string;
  flatDailyPay: number;
  onUpdate: (updates: Partial<Shift>) => void;
  onRemove: () => void;
}) {
  const [showTips, setShowTips] = useState(shift.tips > 0);

  useEffect(() => {
    setShowTips(shift.tips > 0);
  }, [shift.tips]);

  const bothTimesSet = shift.startTime !== "" && shift.endTime !== "";
  const hours = bothTimesSet ? calculateHours(shift.startTime, shift.endTime) : null;

  const pay =
    shift.payType === "flat"
      ? flatDailyPay
      : bothTimesSet
        ? calculateShiftPay(shift, flatDailyPay)
        : null;

  function toggleTips() {
    if (showTips) {
      setShowTips(false);
      onUpdate({ tips: 0 });
      return;
    }
    setShowTips(true);
  }

  return (
    <div className="dv-shift">
      <div className="dv-shift__head">
        <div className="dv-shift__title-wrap">
          <h3 className="dv-shift__title">Shift {index + 1}</h3>
          <span className={`dv-shift__type-badge dv-shift__type-badge--${shift.payType}`}>
            {shift.payType}
          </span>
        </div>
        <button type="button" className="dv-btn dv-btn--danger" onClick={onRemove}>
          Remove
        </button>
      </div>

      <div className="dv-shift__time-row">
        <TimeInput
          label="Start"
          value={shift.startTime}
          onChange={(v) => onUpdate({ startTime: v })}
        />
        <TimeInput
          label="End"
          value={shift.endTime}
          onChange={(v) => onUpdate({ endTime: v })}
        />
        <div className="dv-shift__metric">
          <span className="dv-shift__metric-label">Duration</span>
          <span className="dv-shift__metric-value">
            {hours !== null ? formatDuration(hours) : "—"}
          </span>
        </div>
      </div>

      <div className="dv-shift__pay-row">
        <label className="dv-field">
          <span className="dv-field__label">Pay type</span>
          <select
            value={shift.payType}
            onChange={(e) =>
              onUpdate({ payType: e.target.value as "flat" | "hourly" })
            }
            className="dv-field__select"
          >
            <option value="hourly">Hourly</option>
            <option value="flat">Flat</option>
          </select>
        </label>

        {shift.payType === "flat" ? (
          <div className="dv-shift__metric dv-shift__metric--pay">
            <span className="dv-shift__metric-label">Daily pay</span>
            <span className="dv-shift__metric-value dv-shift__metric-value--money">
              {formatMoney(currency, flatDailyPay)}
            </span>
          </div>
        ) : (
          <NumberInput
            label={`Rate (${currency}/hr)`}
            value={shift.payAmount === 0 ? "" : shift.payAmount}
            min={0}
            step={0.5}
            placeholder="0"
            onChange={(v) => onUpdate({ payAmount: parseFloat(v) || 0 })}
          />
        )}
      </div>

      <div className="dv-shift__tips-area">
        {!showTips ? (
          <button type="button" className="dv-btn dv-btn--ghost" onClick={toggleTips}>
            + Had tips?
          </button>
        ) : (
          <div className="dv-shift__tips-row">
            <NumberInput
              label={`Tips (${currency})`}
              value={shift.tips === 0 ? "" : shift.tips}
              min={0}
              step={0.5}
              placeholder="0"
              onChange={(v) => onUpdate({ tips: parseFloat(v) || 0 })}
            />
            <button
              type="button"
              className="dv-btn dv-btn--ghost dv-shift__remove-tips"
              onClick={toggleTips}
              title="Remove tips"
            >
              x
            </button>
          </div>
        )}
      </div>

      <div className="dv-shift__footer">
        {pay !== null ? (
          <div className="dv-shift__computed">
            <span className="dv-shift__computed-item">
              Pay: <span className="dv-shift__val--green">{formatMoney(currency, pay)}</span>
            </span>
            {shift.tips > 0 && (
              <span className="dv-shift__computed-item">
                Tips:{" "}
                <span className="dv-shift__val--yellow">
                  {formatMoney(currency, shift.tips)}
                </span>
              </span>
            )}
          </div>
        ) : (
          <span className="dv-shift__hint">Set start and end time to calculate pay</span>
        )}
      </div>
    </div>
  );
}

function ExpenseRow({
  expense,
  currency,
  onUpdate,
  onRemove,
}: {
  expense: Expense;
  currency: string;
  onUpdate: (updates: Partial<Expense>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="dv-expense">
      <div className="dv-expense__amount-wrap">
        <span className="dv-expense__currency">{currency}</span>
        <input
          type="number"
          inputMode="decimal"
          value={expense.amount === 0 ? "" : expense.amount}
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
      <button
        type="button"
        className="dv-btn dv-btn--ghost dv-expense__remove"
        onClick={onRemove}
        title="Remove expense"
      >
        x
      </button>
    </div>
  );
}

function DayNoteArea({
  note,
  onUpdate,
}: {
  note: string;
  onUpdate: (note: string) => void;
}) {
  const [local, setLocal] = useState(note);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setLocal(note);
  }, [note]);

  useEffect(() => {
    return () => {
      if (timer.current !== null) clearTimeout(timer.current);
    };
  }, []);

  function commit(value: string) {
    onUpdate(value);
  }

  function handleChange(e: ChangeEvent<HTMLTextAreaElement>) {
    const value = e.target.value;
    setLocal(value);
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = setTimeout(() => commit(value), 300);
  }

  function handleBlur() {
    if (timer.current !== null) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    commit(local);
  }

  return (
    <section className="dv-section">
      <div className="dv-section__header dv-section__header--tight">
        <h2 className="dv-section__title">Notes</h2>
        <span className="dv-section__meta">Auto-save</span>
      </div>
      <textarea
        className="dv-note__textarea"
        value={local}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Notes for today..."
        rows={5}
      />
    </section>
  );
}

function DaySummaryCard({
  totals,
  currency,
  trackedHours,
  shiftCount,
  expenseCount,
}: {
  totals: DayTotals;
  currency: string;
  trackedHours: number;
  shiftCount: number;
  expenseCount: number;
}) {
  const netClass =
    totals.netEarnings > 0
      ? "dv-summary__net--positive"
      : totals.netEarnings < 0
        ? "dv-summary__net--negative"
        : "";

  const rows = [
    {
      label: "Gross Pay",
      value: formatMoney(currency, totals.grossPay),
      className: "dv-summary__value--green",
    },
    {
      label: "Tips",
      value: formatMoney(currency, totals.totalTips),
      className: "dv-summary__value--yellow",
    },
    {
      label: "Expenses",
      value: `-${formatMoney(currency, totals.totalExpenses)}`,
      className: "dv-summary__value--red",
    },
  ] as const;

  return (
    <section className="dv-section dv-section--sticky">
      <div className="dv-section__header dv-section__header--tight">
        <h2 className="dv-section__title">Summary</h2>
        <span className="dv-section__meta">Live</span>
      </div>

      <div className="dv-summary-quick">
        <div className="dv-summary-quick__item">
          <span className="dv-summary-quick__label">Shifts</span>
          <strong>{shiftCount}</strong>
        </div>
        <div className="dv-summary-quick__item">
          <span className="dv-summary-quick__label">Hours</span>
          <strong>{formatDuration(trackedHours)}</strong>
        </div>
        <div className="dv-summary-quick__item">
          <span className="dv-summary-quick__label">Expenses</span>
          <strong>{expenseCount}</strong>
        </div>
      </div>

      <div className="dv-summary">
        {rows.map((row) => (
          <div key={row.label} className="dv-summary__row">
            <span className="dv-summary__label">{row.label}</span>
            <span className={`dv-summary__value ${row.className}`}>{row.value}</span>
          </div>
        ))}
        <div className="dv-summary__divider" />
        <div className="dv-summary__row dv-summary__row--net">
          <span className="dv-summary__label">Net Earnings</span>
          <span className={`dv-summary__value dv-summary__value--bold ${netClass}`}>
            {formatMoney(currency, totals.netEarnings, true)}
          </span>
        </div>
      </div>
    </section>
  );
}

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
  const flatDailyPay =
    settings.workingDaysPerMonth > 0
      ? settings.monthlyFlatSalary / settings.workingDaysPerMonth
      : 0;

  const currency = settings.currency;
  const totals = calculateDayTotals(day, flatDailyPay);
  const trackedHours = sumTrackedHours(day.shifts);

  const overviewStats = [
    {
      label: "Shifts",
      value: String(day.shifts.length),
      hint: day.shifts.length === 1 ? "entry" : "entries",
      accent: false,
    },
    {
      label: "Hours",
      value: formatDuration(trackedHours),
      hint: "tracked",
      accent: false,
    },
    {
      label: "Gross",
      value: formatMoney(currency, totals.grossPay),
      hint: "pay",
      accent: false,
    },
    {
      label: "Net",
      value: formatMoney(currency, totals.netEarnings, true),
      hint: "after expenses",
      accent: true,
    },
  ] as const;

  return (
    <div className="day-view">
      <header className="day-view__hero">
        <div>
          <h1 className="day-view__title">Work & expenses</h1>
          <p className="day-view__subtitle">
            Log shifts, tips, and expenses. Summary updates automatically.
          </p>
        </div>
      </header>

      <section className="day-view__overview" aria-label="Day overview">
        {overviewStats.map((stat) => (
          <div
            key={stat.label}
            className={`day-view__overview-card${stat.accent ? " day-view__overview-card--accent" : ""}`}
          >
            <span className="day-view__overview-label">{stat.label}</span>
            <strong className="day-view__overview-value">{stat.value}</strong>
            <span className="day-view__overview-hint">{stat.hint}</span>
          </div>
        ))}
      </section>

      <div className="day-view__layout">
        <div className="day-view__main">
          <section className="dv-section">
            <div className="dv-section__header">
              <div className="dv-section__title-wrap">
                <h2 className="dv-section__title">Shifts</h2>
                <span className="dv-section__meta">{day.shifts.length} total</span>
              </div>
              <button type="button" className="dv-btn dv-btn--primary" onClick={onAddShift}>
                + Add Shift
              </button>
            </div>

            {day.shifts.length === 0 ? (
              <p className="dv-section__empty">
                No shifts yet. Add one to start tracking your day.
              </p>
            ) : (
              <div className="dv-section__list">
                {day.shifts.map((shift, index) => (
                  <ShiftCard
                    key={shift.id}
                    index={index}
                    shift={shift}
                    currency={currency}
                    flatDailyPay={flatDailyPay}
                    onUpdate={(updates) => onUpdateShift(shift.id, updates)}
                    onRemove={() => onRemoveShift(shift.id)}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="dv-section">
            <div className="dv-section__header">
              <div className="dv-section__title-wrap">
                <h2 className="dv-section__title">Expenses</h2>
                <span className="dv-section__meta">{day.expenses.length} total</span>
              </div>
              <button type="button" className="dv-btn dv-btn--secondary" onClick={onAddExpense}>
                + Add Expense
              </button>
            </div>

            {day.expenses.length === 0 ? (
              <p className="dv-section__empty">No expenses recorded for today.</p>
            ) : (
              <div className="dv-section__list">
                {day.expenses.map((expense) => (
                  <ExpenseRow
                    key={expense.id}
                    expense={expense}
                    currency={currency}
                    onUpdate={(updates) => onUpdateExpense(expense.id, updates)}
                    onRemove={() => onRemoveExpense(expense.id)}
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="day-view__side">
          <DaySummaryCard
            totals={totals}
            currency={currency}
            trackedHours={trackedHours}
            shiftCount={day.shifts.length}
            expenseCount={day.expenses.length}
          />
          <DayNoteArea note={day.note ?? ""} onUpdate={onUpdateNote} />
        </aside>
      </div>
    </div>
  );
}
