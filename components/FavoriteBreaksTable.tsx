"use client";

import Link from "next/link";
import { useState } from "react";
import {
  CONDITION_FIELDS,
  getSuggestionColor,
  type ConditionKey,
} from "@/lib/conditions";
import { getBreakSummary } from "@/lib/reportHistory";
import AddBreakModal from "./AddBreakModal";
import { useCredits } from "./CreditsProvider";
import { useFavoriteBreaks } from "./FavoriteBreaksProvider";

const MOBILE_CARD_CONDITION_KEYS: ConditionKey[] = ["suggestion", "waveHeight"];

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}

export default function FavoriteBreaksTable() {
  const { favoriteBreaks: breaks } = useFavoriteBreaks();
  const { credits, deductCredit } = useCredits();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddBreakModalOpen, setIsAddBreakModalOpen] = useState(false);
  const [conditionsVisible, setConditionsVisible] = useState(false);

  const handleConfirmShowConditions = () => {
    deductCredit(1);
    setConditionsVisible(true);
    setIsModalOpen(false);
  };

  const handleRequestShowConditions = () => {
    if (!conditionsVisible) {
      setIsModalOpen(true);
    }
  };

  const colCount = conditionsVisible
    ? 3 + CONDITION_FIELDS.length + 1
    : 4;

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1
            className="text-2xl md:text-3xl font-semibold tracking-tight"
            style={{ color: "var(--color-text)" }}
          >
            Favorite breaks
          </h1>
          <p
            className="mt-1.5 text-sm"
            style={{ color: "var(--color-text-muted)" }}
          >
            Manage report frequency and review the latest conditions for your
            saved breaks.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            className="inline-flex shrink-0 items-center rounded border px-3 py-1.5 text-[13px] font-medium transition-colors"
            style={{
              borderColor: "var(--color-border)",
              color: "var(--color-text)",
              backgroundColor: "var(--color-bg)",
            }}
            onClick={() => setIsAddBreakModalOpen(true)}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "var(--color-surface)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "var(--color-bg)";
            }}
          >
            Add break
          </button>
          {!conditionsVisible && (
            <button
              type="button"
              className="inline-flex shrink-0 items-center rounded px-3 py-1.5 text-[13px] font-medium text-white transition-colors"
              style={{ backgroundColor: "var(--color-primary)" }}
              onClick={handleRequestShowConditions}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  "var(--color-primary-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--color-primary)";
              }}
            >
              Show conditions
            </button>
          )}
        </div>
      </div>

      <div className="relative">
        {/* Desktop table */}
        <div
          className="hidden md:block overflow-hidden rounded-lg border"
          style={{
            backgroundColor: "var(--color-bg)",
            borderColor: "var(--color-border)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid var(--color-border)",
                    backgroundColor: "var(--color-surface)",
                  }}
                >
                  <th
                    scope="col"
                    className="px-4 py-2.5 text-[11px] font-medium tracking-wide uppercase min-w-[200px]"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Break name
                  </th>
                  {conditionsVisible &&
                    CONDITION_FIELDS.map((field) => (
                      <th
                        key={field.key}
                        scope="col"
                        className="px-4 py-2.5 text-[11px] font-medium tracking-wide uppercase w-[130px]"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        {field.label}
                      </th>
                    ))}
                  <th
                    scope="col"
                    className="px-4 py-2.5 text-[11px] font-medium tracking-wide uppercase w-[190px]"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    # reports today
                  </th>
                  <th
                    scope="col"
                    className="px-4 py-2.5 text-[11px] font-medium tracking-wide uppercase w-[140px]"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    Latest report
                  </th>
                  {conditionsVisible ? (
                    <th
                      scope="col"
                      className="px-4 py-2.5 text-[11px] font-medium tracking-wide uppercase w-[130px]"
                      style={{ color: "var(--color-text-muted)" }}
                    />
                  ) : (
                    <th
                      scope="col"
                      className="px-4 py-2.5 w-[48px]"
                      aria-label="View conditions"
                    />
                  )}
                </tr>
              </thead>
              <tbody>
                {breaks.length === 0 ? (
                  <tr>
                    <td
                      colSpan={colCount}
                      className="px-4 py-16 text-center text-sm"
                      style={{ color: "var(--color-text-muted)" }}
                    >
                      No favorite breaks yet. Save a break to start tracking
                      reports.
                    </td>
                  </tr>
                ) : (
                  breaks.map((item, index) => {
                    const summary = getBreakSummary(item.id);
                    return (
                      <tr
                        key={item.id}
                        className={`group transition-colors${conditionsVisible ? "" : " cursor-pointer"}`}
                        style={{
                          borderBottom:
                            index < breaks.length - 1
                              ? "1px solid var(--color-border)"
                              : undefined,
                        }}
                        onClick={
                          conditionsVisible
                            ? undefined
                            : handleRequestShowConditions
                        }
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor =
                            "var(--color-surface)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        <td className="px-4 py-3">
                          <span
                            className="text-[13px] font-medium"
                            style={{ color: "var(--color-text)" }}
                          >
                            {item.name}
                          </span>
                        </td>
                        {conditionsVisible && (
                          <>
                            {CONDITION_FIELDS.map((field) => {
                              const value = summary.conditions[field.key];
                              const isSuggestion = field.key === "suggestion";
                              return (
                                <td key={field.key} className="px-4 py-3">
                                  <span
                                    className={`text-[13px]${isSuggestion ? " font-medium" : ""}`}
                                    style={{
                                      color: isSuggestion
                                        ? getSuggestionColor(summary.conditions.suggestion)
                                        : "var(--color-text-muted)",
                                    }}
                                  >
                                    {value}
                                  </span>
                                </td>
                              );
                            })}
                          </>
                        )}
                        <td className="px-4 py-3">
                          <span
                            className="text-[13px] tabular-nums"
                            style={{ color: "var(--color-text-muted)" }}
                          >
                            {summary.reportFrequency}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="text-[13px] tabular-nums"
                            style={{ color: "var(--color-text-muted)" }}
                          >
                            {summary.latestReport}
                          </span>
                        </td>
                        {conditionsVisible ? (
                          <td className="px-4 py-3 text-right">
                            <Link
                              href={`/favorite-breaks/${item.id}`}
                              className="inline-flex shrink-0 items-center whitespace-nowrap rounded border px-3 py-1 text-[12px] font-medium transition-colors"
                              style={{
                                borderColor: "var(--color-border)",
                                color: "var(--color-text-muted)",
                                backgroundColor: "var(--color-bg)",
                              }}
                              onClick={(e) => e.stopPropagation()}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "var(--color-surface)";
                                e.currentTarget.style.borderColor =
                                  "var(--color-text-muted)";
                                e.currentTarget.style.color =
                                  "var(--color-text)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "var(--color-bg)";
                                e.currentTarget.style.borderColor =
                                  "var(--color-border)";
                                e.currentTarget.style.color =
                                  "var(--color-text-muted)";
                              }}
                            >
                              See details
                            </Link>
                          </td>
                        ) : (
                          <td className="px-4 py-3 text-right">
                            <span style={{ color: "var(--color-text-muted)" }}>
                              <EyeIcon className="w-4 h-4 inline-block" />
                            </span>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile card list */}
        <div className="md:hidden">
          {breaks.length === 0 ? (
            <p
              className="py-12 text-center text-sm"
              style={{ color: "var(--color-text-muted)" }}
            >
              No favorite breaks yet. Save a break to start tracking reports.
            </p>
          ) : (
            <div
              className="rounded-lg border overflow-hidden"
              style={{
                backgroundColor: "var(--color-bg)",
                borderColor: "var(--color-border)",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              {breaks.map((item, index) => {
                const summary = getBreakSummary(item.id);
                return (
                  <div
                    key={item.id}
                    className={`px-4 py-3.5${conditionsVisible ? "" : " cursor-pointer"}`}
                    style={{
                      borderBottom:
                        index < breaks.length - 1
                          ? "1px solid var(--color-border)"
                          : undefined,
                    }}
                    onClick={
                      conditionsVisible ? undefined : handleRequestShowConditions
                    }
                    onMouseEnter={
                      conditionsVisible
                        ? undefined
                        : (e) => {
                            e.currentTarget.style.backgroundColor =
                              "var(--color-surface)";
                          }
                    }
                    onMouseLeave={
                      conditionsVisible
                        ? undefined
                        : (e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                          }
                    }
                  >
                    {conditionsVisible ? (
                      <>
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <span
                            className="text-[14px] font-medium leading-snug"
                            style={{ color: "var(--color-text)" }}
                          >
                            {item.name}
                          </span>
                          <Link
                            href={`/favorite-breaks/${item.id}`}
                            className="shrink-0 rounded border px-2.5 py-1 text-[12px] font-medium transition-colors"
                            style={{
                              borderColor: "var(--color-border)",
                              color: "var(--color-text-muted)",
                              backgroundColor: "var(--color-bg)",
                            }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            Details
                          </Link>
                        </div>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                          {MOBILE_CARD_CONDITION_KEYS.map((key) => {
                            const field = CONDITION_FIELDS.find((f) => f.key === key)!;
                            const value = summary.conditions[field.key];
                            const isSuggestion = field.key === "suggestion";
                            return (
                              <div key={field.key} className="flex flex-col gap-0.5">
                                <span
                                  className="text-[10px] font-medium tracking-wide uppercase"
                                  style={{ color: "var(--color-text-muted)" }}
                                >
                                  {field.label}
                                </span>
                                <span
                                  className={`text-[13px]${isSuggestion ? " font-medium" : ""}`}
                                  style={{
                                    color: isSuggestion
                                      ? getSuggestionColor(summary.conditions.suggestion)
                                      : "var(--color-text)",
                                  }}
                                >
                                  {value}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        <div className="flex items-center gap-3 mt-2.5">
                          <span
                            className="text-[12px] tabular-nums"
                            style={{ color: "var(--color-text-muted)" }}
                          >
                            {summary.reportFrequency} reports today
                          </span>
                          <span
                            className="w-px h-3 shrink-0"
                            style={{ backgroundColor: "var(--color-border)" }}
                            aria-hidden
                          />
                          <span
                            className="text-[12px] tabular-nums"
                            style={{ color: "var(--color-text-muted)" }}
                          >
                            Latest: {summary.latestReport}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="min-w-0 flex-1">
                          <span
                            className="text-[14px] font-medium leading-snug"
                            style={{ color: "var(--color-text)" }}
                          >
                            {item.name}
                          </span>
                          <div className="flex items-center gap-3 mt-2">
                            <span
                              className="text-[12px] tabular-nums"
                              style={{ color: "var(--color-text-muted)" }}
                            >
                              {summary.reportFrequency} reports today
                            </span>
                            <span
                              className="w-px h-3 shrink-0"
                              style={{ backgroundColor: "var(--color-border)" }}
                              aria-hidden
                            />
                            <span
                              className="text-[12px] tabular-nums"
                              style={{ color: "var(--color-text-muted)" }}
                            >
                              Latest: {summary.latestReport}
                            </span>
                          </div>
                        </div>
                        <span
                          className="shrink-0"
                          style={{ color: "var(--color-text-muted)" }}
                        >
                          <EyeIcon className="w-4 h-4" />
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {isAddBreakModalOpen && (
        <AddBreakModal onClose={() => setIsAddBreakModalOpen(false)} />
      )}

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="show-conditions-title"
        >
          <button
            type="button"
            className="absolute inset-0 cursor-default"
            style={{ backgroundColor: "rgba(6, 27, 49, 0.4)" }}
            aria-label="Close dialog"
            onClick={() => setIsModalOpen(false)}
          />
          <div
            className="relative w-full max-w-md rounded-lg border p-6"
            style={{
              backgroundColor: "var(--color-bg)",
              borderColor: "var(--color-border)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <p
              id="show-conditions-title"
              className="text-[15px] leading-relaxed"
              style={{ color: "var(--color-text)" }}
            >
              Showing the conditions will cost 1 credit.
            </p>
            <p
              className="mt-3 text-[13px] leading-relaxed"
              style={{ color: "var(--color-text-muted)" }}
            >
              Tip: You can replenish your credits by rating the conditions after
              you surf. Plus, it&apos;s a good way to give back to your surf
              community.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                className="inline-flex items-center rounded border px-4 py-2 text-[13px] font-medium transition-colors"
                style={{
                  borderColor: "var(--color-border)",
                  color: "var(--color-text)",
                  backgroundColor: "var(--color-bg)",
                }}
                onClick={() => setIsModalOpen(false)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor =
                    "var(--color-surface)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "var(--color-bg)";
                }}
              >
                cancel
              </button>
              <button
                type="button"
                className="inline-flex items-center rounded px-4 py-2 text-[13px] font-medium text-white transition-colors"
                style={{
                  backgroundColor:
                    credits < 1
                      ? "var(--color-text-muted)"
                      : "var(--color-primary)",
                  cursor: credits < 1 ? "not-allowed" : undefined,
                }}
                disabled={credits < 1}
                onClick={handleConfirmShowConditions}
                onMouseEnter={(e) => {
                  if (credits >= 1)
                    e.currentTarget.style.backgroundColor =
                      "var(--color-primary-hover)";
                }}
                onMouseLeave={(e) => {
                  if (credits >= 1)
                    e.currentTarget.style.backgroundColor =
                      "var(--color-primary)";
                }}
              >
                Show conditions
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
