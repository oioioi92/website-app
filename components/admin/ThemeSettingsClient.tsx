"use client";

import { useEffect, useState } from "react";
import type { ThemeConfig, ThemeBanner } from "@/lib/public/theme";
import { useLocale } from "@/lib/i18n/context";
import { useAdminApiContext } from "@/lib/admin-api-context";

const inputClass =
  "admin-compact-input w-full rounded-lg border border-[var(--compact-card-border)] bg-[var(--compact-card-bg)] px-3 text-[var(--compact-text)] placeholder-[var(--compact-muted)] focus:border-[var(--compact-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--compact-primary)]";
const labelClass = "mb-1 block text-xs font-medium text-[var(--compact-muted)]";

/** 图片尺寸提示标签 */
function SizeBadge({ size, note }: { size: string; note?: string }) {
  return (
    <span className="inline-flex items-center gap-1 ml-2 rounded-md border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 select-none leading-none">
      <span>📐</span>
      <span>{size}</span>
      {note && <span className="font-normal opacity-80">({note})</span>}
    </span>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <h2 className="text-sm font-semibold text-[var(--compact-text)] border-b border-[var(--compact-card-border)] pb-2 mb-4">{title}</h2>;
}

const emptyBanner: ThemeBanner = { imageUrl: "", linkUrl: null, title: null };

export function ThemeSettingsClient() {
  const { t } = useLocale();
  const { setForbidden } = useAdminApiContext();
  const [theme, setTheme] = useState<ThemeConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

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

  function patchSectionTitles(partial: Partial<ThemeConfig["sectionTitles"]>) {
    if (!theme) return;
    setTheme({ ...theme, sectionTitles: { ...theme.sectionTitles, ...partial } });
  }

  function patchRoutes(partial: Partial<ThemeConfig["routes"]>) {
    if (!theme) return;
    setTheme({ ...theme, routes: { ...theme.routes, ...partial } });
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
      body: JSON.stringify(theme)
    })
      .then((r) => {
        if (r.status === 403) setForbidden(true);
        if (!r.ok) throw new Error("admin.site.saveError");
        setSaved(true);
      })
      .catch(() => setError("admin.site.saveError"))
      .finally(() => setSaving(false));
  }

  if (loading) return <div className="py-8 text-center text-[var(--compact-muted)]">{t("admin.site.loading")}</div>;
  if (error) return <div className="py-8 text-center text-[var(--compact-danger)]">{t(error)}</div>;
  if (!theme) return null;

  return (
    <div className="theme-settings-page space-y-8 [&_.admin-card]:rounded-2xl [&_.admin-card]:shadow-md [&_.admin-card]:border-slate-200/80">
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={save} disabled={saving} className="admin-compact-btn admin-compact-btn-primary">
          {saving ? t("admin.site.saving") : t("admin.site.saveConfig")}
        </button>
        {saved && <span className="text-[13px] text-[var(--compact-success)]">{t("admin.site.saved")}</span>}
        <a href="/" target="_blank" rel="noreferrer" className="admin-compact-btn admin-compact-btn-ghost text-[13px]">
          {t("admin.site.openFrontLink")}
        </a>
      </div>

      {/* 1. Site & entry URLs */}
      <div className="admin-card p-6 space-y-6">
        <SectionTitle title={t("admin.site.sectionEntry")} />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>{t("admin.site.siteName")}</label>
            <input type="text" value={theme.siteName ?? ""} onChange={(e) => patch({ siteName: e.target.value })} className={inputClass} placeholder="Site" />
          </div>
          <div>
            <label className={labelClass}>{t("admin.site.logoUrl")} <SizeBadge size="200×50" note={t("admin.site.logoSizeNote")} /></label>
            <input type="text" value={theme.logoUrl ?? ""} onChange={(e) => patch({ logoUrl: e.target.value || null })} className={inputClass} placeholder="https://..." />
          </div>
          <div>
            <label className={labelClass}>{t("admin.site.loginUrl")}</label>
            <input type="text" value={theme.loginUrl ?? ""} onChange={(e) => patch({ loginUrl: e.target.value || null })} className={inputClass} placeholder={t("admin.site.placeholderUrl")} />
          </div>
          <div>
            <label className={labelClass}>{t("admin.site.registerUrl")}</label>
            <input type="text" value={theme.registerUrl ?? ""} onChange={(e) => patch({ registerUrl: e.target.value || null })} className={inputClass} placeholder={t("admin.site.placeholderUrl")} />
          </div>
          <div>
            <label className={labelClass}>{t("admin.site.depositUrl")}</label>
            <input type="text" value={theme.depositUrl ?? ""} onChange={(e) => patch({ depositUrl: e.target.value || null })} className={inputClass} placeholder={t("admin.site.placeholderUrl")} />
          </div>
          <div>
            <label className={labelClass}>{t("admin.site.withdrawUrl")}</label>
            <input type="text" value={theme.withdrawUrl ?? ""} onChange={(e) => patch({ withdrawUrl: e.target.value || null })} className={inputClass} placeholder={t("admin.site.placeholderUrl")} />
          </div>
          <div>
            <label className={labelClass}>{t("admin.site.chatDefaultUrl")}</label>
            <input type="text" value={theme.chatDefaultUrl ?? ""} onChange={(e) => patch({ chatDefaultUrl: e.target.value || null })} className={inputClass} placeholder={t("admin.site.placeholderChat")} />
          </div>
        </div>
      </div>

      {/* ── 2. 顶栏与跑马灯 ── */}
      <div className="admin-card p-6 space-y-6">
        <SectionTitle title={t("admin.site.sectionMarquee")} />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass}>{t("admin.site.marqueeSingle")}</label>
            <input type="text" value={theme.announcementMarqueeText ?? ""} onChange={(e) => patch({ announcementMarqueeText: e.target.value || null })} className={inputClass} placeholder={t("admin.site.placeholderMarquee")} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>{t("admin.site.marqueeMulti")}</label>
            <textarea
              value={(theme.marqueeMessages ?? []).join("\n")}
              onChange={(e) => patch({ marqueeMessages: e.target.value.split("\n").map((s) => s.trim()).filter(Boolean) })}
              className={`${inputClass} min-h-[80px]`}
              placeholder={t("admin.site.placeholderMarqueeLines")}
              rows={4}
            />
          </div>
          <p className="text-[13px] text-[var(--compact-muted)] sm:col-span-2">{t("admin.site.marqueeStyleDesc")}</p>
          {[
            { key: "vpTopbarBg", labelKey: "admin.site.topbarBg", ph: "rgba(8,8,18,0.96)" },
            { key: "vpTopbarBorder", labelKey: "admin.site.topbarBorder", ph: "rgba(150,80,255,0.35)" },
            { key: "marqueeBg", labelKey: "admin.site.marqueeBgLabel", phKey: "admin.site.marqueePhCard" },
            { key: "marqueeBorder", labelKey: "admin.site.marqueeBorderLabel", phKey: "admin.site.marqueePhBorder" },
            { key: "marqueeTextColor", labelKey: "admin.site.marqueeTextColorLabel", ph: "#ffffff" },
          ].map(({ key, labelKey, phKey, ph }) => (
            <div key={key}>
              <label className={labelClass}>{t(labelKey)}</label>
              <input type="text" value={String((theme as unknown as Record<string, string | null | undefined>)[key] ?? "")} onChange={(e) => patch({ [key]: e.target.value || null } as Partial<ThemeConfig>)} className={inputClass} placeholder={ph ?? (phKey ? t(phKey) : "")} />
            </div>
          ))}
        </div>
      </div>

      {/* ── 3. 首页区块标题与路径 ── */}
      <div className="admin-card p-6 space-y-6">
        <SectionTitle title={t("admin.site.sectionTitlesAndRoutes")} />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>{t("admin.site.quickActionsTitle")}</label>
            <input type="text" value={theme.sectionTitles?.quickActions ?? ""} onChange={(e) => patchSectionTitles({ quickActions: e.target.value })} className={inputClass} placeholder="QUICK ACTIONS" />
          </div>
          <div>
            <label className={labelClass}>{t("admin.site.liveTxTitle")}</label>
            <input type="text" value={theme.sectionTitles?.liveTransaction ?? ""} onChange={(e) => patchSectionTitles({ liveTransaction: e.target.value })} className={inputClass} placeholder="LIVE TRANSACTION" />
          </div>
          <div>
            <label className={labelClass}>{t("admin.site.gameZoneTitle")}</label>
            <input type="text" value={theme.sectionTitles?.gameZone ?? ""} onChange={(e) => patchSectionTitles({ gameZone: e.target.value })} className={inputClass} placeholder="GAME ZONE" />
          </div>
          <div>
            <label className={labelClass}>{t("admin.site.socialTitle")}</label>
            <input type="text" value={theme.sectionTitles?.social ?? ""} onChange={(e) => patchSectionTitles({ social: e.target.value })} className={inputClass} placeholder="SOCIAL" />
          </div>
          <div>
            <label className={labelClass}>{t("admin.site.routePromotion")}</label>
            <input type="text" value={theme.routes?.promotion ?? ""} onChange={(e) => patchRoutes({ promotion: e.target.value })} className={inputClass} placeholder="/promotion" />
          </div>
          <div>
            <label className={labelClass}>{t("admin.site.routeBonus")}</label>
            <input type="text" value={theme.routes?.bonus ?? ""} onChange={(e) => patchRoutes({ bonus: e.target.value })} className={inputClass} placeholder="/bonus" />
          </div>
        </div>
      </div>

      {/* 3b. Game categories & pills */}
      <div className="admin-card p-6 space-y-6">
        <SectionTitle title={t("admin.site.sectionGameCategories")} />
        <div>
          <label className={labelClass}>{t("admin.site.uiGameCategoriesLabel")}</label>
          <input
            type="text"
            value={(theme.uiGameCategories ?? []).join(", ")}
            onChange={(e) => patchUiGameCategories(e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
            className={inputClass}
            placeholder="Casino, Sportbook, Slots, E-Sports, Poker, Fishing"
          />
          <p className="mt-1 text-[11px] text-[var(--compact-muted)]">{t("admin.site.optional") ?? "Optional"} — comma-separated</p>
        </div>
        <div>
          <label className={labelClass}>{t("admin.site.categoryPillsLabel")}</label>
          {Array.from({ length: 12 }, (_, i) => (theme.categoryPills ?? [])[i] ?? { id: "", label: "" }).map((p, i) => (
            <div key={i} className="mb-2 flex gap-2">
              <input
                type="text"
                value={p.id}
                onChange={(e) => {
                  const next = Array.from({ length: 12 }, (_, j) => (theme.categoryPills ?? [])[j] ?? { id: "", label: "" });
                  next[i] = { ...next[i]!, id: e.target.value };
                  patchCategoryPills(next);
                }}
                className={`${inputClass} flex-1 max-w-[120px]`}
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
                className={`${inputClass} flex-1`}
                placeholder="Label"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 4. Age gate */}
      <div className="admin-card p-6 space-y-6">
        <SectionTitle title={t("admin.site.sectionAgeGate")} />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-2">
            <input type="checkbox" id="ageGateEnabled" checked={theme.ageGate?.enabled ?? false} onChange={(e) => patchAgeGate({ enabled: e.target.checked })} className="rounded border-[var(--compact-card-border)]" />
            <label htmlFor="ageGateEnabled" className="text-[13px] text-[var(--compact-text)]">{t("admin.site.ageGateEnabled")}</label>
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>{t("admin.site.ageGateTitle")}</label>
            <input type="text" value={theme.ageGate?.title ?? ""} onChange={(e) => patchAgeGate({ title: e.target.value })} className={inputClass} placeholder={t("admin.site.placeholderAgeConfirm")} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>{t("admin.site.ageGateContent")}</label>
            <textarea value={theme.ageGate?.content ?? ""} onChange={(e) => patchAgeGate({ content: e.target.value })} className={`${inputClass} min-h-[80px]`} placeholder={t("admin.site.placeholderAgeContent")} />
          </div>
        </div>
      </div>

      {/* ── 5. 下载 App 条 ── */}
      <div className="admin-card p-6 space-y-6">
        <SectionTitle title={t("admin.site.sectionDownloadBar")} />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-2">
            <input type="checkbox" id="downloadBarEnabled" checked={theme.downloadBar?.enabled ?? false} onChange={(e) => patchDownloadBar({ enabled: e.target.checked })} className="rounded border-[var(--compact-card-border)]" />
            <label htmlFor="downloadBarEnabled" className="text-[13px] text-[var(--compact-text)]">{t("admin.site.downloadBarEnabled")}</label>
          </div>
          <div>
            <label className={labelClass}>{t("admin.site.downloadBarTitle")}</label>
            <input type="text" value={theme.downloadBar?.title ?? ""} onChange={(e) => patchDownloadBar({ title: e.target.value || null })} className={inputClass} placeholder={t("admin.site.placeholderDownload")} />
          </div>
          <div>
            <label className={labelClass}>{t("admin.site.downloadBarSubtitle")}</label>
            <input type="text" value={theme.downloadBar?.subtitle ?? ""} onChange={(e) => patchDownloadBar({ subtitle: e.target.value || null })} className={inputClass} placeholder={t("admin.site.placeholderGetApp")} />
          </div>
          <div>
            <label className={labelClass}>{t("admin.site.ctaText")}</label>
            <input type="text" value={theme.downloadBar?.ctaText ?? ""} onChange={(e) => patchDownloadBar({ ctaText: e.target.value || null })} className={inputClass} placeholder="Download" />
          </div>
          <div>
            <label className={labelClass}>{t("admin.site.ctaUrl")}</label>
            <input type="text" value={theme.downloadBar?.ctaUrl ?? ""} onChange={(e) => patchDownloadBar({ ctaUrl: e.target.value || null })} className={inputClass} placeholder="https://..." />
          </div>
          <div>
            <label className={labelClass}>{t("admin.site.imageUrl")} <SizeBadge size="200×200" note="App图标" /></label>
            <input type="text" value={theme.downloadBar?.imageUrl ?? ""} onChange={(e) => patchDownloadBar({ imageUrl: e.target.value || null })} className={inputClass} placeholder="https://..." />
          </div>
        </div>
      </div>

      {/* ── 6. 快捷操作栏（存款/提款按钮） ── */}
      <div className="admin-card p-6 space-y-6">
        <SectionTitle title={t("admin.site.sectionActionBar")} />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>{t("admin.site.depositColor")}</label>
            <input type="text" value={theme.actionBarDepositColor ?? ""} onChange={(e) => patch({ actionBarDepositColor: e.target.value || null })} className={inputClass} placeholder="#22c55e" />
          </div>
          <div>
            <label className={labelClass}>{t("admin.site.withdrawColor")}</label>
            <input type="text" value={theme.actionBarWithdrawColor ?? ""} onChange={(e) => patch({ actionBarWithdrawColor: e.target.value || null })} className={inputClass} placeholder="#eab308" />
          </div>
          <div>
            <label className={labelClass}>{t("admin.site.minDeposit")}</label>
            <input type="text" value={theme.actionBarLimits?.minDeposit ?? ""} onChange={(e) => patchActionBarLimits({ minDeposit: e.target.value || null })} className={inputClass} placeholder={t("admin.site.placeholderMin10")} />
          </div>
          <div>
            <label className={labelClass}>{t("admin.site.maxDeposit")}</label>
            <input type="text" value={theme.actionBarLimits?.maxDeposit ?? ""} onChange={(e) => patchActionBarLimits({ maxDeposit: e.target.value || null })} className={inputClass} placeholder={t("admin.site.placeholderMax50k")} />
          </div>
          <div>
            <label className={labelClass}>{t("admin.site.minWithdraw")}</label>
            <input type="text" value={theme.actionBarLimits?.minWithdraw ?? ""} onChange={(e) => patchActionBarLimits({ minWithdraw: e.target.value || null })} className={inputClass} placeholder={t("admin.site.placeholderMin50")} />
          </div>
          <div>
            <label className={labelClass}>{t("admin.site.maxWithdraw")}</label>
            <input type="text" value={theme.actionBarLimits?.maxWithdraw ?? ""} onChange={(e) => patchActionBarLimits({ maxWithdraw: e.target.value || null })} className={inputClass} placeholder={t("admin.site.placeholderMax100k")} />
          </div>
        </div>
        <p className="mt-4 text-xs text-[var(--compact-muted)]">{t("admin.site.actionBarButtonImagesDesc")}</p>
        <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(["login", "register", "deposit", "withdraw", "refresh", "signout"] as const).map((key) => (
            <div key={key}>
              <label className={labelClass}>{key === "login" ? t("admin.site.actionBarImgLogin") : key === "register" ? t("admin.site.actionBarImgRegister") : key === "deposit" ? t("admin.site.actionBarImgDeposit") : key === "withdraw" ? t("admin.site.actionBarImgWithdraw") : key === "refresh" ? t("admin.site.actionBarImgRefresh") : t("admin.site.actionBarImgSignout")}</label>
              <input type="text" value={theme.actionBarButtonImages?.[key] ?? ""} onChange={(e) => patchActionBarButtonImages({ [key]: e.target.value || null })} className={inputClass} placeholder="https://..." />
            </div>
          ))}
        </div>
      </div>

      {/* ── 7. 首页轮播图 ── */}
      <div className="admin-card p-6 space-y-6">
        <SectionTitle title={t("admin.site.sectionHeroBanners")} />
        <p className="text-[13px] text-[var(--compact-muted)] -mt-2">{t("admin.site.heroBannersDesc")}</p>
        {(theme.heroBanners ?? []).concat(emptyBanner, emptyBanner, emptyBanner, emptyBanner, emptyBanner).slice(0, 5).map((b, i) => (
          <div key={i} className="grid gap-3 rounded-lg border border-[var(--compact-card-border)] p-3 sm:grid-cols-3">
            <div>
              <label className={labelClass}>{t("admin.site.imageUrl")} <SizeBadge size="1200×450" note={t("admin.site.heroSizeNote")} /></label>
              <input
                type="text"
                value={b.imageUrl ?? ""}
                onChange={(e) => {
                  const next = [...(theme.heroBanners ?? [])];
                  while (next.length <= i) next.push({ ...emptyBanner });
                  next[i] = { ...next[i], imageUrl: e.target.value };
                  patch({ heroBanners: next.slice(0, 5) });
                }}
                className={inputClass}
                placeholder="https://..."
              />
            </div>
            <div>
              <label className={labelClass}>{t("admin.site.linkUrl")}</label>
              <input
                type="text"
                value={b.linkUrl ?? ""}
                onChange={(e) => {
                  const next = [...(theme.heroBanners ?? [])];
                  while (next.length <= i) next.push({ ...emptyBanner });
                  next[i] = { ...next[i], linkUrl: e.target.value || null };
                  patch({ heroBanners: next.slice(0, 5) });
                }}
                className={inputClass}
                placeholder={t("admin.site.placeholderBonusUrl")}
              />
            </div>
            <div>
              <label className={labelClass}>{t("admin.site.title")}</label>
              <input
                type="text"
                value={b.title ?? ""}
                onChange={(e) => {
                  const next = [...(theme.heroBanners ?? [])];
                  while (next.length <= i) next.push({ ...emptyBanner });
                  next[i] = { ...next[i], title: e.target.value || null };
                  patch({ heroBanners: next.slice(0, 5) });
                }}
                className={inputClass}
                placeholder={t("admin.site.placeholderOptional")}
              />
            </div>
          </div>
        ))}
      </div>

      {/* ── 8. 子公司/品牌条 ── */}
      <div className="admin-card p-6 space-y-6">
        <SectionTitle title={t("admin.site.sectionSubsidiaries")} />
        <p className="text-[13px] text-[var(--compact-muted)] -mt-2">{t("admin.site.subsidiariesDesc")}</p>
        {(theme.subsidiaries ?? []).concat(emptyBanner, emptyBanner, emptyBanner, emptyBanner, emptyBanner).slice(0, 5).map((b, i) => (
          <div key={i} className="grid gap-3 rounded-lg border border-[var(--compact-card-border)] p-3 sm:grid-cols-3">
            <div>
              <label className={labelClass}>{t("admin.site.imageUrl")} <SizeBadge size="300×150" note={t("admin.site.subsidiarySizeNote")} /></label>
              <input
                type="text"
                value={b.imageUrl ?? ""}
                onChange={(e) => {
                  const next = [...(theme.subsidiaries ?? [])];
                  while (next.length <= i) next.push({ ...emptyBanner });
                  next[i] = { ...next[i], imageUrl: e.target.value };
                  patch({ subsidiaries: next.slice(0, 5) });
                }}
                className={inputClass}
                placeholder="https://..."
              />
            </div>
            <div>
              <label className={labelClass}>{t("admin.site.linkUrl")}</label>
              <input
                type="text"
                value={b.linkUrl ?? ""}
                onChange={(e) => {
                  const next = [...(theme.subsidiaries ?? [])];
                  while (next.length <= i) next.push({ ...emptyBanner });
                  next[i] = { ...next[i], linkUrl: e.target.value || null };
                  patch({ subsidiaries: next.slice(0, 5) });
                }}
                className={inputClass}
                placeholder={t("admin.site.placeholderRootUrl")}
              />
            </div>
            <div>
              <label className={labelClass}>{t("admin.site.title")}</label>
              <input
                type="text"
                value={b.title ?? ""}
                onChange={(e) => {
                  const next = [...(theme.subsidiaries ?? [])];
                  while (next.length <= i) next.push({ ...emptyBanner });
                  next[i] = { ...next[i], title: e.target.value || null };
                  patch({ subsidiaries: next.slice(0, 5) });
                }}
                className={inputClass}
                placeholder={t("admin.site.placeholderOptional")}
              />
            </div>
          </div>
        ))}
      </div>

      {/* ── 9. 快捷入口（首页按钮） ── */}
      <div className="admin-card p-6 space-y-6">
        <SectionTitle title={t("admin.site.sectionQuickActions") ?? "Quick Actions"} />
        <p className="text-[13px] text-[var(--compact-muted)] -mt-2">{t("admin.site.quickActionsDesc") ?? "每项可填 iconUrl，前台即用照片代替图标/文字。"}</p>
        {(theme.quickActions ?? []).concat({ label: "", url: "", iconUrl: null, iconKey: null, style: "gold" }).slice(0, 8).map((a, i) => (
          <div key={i} className="grid gap-3 rounded-lg border border-[var(--compact-card-border)] p-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className={labelClass}>{t("admin.site.quickActionLabel") ?? "Label"}</label>
              <input type="text" value={a.label} onChange={(e) => { const next = [...(theme.quickActions ?? [])]; while (next.length <= i) next.push({ label: "", url: "", iconUrl: null, iconKey: null, style: "gold" }); next[i] = { ...next[i], label: e.target.value }; patchQuickActions(next.slice(0, 8)); }} className={inputClass} placeholder="e.g. DEPOSIT" />
            </div>
            <div>
              <label className={labelClass}>{t("admin.site.quickActionUrl") ?? "URL"}</label>
              <input type="text" value={a.url} onChange={(e) => { const next = [...(theme.quickActions ?? [])]; while (next.length <= i) next.push({ label: "", url: "", iconUrl: null, iconKey: null, style: "gold" }); next[i] = { ...next[i], url: e.target.value }; patchQuickActions(next.slice(0, 8)); }} className={inputClass} placeholder="/deposit" />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>{t("admin.site.imageUrl")}（{t("admin.site.optional") ?? "可选"}）</label>
              <input type="text" value={a.iconUrl ?? ""} onChange={(e) => { const next = [...(theme.quickActions ?? [])]; while (next.length <= i) next.push({ label: "", url: "", iconUrl: null, iconKey: null, style: "gold" }); next[i] = { ...next[i], iconUrl: e.target.value || null }; patchQuickActions(next.slice(0, 8)); }} className={inputClass} placeholder={t("admin.site.iconUrlPlaceholder")} />
            </div>
          </div>
        ))}
      </div>

      {/* ── 10. 底部导航 ── */}
      <div className="admin-card p-6 space-y-6">
        <SectionTitle title={t("admin.site.sectionBottomNav") ?? "Bottom Nav"} />
        <p className="text-[13px] text-[var(--compact-muted)] -mt-2">{t("admin.site.bottomNavDesc") ?? "每项可填 iconUrl，前台底部导航即用照片代替 emoji。"}</p>
        {(() => {
          const defaultSix: ThemeConfig["bottomNav"] = [
            { href: "/", label: "HOME", icon: "🏠", iconUrl: null, badge: null },
            { href: "/games", label: "GAMES", icon: "🎮", iconUrl: null, badge: null },
            { href: "/promotion", label: "PROMO", icon: "🎁", iconUrl: null, badge: null },
            { href: "/history", label: "HISTORY", icon: "📜", iconUrl: null, badge: null },
            { href: "/chat", label: "LIVE CHAT", icon: "💬", iconUrl: null, badge: null },
            { href: "/settings", label: "SETTINGS", icon: "⚙️", iconUrl: null, badge: null }
          ];
          const list = (theme.bottomNav ?? []).length >= 6 ? theme.bottomNav! : defaultSix;
          return ["/", "/games", "/promotion", "/history", "/chat", "/settings"].map((href, i) => {
            const item = list[i] ?? defaultSix[i]!;
            const upd = (field: "label" | "icon" | "iconUrl", value: string | null) => {
              const next = list.length >= 6 ? [...list] : [...defaultSix];
              next[i] = { ...(next[i] ?? defaultSix[i]!), [field]: value };
              patchBottomNav(next);
            };
            return (
              <div key={href} className="grid gap-3 rounded-lg border border-[var(--compact-card-border)] p-3 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className={labelClass}>{t("admin.site.bnHref") ?? "href"}</label>
                  <input type="text" value={item.href} readOnly className={inputClass + " opacity-70"} />
                </div>
                <div>
                  <label className={labelClass}>{t("admin.site.bnLabel") ?? "Label"}</label>
                  <input type="text" value={item.label} onChange={(e) => upd("label", e.target.value)} className={inputClass} placeholder="HOME" />
                </div>
                <div>
                  <label className={labelClass}>{t("admin.site.bnIcon") ?? "icon (emoji)"}</label>
                  <input type="text" value={item.icon ?? ""} onChange={(e) => upd("icon", e.target.value || null)} className={inputClass} placeholder="🏠" />
                </div>
                <div>
                  <label className={labelClass}>{t("admin.site.imageUrl")}（{t("admin.site.optional") ?? "可选"}）</label>
                  <input type="text" value={item.iconUrl ?? ""} onChange={(e) => upd("iconUrl", e.target.value || null)} className={inputClass} placeholder={t("admin.site.iconUrlPlaceholder")} />
                </div>
              </div>
            );
          });
        })()}
      </div>

      {/* ── 11. 图片与背景 ── */}
      <div className="admin-card p-6 space-y-6">
        <SectionTitle title={t("admin.site.sectionImages")} />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>{t("admin.site.partnershipBadge")} <SizeBadge size="600×120" note="长条徽章" /></label>
            <input type="text" value={theme.partnershipBadgeUrl ?? ""} onChange={(e) => patch({ partnershipBadgeUrl: e.target.value || null })} className={inputClass} placeholder="https://..." />
          </div>
          <div>
            <label className={labelClass}>{t("admin.site.centerSlot")} <SizeBadge size="400×300" note="中间插槽" /></label>
            <input type="text" value={theme.centerSlotImageUrl ?? ""} onChange={(e) => patch({ centerSlotImageUrl: e.target.value || null })} className={inputClass} placeholder="https://..." />
          </div>
          <div>
            <label className={labelClass}>{t("admin.site.secondaryBanner")} <SizeBadge size="1200×300" note={t("admin.site.secondaryBannerNote")} /></label>
            <input type="text" value={theme.secondaryBannerUrl ?? ""} onChange={(e) => patch({ secondaryBannerUrl: e.target.value || null })} className={inputClass} placeholder="https://..." />
          </div>
          <div>
            <label className={labelClass}>{t("admin.site.liveTxBg")} <SizeBadge size="800×200" note={t("admin.site.liveTxBgSizeNote")} /></label>
            <input type="text" value={theme.liveTxBgImageUrl ?? ""} onChange={(e) => patch({ liveTxBgImageUrl: e.target.value || null })} className={inputClass} placeholder="https://..." />
          </div>
          <div>
            <label className={labelClass}>{t("admin.site.pageBackgroundUrl")}</label>
            <input type="text" value={theme.pageBackgroundUrl ?? ""} onChange={(e) => patch({ pageBackgroundUrl: e.target.value || null })} className={inputClass} placeholder="https://..." />
          </div>
          <div>
            <label className={labelClass}>{t("admin.site.pageBackgroundColor")}</label>
            <input type="text" value={theme.pageBackgroundColor ?? ""} onChange={(e) => patch({ pageBackgroundColor: e.target.value || null })} className={inputClass} placeholder="#0a0a0a" />
          </div>
        </div>
        <p className="text-[12px] text-[var(--compact-muted)]">{t("admin.site.pageBackgroundHint")}</p>
      </div>

      {/* 12. Theme colors & display */}
      <div className="admin-card p-6 space-y-6">
        <SectionTitle title={t("admin.site.sectionDisplay")} />
        <div>
          <label className={labelClass}>{t("admin.site.designStyleLabel")}</label>
          <select
            value={theme.designStyle ?? "default"}
            onChange={(e) => patch({ designStyle: (e.target.value === "default" ? undefined : e.target.value) as ThemeConfig["designStyle"] })}
            className={inputClass}
          >
            <option value="default">{t("admin.site.designStyleDefault")}</option>
            <option value="minimal">{t("admin.site.designStyleMinimal")}</option>
            <option value="luxury">{t("admin.site.designStyleLuxury")}</option>
            <option value="gaming">{t("admin.site.designStyleGaming")}</option>
            <option value="soft">{t("admin.site.designStyleSoft")}</option>
          </select>
          <p className="mt-1 text-[12px] text-[var(--compact-muted)]">{t("admin.site.designStyleHint")}</p>
        </div>
        <p className="text-[13px] text-[var(--compact-muted)] -mt-2">{t("admin.site.themeColorsDesc")}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>{t("admin.site.themePrimaryColor")}</label>
            <input type="text" value={theme.themePrimaryColor ?? ""} onChange={(e) => patch({ themePrimaryColor: e.target.value || null })} className={inputClass} placeholder={t("admin.site.themePrimaryPlaceholder")} />
          </div>
          <div>
            <label className={labelClass}>{t("admin.site.themeAccentColor")}</label>
            <input type="text" value={theme.themeAccentColor ?? ""} onChange={(e) => patch({ themeAccentColor: e.target.value || null })} className={inputClass} placeholder={t("admin.site.themeAccentPlaceholder")} />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>{t("admin.site.promotionPattern")}</label>
            <select value={theme.promotionPattern ?? "classic"} onChange={(e) => patch({ promotionPattern: e.target.value as ThemeConfig["promotionPattern"] })} className={inputClass}>
              <option value="classic">classic</option>
              <option value="image_tiles">image_tiles</option>
              <option value="image_strips">image_strips</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>{t("admin.site.socialStyle")}</label>
            <select value={theme.socialStyle ?? "COIN"} onChange={(e) => patch({ socialStyle: e.target.value as ThemeConfig["socialStyle"] })} className={inputClass}>
              <option value="COIN">COIN</option>
              <option value="CUBE">CUBE</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>{t("admin.site.promotionFontPreset")}</label>
            <select value={theme.promotionFontPreset ?? "default"} onChange={(e) => patch({ promotionFontPreset: e.target.value as ThemeConfig["promotionFontPreset"] })} className={inputClass}>
              <option value="default">default</option>
              <option value="compact">compact</option>
              <option value="bold">bold</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── 13. Vivid 风格（手机端紫黑主题） ── */}
      <div className="admin-card p-6 space-y-6">
        <SectionTitle title={t("admin.site.sectionVividColors")} />
        <p className="text-[13px] text-[var(--compact-muted)] -mt-2">{t("admin.site.vividCssHint")}</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { key: "vividBg", labelKey: "admin.site.vividBg", ph: "#080810" },
            { key: "vividCard", labelKey: "admin.site.vividCard", ph: "#13132a" },
            { key: "vividCard2", labelKey: "admin.site.vividCard2", ph: "#1c1c38" },
            { key: "vividBorder", labelKey: "admin.site.vividBorder", ph: "rgba(150,80,255,0.3)" },
            { key: "vividText", labelKey: "admin.site.vividText", ph: "#ffffff" },
            { key: "vividMuted", labelKey: "admin.site.vividMuted", ph: "#b8aee8" },
            { key: "vividGreen", labelKey: "admin.site.vividGreen", ph: "#22c55e" },
            { key: "vividRed", labelKey: "admin.site.vividRed", ph: "#ef4444" },
            { key: "vividGold", labelKey: "admin.site.vividGold", ph: "#f59e0b" },
            { key: "vpRadiusCard", labelKey: "admin.site.vpRadiusCard", ph: "16px" },
            { key: "vpRadiusBtn", labelKey: "admin.site.vpRadiusBtn", ph: "12px" },
            { key: "vpGap", labelKey: "admin.site.vpGap", ph: "24px" },
            { key: "vpMaxWidth", labelKey: "admin.site.vpMaxWidth", ph: "1100px" },
          ].map(({ key, labelKey, ph }) => (
            <div key={key}>
              <label className={labelClass}>{t(labelKey)}</label>
              <input type="text" value={String((theme as unknown as Record<string, string | null | undefined>)[key] ?? "")} onChange={(e) => patch({ [key]: e.target.value || null } as Partial<ThemeConfig>)} className={inputClass} placeholder={ph} />
            </div>
          ))}
        </div>
      </div>

      {/* ── 14. 桌面版风格 ── */}
      <div className="admin-card p-6 space-y-6">
        <SectionTitle title={t("admin.site.sectionDeskColors")} />
        <p className="text-[13px] text-[var(--compact-muted)] -mt-2">{t("admin.site.deskCssHint")}</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { key: "deskBg", labelKey: "admin.site.deskBg", ph: "#0E1014" },
            { key: "deskPanel", labelKey: "admin.site.deskPanel", ph: "#232630" },
            { key: "deskAccent", labelKey: "admin.site.deskAccent", ph: "#E8C85A" },
            { key: "deskContainer", labelKey: "admin.site.deskContainer", ph: "1560px" },
            { key: "deskBannerH", labelKey: "admin.site.deskBannerH", ph: "300px" },
          ].map(({ key, labelKey, ph }) => (
            <div key={key}>
              <label className={labelClass}>{t(labelKey)}</label>
              <input type="text" value={String((theme as unknown as Record<string, string | null | undefined>)[key] ?? "")} onChange={(e) => patch({ [key]: e.target.value || null } as Partial<ThemeConfig>)} className={inputClass} placeholder={ph} />
            </div>
          ))}
        </div>
      </div>

      {/* ── 15. 流水 / 推荐 / 客服小窗颜色 ── */}
      <div className="admin-card p-6 space-y-6">
        <SectionTitle title={t("admin.site.sectionLivetxReferralChat")} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { key: "livetxDepositColor", labelKey: "admin.site.livetxDepositColor", ph: "#1e3a5f" },
            { key: "livetxWithdrawColor", labelKey: "admin.site.livetxWithdrawColor", ph: "#e6b800" },
            { key: "referralBlockBg", labelKey: "admin.site.referralBlockBg", ph: "rgba(120,80,255,0.08)" },
            { key: "referralBlockBorder", labelKey: "admin.site.referralBlockBorder", ph: "rgba(120,80,255,0.25)" },
            { key: "chatFabBg", labelKey: "admin.site.chatFabBg", ph: "#080808" },
          ].map(({ key, labelKey, ph }) => (
            <div key={key}>
              <label className={labelClass}>{t(labelKey)}</label>
              <input type="text" value={String((theme as unknown as Record<string, string | null | undefined>)[key] ?? "")} onChange={(e) => patch({ [key]: e.target.value || null } as Partial<ThemeConfig>)} className={inputClass} placeholder={ph} />
            </div>
          ))}
        </div>
      </div>

      {/* ── 16. 全局字体与语义色 ── */}
      <div className="admin-card p-6 space-y-6">
        <SectionTitle title={t("admin.site.sectionFrontSemanticFont")} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { key: "frontAccent", labelKey: "admin.site.frontAccent", ph: "#06b6d4" },
            { key: "frontSuccess", labelKey: "admin.site.frontSuccess", ph: "#10b981" },
            { key: "frontDanger", labelKey: "admin.site.frontDanger", ph: "#f43f5e" },
            { key: "frontGold", labelKey: "admin.site.frontGold", ph: "#f59e0b" },
            { key: "fontFamily", labelKey: "admin.site.fontFamily", ph: "-apple-system, BlinkMacSystemFont, Segoe UI" },
            { key: "fontSize", labelKey: "admin.site.fontSize", ph: "15px" },
          ].map(({ key, labelKey, ph }) => (
            <div key={key}>
              <label className={labelClass}>{t(labelKey)}</label>
              <input type="text" value={String((theme as unknown as Record<string, string | null | undefined>)[key] ?? "")} onChange={(e) => patch({ [key]: e.target.value || null } as Partial<ThemeConfig>)} className={inputClass} placeholder={ph} />
            </div>
          ))}
        </div>
      </div>

      {/* ── 17. Vivid 促销卡片 ── */}
      <div className="admin-card p-6 space-y-5">
        <SectionTitle title={t("admin.site.sectionVividPromoCard")} />

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>{t("admin.site.vividPromoImgHeightLabel")}</label>
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
            <p className="mt-1 text-[11px] text-[var(--compact-muted)]">{t("admin.site.vividPromoImgHeightHint")}</p>
          </div>

          <div>
            <label className={labelClass}>{t("admin.site.vividPromoColumnsLabel")}</label>
            <select
              value={theme.vividPromoCardConfig?.columns ?? 3}
              onChange={(e) => patch({ vividPromoCardConfig: { ...(theme.vividPromoCardConfig ?? { imgHeight: 180, showPercent: true, showSubtitle: true, showTnc: true, columns: 3 }), columns: Number(e.target.value) as 2 | 3 } })}
              className={inputClass}
            >
              <option value={2}>{t("admin.site.vividPromoColumns2")}</option>
              <option value={3}>{t("admin.site.vividPromoColumns3")}</option>
            </select>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium text-[var(--compact-muted)]">{t("admin.site.vividPromoCardDisplayContent")}</p>
          <div className="flex flex-wrap gap-3">
            {(
              [
                { key: "showPercent",  labelKey: "admin.site.vividPromoShowPercent" },
                { key: "showSubtitle", labelKey: "admin.site.vividPromoShowSubtitle" },
                { key: "showTnc",      labelKey: "admin.site.vividPromoShowTnc" },
              ] as { key: keyof NonNullable<typeof theme.vividPromoCardConfig>; labelKey: string }[]
            ).map(({ key, labelKey }) => {
              const cfg = theme.vividPromoCardConfig ?? { imgHeight: 180, showPercent: true, showSubtitle: true, showTnc: true, columns: 3 };
              const checked = cfg[key] !== false;
              return (
                <label key={key} className="flex cursor-pointer items-center gap-2 text-sm text-[var(--compact-text)]">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => patch({ vividPromoCardConfig: { ...cfg, [key]: e.target.checked } })}
                    className="h-4 w-4 accent-[var(--compact-primary)]"
                  />
                  {t(labelKey)}
                </label>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg border border-[var(--compact-card-border)] bg-[var(--compact-card-bg)] p-3 text-[12px] text-[var(--compact-muted)]">
          💡 {t("admin.site.vividPromoPreviewHint")}
        </div>
      </div>

      <div className="admin-card p-6">
        <p className="text-[13px] text-[var(--compact-muted)]">
          {t("admin.site.connectedNote")}
        </p>
      </div>
    </div>
  );
}
