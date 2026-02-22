import { useState, useMemo, useCallback, useId } from 'react';
import type { ReactNode } from 'react';
import type { DayData, AppSettings, GymSession } from '../types';
import type { ChartDataPoint } from '../utils/dashboardUtils';
import { calculateHours } from '../utils/dateUtils';
import { calculateDayTotals } from '../utils/payUtils';
import {
  getDateRangeBetween,
  computeDailyTotals,
  getChartData,
  todayStr,
  daysAgo,
} from '../utils/dashboardUtils';
import '../styles/Dashboard.css';

// ── Types ──────────────────────────────────────────────────────────────────

type DateRangePreset = '7d' | '30d' | '3m' | '1y' | 'all';

type DateRange = {
  from: string;
  to: string;
};

type PieSlice = {
  label: string;
  value: number;
  color: string;
};

type BreakdownSegment = {
  label: string;
  value: number;
  color: string;
};

type StatCardVariant = 'blue' | 'green' | 'amber' | 'red' | 'accent' | 'purple';

// ── DateRangePicker ────────────────────────────────────────────────────────

const PRESETS: { key: DateRangePreset; label: string }[] = [
  { key: '7d', label: '7 days' },
  { key: '30d', label: '30 days' },
  { key: '3m', label: '3 months' },
  { key: '1y', label: '1 year' },
  { key: 'all', label: 'All time' },
];

function DateRangePicker({ value, onChange, activePreset, onPresetChange }: {
  value: DateRange;
  onChange: (range: DateRange) => void;
  activePreset: DateRangePreset | null;
  onPresetChange: (preset: DateRangePreset) => void;
}) {
  const fromInputId = useId();
  const toInputId = useId();

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
        <label className="date-picker__label" htmlFor={fromInputId}>From</label>
        <input
          id={fromInputId}
          type="date"
          className="date-picker__input"
          value={value.from}
          max={value.to}
          onChange={(e) => {
            onChange({ from: e.target.value, to: value.to });
          }}
        />
        <label className="date-picker__label" htmlFor={toInputId}>To</label>
        <input
          id={toInputId}
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

// ── StatCard ───────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, variant = 'accent' }: {
  icon?: ReactNode; label: string; value: string; variant?: StatCardVariant;
}) {
  return (
    <div className={`stat-card stat-card--${variant}`}>
      {icon && <div className="stat-card__icon">{icon}</div>}
      <span className="stat-card__value">{value}</span>
      <span className="stat-card__label">{label}</span>
    </div>
  );
}

// ── BarChart ───────────────────────────────────────────────────────────────

const BAR_PADDING_LEFT = 55;
const BAR_PADDING_RIGHT = 10;
const BAR_PADDING_TOP = 16;
const BAR_PADDING_BOTTOM = 40;
const BAR_VIEW_WIDTH = 800;

