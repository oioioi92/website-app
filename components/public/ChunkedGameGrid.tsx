 "use client";

import { useMemo, useState } from "react";
import { GameGrid } from "@/components/public/GameGrid";

type Game = { id: string; name: string; logoUrl: string | null; code?: string | null };

export function ChunkedGameGrid({ games, pageSize = 12 }: { games: Game[]; pageSize?: number }) {
  const [limit, setLimit] = useState(pageSize);
  const visible = useMemo(() => games.slice(0, limit), [games, limit]);
  const hasMore = games.length > limit;

  return (
    <div className="space-y-3">
      <GameGrid games={visible} />
      {hasMore ? (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setLimit((v) => v + pageSize)}
            className="rounded-lg border border-[color:var(--front-gold)]/45 bg-[color:var(--front-gold)]/10 px-4 py-2 text-sm font-semibold text-[color:var(--front-gold-light)] hover:bg-[color:var(--front-gold)]/20"
          >
            Load more games
          </button>
        </div>
      ) : null}
    </div>
  );
}

