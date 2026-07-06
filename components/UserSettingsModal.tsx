type UserSettingsModalProps = {
  displayName: string;
  email: string;
  onClose: () => void;
};

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span
        className="mb-1.5 block text-[11px] font-medium tracking-wide uppercase"
        style={{ color: "var(--color-text-muted)" }}
      >
        {label}
      </span>
      <p className="text-[13px]" style={{ color: "var(--color-text)" }}>
        {value}
      </p>
    </div>
  );
}

export default function UserSettingsModal({
  displayName,
  email,
  onClose,
}: UserSettingsModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-settings-title"
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
          id="user-settings-title"
          className="text-[15px] font-medium"
          style={{ color: "var(--color-text)" }}
        >
          Settings
        </h2>

        <div className="mt-5 space-y-4">
          <ReadOnlyField label="Name" value={displayName} />
          <ReadOnlyField label="Email" value={email} />
        </div>

        <div className="flex justify-end pt-6">
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
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
