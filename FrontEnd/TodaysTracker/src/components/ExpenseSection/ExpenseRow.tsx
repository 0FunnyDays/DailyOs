import type { Expense } from '../../types';
import { Button } from '../shared/Button';

type ExpenseRowProps = {
  expense: Expense;
  currency: string;
  onUpdate: (updates: Partial<Expense>) => void;
  onRemove: () => void;
};

export function ExpenseRow({ expense, currency, onUpdate, onRemove }: ExpenseRowProps) {
  return (
    <div className="expense-row">
      <div className="expense-row__prefix">
        <span className="expense-row__currency">{currency}</span>
        <input
          type="number"
          value={expense.amount === 0 ? '' : expense.amount}
          min={0}
          step={0.01}
          placeholder="0.00"
          onChange={(e) => onUpdate({ amount: parseFloat(e.target.value) || 0 })}
          className="expense-row__amount"
        />
      </div>

      <input
        type="text"
        value={expense.description}
        placeholder="Description (e.g. lunch, transport)"
        onChange={(e) => onUpdate({ description: e.target.value })}
        className="expense-row__desc"
      />

      <Button variant="ghost" onClick={onRemove} title="Remove expense">✕</Button>
    </div>
  );
}
