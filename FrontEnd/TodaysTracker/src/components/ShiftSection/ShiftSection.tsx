import type { Shift } from '../../types';
import { ShiftCard } from './ShiftCard';
import { Button } from '../shared/Button';

type ShiftSectionProps = {
  shifts: Shift[];
  currency: string;
  flatDailyPay: number;
  onAdd: () => void;
  onUpdate: (shiftId: string, updates: Partial<Shift>) => void;
  onRemove: (shiftId: string) => void;
};

export function ShiftSection({ shifts, currency, flatDailyPay, onAdd, onUpdate, onRemove }: ShiftSectionProps) {
  return (
    <section className="section">
      <div className="section__header">
        <h2 className="section__title">Shifts</h2>
        <Button variant="primary" onClick={onAdd}>+ Add Shift</Button>
      </div>

      {shifts.length === 0 ? (
        <p className="section__empty">No shifts yet. Add one to start tracking.</p>
      ) : (
        <div className="section__list">
          {shifts.map((shift) => (
            <ShiftCard
              key={shift.id}
              shift={shift}
              currency={currency}
              flatDailyPay={flatDailyPay}
              onUpdate={(updates) => onUpdate(shift.id, updates)}
              onRemove={() => onRemove(shift.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
