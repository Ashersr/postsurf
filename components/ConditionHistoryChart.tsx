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

type TimeSlot = {
  timestamp: number;
  x: number;
  width: number;
  entries: { value: string; count: number; color: string }[];
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
  const [hover, setHover] = useState<TimeSlot | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const plotH = CHART_H - PADDING.top - PADDING.bottom;
  const plotBottom = PADDING.top + plotH;

  const slotWidth = horizon === "today" ? TODAY_SLOT_WIDTH : SLOT_WIDTH;
  const slotGap = horizon === "today" ? TODAY_SLOT_GAP : SLOT_GAP;

  const { timestamps, plotWidth, allBars, maxCount, timeSlots } = useMemo(() => {
    const slots = getMetricCountsByTimestamp(allReports, metric, horizon);

    const maxCount = Math.max(1, ...slots.map((s) => Math.max(...Array.from(s.counts.values()))));

    const optionCount = options.length;
    const barGap = 2;
    const groupGap = 4;
    const bars: BarPoint[] = [];

    const timeSlots: TimeSlot[] = slots.map((slot, slotIndex) => {
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

      return {
        timestamp: slot.timestamp,
        x: slotLeft,
        width: slotWidth,
        entries: options.map((value) => ({
          value,
          count: slot.counts.get(value) ?? 0,
          color: getOptionColor(metric, value),
        })),
      };
    });

    return {
      timestamps: slots.map((s) => s.timestamp),
      plotWidth: slots.length * (slotWidth + slotGap) - slotGap + PADDING.right,
      allBars: bars,
      maxCount,
      timeSlots,
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

  // Suppress chart hover/highlight styling while a modal is open.
  useEffect(() => {
    const syncModalState = () => {
      const open = document.querySelectorAll('[role="dialog"][aria-modal="true"]').length > 0;
      setIsModalOpen(open);
      if (open) {
        setHover(null);
      }
    };

    syncModalState();

    const observer = new MutationObserver(syncModalState);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

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

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!plotRef.current || isModalOpen) return;
      const rect = plotRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      if (mouseY < PADDING.top || mouseY > plotBottom) {
        setHover(null);
        return;
      }

      const slotSpan = slotWidth + slotGap;
      const slotIndex = Math.floor(mouseX / slotSpan);
      const slotLeft = slotIndex * slotSpan;

      if (
        slotIndex < 0 ||
        slotIndex >= timeSlots.length ||
        mouseX < slotLeft ||
        mouseX > slotLeft + slotWidth
      ) {
        setHover(null);
        return;
      }

      setHover(timeSlots[slotIndex]);
    },
    [timeSlots, plotBottom, slotWidth, slotGap, isModalOpen]
  );

  const hoverEntries = hover ? hover.entries.filter((e) => e.count > 0) : [];
  const tooltipH = hover ? 36 + Math.max(hoverEntries.length, 1) * 20 : 0;
  const tooltipX = hover
    ? hover.x + hover.width / 2 + TOOLTIP_W + 8 > plotWidth
      ? hover.x - TOOLTIP_W - 8
      : hover.x + hover.width / 2 + 8
    : 0;
  const tooltipY = hover
    ? Math.max(PADDING.top, Math.min(PADDING.top + 8, CHART_H - PADDING.bottom - tooltipH))
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
    <div
      style={{
        backgroundColor: isModalOpen ? "transparent" : "var(--color-surface)",
        width: "100%",
      }}
    >
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
              backgroundColor: isModalOpen ? "transparent" : "var(--color-surface)",
              boxShadow: isModalOpen ? "none" : "4px 0 8px -4px rgba(6, 27, 49, 0.08)",
            }}
          >
            <svg width={Y_LABEL_W} height={CHART_H}>
              {!isModalOpen && (
                <line
                  x1={Y_LABEL_W - 1}
                  y1={PADDING.top}
                  x2={Y_LABEL_W - 1}
                  y2={plotBottom}
                  stroke="var(--color-border)"
                  strokeWidth={1}
                />
              )}
              {yTicks.map(({ y, label }) => (
                <g key={label}>
                  {!isModalOpen && (
                    <line
                      x1={Y_LABEL_W - 5}
                      y1={y}
                      x2={Y_LABEL_W - 1}
                      y2={y}
                      stroke="var(--color-border)"
                      strokeWidth={1}
                    />
                  )}
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
            style={{
              display: "block",
              cursor: isModalOpen ? "default" : "crosshair",
              flexShrink: 0,
              pointerEvents: isModalOpen ? "none" : "auto",
            }}
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
                opacity={hover && !isModalOpen && hover.timestamp !== bar.timestamp ? 0.45 : 1}
              />
            ))}

            {/* Hover highlight + tooltip */}
            {hover && !isModalOpen && (
              <>
                <rect
                  x={hover.x}
                  y={PADDING.top}
                  width={hover.width}
                  height={plotH}
                  fill="var(--color-text)"
                  fillOpacity={0.04}
                  stroke="var(--color-text)"
                  strokeWidth={1}
                  rx={2}
                />
                <foreignObject
                  x={tooltipX}
                  y={tooltipY}
                  width={TOOLTIP_W}
                  height={tooltipH}
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
                    {hoverEntries.length === 0 ? (
                      <p
                        style={{
                          fontSize: 12,
                          color: "var(--color-text-muted)",
                          margin: "4px 0 0",
                        }}
                      >
                        No votes
                      </p>
                    ) : (
                      hoverEntries.map(({ value, count, color }) => (
                        <p
                          key={value}
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color,
                            margin: "4px 0 0",
                          }}
                        >
                          {value} · {count} {count === 1 ? "vote" : "votes"}
                        </p>
                      ))
                    )}
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
