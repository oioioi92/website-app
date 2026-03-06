"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Breadcrumb, type BreadcrumbItem } from "@/components/public/ui/Breadcrumb";
import { EmptyState } from "@/components/public/ui/EmptyState";
import { FallbackImage } from "@/components/FallbackImage";

const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "slots", label: "Slots" },
  { key: "live", label: "Live" },
  { key: "sports", label: "Sports" },
  { key: "fishing", label: "Fishing" },
  { key: "lottery", label: "Lottery" },
  { key: "new", label: "New" },
] as const;

const PROVIDERS = [
  { key: "all", label: "All" },
  { key: "pg", label: "PG" },
  { key: "evo", label: "Evo" },
  { key: "jili", label: "Jili" },
  { key: "pragmatic", label: "Pragmatic" },
  { key: "new", label: "New" },
] as const;

type Game = { id: string; name: string; logoUrl: string | null; code?: string | null };

/** V3: Sidebar col-3 + Main col-9，4 道返回（Sidebar/Breadcrumb/Back link/Play+New tab）*/
export function GamesPageClient({ games }: { games: Game[] }) {
  const searchParams = useSearchParams();
  const cat = searchParams.get("cat") || "all";
  const provider = searchParams.get("provider") || "all";
  const backHref = `/games${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Games", href: "/games" },
    ...(cat !== "all" ? [{ label: CATEGORIES.find((c) => c.key === cat)?.label ?? cat }] : []),
  ];

  return (
    <div className="public-desktop-shell hidden min-h-screen lg:block">
      <div data-desktop-header>
        <div className="desk-container flex h-full items-center justify-between">
          <Link href="/" className="text-base font-semibold text-[var(--desk-text)]">KINGDOM888</Link>
          <Link href={backHref} className="desk-btn-secondary h-12">← Back</Link>
        </div>
      </div>
      <main className="mx-auto max-w-[1560px] px-6 py-6" data-desktop-main>
        <div className="grid grid-cols-12 gap-6">
          {/* V3: Sidebar col-span-3 */}
          <aside className="col-span-12 lg:col-span-3">
            <div className="desk-card sticky top-24 flex flex-col">
              <div className="desk-card-head">
                <h2 className="desk-section-title">Category</h2>
              </div>
              <div className="desk-card-body gap-3">
                {CATEGORIES.map((c) => {
                  const q = new URLSearchParams(searchParams.toString());
                  q.set("cat", c.key);
                  const isActive = cat === c.key;
                  return (
                    <Link
                      key={c.key}
                      href={`/games?${q.toString()}`}
                      className={`flex items-center justify-center h-12 rounded-[18px] text-sm font-medium transition ${
                        isActive ? "bg-[var(--desk-accent)] text-[#1a1a1a]" : "text-[var(--desk-text)] hover:bg-[var(--desk-panel-hover)]"
                      }`}
                    >
                      {c.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </aside>
          {/* V3: Main col-span-9 */}
          <div className="col-span-12 lg:col-span-9 min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <Breadcrumb items={breadcrumbItems} />
              <Link href={backHref} className="desk-btn-secondary h-12 shrink-0">← Back to Games</Link>
            </div>
            <div className="flex flex-wrap gap-3 mb-6">
              {PROVIDERS.map((p) => {
                const q = new URLSearchParams(searchParams.toString());
                q.set("provider", p.key);
                const isActive = provider === p.key;
                return (
                  <Link
                    key={p.key}
                    href={`/games?${q.toString()}`}
                    className={`h-12 rounded-[18px] border-2 px-4 flex items-center text-sm font-medium transition ${
                      isActive ? "border-[var(--desk-accent)] bg-[var(--desk-accent)]/20 text-[var(--desk-accent)]" : "border-[var(--desk-border)] text-[var(--desk-text)] hover:border-[var(--desk-accent)]"
                    }`}
                  >
                    {p.label}
                  </Link>
                );
              })}
            </div>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
              {games.length === 0 ? (
                <div className="col-span-full">
                  <EmptyState title="No games yet" description="Games will appear here." />
                </div>
              ) : (
                games.slice(0, 12).map((game) => (
                  <div key={game.id} className="flex flex-col">
                    <Link href={`/games/play/${game.id}`} className="desk-tile block p-0 overflow-hidden">
                      <FallbackImage src={game.logoUrl ?? ""} alt={game.name} className="h-full w-full object-cover" />
                    </Link>
                    <h3 className="truncate text-[13px] font-medium text-[var(--desk-text)] mt-2">{game.name}</h3>
                    <div className="flex gap-2 mt-2">
                      <Link href={`/games/play/${game.id}`} className="desk-btn-primary h-10 min-h-0 flex-1 text-xs">Play</Link>
                      <a href={`/games/play/${game.id}`} target="_blank" rel="noopener noreferrer" className="desk-btn-secondary h-10 min-h-0 px-3 text-xs">New tab</a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
      <footer data-desktop-footer>
        <div className="desk-container text-center">
          <div className="footer-links">
            <Link href="/responsible-gaming" className="hover:text-[var(--desk-text)]">Responsible Gaming</Link>
            <Link href="/security" className="hover:text-[var(--desk-text)]">Security</Link>
            <Link href="/privacy" className="hover:text-[var(--desk-text)]">Privacy</Link>
          </div>
          <p className="mt-3 mb-0 text-[13px] font-medium">18+ Only. Play responsibly.</p>
        </div>
      </footer>
    </div>
  );
}
