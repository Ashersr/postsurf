"use client";

import Link from "next/link";
import { useState } from "react";
import type { FavoriteBreak } from "@/lib/breaks";
import { CONDITION_FIELDS, type ConditionKey, getSuggestionColor } from "@/lib/conditions";
import { getReportsForBreak, getBreakSummary, type TimeHorizon } from "@/lib/reportHistory";
import ConditionHistoryChart from "./ConditionHistoryChart";

const TIME_HORIZONS: { key: TimeHorizon; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "1w", label: "1W" },
  { key: "1m", label: "1M" },
];

export default function BreakDetailView({
  breakData,
}: {
  breakData: FavoriteBreak;
}) {
  const [horizon, setHorizon] = useState<TimeHorizon>("today");
  const [metric, setMetric] = useState<ConditionKey>("suggestion");

  const summary = getBreakSummary(breakData.id);
  const reports = getReportsForBreak(breakData.id, horizon);
  const latestReport = reports[reports.length - 1];

  const activeMetricLabel = CONDITION_FIELDS.find((f) => f.key === metric)?.label ?? "";

  return (
    <div>
      {/* Back link + heading */}
      <div className="mb-8">
        <Link
          href="/favorite-breaks"
          className="inline-flex items-center gap-1.5 text-[13px] mb-4 transition-colors"
          style={{ color: "var(--color-text-muted)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--color-text)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--color-text-muted)";
          }}
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Favorite breaks
        </Link>
        <h1
          className="text-2xl md:text-3xl font-semibold tracking-tight"
          style={{ color: "var(--color-text)" }}
        >
          {breakData.name}
        </h1>
        <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3 text-[13px]">
          <span style={{ color: "var(--color-text-muted)" }}>
            <span className="font-medium" style={{ color: "var(--color-text)" }}>
              {summary.reportFrequency}
            </span>{" "}
            reports in the last 24 hrs
          </span>
          <span
            className="hidden sm:block w-px h-3.5 shrink-0"
            style={{ backgroundColor: "var(--color-border)" }}
            aria-hidden
          />
          <span style={{ color: "var(--color-text-muted)" }}>
            Latest:{" "}
            <span className="font-medium tabular-nums" style={{ color: "var(--color-text)" }}>
              {summary.latestReport}
            </span>
          </span>
        </div>
      </div>

      {/* Headline facts — each derived from vote history */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-8">
        {CONDITION_FIELDS.map((field) => {
          const value = summary.conditions[field.key];
          const isSuggestion = field.key === "suggestion";
          return (
            <div
              key={field.key}
              className="rounded-lg border px-4 py-3.5"
              style={{
                backgroundColor: "var(--color-bg)",
                borderColor: "var(--color-border)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <p
                className="text-[11px] font-medium tracking-wide uppercase mb-1.5"
                style={{ color: "var(--color-text-muted)" }}
              >
                {field.label}
              </p>
              <p
                className="text-[15px] font-semibold leading-tight"
                style={{
                  color: isSuggestion
                    ? getSuggestionColor(summary.conditions.suggestion)
                    : "var(--color-text)",
                }}
              >
                {value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Metric tab selector + graph */}
      <div
        className="rounded-lg border overflow-hidden"
        style={{
          backgroundColor: "var(--color-bg)",
          borderColor: "var(--color-border)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        {/* Chart header */}
        <div
          className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between px-4 py-3 border-b"
          style={{ borderColor: "var(--color-border)" }}
        >
          <span
            className="text-[13px] font-medium"
            style={{ color: "var(--color-text-muted)" }}
          >
            {activeMetricLabel} history
          </span>
          {latestReport && (
            <span
              className="text-[12px] tabular-nums"
              style={{ color: "var(--color-text-muted)" }}
            >
              Latest report{" "}
              {new Date(latestReport.reportedAt).toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>

        {/* Metric tabs */}
        <div
          className="flex items-center gap-1.5 px-4 py-3 border-b overflow-x-auto"
          style={{ borderColor: "var(--color-border)" }}
        >
          {CONDITION_FIELDS.map((field) => {
            const isActive = metric === field.key;
            return (
              <button
                key={field.key}
                type="button"
                onClick={() => setMetric(field.key)}
                className="shrink-0 px-3 py-1 rounded text-[12px] font-medium transition-colors"
                style={{
                  color: isActive ? "var(--color-primary)" : "var(--color-text-muted)",
                  backgroundColor: isActive ? "var(--color-primary-subtle)" : "transparent",
                  border: `1px solid ${isActive ? "var(--color-primary-subtle)" : "var(--color-border)"}`,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = "var(--color-text)";
                    e.currentTarget.style.backgroundColor = "var(--color-surface)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = "var(--color-text-muted)";
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
              >
                {field.label}
              </button>
            );
          })}
        </div>

        {/* Chart */}
        <ConditionHistoryChart breakId={breakData.id} horizon={horizon} metric={metric} />

        {/* Time horizon pills */}
        <div
          className="flex items-center gap-1.5 px-4 py-3 border-t"
          style={{ borderColor: "var(--color-border)" }}
        >
          {TIME_HORIZONS.map((h) => {
            const isActive = horizon === h.key;
            return (
              <button
                key={h.key}
                type="button"
                onClick={() => setHorizon(h.key)}
                className="px-3 py-1 rounded text-[12px] font-medium transition-colors"
                style={{
                  color: isActive ? "var(--color-primary)" : "var(--color-text-muted)",
                  backgroundColor: isActive ? "var(--color-primary-subtle)" : "transparent",
                  border: `1px solid ${isActive ? "var(--color-primary-subtle)" : "var(--color-border)"}`,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = "var(--color-text)";
                    e.currentTarget.style.backgroundColor = "var(--color-surface)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = "var(--color-text-muted)";
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
              >
                {h.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
