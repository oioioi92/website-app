"use client";

import Link from "next/link";

const items = [
  { label: "Home", href: "/", icon: "🏠" },
  { label: "Games", href: "/games", icon: "🎮" },
  { label: "Promo", href: "/promotion", icon: "🎁" },
  { label: "History", href: "/history", icon: "📋" },
  { label: "Live Chat", href: "/chat", icon: "💬" },
  { label: "Setting", href: "/settings", icon: "⚙️" },
];

/** 门户站底部固定导航条（灰底金属条） */
export function BottomDockNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-center gap-1 border-t-2 border-[var(--desk-border)] bg-[#2a2d36] py-2 shadow-[0_-4px_20px_rgba(0,0,0,0.3)]"
      style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)" }}
      aria-label="Bottom navigation"
    >
      <div className="mx-auto grid w-full max-w-[1280px] grid-cols-6 items-center gap-1 px-2 sm:px-4">
        {items.map((item) => {
          return (
          <Link
            key={item.href}
            href={item.href}
            className="flex min-w-0 flex-col items-center gap-1 rounded-[14px] px-2 py-2 text-[var(--desk-text-muted)] transition hover:bg-white/10 hover:text-[var(--desk-text)]"
          >
            <span className="text-lg" aria-hidden>
              {item.icon}
            </span>
            <span className="truncate text-[10px] font-medium">{item.label}</span>
          </Link>
          );
        })}
      </div>
    </nav>
  );
}
