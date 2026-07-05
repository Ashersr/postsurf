"use client";

import { useState } from "react";
import { useCredits } from "./CreditsProvider";
import RateConditionsModal from "./RateConditionsModal";

export default function TopBar() {
  const { credits } = useCredits();
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  return (
    <header
      className="sticky top-0 z-10 flex items-center justify-end shrink-0 px-8 h-14"
      style={{
        backgroundColor: "var(--color-bg)",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <div className="flex items-center gap-4">
        <div
          className="flex items-center gap-2 text-[13px]"
          style={{ color: "var(--color-text-muted)" }}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            style={{ color: "var(--color-primary)" }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
            />
          </svg>
            <span>
            <span
              className="font-semibold tabular-nums"
              style={{ color: "var(--color-text)" }}
            >
              {credits}
            </span>{" "}
            credits
          </span>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2 rounded text-[13px] font-medium text-white transition-colors"
          style={{ backgroundColor: "var(--color-primary)" }}
          onClick={() => setIsRateModalOpen(true)}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--color-primary-hover)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "var(--color-primary)";
          }}
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
            />
          </svg>
          Rate conditions
        </button>
      </div>

      {isRateModalOpen && (
        <RateConditionsModal onClose={() => setIsRateModalOpen(false)} />
      )}
    </header>
  );
}
