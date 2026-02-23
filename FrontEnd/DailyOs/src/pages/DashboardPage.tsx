import { useState, useMemo, useCallback, useId, useRef } from 'react';
import type { ReactNode } from 'react';
import type { DayData, AppSettings, GymSession } from '../types';
import type { ChartDataPoint } from '../utils/dashboardUtils';
import { PageGuideModal, usePageGuide } from '../components/PageGuideModal/PageGuideModal';
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
type DashboardDataKey = 'work' | 'gym' | 'sleep';

type DashboardDataVisibility = Record<DashboardDataKey, boolean>;

// ── DateRangePicker ────────────────────────────────────────────────────────

const PRESETS: { key: DateRangePreset; label: string }[] = [
  { key: '7d', label: '7 days' },
  { key: '30d', label: '30 days' },
  { key: '3m', label: '3 months' },
  { key: '1y', label: '1 year' },
  { key: 'all', label: 'All time' },
];

const DASHBOARD_DATA_FILTERS: { key: DashboardDataKey; label: string }[] = [
  { key: 'work', label: 'Work' },
  { key: 'gym', label: 'Gym' },
  { key: 'sleep', label: 'Sleep' },
];

const DEFAULT_DASHBOARD_DATA_VISIBILITY: DashboardDataVisibility = {
  work: true,
  gym: true,
  sleep: true,
};

function clampDateKey(dateKey: string, minDate: string, maxDate: string): string {
  if (dateKey < minDate) return minDate;
  if (dateKey > maxDate) return maxDate;
  return dateKey;
}

function clampRange(range: DateRange, minDate: string, maxDate: string): DateRange {
  let from = clampDateKey(range.from, minDate, maxDate);
  let to = clampDateKey(range.to, minDate, maxDate);
  if (from > to) [from, to] = [to, from];
  return { from, to };
}

