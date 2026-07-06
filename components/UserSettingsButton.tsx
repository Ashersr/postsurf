"use client";

import { useState } from "react";
import { useUser } from "./UserProvider";
import UserSettingsModal from "./UserSettingsModal";

export default function UserSettingsButton() {
  const { displayName, email } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className="flex w-full items-center justify-start gap-2.5 px-5 py-2.5 rounded-lg text-[13px] font-medium transition-colors"
        style={{
          backgroundColor: "var(--color-bg)",
          border: "1px solid var(--color-border)",
          color: "var(--color-text)",
        }}
        aria-label="Open settings"
        onClick={() => setIsOpen(true)}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "var(--color-surface)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "var(--color-bg)";
        }}
      >
        <span
          className="w-[18px] h-[18px] rounded-full shrink-0"
          style={{
            background:
              "linear-gradient(135deg, #6366f1 0%, #a855f7 45%, #f472b6 75%, #fb923c 100%)",
          }}
          aria-hidden
        />
        {displayName}
      </button>

      {isOpen && (
        <UserSettingsModal
          displayName={displayName}
          email={email}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
