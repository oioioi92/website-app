import { FallbackImage } from "@/components/FallbackImage";

export type PublicPromotion = {
  id: string;
  title: string;
  subtitle: string | null;
  coverUrl: string | null;
  detailJson: unknown;
  ruleJson?: unknown;
  percentText: string;
  statusLabel: "PAUSED" | "SCHEDULED" | "EXPIRED" | "ACTIVE";
  limitTag: string;
  grantTag: string;
  groupLabel?: string;
};

function statusClass(status: PublicPromotion["statusLabel"]) {
  if (status === "ACTIVE") return "border-[color:var(--front-success)]/40 bg-[color:var(--front-success)]/15 text-[color:var(--front-success-light)]";
  if (status === "SCHEDULED") return "border-[color:var(--front-accent)]/40 bg-[color:var(--front-accent)]/15 text-[color:var(--front-accent-light)]";
  if (status === "EXPIRED") return "border-[color:var(--front-gold)]/40 bg-[color:var(--front-gold)]/15 text-[color:var(--rb-gold2)]";
  return "border-[color:var(--muted)]/40 bg-[color:var(--muted)]/15 text-[color:var(--text)]";
}

export function PromotionCard({ promo, onClick }: { promo: PublicPromotion; onClick: () => void }) {
  const percentText = promo.percentText.replace(/\s+/g, "");
  return (
    <button
      type="button"
      data-testid="promo-card"
      onClick={onClick}
      className="rb-card rb-glow group min-h-11 overflow-hidden rounded-2xl border-[color:var(--front-gold)]/35 bg-zinc-950/70 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--front-gold)]/35"
    >
      <div className="relative aspect-[16/9]">
        <FallbackImage src={promo.coverUrl} alt={promo.title} className="ui-asset-img h-full w-full object-cover" />
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
        <div className="rb-badge absolute left-2 top-2 border-[color:var(--front-gold)]/40 bg-black/55 text-[color:var(--rb-gold2)]">
          {percentText}
        </div>
        <div className={`rb-badge absolute right-2 top-2 ${statusClass(promo.statusLabel)}`}>
          {promo.statusLabel}
        </div>
      </div>
      <div className="space-y-2 p-3">
        <p className="line-clamp-2 text-sm font-semibold leading-tight text-white md:text-base">{promo.title}</p>
        <div className="flex flex-wrap gap-1 text-[11px]">
          <span className="rb-badge max-w-full truncate border-[color:var(--front-tag)]/40 bg-[color:var(--front-tag)]/10 text-[color:var(--front-tag)]">{promo.limitTag}</span>
          <span className="rb-badge max-w-full truncate border-[color:var(--front-tag2)]/40 bg-[color:var(--front-tag2)]/10 text-[color:var(--front-tag2)]">{promo.grantTag}</span>
        </div>
      </div>
    </button>
  );
}
