import SidebarNav from "@/components/SidebarNav";
import AppShell from "@/components/AppShell";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full min-h-screen">
      <SidebarNav />
      <div className="flex flex-1 flex-col min-h-0 min-w-0">
        <AppShell>
          <main
            className="flex-1 overflow-auto"
            style={{ backgroundColor: "var(--color-surface)" }}
          >
            <div className="max-w-5xl mx-auto px-8 py-10">{children}</div>
          </main>
        </AppShell>
      </div>
    </div>
  );
}
