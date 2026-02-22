import Link from "next/link";
import { getPublicTheme } from "@/lib/theme/getPublicTheme";

export const dynamic = "force-dynamic";

type Item = { title: string; imageUrl: string | null; linkUrl: string | null };

// 占位：无后台合作方配置时使用，正式环境请在「后台 → 合作方设置」配置
const DEFAULT_ITEMS: Item[] = [
  { title: "Emas888", imageUrl: null, linkUrl: null },
  { title: "D Reload", imageUrl: null, linkUrl: null },
  { title: "DG Station", imageUrl: null, linkUrl: null },
  { title: "JKJ92", imageUrl: null, linkUrl: null }
];

function isExternalUrl(href: string) {
  return /^https?:\/\//i.test(href);
}

export default async function PartnershipPage() {
  let items: Item[] = DEFAULT_ITEMS;

  try {
    const { theme } = await getPublicTheme();
    const fromTheme = (theme.subsidiaries ?? []).map((x, i) => ({
      title: x.title?.trim() || DEFAULT_ITEMS[i]?.title || `Partner ${i + 1}`,
      imageUrl: x.imageUrl ?? null,
      linkUrl: x.linkUrl ?? null
    }));
    items = fromTheme.length > 0 ? fromTheme : DEFAULT_ITEMS;
  } catch {
    // DB unavailable: fall back to defaults
  }

  return (
    <main className="mx-auto w-full max-w-[980px] px-4 py-6">
      <header className="rounded-2xl border border-white/10 bg-black/35 p-4 shadow-[0_0_24px_rgba(245,158,11,0.10)]">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate text-lg font-extrabold tracking-wide text-white">Partnership</h1>
            <p className="mt-1 text-sm text-white/60">子公司 / 合作伙伴入口</p>
          </div>
          <Link href="/" className="shrink-0 rounded-lg border border-[color:var(--front-gold)]/35 bg-[color:var(--front-gold)]/10 px-3 py-2 text-xs font-bold text-[color:var(--rb-gold2)]">
            返回首页
          </Link>
        </div>
      </header>

      <section className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {items.map((s, idx) => {
          const href = (s.linkUrl ?? "").trim();
          const clickable = href.length > 0;
          const Card = (
            <div
              className={[
                "group overflow-hidden rounded-2xl border border-white/10 bg-black/25",
                "shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]",
                clickable ? "hover:border-[color:var(--front-gold)]/35 hover:bg-white/5" : "opacity-70"
              ].join(" ")}
            >
              <div className="p-3">
                <div className="flex items-center justify-center">
                  <div className="h-20 w-20 overflow-hidden rounded-full border border-[color:var(--front-gold)]/35 bg-black/30">
                    {s.imageUrl ? (
                      <img src={s.imageUrl} alt={s.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xl font-black text-[color:var(--front-gold)]/80">
                        ★
                      </div>
                    )}
                  </div>
                </div>
                <p className="mt-3 truncate text-center text-sm font-extrabold text-white">{s.title}</p>
                <div className="mt-3 flex items-center justify-center">
                  <span
                    className={[
                      "rounded-full px-3 py-1 text-[11px] font-bold",
                      clickable ? "bg-[color:var(--front-gold)]/15 text-[color:var(--rb-gold2)]" : "bg-white/5 text-white/50"
                    ].join(" ")}
                  >
                    {clickable ? "进入" : "未配置链接"}
                  </span>
                </div>
              </div>
              <div className="h-px w-full bg-gradient-to-r from-transparent via-[color:var(--front-gold)]/25 to-transparent" aria-hidden />
              <div className="px-3 py-2 text-center text-[11px] text-white/55">
                {clickable ? "Tap to open" : "Go admin/site to configure"}
              </div>
            </div>
          );

          if (!clickable) return <div key={`${idx}-${s.title}`}>{Card}</div>;
          return isExternalUrl(href) ? (
            <a key={`${idx}-${s.title}`} href={href} target="_blank" rel="noopener noreferrer">
              {Card}
            </a>
          ) : (
            <Link key={`${idx}-${s.title}`} href={href}>
              {Card}
            </Link>
          );
        })}
      </section>
    </main>
  );
}

