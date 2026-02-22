"use client";

import { useMemo } from "react";
import { FallbackImage } from "@/components/FallbackImage";
import { ProviderPlaceholderTile } from "@/components/public/ProviderPlaceholderTile";

type Game = { id: string; name: string; logoUrl: string | null; code?: string | null };

export function PagedGameGrid({
  games,
  pageSize = 9,
  cols = 3,
  paginate = false
}: {
  games: Game[];
  /** 3x3 一页 => 9 */
  pageSize?: number;
  cols?: number;
  /** false 时一次性显示全部，不启用拖拽分页 */
  paginate?: boolean;
}) {
  void paginate;
  const visibleGames = useMemo(() => games, [games]);
  const gridColsClass = cols === 3 ? "grid-cols-3" : "grid-cols-3";
  const padCount = pageSize > 0 && visibleGames.length > 0 ? (pageSize - (visibleGames.length % pageSize)) % pageSize : 0;

  return (
    <div className="space-y-3">
      <section data-testid="paged-game-grid" className={`grid gap-3 ${gridColsClass}`}>
        {visibleGames.length === 0 ? <div className="col-span-3 py-10" aria-hidden /> : null}
        {visibleGames.map((game) => (
          <article key={game.id} className="logo-tile group cursor-pointer p-1" title={game.name}>
            <div className="flex h-full w-full items-center justify-center">
              {game.logoUrl ? (
                <FallbackImage src={game.logoUrl} alt={game.name} className="h-full w-full object-cover" />
              ) : (
                <ProviderPlaceholderTile name={game.name} code={game.code} className="h-full w-full" />
              )}
            </div>
          </article>
        ))}
        {padCount > 0
          ? Array.from({ length: padCount }).map((_, i) => <div key={`pad-${i}`} className="logo-tile p-1 opacity-0" aria-hidden />)
          : null}
      </section>
    </div>
  );
}

