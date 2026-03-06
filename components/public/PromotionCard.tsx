import { FallbackImage } from "@/components/FallbackImage";

export type PublicPromotion = {
  id: string;
  title: string;
  subtitle: string | null;
  coverUrl: string | null;
  coverUrlMobilePromo?: string | null;  // 手机版活动页 / 通用缩图
  coverUrlDesktopHome?: string | null;  // 电脑版首页缩图（已合并到 coverUrlMobilePromo）
  coverUrlMobileHome?: string | null;   // 手机版首页缩图（已合并到 coverUrlMobilePromo）
  promoLink?: string | null;            // 点击跳转链接
  ctaLabel?: string | null;
  ctaUrl?: string | null;
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
      className="promo-list-card group min-h-11 overflow-hidden rounded-2xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/50"
    >
      <div className="promo-list-card-hero relative aspect-[16/9]">
        <FallbackImage src={promo.coverUrl} alt={promo.title} className="ui-asset-img h-full w-full object-cover" />
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />
        <div className="rb-badge absolute left-2 top-2 border-amber-300/45 bg-[#0f172a]/80 text-amber-100 shadow-[0_0_12px_rgba(251,191,36,0.3)]">
          {percentText}
        </div>
        <div className={`rb-badge absolute right-2 top-2 ${statusClass(promo.statusLabel)}`}>
          {promo.statusLabel}
        </div>
      </div>
      <div className="space-y-2 p-3.5">
        <p className="promo-list-card-title line-clamp-2 text-sm font-extrabold leading-tight md:text-base">{promo.title}</p>
        <div className="flex flex-wrap gap-1 text-[11px]">
          <span className="rb-badge max-w-full truncate border-indigo-300/45 bg-indigo-500/20 text-indigo-100">{promo.limitTag}</span>
          <span className="rb-badge max-w-full truncate border-cyan-300/45 bg-cyan-500/20 text-cyan-100">{promo.grantTag}</span>
        </div>
      </div>
    </button>
  );
}
