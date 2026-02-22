"use client";

import { useMemo, useState } from "react";
import { FallbackImage } from "@/components/FallbackImage";

type PromoItem = {
  id: string;
  title: string;
  subtitle: string | null;
  coverUrl: string | null;
  detailJson?: unknown;
};

function renderDetailFromJson(detailJson: unknown): React.ReactNode {
  const obj = detailJson && typeof detailJson === "object" && "blocks" in detailJson ? (detailJson as { blocks: unknown[] }) : null;
  const blocks = Array.isArray(obj?.blocks) ? obj.blocks : [];
  if (blocks.length === 0) return <p className="text-white/60">No content yet</p>;
  return (
    <div className="space-y-2">
      {blocks.map((block: unknown, i: number) => {
        const b = block && typeof block === "object" ? (block as Record<string, unknown>) : null;
        if (!b) return null;
        if (b.type === "p" && typeof b.text === "string") {
          return <p key={i} className="text-sm leading-6 text-white/80">{b.text}</p>;
        }
        if (b.type === "button" && typeof b.label === "string") {
          const url = typeof b.url === "string" ? b.url : "#";
          return (
            <a key={i} href={url} className="inline-block rounded-lg bg-[color:var(--front-gold)] px-4 py-2 text-sm font-semibold text-black hover:opacity-90">
              {b.label}
            </a>
          );
        }
        return null;
      })}
    </div>
  );
}

export function PromotionShowcase({
  promotions,
  routeBonus = "/bonus",
  uiText
}: {
  promotions: Array<{ id: string; title: string; subtitle?: string | null; coverUrl: string | null; detailJson?: unknown }>;
  routeBonus?: string;
  uiText?: Record<string, string>;
}) {
  const t = uiText ?? {};
  const list = useMemo<PromoItem[]>(
    () =>
      promotions.length > 0
        ? promotions.slice(0, 6).map((p) => ({
            id: p.id,
            title: p.title,
            subtitle: p.subtitle ?? null,
            coverUrl: p.coverUrl,
            detailJson: p.detailJson
          }))
        : [],
    [promotions]
  );
  const [openId, setOpenId] = useState<string | null>(null);
  const active = useMemo(() => list.find((x) => x.id === openId) ?? null, [list, openId]);

  if (list.length === 0) {
    return (
      <section id="promotion-showcase" className="rounded-2xl border border-white/15 bg-white/5 p-4 shadow-lg lg:p-5">
        <h2 className="text-lg font-bold text-white">{t.promotionshowcasetitle ?? "Promotion Showcase"}</h2>
        <p className="mt-3 text-sm text-white/50">{t.promotionshowcaseemptytext ?? "暂无活动"}</p>
      </section>
    );
  }

  return (
    <section id="promotion-showcase" className="rounded-2xl border border-white/15 bg-white/5 p-4 shadow-lg lg:p-5">
      <h2 className="text-lg font-bold text-white">{t.promotionshowcasetitle ?? "Promotion Showcase"}</h2>
      <p className="mt-1 text-sm text-white/65">
        {t.promotionshowcasesubtitle ?? "Select an item to expand details."}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {list.map((item) => {
          const isActive = item.id === openId;
          return (
            <button
              key={item.id}
              type="button"
              data-testid="promotion-tile"
              onClick={() => setOpenId((prev) => (prev === item.id ? null : item.id))}
              className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                isActive
                  ? "border-[color:var(--front-gold)]/70 bg-[color:var(--front-gold)]/15 text-[color:var(--front-gold-light)]"
                  : "border-white/20 bg-black/30 text-white/85 hover:bg-white/10"
              }`}
            >
              {item.title}
            </button>
          );
        })}
      </div>

      {active ? (
        <div
          className="mt-4 rounded-xl border border-white/15 bg-black/30 p-4 transition-all duration-200"
          role="region"
          aria-label="活动详情"
        >
          <div className="grid gap-4 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <div className="overflow-hidden rounded-lg border border-white/15 bg-black/20">
                <FallbackImage src={active.coverUrl} alt={active.title} loading="lazy" className="ui-asset-img h-40 w-full object-cover" />
              </div>
            </div>
            <div className="lg:col-span-8">
              <h3 className="text-base font-bold text-white">{active.title}</h3>
              {active.subtitle ? <p className="mt-1 text-sm text-[color:var(--rb-gold2)]/90">{active.subtitle}</p> : null}
              <div className="mt-3">
                {active.detailJson ? renderDetailFromJson(active.detailJson) : <p className="text-white/60">No content yet</p>}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href={routeBonus}
                  className="rounded-lg bg-[color:var(--front-gold)] px-4 py-2 text-sm font-semibold text-black hover:opacity-90"
                >
                  {t.openbonustext ?? "Open Bonus"}
                </a>
                <button
                  type="button"
                  onClick={() => setOpenId(null)}
                  className="rounded-lg border border-white/25 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
                >
                  {t.closetext ?? "Close"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
