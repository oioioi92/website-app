"use client";

import Link from "next/link";

const CATEGORIES = [
  { key: "event", label: "Event", href: "/promotion", icon: "🎉", highlight: true },
  { key: "slots", label: "Slots", href: "/games?cat=slots", icon: "🎰", highlight: false },
  { key: "live", label: "Live", href: "/games?cat=live", icon: "📺", highlight: false },
  { key: "fishing", label: "Fishing", href: "/games?cat=fishing", icon: "🎣", highlight: false },
  { key: "sports", label: "Sports", href: "/games?cat=sports", icon: "⚽", highlight: false },
  { key: "lottery", label: "Lottery", href: "/games?cat=lottery", icon: "🎱", highlight: false },
  { key: "new", label: "New", href: "/games?cat=new", icon: "✨", highlight: false },
];

/** 中上：一排分类 icon 按钮（灰底舞台内，红/绿强对比） */
export function CategoryIconRow() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {CATEGORIES.map((cat) => (
        <Link
          key={cat.key}
          href={cat.href}
          className={`flex h-12 min-w-[88px] flex-col items-center justify-center rounded-[18px] px-4 text-sm font-semibold shadow-md transition hover:opacity-90 ${
            cat.highlight
              ? "bg-[#dc2626] text-white"
              : "border-2 border-[#166534] bg-[#22c55e] text-white"
          }`}
        >
          <span className="text-lg" aria-hidden>
            {cat.icon}
          </span>
          <span>{cat.label}</span>
        </Link>
      ))}
    </div>
  );
}
