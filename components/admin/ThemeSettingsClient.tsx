"use client";

import { useEffect, useState } from "react";
import type { ThemeConfig, ThemeBanner } from "@/lib/public/theme";
import { useLocale } from "@/lib/i18n/context";
import { useAdminApiContext } from "@/lib/admin-api-context";

/* ─── 公用样式 ─────────────────────────────────────────────── */
const inputClass =
  "admin-compact-input w-full rounded-lg border border-[var(--compact-card-border)] bg-[var(--compact-card-bg)] px-3 text-[var(--compact-text)] placeholder-[var(--compact-muted)] focus:border-[var(--compact-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--compact-primary)]";
const labelClass = "mb-1 block text-xs font-semibold text-[var(--compact-muted)] uppercase tracking-wide";

/* ─── 图片预览输入框 ────────────────────────────────────────── */
function ImageInput({
  label,
  value,
  onChange,
  placeholder = "https://...",
  size,
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  size?: string;
  hint?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className={labelClass}>{label}</label>
        {size && (
          <span className="rounded bg-blue-50 border border-blue-200 px-1.5 py-0.5 text-[10px] font-bold text-blue-600 leading-none">
            📐 {size}
          </span>
        )}
      </div>
      {value ? (
        <div className="relative group rounded-lg overflow-hidden border border-[var(--compact-card-border)] bg-[var(--compact-card-bg)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt=""
            className="max-h-28 w-full object-contain"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity">
            <button
              type="button"
              onClick={() => onChange("")}
              className="rounded-lg bg-red-500 px-3 py-1 text-xs font-semibold text-white"
            >
              删除图片
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border-2 border-dashed border-[var(--compact-card-border)] bg-[var(--compact-card-bg)] p-4 text-center">
          <p className="text-xs text-[var(--compact-muted)]">暂无图片</p>
        </div>
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass}
        placeholder={placeholder}
      />
      {hint && <p className="text-[11px] text-[var(--compact-muted)]">{hint}</p>}
    </div>
  );
}

/* ─── 分区标题 ──────────────────────────────────────────────── */
function SectionTitle({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="mb-5 border-b border-[var(--compact-card-border)] pb-3">
      <h2 className="text-base font-bold text-[var(--compact-text)]">{title}</h2>
      {desc && <p className="mt-1 text-[12px] text-[var(--compact-muted)]">{desc}</p>}
    </div>
  );
}

/* ─── Banner 行（图片 + 链接） ─────────────────────────────── */
function BannerRow({
  index,
  banner,
  onChange,
  imgSize,
}: {
  index: number;
  banner: ThemeBanner;
  onChange: (b: ThemeBanner) => void;
  imgSize: string;
}) {
  const hasImg = !!banner.imageUrl;
  return (
    <div className="rounded-xl border border-[var(--compact-card-border)] bg-[var(--compact-card-bg)] p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--compact-primary)] text-[11px] font-bold text-white">{index + 1}</span>
        {hasImg
          ? <span className="text-[13px] font-semibold text-[var(--compact-success)]">✅ 已设置图片</span>
          : <span className="text-[13px] text-[var(--compact-muted)] italic">空白（不显示）</span>
        }
        {banner.linkUrl && <span className="ml-auto rounded bg-[var(--compact-card-border)] px-2 py-0.5 text-[11px] text-[var(--compact-muted)] font-mono">{banner.linkUrl}</span>}
      </div>
      <ImageInput
        label="图片"
        value={banner.imageUrl ?? ""}
        onChange={(v) => onChange({ ...banner, imageUrl: v })}
        size={imgSize}
      />
      {hasImg && (
        <div>
          <label className={labelClass}>点击链接（可选）</label>
          <input
            type="text"
            value={banner.linkUrl ?? ""}
            onChange={(e) => onChange({ ...banner, linkUrl: e.target.value || null })}
            className={inputClass}
            placeholder="https://..."
          />
        </div>
      )}
    </div>
  );
}

/* ─── 左侧导航列表 ──────────────────────────────────────────── */
const SECTIONS = [
  { id: "background",  icon: "🖼️",  label: "整页背景" },
  { id: "logo",        icon: "🏷️",  label: "Logo 与站名" },
  { id: "heroBanners", icon: "📸",  label: "首页轮播图" },
  { id: "buttons",     icon: "🔘",  label: "按钮图片" },
  { id: "quickActions",icon: "⚡",  label: "快捷入口" },
  { id: "bottomNav",   icon: "🧭",  label: "底部导航" },
  { id: "promos",      icon: "🎁",  label: "促销设置" },
  { id: "partners",    icon: "🤝",  label: "品牌与合作" },
  { id: "otherImages", icon: "🗂️",  label: "其他图片" },
  { id: "downloadBar", icon: "📲",  label: "下载 App 条" },
  { id: "marquee",     icon: "📢",  label: "公告滚动" },
  { id: "gameCategories", icon: "🎮", label: "游戏分类" },
  { id: "ageGate",     icon: "🔞",  label: "年龄验证" },
  { id: "advanced",    icon: "⚙️",  label: "高级（颜色）" },
] as const;

type SectionId = typeof SECTIONS[number]["id"];

const emptyBanner: ThemeBanner = { imageUrl: "", linkUrl: null, title: null };

/* ═══════════════════════════════════════════════════════════ */
export function ThemeSettingsClient() {
  const { t } = useLocale();
  const { setForbidden } = useAdminApiContext();
  const [theme, setTheme] = useState<ThemeConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId>("background");

  useEffect(() => {
    fetch("/api/admin/theme", { credentials: "include" })
      .then((r) => {
        if (r.status === 403) setForbidden(true);
        if (!r.ok) throw new Error("admin.site.fetchError");
        return r.json();
      })
      .then((d: { theme: ThemeConfig }) => setTheme(d.theme))
      .catch(() => setError("admin.site.fetchError"))
      .finally(() => setLoading(false));
  }, [setForbidden]);

  function patch(partial: Partial<ThemeConfig>) {
    if (!theme) return;
    setTheme({ ...theme, ...partial });
  }
  function patchUiGameCategories(list: string[]) {
    if (!theme) return;
    setTheme({ ...theme, uiGameCategories: list });
  }
  function patchCategoryPills(list: ThemeConfig["categoryPills"]) {
    if (!theme) return;
    setTheme({ ...theme, categoryPills: list });
  }
  function patchAgeGate(partial: Partial<ThemeConfig["ageGate"]>) {
    if (!theme) return;
    setTheme({ ...theme, ageGate: { ...theme.ageGate, ...partial } });
  }
  function patchDownloadBar(partial: Partial<ThemeConfig["downloadBar"]>) {
    if (!theme) return;
    setTheme({ ...theme, downloadBar: { ...theme.downloadBar, ...partial } });
  }
  function patchActionBarLimits(partial: Partial<ThemeConfig["actionBarLimits"]>) {
    if (!theme) return;
    setTheme({ ...theme, actionBarLimits: { ...theme.actionBarLimits, ...partial } });
  }
  function patchActionBarButtonImages(partial: Partial<ThemeConfig["actionBarButtonImages"]>) {
    if (!theme) return;
    setTheme({ ...theme, actionBarButtonImages: { ...theme.actionBarButtonImages, ...partial } });
  }
  function patchQuickActions(list: ThemeConfig["quickActions"]) {
    if (!theme) return;
    setTheme({ ...theme, quickActions: list });
  }
  function patchBottomNav(list: ThemeConfig["bottomNav"]) {
    if (!theme) return;
    setTheme({ ...theme, bottomNav: list });
  }

  function save() {
    if (!theme) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    fetch("/api/admin/theme", {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(theme),
    })
      .then((r) => {
        if (r.status === 403) setForbidden(true);
        if (!r.ok) throw new Error("admin.site.saveError");
        setSaved(true);
      })
      .catch(() => setError("admin.site.saveError"))
      .finally(() => setSaving(false));
  }

  if (loading) return <div className="py-16 text-center text-[var(--compact-muted)]">加载中…</div>;
  if (error) return <div className="py-16 text-center text-[var(--compact-danger)]">{t(error)}</div>;
  if (!theme) return null;

  /* ─── 各区块渲染 ─────────────────────────────────────────── */
  function renderContent() {
    if (!theme) return null;

    /* ── 1. 整页背景 ── */
    if (activeSection === "background") return (
      <div className="admin-card p-6 space-y-6">
        <SectionTitle title="🖼️ 整页背景" desc="用一张照片覆盖整个前台背景，手机和桌面都生效。" />
        <ImageInput
          label="整页背景图"
          value={theme.pageBackgroundUrl ?? ""}
          onChange={(v) => patch({ pageBackgroundUrl: v || null })}
          size="建议 1920×1080 或更大"
          hint="填入图片地址即可。图片会覆盖整个网站背景，不需要设颜色。"
        />
      </div>
    );

    /* ── 2. Logo 与站名 ── */
    if (activeSection === "logo") return (
      <div className="admin-card p-6 space-y-6">
        <SectionTitle title="🏷️ Logo 与站名" desc="设置网站 Logo 图片和名称。" />
        <ImageInput
          label="Logo 图片"
          value={theme.logoUrl ?? ""}
          onChange={(v) => patch({ logoUrl: v || null })}
          size="200×50 透明底 PNG"
          hint="建议使用透明背景的 PNG 或 SVG 文件。"
        />
        <div>
          <label className={labelClass}>网站名称</label>
          <input
            type="text"
            value={theme.siteName ?? ""}
            onChange={(e) => patch({ siteName: e.target.value })}
            className={inputClass}
            placeholder="我的网站"
          />
        </div>
      </div>
    );

    /* ── 3. 首页轮播图 ── */
    if (activeSection === "heroBanners") return (
      <div className="admin-card p-6 space-y-5">
        <SectionTitle title="📸 首页轮播图" desc="最多 5 张。图片建议宽大于高，例如 1200×450。填入图片地址，可选填点击链接。" />
        <div className="space-y-4">
          {Array.from({ length: 5 }, (_, i) => (
            (theme.heroBanners ?? []).concat(emptyBanner, emptyBanner, emptyBanner, emptyBanner, emptyBanner)[i] ?? emptyBanner
          )).map((b, i) => (
            <BannerRow
              key={i}
              index={i}
              banner={b}
              imgSize="1200×450"
              onChange={(nb) => {
                const next = Array.from({ length: 5 }, (_, j) =>
                  ((theme.heroBanners ?? []).concat(emptyBanner, emptyBanner, emptyBanner, emptyBanner, emptyBanner))[j] ?? emptyBanner
                );
                next[i] = nb;
                patch({ heroBanners: next.slice(0, 5).filter(x => x.imageUrl) });
              }}
            />
          ))}
        </div>
      </div>
    );

    /* ── 4. 按钮图片 ── */
    if (activeSection === "buttons") {
      const btnDefs = [
        { key: "login" as const,    label: "登录按钮" },
        { key: "register" as const, label: "注册按钮" },
        { key: "deposit" as const,  label: "存款按钮" },
        { key: "withdraw" as const, label: "提款按钮" },
        { key: "refresh" as const,  label: "刷新按钮" },
        { key: "signout" as const,  label: "退出按钮" },
      ];
      return (
        <div className="admin-card p-6 space-y-6">
          <SectionTitle title="🔘 按钮图片" desc="用照片替换各功能按钮。上传后前台按钮显示为图片，不显示文字。" />
          <div className="grid gap-6 sm:grid-cols-2">
            {btnDefs.map(({ key, label }) => (
              <ImageInput
                key={key}
                label={label}
                value={theme.actionBarButtonImages?.[key] ?? ""}
                onChange={(v) => patchActionBarButtonImages({ [key]: v || null })}
                size="200×60"
                hint="建议透明底 PNG"
              />
            ))}
          </div>
          <div className="rounded-xl bg-[var(--compact-card-bg)] border border-[var(--compact-card-border)] p-4 space-y-3">
            <p className="text-xs font-bold text-[var(--compact-muted)] uppercase">存款 / 提款限额文字</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { key: "minDeposit" as const, label: "最低存款" },
                { key: "maxDeposit" as const, label: "最高存款" },
                { key: "minWithdraw" as const, label: "最低提款" },
                { key: "maxWithdraw" as const, label: "最高提款" },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className={labelClass}>{label}</label>
                  <input
                    type="text"
                    value={theme.actionBarLimits?.[key] ?? ""}
                    onChange={(e) => patchActionBarLimits({ [key]: e.target.value || null })}
                    className={inputClass}
                    placeholder="如：MYR 30"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    /* ── 5. 快捷入口 ── */
    if (activeSection === "quickActions") {
      const defaultAction = { label: "", url: "", iconUrl: null, iconKey: null, style: "gold" as const };
      const actions = Array.from({ length: 8 }, (_, i) => (theme.quickActions ?? [])[i] ?? defaultAction);
      return (
        <div className="admin-card p-6 space-y-5">
          <SectionTitle title="⚡ 快捷入口" desc="首页显示的快捷按钮，最多 8 个。每个可以设一张图片，有图片时前台只显示图片，没有图片则显示文字图标。" />
          <div className="space-y-3">
            {actions.map((a, i) => (
              <div key={i} className="rounded-xl border border-[var(--compact-card-border)] bg-[var(--compact-card-bg)] p-4">
                <div className="mb-3 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--compact-primary)] text-[11px] font-bold text-white">{i + 1}</span>
                  <span className="text-sm font-semibold text-[var(--compact-text)]">
                    {a.label ? a.label : <span className="text-[var(--compact-muted)] font-normal italic">未设置名称</span>}
                  </span>
                  {a.url && <span className="ml-auto rounded bg-[var(--compact-card-border)] px-2 py-0.5 text-[11px] text-[var(--compact-muted)] font-mono">{a.url}</span>}
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <ImageInput
                    label="图片（用图片代替文字图标）"
                    value={a.iconUrl ?? ""}
                    onChange={(v) => {
                      const next = [...actions];
                      next[i] = { ...next[i], iconUrl: v || null };
                      patchQuickActions(next.filter(x => x.label || x.url || x.iconUrl));
                    }}
                    size="100×100"
                  />
                  <div className="space-y-3">
                    <div>
                      <label className={labelClass}>名称</label>
                      <input
                        type="text"
                        value={a.label}
                        onChange={(e) => {
                          const next = [...actions];
                          next[i] = { ...next[i], label: e.target.value };
                          patchQuickActions(next);
                        }}
                        className={inputClass}
                        placeholder="如：存款"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>链接</label>
                      <input
                        type="text"
                        value={a.url}
                        onChange={(e) => {
                          const next = [...actions];
                          next[i] = { ...next[i], url: e.target.value };
                          patchQuickActions(next);
                        }}
                        className={inputClass}
                        placeholder="/deposit"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    /* ── 6. 底部导航 ── */
    if (activeSection === "bottomNav") {
      const defaultSix: ThemeConfig["bottomNav"] = [
        { href: "/",          label: "HOME",      icon: "🏠", iconUrl: null, badge: null },
        { href: "/games",     label: "GAMES",     icon: "🎮", iconUrl: null, badge: null },
        { href: "/promotion", label: "PROMO",     icon: "🎁", iconUrl: null, badge: null },
        { href: "/history",   label: "HISTORY",   icon: "📜", iconUrl: null, badge: null },
        { href: "/chat",      label: "LIVE CHAT", icon: "💬", iconUrl: null, badge: null },
        { href: "/settings",  label: "SETTINGS",  icon: "⚙️", iconUrl: null, badge: null },
      ];
      const list = (theme.bottomNav ?? []).length >= 6 ? theme.bottomNav! : defaultSix;
      return (
        <div className="admin-card p-6 space-y-5">
          <SectionTitle title="🧭 底部导航" desc="手机底部导航栏，共 6 个。可上传图标图片替换 emoji，也可修改显示文字。" />
          <div className="space-y-3">
            {defaultSix.map((def, i) => {
              const item = list[i] ?? def;
              const upd = (field: "label" | "icon" | "iconUrl", value: string | null) => {
                const next = list.length >= 6 ? [...list] : [...defaultSix];
                next[i] = { ...next[i]!, [field]: value };
                patchBottomNav(next);
              };
              return (
                <div key={def.href} className="rounded-xl border border-[var(--compact-card-border)] bg-[var(--compact-card-bg)] p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--compact-primary)] text-[11px] font-bold text-white">{i + 1}</span>
                    <span className="text-sm font-semibold text-[var(--compact-text)]">{item.icon ?? def.icon} {item.label || def.label}</span>
                    <span className="ml-auto rounded bg-[var(--compact-card-border)] px-2 py-0.5 text-[11px] text-[var(--compact-muted)] font-mono">{def.href}</span>
                    {item.iconUrl && <span className="rounded bg-green-50 border border-green-200 px-2 py-0.5 text-[11px] text-green-700">已设图片</span>}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <ImageInput
                      label="图标图片（替换 emoji）"
                      value={item.iconUrl ?? ""}
                      onChange={(v) => upd("iconUrl", v || null)}
                      size="60×60 透明 PNG"
                    />
                    <div className="space-y-3">
                      <div>
                        <label className={labelClass}>显示文字</label>
                        <input type="text" value={item.label} onChange={(e) => upd("label", e.target.value)} className={inputClass} placeholder={def.label} />
                      </div>
                      <div>
                        <label className={labelClass}>Emoji 图标（无图片时显示）</label>
                        <input type="text" value={item.icon ?? ""} onChange={(e) => upd("icon", e.target.value || null)} className={inputClass} placeholder={def.icon ?? "🏠"} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    /* ── 7. 促销设置 ── */
    if (activeSection === "promos") return (
      <div className="admin-card p-6 space-y-6">
        <SectionTitle title="🎁 促销设置" desc="促销卡片的显示方式与图片高度。" />
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass}>卡片排列方式</label>
            <select
              value={theme.promotionPattern ?? "classic"}
              onChange={(e) => patch({ promotionPattern: e.target.value as ThemeConfig["promotionPattern"] })}
              className={inputClass}
            >
              <option value="classic">经典（文字 + 图片）</option>
              <option value="image_tiles">图片方块</option>
              <option value="image_strips">图片条形</option>
            </select>
            <p className="mt-1 text-[11px] text-[var(--compact-muted)]">image_tiles / image_strips 以图片为主</p>
          </div>
          <div>
            <label className={labelClass}>每行列数</label>
            <select
              value={theme.vividPromoCardConfig?.columns ?? 3}
              onChange={(e) => patch({ vividPromoCardConfig: { ...(theme.vividPromoCardConfig ?? { imgHeight: 180, showPercent: true, showSubtitle: true, showTnc: true, columns: 3 }), columns: Number(e.target.value) as 2 | 3 } })}
              className={inputClass}
            >
              <option value={2}>2 列（卡片较宽）</option>
              <option value={3}>3 列（默认）</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>图片区高度（像素）</label>
            <input
              type="number"
              min={80}
              max={600}
              step={10}
              value={theme.vividPromoCardConfig?.imgHeight ?? 180}
              onChange={(e) => {
                const v = Math.min(600, Math.max(80, Number(e.target.value) || 180));
                patch({ vividPromoCardConfig: { ...(theme.vividPromoCardConfig ?? { imgHeight: 180, showPercent: true, showSubtitle: true, showTnc: true, columns: 3 }), imgHeight: v } });
              }}
              className={inputClass}
            />
            <p className="mt-1 text-[11px] text-[var(--compact-muted)]">80 ~ 600 px，建议 160~240</p>
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-bold text-[var(--compact-muted)] uppercase">卡片上显示的内容</p>
          <div className="flex flex-wrap gap-4">
            {([
              { key: "showPercent" as const,  label: "百分比" },
              { key: "showSubtitle" as const, label: "副标题" },
              { key: "showTnc" as const,      label: "条款" },
            ]).map(({ key, label }) => {
              const cfg = theme.vividPromoCardConfig ?? { imgHeight: 180, showPercent: true, showSubtitle: true, showTnc: true, columns: 3 };
              return (
                <label key={key} className="flex cursor-pointer items-center gap-2 text-sm text-[var(--compact-text)]">
                  <input
                    type="checkbox"
                    checked={cfg[key] !== false}
                    onChange={(e) => patch({ vividPromoCardConfig: { ...cfg, [key]: e.target.checked } })}
                    className="h-4 w-4 accent-[var(--compact-primary)]"
                  />
                  {label}
                </label>
              );
            })}
          </div>
        </div>
      </div>
    );

    /* ── 8. 品牌与合作 ── */
    if (activeSection === "partners") return (
      <div className="admin-card p-6 space-y-5">
        <SectionTitle title="🤝 品牌与合作" desc="子公司 / 品牌 Logo 条（最多 5 个），以及合作徽章图片。" />
        <p className="text-xs font-bold text-[var(--compact-muted)] uppercase">品牌 Logo（最多 5 个）</p>
        <div className="space-y-4">
          {Array.from({ length: 5 }, (_, i) =>
            ((theme.subsidiaries ?? []).concat(emptyBanner, emptyBanner, emptyBanner, emptyBanner, emptyBanner))[i] ?? emptyBanner
          ).map((b, i) => (
            <BannerRow
              key={i}
              index={i}
              banner={b}
              imgSize="300×150"
              onChange={(nb) => {
                const next = Array.from({ length: 5 }, (_, j) =>
                  ((theme.subsidiaries ?? []).concat(emptyBanner, emptyBanner, emptyBanner, emptyBanner, emptyBanner))[j] ?? emptyBanner
                );
                next[i] = nb;
                patch({ subsidiaries: next.slice(0, 5).filter(x => x.imageUrl) });
              }}
            />
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-[var(--compact-card-border)]">
          <ImageInput
            label="合作商徽章（长条图）"
            value={theme.partnershipBadgeUrl ?? ""}
            onChange={(v) => patch({ partnershipBadgeUrl: v || null })}
            size="600×120"
          />
        </div>
      </div>
    );

    /* ── 9. 其他图片 ── */
    if (activeSection === "otherImages") return (
      <div className="admin-card p-6 space-y-6">
        <SectionTitle title="🗂️ 其他图片" desc="首页其他位置的图片，如次级横幅、流水表背景、中间插槽。" />
        <ImageInput
          label="次级横幅（首页大图下方）"
          value={theme.secondaryBannerUrl ?? ""}
          onChange={(v) => patch({ secondaryBannerUrl: v || null })}
          size="1200×300"
        />
        <ImageInput
          label="流水表背景"
          value={theme.liveTxBgImageUrl ?? ""}
          onChange={(v) => patch({ liveTxBgImageUrl: v || null })}
          size="800×200"
        />
        <ImageInput
          label="中间插槽图片"
          value={theme.centerSlotImageUrl ?? ""}
          onChange={(v) => patch({ centerSlotImageUrl: v || null })}
          size="400×300"
        />
      </div>
    );

    /* ── 10. 下载 App 条 ── */
    if (activeSection === "downloadBar") return (
      <div className="admin-card p-6 space-y-5">
        <SectionTitle title="📲 下载 App 条" desc="顶部下载 App 横幅，可开关。" />
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={theme.downloadBar?.enabled ?? false}
            onChange={(e) => patchDownloadBar({ enabled: e.target.checked })}
            className="h-5 w-5 rounded accent-[var(--compact-primary)]"
          />
          <span className="text-sm font-semibold text-[var(--compact-text)]">显示下载 App 条</span>
        </label>
        <ImageInput
          label="App 图标图片"
          value={theme.downloadBar?.imageUrl ?? ""}
          onChange={(v) => patchDownloadBar({ imageUrl: v || null })}
          size="200×200"
          hint="显示在横幅左侧的图标"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>标题文字</label>
            <input type="text" value={theme.downloadBar?.title ?? ""} onChange={(e) => patchDownloadBar({ title: e.target.value || null })} className={inputClass} placeholder="下载 App" />
          </div>
          <div>
            <label className={labelClass}>副标题</label>
            <input type="text" value={theme.downloadBar?.subtitle ?? ""} onChange={(e) => patchDownloadBar({ subtitle: e.target.value || null })} className={inputClass} placeholder="立即获取" />
          </div>
          <div>
            <label className={labelClass}>按钮文字</label>
            <input type="text" value={theme.downloadBar?.ctaText ?? ""} onChange={(e) => patchDownloadBar({ ctaText: e.target.value || null })} className={inputClass} placeholder="Download" />
          </div>
          <div>
            <label className={labelClass}>下载链接</label>
            <input type="text" value={theme.downloadBar?.ctaUrl ?? ""} onChange={(e) => patchDownloadBar({ ctaUrl: e.target.value || null })} className={inputClass} placeholder="https://..." />
          </div>
        </div>
      </div>
    );

    /* ── 11. 公告滚动 ── */
    if (activeSection === "marquee") return (
      <div className="admin-card p-6 space-y-5">
        <SectionTitle title="📢 公告滚动条" desc="顶部滚动文字公告。每行一条。" />
        <div>
          <label className={labelClass}>单条公告</label>
          <input
            type="text"
            value={theme.announcementMarqueeText ?? ""}
            onChange={(e) => patch({ announcementMarqueeText: e.target.value || null })}
            className={inputClass}
            placeholder="欢迎光临…"
          />
        </div>
        <div>
          <label className={labelClass}>多条公告（每行一条）</label>
          <textarea
            value={(theme.marqueeMessages ?? []).join("\n")}
            onChange={(e) => patch({ marqueeMessages: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })}
            className={`${inputClass} min-h-[120px]`}
            rows={5}
            placeholder={"第一条公告\n第二条公告\n第三条公告"}
          />
        </div>
      </div>
    );

    /* ── 12. 链接与路径 ── */

    /* ── 13. 游戏分类 ── */
    if (activeSection === "gameCategories") return (
      <div className="admin-card p-6 space-y-5">
        <SectionTitle title="🎮 游戏分类" desc="前台显示的游戏类别列表，以及分类筛选标签。" />
        <div>
          <label className={labelClass}>游戏类别（逗号分隔）</label>
          <input
            type="text"
            value={(theme.uiGameCategories ?? []).join(", ")}
            onChange={(e) => patchUiGameCategories(e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
            className={inputClass}
            placeholder="Casino, Sportbook, Slots, E-Sports, Poker, Fishing"
          />
          <p className="mt-1 text-[11px] text-[var(--compact-muted)]">填入前台要显示的分类名称，用英文逗号分隔</p>
        </div>
        <div>
          <label className={labelClass}>分类筛选标签（ID + 显示名）</label>
          <div className="space-y-2">
            {Array.from({ length: 12 }, (_, i) => (theme.categoryPills ?? [])[i] ?? { id: "", label: "" }).map((p, i) => (
              <div key={i} className="flex gap-2">
                <input
                  type="text"
                  value={p.id}
                  onChange={(e) => {
                    const next = Array.from({ length: 12 }, (_, j) => (theme.categoryPills ?? [])[j] ?? { id: "", label: "" });
                    next[i] = { ...next[i]!, id: e.target.value };
                    patchCategoryPills(next);
                  }}
                  className={`${inputClass} max-w-[120px]`}
                  placeholder="id"
                />
                <input
                  type="text"
                  value={p.label}
                  onChange={(e) => {
                    const next = Array.from({ length: 12 }, (_, j) => (theme.categoryPills ?? [])[j] ?? { id: "", label: "" });
                    next[i] = { ...next[i]!, label: e.target.value };
                    patchCategoryPills(next);
                  }}
                  className={inputClass}
                  placeholder="显示名称"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );

    /* ── 14. 年龄验证 ── */
    if (activeSection === "ageGate") return (
      <div className="admin-card p-6 space-y-5">
        <SectionTitle title="🔞 年龄验证弹窗" desc="用户首次访问时显示年龄确认弹窗。" />
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={theme.ageGate?.enabled ?? false}
            onChange={(e) => patchAgeGate({ enabled: e.target.checked })}
            className="h-5 w-5 rounded accent-[var(--compact-primary)]"
          />
          <span className="text-sm font-semibold text-[var(--compact-text)]">启用年龄验证弹窗</span>
        </label>
        <div>
          <label className={labelClass}>弹窗标题</label>
          <input type="text" value={theme.ageGate?.title ?? ""} onChange={(e) => patchAgeGate({ title: e.target.value })} className={inputClass} placeholder="您是否已满 18 岁？" />
        </div>
        <div>
          <label className={labelClass}>弹窗内容</label>
          <textarea value={theme.ageGate?.content ?? ""} onChange={(e) => patchAgeGate({ content: e.target.value })} className={`${inputClass} min-h-[100px]`} placeholder="本网站仅供 18 岁以上人士访问…" />
        </div>
      </div>
    );

    /* ── 15. 高级（颜色） ── */
    if (activeSection === "advanced") return (
      <div className="admin-card p-6 space-y-6">
        <SectionTitle title="⚙️ 高级：颜色与尺寸" desc="以下均为细项颜色设置，日常用照片和背景图即可，不需要改这里。" />
        <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-[12px] text-amber-800">
          ⚠️ 一般用户不需要修改这里。只有在需要精确调整颜色时才使用。
        </div>
        {/* 主色 */}
        <div>
          <p className="mb-2 text-xs font-bold text-[var(--compact-muted)] uppercase">主题色</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { key: "themePrimaryColor", label: "主色", ph: "#a855f7" },
              { key: "themeAccentColor",  label: "强调色", ph: "#6366f1" },
              { key: "pageBackgroundColor", label: "背景色", ph: "#0a0a0a" },
            ].map(({ key, label, ph }) => (
              <div key={key}>
                <label className={labelClass}>{label}</label>
                <input type="text" value={String((theme as unknown as Record<string, string | null | undefined>)[key] ?? "")} onChange={(e) => patch({ [key]: e.target.value || null } as Partial<ThemeConfig>)} className={inputClass} placeholder={ph} />
              </div>
            ))}
          </div>
        </div>
        {/* 顶栏颜色 */}
        <div>
          <p className="mb-2 text-xs font-bold text-[var(--compact-muted)] uppercase">顶栏 / 跑马灯颜色</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { key: "vpTopbarBg",       label: "顶栏背景",     ph: "rgba(8,8,18,0.96)" },
              { key: "vpTopbarBorder",   label: "顶栏边框",     ph: "rgba(150,80,255,0.35)" },
              { key: "marqueeBg",        label: "跑马灯背景",   ph: "" },
              { key: "marqueeBorder",    label: "跑马灯边框",   ph: "" },
              { key: "marqueeTextColor", label: "跑马灯文字色", ph: "#ffffff" },
            ].map(({ key, label, ph }) => (
              <div key={key}>
                <label className={labelClass}>{label}</label>
                <input type="text" value={String((theme as unknown as Record<string, string | null | undefined>)[key] ?? "")} onChange={(e) => patch({ [key]: e.target.value || null } as Partial<ThemeConfig>)} className={inputClass} placeholder={ph} />
              </div>
            ))}
          </div>
        </div>
        {/* 按钮颜色 */}
        <div>
          <p className="mb-2 text-xs font-bold text-[var(--compact-muted)] uppercase">存款 / 提款按钮颜色</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>存款按钮颜色</label>
              <input type="text" value={theme.actionBarDepositColor ?? ""} onChange={(e) => patch({ actionBarDepositColor: e.target.value || null })} className={inputClass} placeholder="#22c55e" />
            </div>
            <div>
              <label className={labelClass}>提款按钮颜色</label>
              <input type="text" value={theme.actionBarWithdrawColor ?? ""} onChange={(e) => patch({ actionBarWithdrawColor: e.target.value || null })} className={inputClass} placeholder="#eab308" />
            </div>
          </div>
        </div>
        {/* Vivid */}
        <div>
          <p className="mb-2 text-xs font-bold text-[var(--compact-muted)] uppercase">手机端 Vivid 颜色与尺寸</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { key: "vividBg",       label: "背景",        ph: "#080810" },
              { key: "vividCard",     label: "卡片背景",    ph: "#13132a" },
              { key: "vividCard2",    label: "卡片背景 2",  ph: "#1c1c38" },
              { key: "vividBorder",   label: "边框",        ph: "rgba(150,80,255,0.3)" },
              { key: "vividText",     label: "文字色",      ph: "#ffffff" },
              { key: "vividMuted",    label: "次要文字",    ph: "#b8aee8" },
              { key: "vividGreen",    label: "成功色",      ph: "#22c55e" },
              { key: "vividRed",      label: "错误色",      ph: "#ef4444" },
              { key: "vividGold",     label: "金色",        ph: "#f59e0b" },
              { key: "vpRadiusCard",  label: "卡片圆角",    ph: "16px" },
              { key: "vpRadiusBtn",   label: "按钮圆角",    ph: "12px" },
              { key: "vpGap",         label: "间距",        ph: "24px" },
              { key: "vpMaxWidth",    label: "最大宽度",    ph: "1100px" },
            ].map(({ key, label, ph }) => (
              <div key={key}>
                <label className={labelClass}>{label}</label>
                <input type="text" value={String((theme as unknown as Record<string, string | null | undefined>)[key] ?? "")} onChange={(e) => patch({ [key]: e.target.value || null } as Partial<ThemeConfig>)} className={inputClass} placeholder={ph} />
              </div>
            ))}
          </div>
        </div>
        {/* Desktop */}
        <div>
          <p className="mb-2 text-xs font-bold text-[var(--compact-muted)] uppercase">桌面版颜色与尺寸</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { key: "deskBg",        label: "桌面背景",    ph: "#0E1014" },
              { key: "deskPanel",     label: "面板色",      ph: "#232630" },
              { key: "deskAccent",    label: "强调色",      ph: "#E8C85A" },
              { key: "deskContainer", label: "容器宽度",    ph: "1560px" },
              { key: "deskBannerH",   label: "Banner 高度", ph: "300px" },
            ].map(({ key, label, ph }) => (
              <div key={key}>
                <label className={labelClass}>{label}</label>
                <input type="text" value={String((theme as unknown as Record<string, string | null | undefined>)[key] ?? "")} onChange={(e) => patch({ [key]: e.target.value || null } as Partial<ThemeConfig>)} className={inputClass} placeholder={ph} />
              </div>
            ))}
          </div>
        </div>
        {/* Misc colors */}
        <div>
          <p className="mb-2 text-xs font-bold text-[var(--compact-muted)] uppercase">流水 / 推荐 / 客服颜色</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { key: "livetxDepositColor",  label: "流水存款色",   ph: "#1e3a5f" },
              { key: "livetxWithdrawColor", label: "流水提款色",   ph: "#e6b800" },
              { key: "referralBlockBg",     label: "推荐区块背景", ph: "rgba(120,80,255,0.08)" },
              { key: "referralBlockBorder", label: "推荐区块边框", ph: "rgba(120,80,255,0.25)" },
              { key: "chatFabBg",           label: "客服悬浮背景", ph: "#080808" },
            ].map(({ key, label, ph }) => (
              <div key={key}>
                <label className={labelClass}>{label}</label>
                <input type="text" value={String((theme as unknown as Record<string, string | null | undefined>)[key] ?? "")} onChange={(e) => patch({ [key]: e.target.value || null } as Partial<ThemeConfig>)} className={inputClass} placeholder={ph} />
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-bold text-[var(--compact-muted)] uppercase">字体</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>字体族</label>
              <input type="text" value={theme.fontFamily ?? ""} onChange={(e) => patch({ fontFamily: e.target.value || null })} className={inputClass} placeholder="-apple-system, Segoe UI" />
            </div>
            <div>
              <label className={labelClass}>基础字号</label>
              <input type="text" value={theme.fontSize ?? ""} onChange={(e) => patch({ fontSize: e.target.value || null })} className={inputClass} placeholder="15px" />
            </div>
          </div>
        </div>
      </div>
    );

    return null;
  }

  /* ─── 主渲染 ─────────────────────────────────────────────── */
  return (
    <div className="space-y-6">
      {/* 顶部操作栏 */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[var(--compact-card-border)] bg-[var(--compact-card-bg)] p-4 shadow-sm">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="admin-compact-btn admin-compact-btn-primary"
        >
          {saving ? "保存中…" : "💾 保存设置"}
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm font-semibold text-[var(--compact-success)]">
            ✅ 已保存
          </span>
        )}
        {error && (
          <span className="text-sm text-[var(--compact-danger)]">{t(error)}</span>
        )}
        <a href="/" target="_blank" rel="noreferrer" className="admin-compact-btn admin-compact-btn-ghost text-[13px]">
          🔗 查看前台
        </a>
      </div>

      {/* 主体：左侧列表 + 右侧内容 */}
      <div className="flex flex-col gap-5 lg:flex-row lg:gap-6">
        {/* 左侧菜单 */}
        <nav className="shrink-0 lg:w-48">
          <ul className="space-y-0.5 rounded-2xl border border-[var(--compact-card-border)] bg-[var(--compact-card-bg)] p-2 shadow-sm">
            {SECTIONS.map(({ id, icon, label }) => (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => setActiveSection(id)}
                  className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-[13px] font-medium transition-all ${
                    activeSection === id
                      ? "bg-[var(--compact-primary)] text-white shadow-sm"
                      : "text-[var(--compact-text)] hover:bg-[var(--compact-card-border)]/60"
                  }`}
                >
                  <span className="text-base leading-none">{icon}</span>
                  <span>{label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* 右侧内容 */}
        <div className="min-w-0 flex-1 [&_.admin-card]:rounded-2xl [&_.admin-card]:shadow-sm [&_.admin-card]:border-[var(--compact-card-border)]">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
