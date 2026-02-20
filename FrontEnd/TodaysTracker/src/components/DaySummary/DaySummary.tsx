import type { DayData } from '../../types';
import { calculateDayTotals } from '../../utils/payUtils';

type DaySummaryProps = {
  day: DayData;
  currency: string;
  flatDailyPay: number;
};

export function DaySummary({ day, currency, flatDailyPay }: DaySummaryProps) {
  const { grossPay, totalTips, totalExpenses, netEarnings } = calculateDayTotals(day, flatDailyPay);

  const netClass =
    netEarnings > 0 ? 'summary__net-value--positive' :
    netEarnings < 0 ? 'summary__net-value--negative' :
    'summary__net-value--zero';

  return (
    <section className="summary">
      <p className="summary__title">Summary</p>

      <div className="summary__row">
        <span className="summary__row-label">Gross Pay</span>
        <span className="summary__row-value summary__row-value--green">{currency}{grossPay.toFixed(2)}</span>
      </div>
      <div className="summary__row">
        <span className="summary__row-label">Tips</span>
        <span className="summary__row-value summary__row-value--yellow">{currency}{totalTips.toFixed(2)}</span>
      </div>
      <div className="summary__row">
        <span className="summary__row-label">Expenses</span>
        <span className="summary__row-value summary__row-value--red">−{currency}{totalExpenses.toFixed(2)}</span>
      </div>

      <div className="summary__divider" />

      <div className="summary__net">
        <span className="summary__net-label">Net Earnings</span>
        <span className={`summary__net-value ${netClass}`}>{currency}{netEarnings.toFixed(2)}</span>
      </div>
    </section>
  );
}
