"use client";

import { useRef, useState, useCallback, useEffect, useMemo } from "react";
import {
  type ConditionKey,
  CONDITION_FIELDS,
  getOptionColor,
} from "@/lib/conditions";
import {
  getReportsForBreak,
  getMetricCountsByTimestamp,
  REFERENCE_NOW,
  type TimeHorizon,
} from "@/lib/reportHistory";

const CHART_H = 240;
const Y_LABEL_W = 48;
const PADDING = { top: 16, right: 20, bottom: 32, left: 0 };
const SLOT_WIDTH = 72;
const SLOT_GAP = 12;
const TODAY_SLOT_WIDTH = 48;
const TODAY_SLOT_GAP = 8;

type BarPoint = {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  value: string;
  count: number;
  timestamp: number;
};

function formatXLabel(date: Date, horizon: TimeHorizon): string {
  if (horizon === "today") {
    const h = date.getHours();
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12} ${ampm}`;
  }
  if (horizon === "1w") {
    return date.toLocaleDateString("en-US", { weekday: "short" });
  }
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatTooltipTime(date: Date, horizon: TimeHorizon): string {
  if (horizon === "today") {
    const h = date.getHours();
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12} ${ampm} hour`;
  }
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

type Props = {
  breakId: string;
  horizon: TimeHorizon;
  metric: ConditionKey;
};

