"use client";

import Link from "next/link";

const items = [
  { label: "Home", href: "/", icon: "🏠" },
  { label: "History", href: "/deposit", icon: "📋" },
  { label: "Promo", href: "/promotion", icon: "🎁" },
  { label: "Support", href: "/live-chat", icon: "💬" },
  { label: "Settings", href: "/login", icon: "⚙️" },
];

/** 门户站底部固定导航条（灰底金属条） */
export function BottomDockNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-center gap-1 border-t-2 border-[var(--desk-border)] bg-[#2a2d36] py-2 shadow-[0_-4px_20px_rgba(0,0,0,0.3)]"
      style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)" }}
      aria-label="Bottom navigation"
    >
      <div className="mx-auto flex max-w-[1280px] flex-1 items-center justify-around px-6">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-1 rounded-[14px] px-4 py-2 text-[var(--desk-text-muted)] transition hover:bg-white/10 hover:text-[var(--desk-text)]"
          >
            <span className="text-lg" aria-hidden>
              {item.icon}
            </span>
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
