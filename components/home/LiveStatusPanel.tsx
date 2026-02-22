"use client";

export function LiveStatusPanel() {
  return (
    <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4 shadow-xl">
      <h2 className="text-sm font-bold uppercase tracking-wider text-[color:var(--front-gold)]/90">
        Live Status Panel
      </h2>
      <div className="rounded-xl border border-white/10 bg-black/30 p-3">
        <p className="text-xs font-semibold text-white/70">Today draw status</p>
        <p className="mt-1 text-sm font-medium text-white">Updated · Next in 2h 15m</p>
      </div>
      <div className="rounded-xl border border-white/10 bg-black/30 p-3">
        <p className="text-xs font-semibold text-white/70">Top Picks preview</p>
        <ul className="mt-2 space-y-1 text-sm text-white/90">
          <li>#1 — 12, 34, 56</li>
          <li>#2 — 07, 21, 89</li>
          <li>#3 — 45, 67, 01</li>
        </ul>
      </div>
      <div className="rounded-xl border border-white/10 bg-black/30 p-3">
        <p className="text-xs font-semibold text-white/70">Data sync status</p>
        <p className="mt-1 flex items-center gap-2 text-sm text-[color:var(--front-success)]">
          <span className="h-2 w-2 rounded-full bg-[color:var(--front-success)]" />
          Last updated 10 min ago
        </p>
      </div>
    </div>
  );
}
