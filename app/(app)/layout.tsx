import SidebarNav from "@/components/SidebarNav";
import AppShell from "@/components/AppShell";
import BottomNav from "@/components/BottomNav";

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
            <div className="max-w-5xl mx-auto px-4 py-6 md:px-8 md:py-10 pb-[calc(4rem+env(safe-area-inset-bottom,0px))] md:pb-10">
              {children}
            </div>
          </main>
        </AppShell>
      </div>
      <BottomNav />
    </div>
  );
}
