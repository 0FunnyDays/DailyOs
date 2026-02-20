import { useState } from 'react';
import type { Shift } from '../../types';
import { calculateShiftPay } from '../../utils/payUtils';
import { calculateHours } from '../../utils/dateUtils';
import { TimeInput } from '../shared/TimeInput';
import { InputField } from '../shared/InputField';
import { Button } from '../shared/Button';

type ShiftCardProps = {
  shift: Shift;
  currency: string;
  flatDailyPay: number;
  onUpdate: (updates: Partial<Shift>) => void;
  onRemove: () => void;
};

function formatDuration(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

export function ShiftCard({ shift, currency, flatDailyPay, onUpdate, onRemove }: ShiftCardProps) {
  const [showTips, setShowTips] = useState(shift.tips > 0);

  const bothTimesSet = shift.startTime !== '' && shift.endTime !== '';
  const hours = bothTimesSet ? calculateHours(shift.startTime, shift.endTime) : null;

  // Flat: always show daily pay; hourly: only when both times are set
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
    <div className="shift-card">
      {/* Time row */}
      <div className="shift-card__time-row">
        <TimeInput label="Start" value={shift.startTime} onChange={(v) => onUpdate({ startTime: v })} />
        <TimeInput label="End"   value={shift.endTime}   onChange={(v) => onUpdate({ endTime: v })} />

        {bothTimesSet && hours !== null && (
          <div className="shift-card__duration">
            <span className="shift-card__duration-label">Duration</span>
            <span className="shift-card__duration-value">{formatDuration(hours)}</span>
          </div>
        )}
      </div>

      {/* Pay row */}
      <div className="shift-card__pay-row">
        <label className="field">
          <span className="field__label">Pay type</span>
          <select
            value={shift.payType}
            onChange={(e) => onUpdate({ payType: e.target.value as 'flat' | 'hourly' })}
            className="field__select"
          >
            <option value="hourly">Hourly</option>
            <option value="flat">Flat</option>
          </select>
        </label>

        {shift.payType === 'flat' ? (
          <div className="shift-card__flat-info">
            <span className="shift-card__flat-label">Daily pay</span>
            <span className="shift-card__flat-value">{currency}{flatDailyPay.toFixed(2)}</span>
          </div>
        ) : (
          <InputField
            label={`Rate (${currency}/hr)`}
            value={shift.payAmount === 0 ? '' : shift.payAmount}
            type="number"
            min={0}
            step={0.5}
            placeholder="0"
            onChange={(v) => onUpdate({ payAmount: parseFloat(v) || 0 })}
          />
        )}
      </div>

      {/* Tips row */}
      <div className="shift-card__tips-toggle">
        {!showTips ? (
          <button className="btn btn--ghost" onClick={handleToggleTips}>
            + Had tips?
          </button>
        ) : (
          <div className="shift-card__tips-row">
            <InputField
              label={`Tips (${currency})`}
              value={shift.tips === 0 ? '' : shift.tips}
              type="number"
              min={0}
              step={0.5}
              placeholder="0"
              onChange={(v) => onUpdate({ tips: parseFloat(v) || 0 })}
            />
            <button
              className="btn btn--ghost shift-card__remove-tips"
              onClick={handleToggleTips}
              title="Remove tips"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Footer: computed totals + remove */}
      <div className="shift-card__footer">
        {pay !== null ? (
          <div className="shift-card__computed">
            <span className="shift-card__computed-item">
              Pay: <span className="shift-card__computed-value--green">{currency}{pay.toFixed(2)}</span>
            </span>
            {shift.tips > 0 && (
              <span className="shift-card__computed-item">
                Tips: <span className="shift-card__computed-value--yellow">{currency}{shift.tips.toFixed(2)}</span>
              </span>
            )}
          </div>
        ) : (
          <span className="shift-card__hint">Set start and end time</span>
        )}
        <Button variant="danger" onClick={onRemove}>Remove</Button>
      </div>
    </div>
  );
}
