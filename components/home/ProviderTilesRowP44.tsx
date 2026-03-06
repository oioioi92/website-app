"use client";

import Link from "next/link";
import { FallbackImage } from "@/components/FallbackImage";

type Game = { id: string; name: string; logoUrl: string | null; code?: string | null };

/** 中栏：一排 3 个大 provider tile（MEGA/918/PUSSY 那种），首页只展示 3 个 */
const PLACEHOLDER_NAMES = ["MEGA 888", "918 KISS", "Pussy888"];

export function ProviderTilesRowP44({ games = [] }: { games?: Game[] }) {
  const tiles = games.length >= 3
    ? games.slice(0, 3)
    : [
        ...games,
        ...Array.from({ length: 3 - games.length }, (_, i) => ({
          id: `placeholder-${i}`,
          name: PLACEHOLDER_NAMES[games.length + i] ?? `Provider ${i + 1}`,
          logoUrl: null as string | null,
        })),
      ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {tiles.map((item) => (
        <Link
          key={item.id}
          href={item.logoUrl ? `/games/play/${item.id}` : "/games"}
          className="flex flex-col items-center rounded-xl border-2 border-[#3d4150] bg-[var(--desk-panel)] p-4 shadow-md transition hover:border-[var(--desk-accent)] hover:shadow-lg"
        >
          <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-[var(--desk-border)] bg-[var(--desk-panel-alt)]">
            {item.logoUrl ? (
              <FallbackImage src={item.logoUrl} alt={item.name} className="h-full w-full object-cover" />
            ) : (
              <span className="text-4xl text-[var(--desk-text-muted)]">🎮</span>
            )}
          </div>
          <span className="mt-2 text-center text-sm font-semibold text-[var(--desk-text)]">
            {item.name}
          </span>
        </Link>
      ))}
    </div>
  );
}
