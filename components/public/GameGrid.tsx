import { FallbackImage } from "@/components/FallbackImage";
import { ProviderPlaceholderTile } from "@/components/public/ProviderPlaceholderTile";

type Game = { id: string; name: string; logoUrl: string | null; code?: string | null };

export function GameGrid({ games }: { games: Game[] }) {
  return (
    <section data-testid="game-grid" className="grid grid-cols-4 gap-2 md:grid-cols-6 md:gap-3 xl:grid-cols-8">
      {games.map((game) => (
        <article
          key={game.id}
          className="logo-tile group cursor-pointer p-1"
          title={game.name}
        >
          <div className="flex h-full w-full items-center justify-center">
            {game.logoUrl ? (
              // Fill the tile (reference-like): cover the square area.
              <FallbackImage src={game.logoUrl} alt={game.name} className="h-full w-full object-cover" />
            ) : (
              <ProviderPlaceholderTile name={game.name} code={game.code} className="h-full w-full" />
            )}
          </div>
        </article>
      ))}
    </section>
  );
}
