"use client";

import { useState } from "react";
import {
  CONDITION_FIELDS,
  DEFAULT_CONDITIONS,
  type Conditions,
} from "@/lib/conditions";
import { useCredits } from "./CreditsProvider";
import BreakSearchField from "./BreakSearchField";

type RateConditionsModalProps = {
  onClose: () => void;
};

export default function RateConditionsModal({
  onClose,
}: RateConditionsModalProps) {
  const { addCredit } = useCredits();
  const [breakId, setBreakId] = useState("");
  const [conditions, setConditions] = useState<Conditions>(DEFAULT_CONDITIONS);

  const handleFieldChange = <K extends keyof Conditions>(
    key: K,
    value: Conditions[K]
  ) => {
    setConditions((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    addCredit(1);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rate-conditions-title"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        style={{ backgroundColor: "rgba(6, 27, 49, 0.4)" }}
        aria-label="Close dialog"
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-md rounded-lg border p-6"
        style={{
          backgroundColor: "var(--color-bg)",
          borderColor: "var(--color-border)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <h2
          id="rate-conditions-title"
          className="text-[15px] font-medium"
          style={{ color: "var(--color-text)" }}
        >
          Rate conditions
        </h2>
        <p
          className="mt-2 text-[13px] leading-relaxed"
          style={{ color: "var(--color-text-muted)" }}
        >
          Share what you saw at the break. You&apos;ll earn 1 credit for your
          report.
        </p>

        <form
          className="mt-5 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <label className="block">
            <span
              className="mb-1.5 block text-[11px] font-medium tracking-wide uppercase"
              style={{ color: "var(--color-text-muted)" }}
            >
              Break
            </span>
            <BreakSearchField value={breakId} onChange={setBreakId} />
          </label>

          {CONDITION_FIELDS.map((field) => (
            <label key={field.key} className="block">
              <span
                className="mb-1.5 block text-[11px] font-medium tracking-wide uppercase"
                style={{ color: "var(--color-text-muted)" }}
              >
                {field.label}
              </span>
              <select
                value={conditions[field.key]}
                onChange={(e) =>
                  handleFieldChange(
                    field.key,
                    e.target.value as Conditions[typeof field.key]
                  )
                }
                className="w-full rounded border px-3 py-2 text-[13px]"
                style={{
                  borderColor: "var(--color-border)",
                  color: "var(--color-text)",
                  backgroundColor: "var(--color-bg)",
                }}
              >
                {field.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          ))}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              className="inline-flex items-center rounded border px-4 py-2 text-[13px] font-medium transition-colors"
              style={{
                borderColor: "var(--color-border)",
                color: "var(--color-text)",
                backgroundColor: "var(--color-bg)",
              }}
              onClick={onClose}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--color-surface)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--color-bg)";
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!breakId}
              className="inline-flex items-center rounded px-4 py-2 text-[13px] font-medium text-white transition-colors"
              style={{
                backgroundColor: breakId
                  ? "var(--color-primary)"
                  : "var(--color-text-muted)",
                cursor: breakId ? undefined : "not-allowed",
              }}
              onMouseEnter={(e) => {
                if (breakId)
                  e.currentTarget.style.backgroundColor =
                    "var(--color-primary-hover)";
              }}
              onMouseLeave={(e) => {
                if (breakId)
                  e.currentTarget.style.backgroundColor = "var(--color-primary)";
              }}
            >
              Submit report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
