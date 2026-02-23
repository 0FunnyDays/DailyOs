import { useState } from 'react';

export type PieSlice = {
  label: string;
  value: number;
  color: string;
};

type PieChartProps = {
  slices: PieSlice[];
  size?: number;
  currency?: string;
};

const INNER_RADIUS = 55; // donut hole
const OUTER_RADIUS = 90;

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

export function PieChart({ slices, size = 200, currency }: PieChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const total = slices.reduce((sum, s) => sum + s.value, 0);

  if (total === 0) {
    return <div className="pie-chart__empty">No data for this period</div>;
  }

  const cx = size / 2;
  const cy = size / 2;
  const scale = size / 200; // scale radii relative to size
  const r1 = INNER_RADIUS * scale;
  const r2 = OUTER_RADIUS * scale;

  const positiveSlices = slices.filter((s) => s.value > 0);
  const arcs = positiveSlices
    .map((slice, i) => {
      const sweep = (slice.value / total) * 360;
      // Avoid full 360 sweep (SVG arc bug) — clamp to 359.99
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
            return (
              <path
                key={arc.slice.label}
                d={describeArc(cx, cy, r1, r2, arc.startAngle, arc.endAngle)}
                fill={arc.slice.color}
                opacity={hovered === null || isHovered ? 1 : 0.4}
                style={{
                  transition: 'opacity 0.2s, transform 0.2s',
                  transformOrigin: `${cx}px ${cy}px`,
                  transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                  cursor: 'pointer',
                }}
                onMouseEnter={() => setHovered(idx)}
                onMouseLeave={() => setHovered(null)}
              />
            );
          })}
        </svg>

        {/* Center label */}
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

      {/* Legend */}
      <div className="pie-chart__legend">
        {arcs.map((arc, idx) => (
          <div
            key={arc.slice.label}
            className={`pie-chart__legend-item ${hovered === idx ? 'pie-chart__legend-item--active' : ''}`}
            onMouseEnter={() => setHovered(idx)}
            onMouseLeave={() => setHovered(null)}
          >
            <span className="pie-chart__legend-dot" style={{ background: arc.slice.color }} />
            <span className="pie-chart__legend-label">{arc.slice.label}</span>
            <span className="pie-chart__legend-pct">{arc.pct.toFixed(0)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
