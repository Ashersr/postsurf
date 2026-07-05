"use client";

import { useEffect, useRef, useState } from "react";

type WelcomeOverlayProps = {
  onDismiss: () => void;
};

export default function WelcomeOverlay({ onDismiss }: WelcomeOverlayProps) {
  const [isExiting, setIsExiting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      buttonRef.current?.focus();
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  const handleContinue = () => {
    setIsExiting(true);
    setTimeout(onDismiss, 380);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleContinue();
    }
  };

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center ${
        isExiting ? "welcome-backdrop-exit" : "welcome-backdrop-enter"
      }`}
      style={{
        background: "rgba(248, 250, 253, 0.88)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
      aria-describedby="welcome-body"
      onKeyDown={handleKeyDown}
    >
      <div
        className={`flex flex-col items-center text-center px-8 max-w-sm w-full ${
          isExiting ? "welcome-content-exit" : ""
        }`}
      >
        {/* Logo mark */}
        <div
          className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${
            isExiting ? "" : "welcome-logo-enter"
          }`}
          style={{ backgroundColor: "var(--color-primary)" }}
        >
          <svg
            className="w-7 h-7 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728M9 10c0-1.657.895-3 2-3s2 1.343 2 3-.895 3-2 3-2-1.343-2-3z"
            />
          </svg>
        </div>

        {/* Headline */}
        <h1
          id="welcome-title"
          className={`text-3xl font-semibold tracking-tight ${
            isExiting ? "" : "welcome-text-1"
          }`}
          style={{ color: "var(--color-text)" }}
        >
          Welcome to post surf
        </h1>

        {/* Subtitle */}
        <p
          className={`mt-2 text-[15px] font-semibold tracking-tight ${
            isExiting ? "" : "welcome-text-2"
          }`}
          style={{ color: "var(--color-primary)" }}
        >
          A better surf report
        </p>

        {/* Body */}
        <p
          id="welcome-body"
          className={`mt-5 text-[15px] leading-relaxed ${
            isExiting ? "" : "welcome-text-3"
          }`}
          style={{ color: "var(--color-text-muted)" }}
        >
          Hear about the conditions from people who are at the break, not a
          model.
        </p>

        {/* Continue button */}
        <button
          ref={buttonRef}
          type="button"
          className={`mt-8 inline-flex items-center px-6 py-2.5 rounded text-[14px] font-medium text-white transition-colors ${
            isExiting ? "" : "welcome-button-enter"
          }`}
          style={{
            backgroundColor: isHovered
              ? "var(--color-primary-hover)"
              : "var(--color-primary)",
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={handleContinue}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