function DateRangePicker({ value, onChange, activePreset, onPresetChange, minDate, maxDate }: {
  value: DateRange;
  onChange: (range: DateRange) => void;
  activePreset: DateRangePreset | null;
  onPresetChange: (preset: DateRangePreset) => void;
  minDate: string;
  maxDate: string;
}) {
  const fromInputId = useId();
  const toInputId = useId();
  const fromInputRef = useRef<HTMLInputElement>(null);
  const toInputRef = useRef<HTMLInputElement>(null);

  function handleFromChange(raw: string) {
    if (!raw) return;
    const next = clampRange({ from: raw, to: value.to }, minDate, maxDate);
    onChange(next);
  }

  function handleToChange(raw: string) {
    if (!raw) return;
    const next = clampRange({ from: value.from, to: raw }, minDate, maxDate);
    onChange(next);
  }

  function openPicker(ref: { current: HTMLInputElement | null }) {
    const input = ref.current;
    if (!input) return;
    if (typeof input.showPicker === 'function') {
      input.showPicker();
      return;
    }
    input.focus();
    input.click();
  }

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
        <div className="date-picker__field-group">
          <label className="date-picker__label" htmlFor={fromInputId}>From</label>
          <div className="date-picker__input-wrap">
            <input
              ref={fromInputRef}
              id={fromInputId}
              type="date"
              className="date-picker__input"
              value={value.from}
              min={minDate}
              max={maxDate}
              onChange={(e) => handleFromChange(e.target.value)}
            />
            <button
              type="button"
              className="date-picker__picker-btn"
              onClick={() => openPicker(fromInputRef)}
              aria-label="Open start date picker"
              title="Open calendar"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="3" y="5" width="18" height="16" rx="3" ry="3" />
                <line x1="3" y1="10" x2="21" y2="10" />
                <line x1="8" y1="3" x2="8" y2="7" />
                <line x1="16" y1="3" x2="16" y2="7" />
                <circle cx="8" cy="14" r="1" />
                <circle cx="12" cy="14" r="1" />
                <circle cx="16" cy="14" r="1" />
              </svg>
            </button>
          </div>
        </div>

        <div className="date-picker__field-group">
          <label className="date-picker__label" htmlFor={toInputId}>To</label>
          <div className="date-picker__input-wrap">
            <input
              ref={toInputRef}
              id={toInputId}
              type="date"
              className="date-picker__input"
              value={value.to}
              min={minDate}
              max={maxDate}
              onChange={(e) => handleToChange(e.target.value)}
            />
            <button
              type="button"
              className="date-picker__picker-btn"
              onClick={() => openPicker(toInputRef)}
              aria-label="Open end date picker"
              title="Open calendar"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="3" y="5" width="18" height="16" rx="3" ry="3" />
                <line x1="3" y1="10" x2="21" y2="10" />
                <line x1="8" y1="3" x2="8" y2="7" />
                <line x1="16" y1="3" x2="16" y2="7" />
                <path d="M8 15h8" />
              </svg>
            </button>
          </div>
        </div>
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
  userId: string;
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

type SleepDashboardStats = {
  trackedDays: number;
  notesCount: number;
  avgSleepHours: number | null;
  avgQuality: number | null;
  avgEnergy: number | null;
  sleep7PlusNights: number;
  qualityCounts: Record<1 | 2 | 3 | 4 | 5, number>;
  energyCounts: Record<1 | 2 | 3 | 4 | 5, number>;
};

function avg(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function formatSleepHoursStat(value: number | null): string {
  if (value === null) return '—';
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? `${rounded}h` : `${rounded.toFixed(1)}h`;
}

function formatScoreStat(value: number | null): string {
  if (value === null) return '—';
  return `${value.toFixed(1)}/5`;
}

function getSleepQualityLabel(level: 1 | 2 | 3 | 4 | 5): string {
  switch (level) {
    case 1: return 'Poor';
    case 2: return 'Low';
    case 3: return 'Okay';
    case 4: return 'Good';
    case 5: return 'Great';
  }
}

function getEnergyLabel(level: 1 | 2 | 3 | 4 | 5): string {
  switch (level) {
    case 1: return 'Drained';
    case 2: return 'Low';
    case 3: return 'Stable';
    case 4: return 'Good';
    case 5: return 'High';
  }
}

function computeSleepStats(days: Record<string, DayData>, dateKeys: string[]): SleepDashboardStats {
  const sleepHoursValues: number[] = [];
  const qualityValues: number[] = [];
  const energyValues: number[] = [];

  const qualityCounts: Record<1 | 2 | 3 | 4 | 5, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };
  const energyCounts: Record<1 | 2 | 3 | 4 | 5, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  let trackedDays = 0;
  let notesCount = 0;
  let sleep7PlusNights = 0;

  for (const key of dateKeys) {
    const day = days[key];
    if (!day) continue;

    const hasRecoveryData =
      typeof day.sleepHours === 'number'
      || typeof day.sleepQuality === 'number'
      || typeof day.energyLevel === 'number'
      || Boolean(day.recoveryNote?.trim());

    if (hasRecoveryData) trackedDays += 1;
    if (day.recoveryNote?.trim()) notesCount += 1;

    if (typeof day.sleepHours === 'number' && Number.isFinite(day.sleepHours)) {
      sleepHoursValues.push(day.sleepHours);
      if (day.sleepHours >= 7) sleep7PlusNights += 1;
    }

    if (typeof day.sleepQuality === 'number') {
      qualityValues.push(day.sleepQuality);
      qualityCounts[day.sleepQuality] += 1;
    }

    if (typeof day.energyLevel === 'number') {
      energyValues.push(day.energyLevel);
      energyCounts[day.energyLevel] += 1;
    }
  }

  return {
    trackedDays,
    notesCount,
    avgSleepHours: avg(sleepHoursValues),
    avgQuality: avg(qualityValues),
    avgEnergy: avg(energyValues),
    sleep7PlusNights,
    qualityCounts,
    energyCounts,
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

const SleepIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
  </svg>
);

const QualityIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const EnergyIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const SleepLogIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="3" width="16" height="18" rx="2" />
    <line x1="8" y1="7" x2="16" y2="7" />
    <line x1="8" y1="11" x2="16" y2="11" />
    <line x1="8" y1="15" x2="13" y2="15" />
  </svg>
);

const NoteIcon = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 3h7v7" />
    <path d="M10 14 21 3" />
    <path d="M21 14v7H3V3h7" />
  </svg>
);

const DASHBOARD_GUIDE_STEPS = [
  {
    title: "Pick a date range",
    text: "Use the preset buttons (7 days, 30 days, etc.) or pick custom start/end dates to control what data you see.",
  },
  {
    title: "Filter by category",
    text: "Toggle Work, Gym, and Sleep on or off to focus on the data that matters to you right now.",
  },
  {
    title: "Read the charts",
    text: "Summary cards show totals, bar charts show earnings over time, and pie charts break down distributions.",
  },
  {
    title: "Keep logging",
    text: "The more days you log (shifts, gym sessions, sleep), the more useful the trends and averages become.",
  },
];

