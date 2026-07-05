"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/navItems";

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-20 md:hidden flex"
      style={{
        backgroundColor: "var(--color-bg)",
        borderTop: "1px solid var(--color-border)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      {NAV_ITEMS.map((item) => {
        const isActive = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex-1 flex flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium transition-colors"
            style={{
              color: isActive ? "var(--color-primary)" : "var(--color-text-muted)",
            }}
          >
            <span
              style={{
                color: isActive ? "var(--color-primary)" : "var(--color-text-muted)",
              }}
            >
              {item.icon("w-5 h-5")}
            </span>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
