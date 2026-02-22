export type DateRangePreset = '7d' | '30d' | '3m' | '1y' | 'all';

export type DateRange = {
  from: string;
  to: string;
};

type DateRangePickerProps = {
  value: DateRange;
  onChange: (range: DateRange) => void;
  activePreset: DateRangePreset | null;
  onPresetChange: (preset: DateRangePreset) => void;
};

const PRESETS: { key: DateRangePreset; label: string }[] = [
  { key: '7d', label: '7 days' },
  { key: '30d', label: '30 days' },
  { key: '3m', label: '3 months' },
  { key: '1y', label: '1 year' },
  { key: 'all', label: 'All time' },
];

export function DateRangePicker({ value, onChange, activePreset, onPresetChange }: DateRangePickerProps) {
  return (
    <div className="date-picker">
      <div className="date-picker__presets">
        {PRESETS.map((p) => (
          <button
            key={p.key}
            type="button"
            className={`date-picker__btn${activePreset === p.key ? ' date-picker__btn--active' : ''}`}
            onClick={() => onPresetChange(p.key)}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="date-picker__custom">
        <span className="date-picker__label">From</span>
        <input
          type="date"
          className="date-picker__input"
          value={value.from}
          max={value.to}
          onChange={(e) => {
            onChange({ from: e.target.value, to: value.to });
          }}
        />
        <span className="date-picker__label">To</span>
        <input
          type="date"
          className="date-picker__input"
          value={value.to}
          min={value.from}
          onChange={(e) => {
            onChange({ from: value.from, to: e.target.value });
          }}
        />
      </div>
    </div>
  );
}
