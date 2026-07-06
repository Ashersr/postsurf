"use client";

import { useMemo, useState } from "react";
import type { FavoriteBreak } from "@/lib/breaks";
import { useFavoriteBreaks } from "./FavoriteBreaksProvider";

type AddBreakModalProps = {
  onClose: () => void;
};

type SaveMode = "existing" | "new";

export default function AddBreakModal({ onClose }: AddBreakModalProps) {
  const { favoriteBreaks, knownBreaks, addFavoriteBreak, createAndAddBreak } =
    useFavoriteBreaks();
  const [query, setQuery] = useState("");
  const [selectedBreak, setSelectedBreak] = useState<FavoriteBreak | null>(null);
  const [saveMode, setSaveMode] = useState<SaveMode | null>(null);

  const trimmedQuery = query.trim();

  const filteredBreaks = useMemo(() => {
    const normalizedQuery = trimmedQuery.toLowerCase();
    if (!normalizedQuery) return [];
    return knownBreaks.filter((item) =>
      item.name.toLowerCase().includes(normalizedQuery)
    );
  }, [knownBreaks, trimmedQuery]);

  const isAlreadyFavorite = selectedBreak
    ? favoriteBreaks.some((item) => item.id === selectedBreak.id)
    : false;

  const canSave =
    saveMode === "new"
      ? trimmedQuery.length > 0
      : saveMode === "existing" && selectedBreak !== null && !isAlreadyFavorite;

  const handleQueryChange = (value: string) => {
    setQuery(value);
    setSelectedBreak(null);
    setSaveMode(null);
  };

  const handleSelectBreak = (breakData: FavoriteBreak) => {
    setSelectedBreak(breakData);
    setQuery(breakData.name);
    setSaveMode("existing");
  };

  const handleAddAsNew = () => {
    setSelectedBreak(null);
    setSaveMode("new");
  };

  const handleSave = () => {
    if (saveMode === "new") {
      createAndAddBreak(trimmedQuery);
    } else if (selectedBreak) {
      addFavoriteBreak(selectedBreak);
    }
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-break-title"
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
          id="add-break-title"
          className="text-[15px] font-medium"
          style={{ color: "var(--color-text)" }}
        >
          Add break
        </h2>
        <p
          className="mt-2 text-[13px] leading-relaxed"
          style={{ color: "var(--color-text-muted)" }}
        >
          Search for a break by name, or add a new one if it&apos;s not in our
          list.
        </p>

        <form
          className="mt-5 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (canSave) handleSave();
          }}
        >
          <label className="block">
            <span
              className="mb-1.5 block text-[11px] font-medium tracking-wide uppercase"
              style={{ color: "var(--color-text-muted)" }}
            >
              Break name
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="e.g. Pacific Beach"
              autoComplete="off"
              autoFocus
              className="w-full rounded border px-3 py-2 text-[13px]"
              style={{
                borderColor: "var(--color-border)",
                color: "var(--color-text)",
                backgroundColor: "var(--color-bg)",
              }}
            />
          </label>

          {trimmedQuery.length > 0 && (
            <div
              className="rounded border overflow-hidden"
              style={{ borderColor: "var(--color-border)" }}
            >
              {filteredBreaks.length > 0 ? (
                <ul>
                  {filteredBreaks.map((item) => {
                    const isSelected = selectedBreak?.id === item.id;
                    const isFavorite = favoriteBreaks.some(
                      (fav) => fav.id === item.id
                    );
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          className="w-full px-3 py-2 text-left text-[13px] transition-colors"
                          style={{
                            color: "var(--color-text)",
                            backgroundColor: isSelected
                              ? "var(--color-surface)"
                              : "transparent",
                          }}
                          onClick={() => handleSelectBreak(item)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor =
                              "var(--color-surface)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = isSelected
                              ? "var(--color-surface)"
                              : "transparent";
                          }}
                        >
                          {item.name}
                          {isFavorite && (
                            <span
                              className="ml-2 text-[12px]"
                              style={{ color: "var(--color-text-muted)" }}
                            >
                              (already saved)
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p
                  className="px-3 py-2 text-[13px]"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  No matching breaks found.
                </p>
              )}

              {filteredBreaks.length === 0 && (
                <button
                  type="button"
                  className="w-full border-t px-3 py-2.5 text-left text-[13px] font-medium transition-colors"
                  style={{
                    borderColor: "var(--color-border)",
                    color: "var(--color-primary)",
                    backgroundColor:
                      saveMode === "new"
                        ? "var(--color-primary-subtle)"
                        : "transparent",
                  }}
                  onClick={handleAddAsNew}
                  onMouseEnter={(e) => {
                    if (saveMode !== "new") {
                      e.currentTarget.style.backgroundColor =
                        "var(--color-surface)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor =
                      saveMode === "new"
                        ? "var(--color-primary-subtle)"
                        : "transparent";
                  }}
                >
                  Add &ldquo;{trimmedQuery}&rdquo; as new break
                </button>
              )}
            </div>
          )}

          {isAlreadyFavorite && saveMode === "existing" && (
            <p className="text-[13px]" style={{ color: "var(--color-text-muted)" }}>
              This break is already in your favorites.
            </p>
          )}

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
              disabled={!canSave}
              className="inline-flex items-center rounded px-4 py-2 text-[13px] font-medium text-white transition-colors"
              style={{
                backgroundColor: canSave
                  ? "var(--color-primary)"
                  : "var(--color-text-muted)",
                cursor: canSave ? undefined : "not-allowed",
              }}
              onMouseEnter={(e) => {
                if (canSave)
                  e.currentTarget.style.backgroundColor =
                    "var(--color-primary-hover)";
              }}
              onMouseLeave={(e) => {
                if (canSave)
                  e.currentTarget.style.backgroundColor = "var(--color-primary)";
              }}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
