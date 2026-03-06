"use client";

import Link from "next/link";
import { FallbackImage } from "@/components/FallbackImage";

type Game = { id: string; name: string; logoUrl: string | null; code?: string | null };

/** 游戏图标墙：6 列网格，每 tile 120–140px，至少展示 30+（不足用 placeholder 填满） */
const PLACEHOLDER_COUNT = 36;

export function GameIconWallP44({ games = [] }: { games?: Game[] }) {
  const list = games.length >= PLACEHOLDER_COUNT
    ? games.slice(0, PLACEHOLDER_COUNT)
    : [
        ...games,
        ...Array.from({ length: PLACEHOLDER_COUNT - games.length }, (_, i) => ({
          id: `placeholder-${i}`,
          name: `Game ${i + 1}`,
          logoUrl: null as string | null,
        })),
      ];

  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
      {list.map((item) => (
        <div key={item.id} className="flex flex-col items-center">
          <Link
            href={item.logoUrl ? `/games/play/${item.id}` : "/games"}
            className="flex h-[120px] w-[120px] flex-shrink-0 items-center justify-center overflow-hidden rounded-[18px] border-2 border-[#3d4150] bg-[var(--desk-panel-alt)] shadow-md transition hover:border-[var(--desk-accent)] hover:shadow-lg"
          >
            {item.logoUrl ? (
              <FallbackImage
                src={item.logoUrl}
                alt={item.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-3xl text-[var(--desk-text-muted)]">🎮</span>
            )}
          </Link>
          <span className="mt-2 line-clamp-2 text-center text-xs font-medium text-[var(--desk-text)]">
            {item.name}
          </span>
        </div>
      ))}
    </div>
  );
}
