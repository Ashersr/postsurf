"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/navItems";

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside
      className="hidden md:flex w-56 shrink-0 flex-col h-full"
      style={{
        backgroundColor: "var(--color-bg)",
        borderRight: "1px solid var(--color-border)",
      }}
    >
      {/* Branding */}
      <div
        className="px-5 py-[18px]"
        style={{ borderBottom: "1px solid var(--color-border)" }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded flex items-center justify-center shrink-0"
            style={{ backgroundColor: "var(--color-primary)" }}
          >
            <svg
              className="w-4 h-4 text-white"
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
          <span
            className="text-sm font-semibold tracking-tight"
            style={{ color: "var(--color-text)" }}
          >
            Post surf
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-2.5 px-3 py-2 rounded text-[13px] font-medium transition-colors"
                  style={{
                    backgroundColor: isActive
                      ? "var(--color-primary-subtle)"
                      : "transparent",
                    color: isActive
                      ? "var(--color-primary)"
                      : "var(--color-text-muted)",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor =
                        "var(--color-border)";
                      e.currentTarget.style.color = "var(--color-text)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "var(--color-text-muted)";
                    }
                  }}
                >
                  <span
                    style={{
                      color: isActive
                        ? "var(--color-primary)"
                        : "var(--color-text-muted)",
                    }}
                  >
                    {item.icon("w-4 h-4")}
                  </span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