export function DashboardPage({ userId, days, settings, gymSessions }: DashboardPageProps) {
  const guide = usePageGuide(userId, "dashboard");
  const flatDailyPay = settings.workingDaysPerMonth > 0
    ? settings.monthlyFlatSalary / settings.workingDaysPerMonth
    : 0;

  const [activePreset, setActivePreset] = useState<DateRangePreset | null>('7d');
  const [dateRange, setDateRange] = useState<DateRange>(() => presetToRange('7d', days, gymSessions));
  const [visibleData, setVisibleData] = useState<DashboardDataVisibility>(DEFAULT_DASHBOARD_DATA_VISIBILITY);

  const handlePresetChange = useCallback((preset: DateRangePreset) => {
    setActivePreset(preset);
    setDateRange(presetToRange(preset, days, gymSessions));
  }, [days, gymSessions]);

  const handleCustomRange = useCallback((range: DateRange) => {
    setActivePreset(null);
    setDateRange(range);
  }, []);

  const handleToggleData = useCallback((key: DashboardDataKey) => {
    setVisibleData((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleShowAllData = useCallback(() => {
    setVisibleData(DEFAULT_DASHBOARD_DATA_VISIBILITY);
  }, []);

  const cur = settings.currency;
  const minSelectableDate = useMemo(() => getEarliestDateAll(days, gymSessions), [days, gymSessions]);
  const maxSelectableDate = todayStr();

  const dateKeys = useMemo(() => getDateRangeBetween(dateRange.from, dateRange.to), [dateRange]);
  const stats = useMemo(() => computeStats(days, dateKeys, flatDailyPay), [days, dateKeys, flatDailyPay]);
  const dailyTotals = useMemo(() => computeDailyTotals(days, dateKeys, flatDailyPay), [days, dateKeys, flatDailyPay]);
  const chartData = useMemo(() => getChartData(dailyTotals, cur), [dailyTotals, cur]);

  const gymStats = useMemo(() => computeGymStats(gymSessions, dateKeys), [gymSessions, dateKeys]);
  const sleepStats = useMemo(() => computeSleepStats(days, dateKeys), [days, dateKeys]);

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

  const sleepQualityPieSlices = useMemo(() => ([
    { label: getSleepQualityLabel(1), value: sleepStats.qualityCounts[1], color: '#f87171' },
    { label: getSleepQualityLabel(2), value: sleepStats.qualityCounts[2], color: '#f59e0b' },
    { label: getSleepQualityLabel(3), value: sleepStats.qualityCounts[3], color: '#60a5fa' },
    { label: getSleepQualityLabel(4), value: sleepStats.qualityCounts[4], color: '#34d399' },
    { label: getSleepQualityLabel(5), value: sleepStats.qualityCounts[5], color: '#a3e635' },
  ]), [sleepStats]);

  const sleepEnergyPieSlices = useMemo(() => ([
    { label: getEnergyLabel(1), value: sleepStats.energyCounts[1], color: '#fb7185' },
    { label: getEnergyLabel(2), value: sleepStats.energyCounts[2], color: '#f59e0b' },
    { label: getEnergyLabel(3), value: sleepStats.energyCounts[3], color: '#93c5fd' },
    { label: getEnergyLabel(4), value: sleepStats.energyCounts[4], color: '#22c55e' },
    { label: getEnergyLabel(5), value: sleepStats.energyCounts[5], color: '#14b8a6' },
  ]), [sleepStats]);
  const selectedRangeDays = dateKeys.length;
  const showWorkData = visibleData.work;
  const showGymData = visibleData.gym;
  const showSleepData = visibleData.sleep;
  const hasVisibleData = showWorkData || showGymData || showSleepData;
  const allDataVisible = showWorkData && showGymData && showSleepData;

  return (
    <div className="dashboard">
      <PageGuideModal
        userId={userId}
        pageKey="dashboard"
        title="Dashboard"
        description="Your analytics hub — see trends, totals, and distributions for work, gym, and sleep data."
        steps={DASHBOARD_GUIDE_STEPS}
        isOpen={guide.isOpen}
        onClose={guide.dismiss}
      />
      <div className="dashboard__hero">
        <div className="dashboard__title-row">
          <h2 className="dashboard__title">Dashboard</h2>
          <div className="date-picker__range-chip dashboard__range-chip" aria-live="polite">
            {selectedRangeDays} day{selectedRangeDays === 1 ? '' : 's'}
          </div>
          <button type="button" className="page-guide-trigger" onClick={guide.reopen}>
            <span className="page-guide-trigger__icon" aria-hidden="true">?</span>
            How it works
          </button>
        </div>

        <DateRangePicker
          value={dateRange}
          onChange={handleCustomRange}
          activePreset={activePreset}
          onPresetChange={handlePresetChange}
          minDate={minSelectableDate}
          maxDate={maxSelectableDate}
        />

        <div className="dashboard__data-filter" role="group" aria-label="Choose dashboard data to show">
          <span className="dashboard__data-filter-label">Show</span>
          <div className="dashboard__data-filter-chips">
            {DASHBOARD_DATA_FILTERS.map((item) => (
              <button
                key={item.key}
                type="button"
                className={`dashboard__data-filter-btn${visibleData[item.key] ? ' dashboard__data-filter-btn--active' : ''}`}
                onClick={() => handleToggleData(item.key)}
                aria-pressed={visibleData[item.key] ? "true" : "false"}
              >
                {item.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            className={`dashboard__data-filter-reset${allDataVisible ? ' dashboard__data-filter-reset--active' : ''}`}
            onClick={handleShowAllData}
          >
            Show all
          </button>
        </div>
      </div>

      {!hasVisibleData && (
        <section>
          <div className="dashboard__empty-selection">
            Select at least one data group (`Work`, `Gym`, `Sleep`) to show dashboard cards and charts.
          </div>
        </section>
      )}

      {showWorkData && (
        <>
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
        </>
      )}

      {showGymData && (
        <section>
          <h3 className="dashboard__section-title">Gym</h3>
          <div className="dashboard__cards dashboard__cards--3">
            <StatCard icon={GymIcon} label="Workouts" value={`${gymStats.workouts}`} variant="purple" />
            <StatCard icon={SetsIcon} label="Total Sets" value={`${gymStats.totalSets}`} variant="blue" />
            <StatCard icon={VolumeIcon} label="Volume" value={`${gymStats.totalVolume.toLocaleString()} kg`} variant="red" />
          </div>
        </section>
      )}

      {showSleepData && (
        <section>
          <h3 className="dashboard__section-title">Sleep / Recovery</h3>
          <div className="dashboard__cards dashboard__cards--3">
            <StatCard
              icon={SleepIcon}
              label="Avg Sleep"
              value={formatSleepHoursStat(sleepStats.avgSleepHours)}
              variant="blue"
            />
            <StatCard
              icon={QualityIcon}
              label="Avg Quality"
              value={formatScoreStat(sleepStats.avgQuality)}
              variant="purple"
            />
            <StatCard
              icon={EnergyIcon}
              label="Avg Energy"
              value={formatScoreStat(sleepStats.avgEnergy)}
              variant="green"
            />
            <StatCard
              icon={SleepLogIcon}
              label="Sleep Logs"
              value={`${sleepStats.trackedDays}/${selectedRangeDays}`}
              variant="amber"
            />
            <StatCard
              icon={ClockIcon}
              label="7h+ Nights"
              value={`${sleepStats.sleep7PlusNights}`}
              variant="accent"
            />
            <StatCard
              icon={NoteIcon}
              label="Recovery Notes"
              value={`${sleepStats.notesCount}`}
              variant="red"
            />
          </div>
        </section>
      )}

      {(showWorkData || showGymData || showSleepData) && (
        <section>
          <h3 className="dashboard__section-title">Distribution</h3>
          <div className="dashboard__pies">
            {showWorkData && (
              <div className="dashboard__pie-card">
                <h4 className="dashboard__pie-card-title">Earnings</h4>
                <PieChart slices={earningsPieSlices} currency={cur} />
              </div>
            )}
            {showGymData && (
              <div className="dashboard__pie-card">
                <h4 className="dashboard__pie-card-title">Gym Split</h4>
                <PieChart slices={gymSplitSlices} />
              </div>
            )}
            {showSleepData && (
              <div className="dashboard__pie-card">
                <h4 className="dashboard__pie-card-title">Sleep Quality</h4>
                <PieChart slices={sleepQualityPieSlices} />
              </div>
            )}
            {showSleepData && (
              <div className="dashboard__pie-card">
                <h4 className="dashboard__pie-card-title">Energy Levels</h4>
                <PieChart slices={sleepEnergyPieSlices} />
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
