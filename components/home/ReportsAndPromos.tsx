"use client";

import Link from "next/link";
import { FallbackImage } from "@/components/FallbackImage";

type PromoItem = {
  id: string;
  title: string;
  coverUrl: string | null;
  subtitle?: string | null;
};

export function ReportsAndPromos({
  promotions,
  routeBonus = "/bonus",
  uiText
}: {
  promotions: PromoItem[];
  routeBonus?: string;
  uiText?: Record<string, string>;
}) {
  const tiles = promotions.slice(0, 3);
  const t = uiText ?? {};

  return (
    <section className="grid gap-6 lg:grid-cols-12 lg:gap-8">
      {/* Left 7 cols: Trend chart placeholder */}
      <div className="rounded-2xl border border-white/15 bg-white/5 p-5 shadow-lg lg:col-span-7">
        <h2 className="text-lg font-bold text-white">{t.reportstitle ?? "Reports"}</h2>
        <p className="mt-1 text-sm text-white/60">{t.reportssubtitle ?? "Trend & analytics"}</p>
        <div className="mt-4 flex min-h-[200px] items-center justify-center rounded-xl border border-dashed border-white/20 bg-black/20">
          <p className="text-sm text-white/50">{t.reportsplaceholdertext ?? "Chart placeholder — no chart lib"}</p>
        </div>
      </div>
      {/* Right 5 cols: Promotion carousel area (3 tiles) */}
      <div className="lg:col-span-5">
        <h2 className="text-lg font-bold text-white">{t.promotionstitle ?? "Promotions"}</h2>
        <div className="mt-3 space-y-3">
          {tiles.length > 0 ? (
            tiles.map((p) => (
              <Link
                key={p.id}
                href={`${routeBonus}#${encodeURIComponent(p.id)}`}
                className="flex gap-3 rounded-xl border border-white/10 bg-white/5 p-3 transition hover:bg-white/10"
              >
                {p.coverUrl ? (
                  <FallbackImage
                    src={p.coverUrl}
                    alt={p.title}
                    className="h-14 w-14 shrink-0 rounded-lg object-cover"
                  />
                ) : (
                  <div className="h-14 w-14 shrink-0 rounded-lg bg-[color:var(--front-gold)]/20" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-white">{p.title}</p>
                  {p.subtitle && (
                    <p className="truncate text-xs text-white/60">{p.subtitle}</p>
                  )}
                </div>
              </Link>
            ))
          ) : (
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center text-sm text-white/50">
              {t.promotionslistemptytext ?? "暂无活动"}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