export default function ConditionHistoryChart({ breakId, horizon, metric }: Props) {
  const allReports = getReportsForBreak(breakId, horizon);
  const metricField = CONDITION_FIELDS.find((f) => f.key === metric)!;
  const options = metricField.options as readonly string[];

  const scrollRef = useRef<HTMLDivElement>(null);
  const plotRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<BarPoint | null>(null);

  const plotH = CHART_H - PADDING.top - PADDING.bottom;
  const plotBottom = PADDING.top + plotH;

  const slotWidth = horizon === "today" ? TODAY_SLOT_WIDTH : SLOT_WIDTH;
  const slotGap = horizon === "today" ? TODAY_SLOT_GAP : SLOT_GAP;

  const { timestamps, plotWidth, allBars, maxCount } = useMemo(() => {
    const slots = getMetricCountsByTimestamp(allReports, metric, horizon);

    const maxCount = Math.max(1, ...slots.map((s) => Math.max(...Array.from(s.counts.values()))));

    const optionCount = options.length;
    const barGap = 2;
    const groupGap = 4;
    const bars: BarPoint[] = [];

    slots.forEach((slot, slotIndex) => {
      const slotLeft = slotIndex * (slotWidth + slotGap);
      const barWidth = (slotWidth - barGap * (optionCount - 1) - groupGap) / optionCount;

      options.forEach((value, optIndex) => {
        const count = slot.counts.get(value) ?? 0;
        if (count === 0) return;

        const height = (count / maxCount) * plotH;
        const x = slotLeft + optIndex * (barWidth + barGap);
        const y = plotBottom - height;

        bars.push({
          x,
          y,
          width: Math.max(barWidth, 3),
          height,
          color: getOptionColor(metric, value),
          value,
          count,
          timestamp: slot.timestamp,
        });
      });
    });

    return {
      timestamps: slots.map((s) => s.timestamp),
      plotWidth: slots.length * (slotWidth + slotGap) - slotGap + PADDING.right,
      allBars: bars,
      maxCount,
    };
  }, [allReports, metric, horizon, options, plotH, plotBottom, slotWidth, slotGap]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (horizon === "today") {
      const currentHour = new Date(REFERENCE_NOW).getHours();
      const slotLeft = currentHour * (slotWidth + slotGap);
      el.scrollLeft = Math.max(
        0,
        Math.min(slotLeft - el.clientWidth / 2 + slotWidth / 2, el.scrollWidth - el.clientWidth)
      );
    } else {
      el.scrollLeft = el.scrollWidth - el.clientWidth;
    }
  }, [breakId, horizon, metric, plotWidth, slotWidth, slotGap]);

  // Y-axis: integer ticks from 0 to maxCount
  const yTicks = useMemo(() => {
    const ticks: { y: number; label: string }[] = [];
    for (let i = 0; i <= maxCount; i++) {
      ticks.push({
        y: plotBottom - (i / maxCount) * plotH,
        label: String(i),
      });
    }
    return ticks;
  }, [maxCount, plotBottom, plotH]);

  const TOOLTIP_W = 180;
  const TOOLTIP_H = 52;

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!plotRef.current || !scrollRef.current) return;
      const rect = plotRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left + scrollRef.current.scrollLeft;
      const mouseY = e.clientY - rect.top;

      let nearest: BarPoint | null = null;
      let nearestDist = Infinity;

      for (const bar of allBars) {
        if (
          mouseX >= bar.x &&
          mouseX <= bar.x + bar.width &&
          mouseY >= bar.y &&
          mouseY <= plotBottom
        ) {
          const cx = bar.x + bar.width / 2;
          const cy = bar.y + bar.height / 2;
          const dist = Math.hypot(mouseX - cx, mouseY - cy);
          if (dist < nearestDist) {
            nearestDist = dist;
            nearest = bar;
          }
        }
      }

      setHover(nearest);
    },
    [allBars, plotBottom]
  );

  const tooltipX = hover
    ? hover.x + hover.width / 2 + TOOLTIP_W + 8 > plotWidth
      ? hover.x - TOOLTIP_W - 8
      : hover.x + hover.width / 2 + 8
    : 0;
  const tooltipY = hover
    ? Math.max(
        PADDING.top,
        Math.min(hover.y - TOOLTIP_H / 2, CHART_H - PADDING.bottom - TOOLTIP_H)
      )
    : 0;

  if (allReports.length === 0 && horizon !== "today") {
    return (
      <div
        className="flex flex-col items-center justify-center gap-2 py-16"
        style={{ minHeight: CHART_H, backgroundColor: "var(--color-surface)" }}
      >
        <p className="text-[13px]" style={{ color: "var(--color-text-muted)" }}>
          No reports in this time period
        </p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "var(--color-surface)", width: "100%" }}>
      <div
        ref={scrollRef}
        className="overflow-x-auto"
        style={{ scrollbarGutter: "stable" }}
      >
        <div className="flex" style={{ minWidth: "min-content" }}>
          {/* Sticky Y-axis */}
          <div
            className="sticky left-0 z-10 shrink-0"
            style={{
              width: Y_LABEL_W,
              backgroundColor: "var(--color-surface)",
              boxShadow: "4px 0 8px -4px rgba(6, 27, 49, 0.08)",
            }}
          >
            <svg width={Y_LABEL_W} height={CHART_H}>
              <line
                x1={Y_LABEL_W - 1}
                y1={PADDING.top}
                x2={Y_LABEL_W - 1}
                y2={plotBottom}
                stroke="var(--color-border)"
                strokeWidth={1}
              />
              {yTicks.map(({ y, label }) => (
                <g key={label}>
                  <line
                    x1={Y_LABEL_W - 5}
                    y1={y}
                    x2={Y_LABEL_W - 1}
                    y2={y}
                    stroke="var(--color-border)"
                    strokeWidth={1}
                  />
                  <text
                    x={Y_LABEL_W - 9}
                    y={y}
                    dominantBaseline="middle"
                    textAnchor="end"
                    fontSize={11}
                    fill="var(--color-text-muted)"
                    fontFamily="inherit"
                  >
                    {label}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          {/* Scrollable plot */}
          <svg
            ref={plotRef}
            width={plotWidth}
            height={CHART_H}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHover(null)}
            style={{ display: "block", cursor: "crosshair", flexShrink: 0 }}
          >
            {/* Horizontal grid lines */}
            {yTicks.map(({ y, label }) => (
              <line
                key={label}
                x1={0}
                y1={y}
                x2={plotWidth}
                y2={y}
                stroke="var(--color-border)"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
            ))}

            {/* X-axis baseline */}
            <line
              x1={0}
              y1={plotBottom}
              x2={plotWidth}
              y2={plotBottom}
              stroke="var(--color-border)"
              strokeWidth={1}
            />

            {/* X-axis labels */}
            {timestamps.map((ts, slotIndex) => {
              const x = slotIndex * (slotWidth + slotGap) + slotWidth / 2;
              return (
                <text
                  key={ts}
                  x={x}
                  y={CHART_H - PADDING.bottom + 14}
                  textAnchor="middle"
                  fontSize={11}
                  fill="var(--color-text-muted)"
                  fontFamily="inherit"
                >
                  {formatXLabel(new Date(ts), horizon)}
                </text>
              );
            })}

            {/* Bars */}
            {allBars.map((bar, i) => (
              <rect
                key={i}
                x={bar.x}
                y={bar.y}
                width={bar.width}
                height={bar.height}
                fill={bar.color}
                rx={1}
                opacity={hover && hover !== bar ? 0.45 : 1}
              />
            ))}

            {/* Hover highlight + tooltip */}
            {hover && (
              <>
                <rect
                  x={hover.x}
                  y={hover.y}
                  width={hover.width}
                  height={hover.height}
                  fill="none"
                  stroke="var(--color-text)"
                  strokeWidth={1.5}
                  rx={1}
                />
                <foreignObject
                  x={tooltipX}
                  y={tooltipY}
                  width={TOOLTIP_W}
                  height={TOOLTIP_H}
                >
                  <div
                    style={{
                      backgroundColor: "var(--color-bg)",
                      border: "1px solid var(--color-border)",
                      boxShadow: "var(--shadow-sm)",
                      borderRadius: 6,
                      padding: "6px 10px",
                      fontFamily: "inherit",
                      pointerEvents: "none",
                    }}
                  >
                    <p
                      style={{
                        fontSize: 11,
                        color: "var(--color-text-muted)",
                        margin: 0,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {formatTooltipTime(new Date(hover.timestamp), horizon)}
                    </p>
                    <p
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: hover.color,
                        margin: "2px 0 0",
                      }}
                    >
                      {hover.value} · {hover.count} {hover.count === 1 ? "vote" : "votes"}
                    </p>
                  </div>
                </foreignObject>
              </>
            )}
          </svg>
        </div>
      </div>

      {/* Legend — options for selected metric only */}
      <div
        className="flex flex-wrap items-center gap-x-4 gap-y-1.5 px-4 py-2 border-t"
        style={{ borderColor: "var(--color-border)" }}
      >
        {options.map((value) => (
          <div key={value} className="flex items-center gap-1.5">
            <span
              style={{
                display: "inline-block",
                width: 10,
                height: 10,
                backgroundColor: getOptionColor(metric, value),
                borderRadius: 2,
                flexShrink: 0,
              }}
            />
            <span className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
