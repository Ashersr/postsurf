"use client";

import { useMemo, useRef, useState } from "react";
import { FAVORITE_BREAKS } from "@/lib/breaks";

type BreakSearchFieldProps = {
  value: string;
  onChange: (breakId: string) => void;
};

export default function BreakSearchField({
  value,
  onChange,
}: BreakSearchFieldProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredBreaks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return FAVORITE_BREAKS;
    return FAVORITE_BREAKS.filter((item) =>
      item.name.toLowerCase().includes(normalizedQuery)
    );
  }, [query]);

  const handleSelect = (breakId: string, name: string) => {
    onChange(breakId);
    setQuery(name);
    setIsOpen(false);
  };

  const handleBlur = (e: React.FocusEvent) => {
    if (containerRef.current?.contains(e.relatedTarget as Node)) return;
    setIsOpen(false);
    if (value) {
      const match = FAVORITE_BREAKS.find((item) => item.id === value);
      setQuery(match?.name ?? "");
    } else {
      setQuery("");
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <input
        type="search"
        value={query}
        onChange={(e) => {
          const nextQuery = e.target.value;
          setQuery(nextQuery);
          setIsOpen(true);
          if (value) {
            const selected = FAVORITE_BREAKS.find((item) => item.id === value);
            if (selected?.name !== nextQuery) onChange("");
          }
        }}
        onFocus={() => setIsOpen(true)}
        onBlur={handleBlur}
        placeholder="Search favorite breaks"
        autoComplete="off"
        className="w-full rounded border px-3 py-2 text-[13px]"
        style={{
          borderColor: "var(--color-border)",
          color: "var(--color-text)",
          backgroundColor: "var(--color-bg)",
        }}
        aria-expanded={isOpen}
        aria-controls="break-search-listbox"
        aria-autocomplete="list"
        role="combobox"
      />

      {isOpen && (
        <ul
          id="break-search-listbox"
          role="listbox"
          className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded border py-1"
          style={{
            borderColor: "var(--color-border)",
            backgroundColor: "var(--color-bg)",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          {filteredBreaks.length === 0 ? (
            <li
              className="px-3 py-2 text-[13px]"
              style={{ color: "var(--color-text-muted)" }}
            >
              No matching breaks
            </li>
          ) : (
            filteredBreaks.map((item) => (
              <li key={item.id} role="option" aria-selected={item.id === value}>
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left text-[13px] transition-colors"
                  style={{
                    color: "var(--color-text)",
                    backgroundColor:
                      item.id === value ? "var(--color-surface)" : "transparent",
                  }}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(item.id, item.name)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "var(--color-surface)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor =
                      item.id === value ? "var(--color-surface)" : "transparent";
                  }}
                >
                  {item.name}
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
