"use client";

import Link from "next/link";
import { useState } from "react";
import { FAVORITE_BREAKS } from "@/lib/breaks";
import { CONDITION_FIELDS, getSuggestionColor } from "@/lib/conditions";
import { getBreakSummary } from "@/lib/reportHistory";
import { useCredits } from "./CreditsProvider";

export default function FavoriteBreaksTable() {
  const breaks = FAVORITE_BREAKS;
  const { credits, deductCredit } = useCredits();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [conditionsVisible, setConditionsVisible] = useState(false);

  const handleConfirmShowConditions = () => {
    deductCredit(1);
    setConditionsVisible(true);
    setIsModalOpen(false);
  };

  const colCount = 3 + (conditionsVisible ? CONDITION_FIELDS.length + 1 : 0);

  return (
    <>
      <div className="relative">
        {!conditionsVisible && (
          <div className="mb-3 flex justify-end">
            <button
              type="button"
              className="inline-flex items-center rounded border px-3 py-1.5 text-[13px] font-medium transition-colors"
              style={{
                borderColor: "var(--color-border)",
                color: "var(--color-text)",
                backgroundColor: "var(--color-bg)",
              }}
              onClick={() => setIsModalOpen(true)}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--color-surface)";
                e.currentTarget.style.borderColor = "var(--color-text-muted)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--color-bg)";
                e.currentTarget.style.borderColor = "var(--color-border)";
              }}
            >
              Show conditions
            </button>
          </div>
        )}

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
                  {conditionsVisible && (
                    <th
                      scope="col"
                      className="px-4 py-2.5 text-[11px] font-medium tracking-wide uppercase w-[130px]"
                      style={{ color: "var(--color-text-muted)" }}
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
                        className="group transition-colors"
                        style={{
                          borderBottom:
                            index < breaks.length - 1
                              ? "1px solid var(--color-border)"
                              : undefined,
                        }}
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
                            <td className="px-4 py-3 text-right">
                              <Link
                                href={`/favorite-breaks/${item.id}`}
                                className="inline-flex shrink-0 items-center whitespace-nowrap rounded border px-3 py-1 text-[12px] font-medium transition-colors"
                                style={{
                                  borderColor: "var(--color-border)",
                                  color: "var(--color-text-muted)",
                                  backgroundColor: "var(--color-bg)",
                                }}
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
                          </>
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
                    className="px-4 py-3.5"
                    style={{
                      borderBottom:
                        index < breaks.length - 1
                          ? "1px solid var(--color-border)"
                          : undefined,
                    }}
                  >
                    {/* Name + details link */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <span
                        className="text-[14px] font-medium leading-snug"
                        style={{ color: "var(--color-text)" }}
                      >
                        {item.name}
                      </span>
                      {conditionsVisible && (
                        <Link
                          href={`/favorite-breaks/${item.id}`}
                          className="shrink-0 rounded border px-2.5 py-1 text-[12px] font-medium transition-colors"
                          style={{
                            borderColor: "var(--color-border)",
                            color: "var(--color-text-muted)",
                            backgroundColor: "var(--color-bg)",
                          }}
                        >
                          Details
                        </Link>
                      )}
                    </div>

                    {/* Stats row */}
                    <div className="flex items-center gap-3 mb-2">
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

                    {/* Conditions grid */}
                    {conditionsVisible && (
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2.5">
                        {CONDITION_FIELDS.map((field) => {
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
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

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
