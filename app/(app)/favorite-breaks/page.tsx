import FavoriteBreaksTable from "@/components/FavoriteBreaksTable";

export default function FavoriteBreaksPage() {
  return (
    <div>
      <div className="mb-8">
        <h1
          className="text-2xl md:text-3xl font-semibold tracking-tight"
          style={{ color: "var(--color-text)" }}
        >
          Favorite breaks
        </h1>
        <p className="mt-1.5 text-sm" style={{ color: "var(--color-text-muted)" }}>
          Manage report frequency and review the latest conditions for your saved breaks.
        </p>
      </div>

      <FavoriteBreaksTable />
    </div>
  );
}