function BarChart({ data, height = 260, barColor = 'var(--clr-accent)' }: {
  data: ChartDataPoint[]; height?: number; barColor?: string;
}) {
  const [hovered, setHovered] = useState<number | null>(null);

  if (data.length === 0) {
    return <div className="bar-chart__empty">No data for this period</div>;
  }

  const viewHeight = height;
  const chartW = BAR_VIEW_WIDTH - BAR_PADDING_LEFT - BAR_PADDING_RIGHT;
  const chartH = viewHeight - BAR_PADDING_TOP - BAR_PADDING_BOTTOM;

  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const barCount = data.length;
  const gap = Math.min(4, chartW / barCount * 0.15);
  const barW = Math.max(4, (chartW - gap * (barCount - 1)) / barCount);

  const gridLines = Array.from({ length: 5 }, (_, i) => {
    const val = (maxVal / 4) * i;
    const y = BAR_PADDING_TOP + chartH - (val / maxVal) * chartH;
    return { val, y };
  });

  return (
    <div className="bar-chart">
      <svg
        viewBox={`0 0 ${BAR_VIEW_WIDTH} ${viewHeight}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {gridLines.map(({ val, y }) => (
          <g key={val}>
            <line
              x1={BAR_PADDING_LEFT}
              y1={y}
              x2={BAR_VIEW_WIDTH - BAR_PADDING_RIGHT}
              y2={y}
              stroke="var(--clr-border)"
              strokeDasharray="4 4"
            />
            <text
              x={BAR_PADDING_LEFT - 8}
              y={y + 4}
              textAnchor="end"
              fill="var(--clr-text-dim)"
              fontSize="11"
              fontFamily="inherit"
            >
              {val >= 1000 ? `${(val / 1000).toFixed(1)}k` : Math.round(val)}
            </text>
          </g>
        ))}

        {data.map((d, i) => {
          const barH = maxVal > 0 ? (d.value / maxVal) * chartH : 0;
          const x = BAR_PADDING_LEFT + i * (barW + gap);
          const y = BAR_PADDING_TOP + chartH - barH;
          const isHovered = hovered === i;

          return (
            <g
              key={i}
              className="bar-chart__bar-group"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              <title>{d.tooltip}</title>
              <rect
                className="bar-chart__bar"
                x={x}
                y={y}
                width={barW}
                height={Math.max(barH, 1)}
                rx={Math.min(4, barW / 2)}
                fill={barColor}
                opacity={isHovered ? 1 : 0.8}
              />
              {(barCount <= 31 || i % Math.ceil(barCount / 20) === 0) && (
                <text
                  x={x + barW / 2}
                  y={BAR_PADDING_TOP + chartH + 18}
                  textAnchor="middle"
                  fill="var(--clr-text-dim)"
                  fontSize={barCount > 20 ? '9' : '11'}
                  fontFamily="inherit"
                  transform={barCount > 14 ? `rotate(-45, ${x + barW / 2}, ${BAR_PADDING_TOP + chartH + 18})` : undefined}
                >
                  {d.label}
                </text>
              )}
            </g>
          );
        })}

        {hovered !== null && (() => {
          const d = data[hovered];
          const barH = (d.value / maxVal) * chartH;
          const x = BAR_PADDING_LEFT + hovered * (barW + gap) + barW / 2;
          const y = BAR_PADDING_TOP + chartH - barH - 10;
          const tipW = 120;
          const tipH = 24;
          const tipX = Math.max(BAR_PADDING_LEFT, Math.min(x - tipW / 2, BAR_VIEW_WIDTH - BAR_PADDING_RIGHT - tipW));
          const tipY = Math.max(4, y - tipH);

          return (
            <g>
              <rect
                x={tipX}
                y={tipY}
                width={tipW}
                height={tipH}
                rx="6"
                fill="var(--clr-surface)"
                stroke="var(--clr-border-2)"
              />
              <text
                x={tipX + tipW / 2}
                y={tipY + tipH / 2 + 4}
                textAnchor="middle"
                fill="var(--clr-text)"
                fontSize="11"
                fontWeight="600"
                fontFamily="inherit"
              >
                {d.tooltip}
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}

// ── PieChart ──────────────────────────────────────────────────────────────

const PIE_INNER_RADIUS = 55;
const PIE_OUTER_RADIUS = 90;

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r1: number, r2: number, startAngle: number, endAngle: number): string {
  const sweep = endAngle - startAngle;
  const largeArc = sweep > 180 ? 1 : 0;

  const outerStart = polarToCartesian(cx, cy, r2, startAngle);
  const outerEnd = polarToCartesian(cx, cy, r2, endAngle);
  const innerEnd = polarToCartesian(cx, cy, r1, endAngle);
  const innerStart = polarToCartesian(cx, cy, r1, startAngle);

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${r2} ${r2} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${r1} ${r1} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
    'Z',
  ].join(' ');
}

function PieChart({ slices, size = 200, currency }: {
  slices: PieSlice[]; size?: number; currency?: string;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const total = slices.reduce((sum, s) => sum + s.value, 0);

  if (total === 0) {
    return <div className="pie-chart__empty">No data for this period</div>;
  }

  const cx = size / 2;
  const cy = size / 2;
  const scale = size / 200;
  const r1 = PIE_INNER_RADIUS * scale;
  const r2 = PIE_OUTER_RADIUS * scale;

  const positiveSlices = slices.filter((s) => s.value > 0);
  const arcs = positiveSlices
    .map((slice, i) => {
      const sweep = (slice.value / total) * 360;
      const startAngle = positiveSlices
        .slice(0, i)
        .reduce((sum, s) => sum + (s.value / total) * 360, 0);
      const endAngle = startAngle + Math.min(sweep, 359.99);

      return { slice, i, startAngle, endAngle, pct: (slice.value / total) * 100 };
    });

  const hoveredArc = hovered !== null ? arcs[hovered] : null;

  return (
    <div className="pie-chart">
      <div className="pie-chart__svg-wrap">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {arcs.map((arc, idx) => {
            const isHovered = hovered === idx;
            const hoverTransform = isHovered
              ? `translate(${cx} ${cy}) scale(1.05) translate(${-cx} ${-cy})`
              : undefined;
            return (
              <g
                key={arc.slice.label}
                className="pie-chart__slice-group"
                transform={hoverTransform}
                onMouseEnter={() => setHovered(idx)}
                onMouseLeave={() => setHovered(null)}
              >
                <path
                  className="pie-chart__slice"
                  d={describeArc(cx, cy, r1, r2, arc.startAngle, arc.endAngle)}
                  fill={arc.slice.color}
                  opacity={hovered === null || isHovered ? 1 : 0.4}
                />
              </g>
            );
          })}
        </svg>

        <div className="pie-chart__center">
          {hoveredArc ? (
            <>
              <span className="pie-chart__center-value">
                {currency ? `${currency}${hoveredArc.slice.value.toFixed(2)}` : hoveredArc.slice.value}
              </span>
              <span className="pie-chart__center-label">{hoveredArc.slice.label}</span>
            </>
          ) : (
            <>
              <span className="pie-chart__center-value">
                {currency ? `${currency}${total.toFixed(2)}` : total}
              </span>
              <span className="pie-chart__center-label">Total</span>
            </>
          )}
        </div>
      </div>

      <div className="pie-chart__legend">
        {arcs.map((arc, idx) => (
          <div
            key={arc.slice.label}
            className={`pie-chart__legend-item ${hovered === idx ? 'pie-chart__legend-item--active' : ''}`}
            onMouseEnter={() => setHovered(idx)}
            onMouseLeave={() => setHovered(null)}
          >
            <svg className="pie-chart__legend-dot" viewBox="0 0 10 10" aria-hidden="true">
              <rect x="0" y="0" width="10" height="10" rx="3" fill={arc.slice.color} />
            </svg>
            <span className="pie-chart__legend-label">{arc.slice.label}</span>
            <span className="pie-chart__legend-pct">{arc.pct.toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── BreakdownBar ──────────────────────────────────────────────────────────

function BreakdownBar({ segments, currency = '€' }: {
  segments: BreakdownSegment[]; currency?: string;
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const visibleSegments = segments.filter((seg) => seg.value > 0);

  if (total === 0) {
    return <div className="breakdown-bar__empty">No data for this period</div>;
  }

  return (
    <div>
      <div className="breakdown-bar__track">
        <svg
          className="breakdown-bar__track-svg"
          viewBox="0 0 100 32"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {visibleSegments.map((seg, idx) => {
            const pct = (seg.value / total) * 100;
            const x = visibleSegments
              .slice(0, idx)
              .reduce((sum, s) => sum + (s.value / total) * 100, 0);

            return (
              <g key={seg.label}>
                <title>{`${seg.label}: ${currency}${seg.value.toFixed(2)} (${pct.toFixed(0)}%)`}</title>
                <rect x={x} y="0" width={pct} height="32" fill={seg.color} />
              </g>
            );
          })}
        </svg>
      </div>
      <div className="breakdown-bar__legend">
        {segments.map((seg) => (
          <div key={seg.label} className="breakdown-bar__legend-item">
            <svg className="breakdown-bar__dot" viewBox="0 0 12 12" aria-hidden="true">
              <rect x="0" y="0" width="12" height="12" rx="4" fill={seg.color} />
            </svg>
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

// ── Helpers ───────────────────────────────────────────────────────────────

type DashboardPageProps = {
  days: Record<string, DayData>;
  settings: AppSettings;
  gymSessions: Record<string, GymSession>;
};

function computeStats(days: Record<string, DayData>, dateKeys: string[], flatDailyPay: number) {
  let totalHours = 0;
  let totalGross = 0;
  let totalTips = 0;
  let totalExpenses = 0;
  let daysWorked = 0;

  for (const key of dateKeys) {
    const day = days[key];
    if (!day || day.shifts.length === 0) continue;
    daysWorked++;

    for (const s of day.shifts) {
      if (s.startTime && s.endTime) {
        totalHours += calculateHours(s.startTime, s.endTime);
      }
    }

    const totals = calculateDayTotals(day, flatDailyPay);
    totalGross += totals.grossPay;
    totalTips += totals.totalTips;
    totalExpenses += totals.totalExpenses;
  }

  return {
    totalHours: Math.round(totalHours * 10) / 10,
    totalGross: Math.round(totalGross * 100) / 100,
    totalTips: Math.round(totalTips * 100) / 100,
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    netEarnings: Math.round((totalGross + totalTips - totalExpenses) * 100) / 100,
    daysWorked,
  };
}

function computeGymStats(gymSessions: Record<string, GymSession>, dateKeys: string[]) {
  let workouts = 0;
  let totalSets = 0;
  let totalVolume = 0;

  for (const key of dateKeys) {
    const session = gymSessions[key];
    if (!session) continue;
    workouts++;

    for (const ex of session.exercises) {
      totalSets += ex.sets.length;
      for (const set of ex.sets) {
        totalVolume += set.reps * set.weight;
      }
    }
  }

  return {
    workouts,
    totalSets,
    totalVolume: Math.round(totalVolume),
  };
}

function getEarliestDateAll(...records: Record<string, unknown>[]): string {
  const allKeys = records.flatMap((r) => Object.keys(r)).sort();
  return allKeys[0] ?? todayStr();
}

function presetToRange(preset: DateRangePreset, days: Record<string, DayData>, gymSessions: Record<string, GymSession>): DateRange {
  const to = todayStr();
  switch (preset) {
    case '7d': return { from: daysAgo(7), to };
    case '30d': return { from: daysAgo(30), to };
    case '3m': return { from: daysAgo(90), to };
    case '1y': return { from: daysAgo(365), to };
    case 'all': return { from: getEarliestDateAll(days, gymSessions), to };
  }
}

// SVG Icons
const ClockIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
);

const DollarIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
  </svg>
);

const TipsIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2z" />
  </svg>
);

const NetIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="20" x2="12" y2="4" /><polyline points="6 10 12 4 18 10" />
  </svg>
);

const GymIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6.5 6.5h11M6.5 17.5h11M3 10.5h18M3 13.5h18M4.5 6.5v11M19.5 6.5v11M1.5 10.5v3M22.5 10.5v3" />
  </svg>
);

const SetsIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
  </svg>
);

const VolumeIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

// ── DashboardPage (main export) ───────────────────────────────────────────

export function DashboardPage({ days, settings, gymSessions }: DashboardPageProps) {
  const flatDailyPay = settings.workingDaysPerMonth > 0
    ? settings.monthlyFlatSalary / settings.workingDaysPerMonth
    : 0;

  const [activePreset, setActivePreset] = useState<DateRangePreset | null>('7d');
  const [dateRange, setDateRange] = useState<DateRange>(() => presetToRange('7d', days, gymSessions));

  const handlePresetChange = useCallback((preset: DateRangePreset) => {
    setActivePreset(preset);
    setDateRange(presetToRange(preset, days, gymSessions));
  }, [days, gymSessions]);

  const handleCustomRange = useCallback((range: DateRange) => {
    setActivePreset(null);
    setDateRange(range);
  }, []);

  const cur = settings.currency;

  const dateKeys = useMemo(() => getDateRangeBetween(dateRange.from, dateRange.to), [dateRange]);
  const stats = useMemo(() => computeStats(days, dateKeys, flatDailyPay), [days, dateKeys, flatDailyPay]);
  const dailyTotals = useMemo(() => computeDailyTotals(days, dateKeys, flatDailyPay), [days, dateKeys, flatDailyPay]);
  const chartData = useMemo(() => getChartData(dailyTotals, cur), [dailyTotals, cur]);

  const gymStats = useMemo(() => computeGymStats(gymSessions, dateKeys), [gymSessions, dateKeys]);

  const breakdownSegments = useMemo(() => [
    { label: 'Pay', value: stats.totalGross, color: 'var(--clr-green)' },
    { label: 'Tips', value: stats.totalTips, color: 'var(--clr-yellow)' },
    { label: 'Expenses', value: stats.totalExpenses, color: 'var(--clr-red)' },
  ], [stats]);

  const earningsPieSlices = useMemo(() => [
    { label: 'Pay', value: stats.totalGross, color: '#34d399' },
    { label: 'Tips', value: stats.totalTips, color: '#fbbf24' },
    { label: 'Expenses', value: stats.totalExpenses, color: '#f87171' },
  ], [stats]);

  const gymSplitSlices = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const key of dateKeys) {
      const session = gymSessions[key];
      if (!session) continue;
      counts[session.dayName] = (counts[session.dayName] ?? 0) + 1;
    }
    const palette = ['#a78bfa', '#60a5fa', '#34d399', '#fbbf24', '#f87171', '#f472b6'];
    return Object.entries(counts).map(([name, count], i) => ({
      label: name,
      value: count,
      color: palette[i % palette.length],
    }));
  }, [gymSessions, dateKeys]);

  return (
    <div className="dashboard">
      <h2 className="dashboard__title">Dashboard</h2>

      <DateRangePicker
        value={dateRange}
        onChange={handleCustomRange}
        activePreset={activePreset}
        onPresetChange={handlePresetChange}
      />

      {/* Summary cards */}
      <section>
        <h3 className="dashboard__section-title">Summary</h3>
        <div className="dashboard__cards">
          <StatCard icon={ClockIcon} label="Hours Worked" value={`${stats.totalHours}h`} variant="blue" />
          <StatCard icon={DollarIcon} label="Gross Pay" value={`${cur}${stats.totalGross.toFixed(2)}`} variant="green" />
          <StatCard icon={TipsIcon} label="Tips" value={`${cur}${stats.totalTips.toFixed(2)}`} variant="amber" />
          <StatCard icon={NetIcon} label="Net Earnings" value={`${cur}${stats.netEarnings.toFixed(2)}`} variant="accent" />
        </div>
      </section>

      {/* Gym stats */}
      <section>
        <h3 className="dashboard__section-title">Gym</h3>
        <div className="dashboard__cards dashboard__cards--3">
          <StatCard icon={GymIcon} label="Workouts" value={`${gymStats.workouts}`} variant="purple" />
          <StatCard icon={SetsIcon} label="Total Sets" value={`${gymStats.totalSets}`} variant="blue" />
          <StatCard icon={VolumeIcon} label="Volume" value={`${gymStats.totalVolume.toLocaleString()} kg`} variant="red" />
        </div>
      </section>

      {/* Earnings chart */}
      <section>
        <h3 className="dashboard__section-title">Earnings Over Time</h3>
        <div className="dashboard__chart-card">
          <BarChart data={chartData} />
        </div>
      </section>

      {/* Breakdown */}
      <section>
        <h3 className="dashboard__section-title">Breakdown</h3>
        <div className="dashboard__breakdown-card">
          <BreakdownBar segments={breakdownSegments} currency={cur} />
        </div>
      </section>

      {/* Pie charts */}
      <section>
        <h3 className="dashboard__section-title">Distribution</h3>
        <div className="dashboard__pies">
          <div className="dashboard__pie-card">
            <h4 className="dashboard__pie-card-title">Earnings</h4>
            <PieChart slices={earningsPieSlices} currency={cur} />
          </div>
          <div className="dashboard__pie-card">
            <h4 className="dashboard__pie-card-title">Gym Split</h4>
            <PieChart slices={gymSplitSlices} />
          </div>
        </div>
      </section>
    </div>
  );
}
