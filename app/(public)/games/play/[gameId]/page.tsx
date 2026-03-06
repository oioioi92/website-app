"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

/** Play page (DESKTOP-UI-DESIGN-SPEC §5.2): Exit Bar + iframe/container */
export default function GamePlayPage() {
  const params = useParams();
  const gameId = typeof params.gameId === "string" ? params.gameId : "";

  return (
    <div className="public-desktop-shell hidden min-h-screen lg:block">
      {/* Sticky Exit Bar */}
      <div
        className="sticky top-0 z-50 flex border-b border-[var(--desk-border)] bg-[var(--desk-header-bg)] py-[var(--desk-m)]"
        data-testid="game-play-exit-bar"
      >
        <div className="desk-container flex w-full items-center justify-between">
          <Link href="/games" className="desk-btn-secondary">← Back to Games</Link>
          <div className="flex gap-[var(--desk-m)]">
            <button type="button" onClick={() => window.document.documentElement.requestFullscreen?.()} className="desk-btn-secondary min-h-0 py-[var(--desk-m)]">Fullscreen</button>
            <a href="/chat" className="desk-btn-secondary min-h-0 py-[var(--desk-m)]">Report issue</a>
          </div>
        </div>
      </div>
      <main className="desk-container py-[var(--desk-xl)]" data-desktop-main>
        <div className="desk-card aspect-video overflow-hidden bg-[var(--desk-panel-alt)]">
          {gameId ? (
            <p className="flex h-full items-center justify-center text-[var(--desk-text-muted)] text-sm m-0">
              Game container for <strong className="text-[var(--desk-text)]">{gameId}</strong>. Integrate iframe/launchUrl here.
            </p>
          ) : (
            <p className="flex h-full items-center justify-center text-[var(--desk-text-muted)] text-sm m-0">No game selected.</p>
          )}
        </div>
      </main>
    </div>
  );
}
