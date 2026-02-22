import { useState } from 'react';
import type { ChartDataPoint } from '../../utils/dashboardUtils';

type BarChartProps = {
  data: ChartDataPoint[];
  height?: number;
  barColor?: string;
};

const PADDING_LEFT = 55;
const PADDING_RIGHT = 10;
const PADDING_TOP = 16;
const PADDING_BOTTOM = 40;
const VIEW_WIDTH = 800;

export function BarChart({ data, height = 260, barColor = 'var(--clr-accent)' }: BarChartProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  if (data.length === 0) {
    return <div className="bar-chart__empty">No data for this period</div>;
  }

  const viewHeight = height;
  const chartW = VIEW_WIDTH - PADDING_LEFT - PADDING_RIGHT;
  const chartH = viewHeight - PADDING_TOP - PADDING_BOTTOM;

  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const barCount = data.length;
  const gap = Math.min(4, chartW / barCount * 0.15);
  const barW = Math.max(4, (chartW - gap * (barCount - 1)) / barCount);

  // Y-axis grid lines (5 lines)
  const gridLines = Array.from({ length: 5 }, (_, i) => {
    const val = (maxVal / 4) * i;
    const y = PADDING_TOP + chartH - (val / maxVal) * chartH;
    return { val, y };
  });

  return (
    <div className="bar-chart">
      <svg
        viewBox={`0 0 ${VIEW_WIDTH} ${viewHeight}`}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Grid lines */}
        {gridLines.map(({ val, y }) => (
          <g key={val}>
            <line
              x1={PADDING_LEFT}
              y1={y}
              x2={VIEW_WIDTH - PADDING_RIGHT}
              y2={y}
              stroke="var(--clr-border)"
              strokeDasharray="4 4"
            />
            <text
              x={PADDING_LEFT - 8}
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

        {/* Bars */}
        {data.map((d, i) => {
          const barH = maxVal > 0 ? (d.value / maxVal) * chartH : 0;
          const x = PADDING_LEFT + i * (barW + gap);
          const y = PADDING_TOP + chartH - barH;
          const isHovered = hovered === i;

          return (
            <g
              key={i}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: 'pointer' }}
            >
              <title>{d.tooltip}</title>
              <rect
                x={x}
                y={y}
                width={barW}
                height={Math.max(barH, 1)}
                rx={Math.min(4, barW / 2)}
                fill={barColor}
                opacity={isHovered ? 1 : 0.8}
                style={{ transition: 'opacity 0.15s' }}
              />
              {/* X-axis label */}
              {(barCount <= 31 || i % Math.ceil(barCount / 20) === 0) && (
                <text
                  x={x + barW / 2}
                  y={PADDING_TOP + chartH + 18}
                  textAnchor="middle"
                  fill="var(--clr-text-dim)"
                  fontSize={barCount > 20 ? '9' : '11'}
                  fontFamily="inherit"
                  transform={barCount > 14 ? `rotate(-45, ${x + barW / 2}, ${PADDING_TOP + chartH + 18})` : undefined}
                >
                  {d.label}
                </text>
              )}
            </g>
          );
        })}

        {/* Tooltip bubble */}
        {hovered !== null && (() => {
          const d = data[hovered];
          const barH = (d.value / maxVal) * chartH;
          const x = PADDING_LEFT + hovered * (barW + gap) + barW / 2;
          const y = PADDING_TOP + chartH - barH - 10;
          const tipW = 120;
          const tipH = 24;
          const tipX = Math.max(PADDING_LEFT, Math.min(x - tipW / 2, VIEW_WIDTH - PADDING_RIGHT - tipW));
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
