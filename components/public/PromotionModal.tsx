"use client";

import { useEffect, useMemo } from "react";
import type { PublicPromotion } from "@/components/public/PromotionCard";
import { FallbackImage } from "@/components/FallbackImage";

type Block =
  | { id?: string; type: "h1"; text: string }
  | { id?: string; type: "p"; text: string }
  | { id?: string; type: "list"; items: string[] }
  | { id?: string; type: "button"; label: string; url: string }
  | { id?: string; type: "image"; url: string };

function safeHref(raw: string): string {
  const s = (raw ?? "").trim();
  if (!s) return "#";
  if (/^javascript:/i.test(s)) return "#";
  if (/^data:/i.test(s)) return "#";
  if (/^blob:/i.test(s)) return "#";
  if (s.startsWith("//")) return `https:${s}`;
  return s;
}

function parseBlocks(detailJson: unknown): Block[] {
  const obj = detailJson && typeof detailJson === "object" && !Array.isArray(detailJson) ? (detailJson as Record<string, unknown>) : null;
  const blocks = obj && Array.isArray(obj.blocks) ? obj.blocks : [];
  const out: Block[] = [];
  for (const raw of blocks) {
    const b = raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, unknown>) : null;
    const type = typeof b?.type === "string" ? b.type : null;
    const id = typeof b?.id === "string" ? b.id : undefined;
    if (type === "h1" && typeof b?.text === "string") out.push({ id, type, text: b.text });
    else if (type === "p" && typeof b?.text === "string") out.push({ id, type, text: b.text });
    else if (type === "list" && Array.isArray(b?.items)) out.push({ id, type, items: b.items.filter((x) => typeof x === "string") });
    else if (type === "button" && typeof b?.label === "string" && typeof b?.url === "string") out.push({ id, type, label: b.label, url: b.url });
    else if (type === "image" && typeof b?.url === "string") out.push({ id, type, url: b.url });
  }
  return out;
}

export function PromotionModal({
  promo,
  onClose,
  routeBonus,
  uiText
}: {
  promo: PublicPromotion | null;
  onClose: () => void;
  routeBonus: string;
  uiText?: Record<string, string>;
}) {
  const open = !!promo;
  const t = uiText ?? {};
  const blocks = useMemo(() => (promo ? parseBlocks(promo.detailJson) : []), [promo]);

  const viewAllText = t.promomodalviewalltext ?? "查看全部优惠";
  const claimText = t.promomodalclaimtext ?? "立即领取";
  const closeText = t.promomodalclosetext ?? "关闭";
  const emptyText = t.promomodaldetailsemptytext ?? "暂无活动内容";

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open || !promo) return null;

  const bonusBase = routeBonus && routeBonus.trim().length > 0 ? routeBonus.trim() : "/bonus";
  const goBonus = `${bonusBase}#${encodeURIComponent(promo.id)}`;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/75 p-3 backdrop-blur sm:items-center">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative w-full max-w-[720px] overflow-hidden rounded-2xl border border-[color:var(--front-gold)]/25 bg-zinc-950/95 shadow-[0_24px_80px_rgba(0,0,0,0.7)]">
        <div className="relative aspect-[16/8] bg-black/40">
          <FallbackImage src={promo.coverUrl} alt={promo.title} className="ui-asset-img h-full w-full object-cover" />
          <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
          <div className="absolute left-3 top-3 inline-flex items-center gap-2">
            <span className="rb-badge border-[color:var(--front-gold)]/40 bg-black/60 text-[color:var(--rb-gold2)]">{promo.percentText}</span>
            <span className="rb-badge border-white/20 bg-black/55 text-white/80">{promo.statusLabel}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 rounded-lg border border-white/15 bg-black/50 px-2 py-1 text-xs font-semibold text-white/85 hover:bg-black/65"
          >
            {closeText}
          </button>
        </div>

        <div className="space-y-3 p-4 sm:p-5">
          <div>
            <h2 className="text-base font-extrabold text-white sm:text-lg">{promo.title}</h2>
            {promo.subtitle ? <p className="mt-1 text-sm text-[color:var(--rb-gold2)]/80">{promo.subtitle}</p> : null}
            <div className="mt-2 flex flex-wrap gap-1 text-[11px]">
              <span className="rb-badge max-w-full truncate border-[color:var(--front-tag)]/40 bg-[color:var(--front-tag)]/10 text-[color:var(--front-tag)]">{promo.limitTag}</span>
              <span className="rb-badge max-w-full truncate border-[color:var(--front-tag2)]/40 bg-[color:var(--front-tag2)]/10 text-[color:var(--front-tag2)]">{promo.grantTag}</span>
            </div>
          </div>

          <div className="max-h-[48vh] overflow-auto rounded-xl border border-white/10 bg-black/25 p-3">
            {blocks.length === 0 ? (
              <p className="text-sm text-white/60">{emptyText}</p>
            ) : (
              <div className="space-y-3">
                {blocks.map((b, idx) => {
                  const key = b.id ?? `${b.type}-${idx}`;
                  if (b.type === "h1") return <h3 key={key} className="text-base font-extrabold text-[color:var(--front-gold-light)]">{b.text}</h3>;
                  if (b.type === "p") return <p key={key} className="text-sm leading-6 text-white/80">{b.text}</p>;
                  if (b.type === "list") {
                    const items = Array.isArray(b.items) ? b.items.filter(Boolean) : [];
                    return (
                      <ul key={key} className="list-inside list-disc space-y-1 text-sm text-white/80">
                        {items.map((x, i) => (
                          <li key={`${key}-i-${i}`}>{x}</li>
                        ))}
                      </ul>
                    );
                  }
                  if (b.type === "image") {
                    const href = safeHref(b.url);
                    return (
                      <div key={key} className="overflow-hidden rounded-lg border border-white/10 bg-black/30">
                        <FallbackImage src={href} alt="" className="ui-asset-img h-auto w-full object-cover" />
                      </div>
                    );
                  }
                  if (b.type === "button") {
                    const href = safeHref(b.url);
                    return (
                      <a
                        key={key}
                        href={href}
                        target={href.startsWith("/") ? undefined : "_blank"}
                        rel={href.startsWith("/") ? undefined : "noopener,noreferrer"}
                        className="inline-flex items-center justify-center rounded-lg bg-[color:var(--front-gold)] px-4 py-2 text-sm font-semibold text-black hover:opacity-90"
                      >
                        {b.label}
                      </a>
                    );
                  }
                  return null;
                })}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            <a
              href={bonusBase}
              className="inline-flex items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 hover:bg-white/10"
              onClick={onClose}
            >
              {viewAllText}
            </a>
            <a
              href={goBonus}
              className="inline-flex items-center justify-center rounded-xl border border-[color:var(--front-gold)]/35 bg-[color:var(--front-gold)]/15 px-4 py-2 text-sm font-extrabold text-[color:var(--front-gold-light)] hover:bg-[color:var(--front-gold)]/20"
              onClick={onClose}
            >
              {claimText}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

