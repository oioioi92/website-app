import Link from "next/link";

export const dynamic = "force-dynamic";

const SECTIONS = [
  { key: "frontend", title: "Frontend", subtitle: "前台整站设置（站点名、链接、跑马灯等）", href: "/admin/site" },
  { key: "bank", title: "Bank", subtitle: "银行/出款账户配置", href: "/admin/settings/bank" },
  { key: "game-api", title: "Game API", subtitle: "插件游戏 API 配置", href: "/admin/settings/game-api" },
  { key: "payment-gateway", title: "Payment Gateway", subtitle: "支付网关 / 入款渠道配置", href: "/admin/settings/payment-gateway" }
];

export default function AdminSettingsPage() {
  return (
    <div>
      <h1 className="text-lg font-semibold text-[var(--compact-text)]">Settings</h1>
      <p className="mt-0.5 text-[13px] text-[var(--compact-muted)]">银行 · 游戏 API · 支付网关</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map((s) => (
          <Link key={s.key} href={s.href} className="admin-card flex flex-col gap-1 p-5 transition hover:border-[var(--compact-primary)] hover:shadow-md">
            <span className="font-medium text-[var(--compact-text)]">{s.title}</span>
            <span className="text-[13px] text-[var(--compact-muted)]">{s.subtitle}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
