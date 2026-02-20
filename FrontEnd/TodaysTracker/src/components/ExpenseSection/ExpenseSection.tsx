import type { Expense } from '../../types';
import { ExpenseRow } from './ExpenseRow';
import { Button } from '../shared/Button';

type ExpenseSectionProps = {
  expenses: Expense[];
  currency: string;
  onAdd: () => void;
  onUpdate: (expenseId: string, updates: Partial<Expense>) => void;
  onRemove: (expenseId: string) => void;
};

export function ExpenseSection({ expenses, currency, onAdd, onUpdate, onRemove }: ExpenseSectionProps) {
  return (
    <section className="section">
      <div className="section__header">
        <h2 className="section__title">Expenses</h2>
        <Button variant="secondary" onClick={onAdd}>+ Add Expense</Button>
      </div>

      {expenses.length === 0 ? (
        <p className="section__empty">No expenses recorded for today.</p>
      ) : (
        <div className="section__list">
          {expenses.map((expense) => (
            <ExpenseRow
              key={expense.id}
              expense={expense}
              currency={currency}
              onUpdate={(updates) => onUpdate(expense.id, updates)}
              onRemove={() => onRemove(expense.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
