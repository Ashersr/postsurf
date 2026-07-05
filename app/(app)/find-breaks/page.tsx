export default function FindBreaksPage() {
  return (
    <div>
      <div className="mb-8">
        <h1
          className="text-2xl md:text-3xl font-semibold tracking-tight"
          style={{ color: "var(--color-text)" }}
        >
          Find breaks
        </h1>
        <p className="mt-1.5 text-sm" style={{ color: "var(--color-text-muted)" }}>
          Discover surf locations near you.
        </p>
      </div>

      <div
        className="rounded border border-dashed flex flex-col items-center justify-center py-20 px-8 text-center"
        style={{ borderColor: "var(--color-border)" }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center mb-4"
          style={{ backgroundColor: "var(--color-primary-subtle)" }}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            style={{ color: "var(--color-primary)" }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.594 2.292c.317.158.69.158 1.006 0z"
            />
          </svg>
        </div>
        <p
          className="text-sm font-medium"
          style={{ color: "var(--color-text)" }}
        >
          Map coming soon
        </p>
        <p
          className="text-sm mt-1"
          style={{ color: "var(--color-text-muted)" }}
        >
          Browse and explore surf breaks on an interactive map.
        </p>
      </div>
    </div>
  );
}
