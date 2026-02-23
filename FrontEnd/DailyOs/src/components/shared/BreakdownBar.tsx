export type BreakdownSegment = {
  label: string;
  value: number;
  color: string;
};

type BreakdownBarProps = {
  segments: BreakdownSegment[];
  currency?: string;
};

export function BreakdownBar({ segments, currency = '€' }: BreakdownBarProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);

  if (total === 0) {
    return <div className="breakdown-bar__empty">No data for this period</div>;
  }

  return (
    <div>
      <div className="breakdown-bar__track">
        {segments.map((seg) => {
          const pct = (seg.value / total) * 100;
          if (pct === 0) return null;
          return (
            <div
              key={seg.label}
              className="breakdown-bar__segment"
              style={{ flexBasis: `${pct}%`, background: seg.color }}
              title={`${seg.label}: ${currency}${seg.value.toFixed(2)} (${pct.toFixed(0)}%)`}
            />
          );
        })}
      </div>
      <div className="breakdown-bar__legend">
        {segments.map((seg) => (
          <div key={seg.label} className="breakdown-bar__legend-item">
            <span className="breakdown-bar__dot" style={{ background: seg.color }} />
            <span>{seg.label}</span>
            <span className="breakdown-bar__legend-value">
              {currency}{seg.value.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
