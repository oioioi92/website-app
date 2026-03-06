"use client";

import { useEffect, useState } from "react";
import type { ThemeConfig, ThemeBanner } from "@/lib/public/theme";
import { useLocale } from "@/lib/i18n/context";
import { PhotoUploadField } from "@/components/admin/PhotoUploadField";
import { UI_GAME_CATEGORIES } from "@/lib/public/uiGameCategories";
import { StickySaveBar } from "@/components/admin/StickySaveBar";

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

const emptyBanner: ThemeBanner = { imageUrl: "", linkUrl: null, title: null };

export type ThemeSettingsSections = "full" | "homeMedia";

export function ThemeSettingsClient({ onlySections = "full" }: { onlySections?: ThemeSettingsSections }) {
  const { t } = useLocale();
  const isHomeMediaOnly = onlySections === "homeMedia";
  const [theme, setTheme] = useState<ThemeConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/theme")
      .then((r) => {
        if (!r.ok) throw new Error("admin.site.fetchError");
        return r.json();
      })
      .then((d: { theme: ThemeConfig }) => setTheme(d.theme))
      .catch(() => setError("admin.site.fetchError"))
      .finally(() => setLoading(false));
  }, []);

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

  function save() {
    if (!theme) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    fetch("/api/admin/theme", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(theme)
    })
      .then((r) => {
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
      {!isHomeMediaOnly && (
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={save} disabled={saving} className="admin-compact-btn admin-compact-btn-primary">
            {saving ? t("admin.site.saving") : t("admin.site.saveConfig")}
          </button>
          {saved && <span className="text-[13px] text-[var(--compact-success)]">{t("admin.site.saved")}</span>}
          <a href="/" target="_blank" rel="noreferrer" className="admin-compact-btn admin-compact-btn-ghost text-[13px]">
            {t("admin.site.openFrontLink")}
          </a>
        </div>
      )}

      {!isHomeMediaOnly && (
      <>
      <div className="admin-card p-6 space-y-6">
        <h2 className="text-sm font-semibold text-[var(--compact-text)] border-b border-[var(--compact-card-border)] pb-2">{t("admin.site.sectionEntry")}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>{t("admin.site.siteName")}</label>
            <input type="text" value={theme.siteName ?? ""} onChange={(e) => patch({ siteName: e.target.value })} className={inputClass} placeholder="Site" />
          </div>
          <div>
            <PhotoUploadField
              label={`${t("admin.site.logoUrl")} `}
              hint="200×50 PNG/SVG 透明底，可粘贴 URL 或上传"
              value={theme.logoUrl ?? ""}
              onChange={(url) => patch({ logoUrl: url || null })}
            />
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

      {!isHomeMediaOnly && (
      <div className="admin-card p-6 space-y-6">
        <h2 className="text-sm font-semibold text-[var(--compact-text)] border-b border-[var(--compact-card-border)] pb-2">{t("admin.site.sectionPageAndHeader")}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <PhotoUploadField
              label={t("admin.site.pageBackgroundImage")}
              hint={t("admin.site.pageBackgroundImageHint")}
              value={theme.pageBackgroundUrl ?? ""}
              onChange={(url) => patch({ pageBackgroundUrl: url || null })}
            />
          </div>
          <div>
            <label className={labelClass}>{t("admin.site.pageBackgroundColor")}</label>
            <input type="text" value={theme.pageBackgroundColor ?? ""} onChange={(e) => patch({ pageBackgroundColor: e.target.value || null })} className={inputClass} placeholder="#1f2937" />
          </div>
          <div className="sm:col-span-2">
            <p className="mb-2 text-[11px] font-medium text-[var(--compact-muted)]">{t("admin.site.themeColorsTitle")}</p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <label className="text-xs text-[var(--compact-muted)]">{t("admin.site.themePrimaryColor")}</label>
                <input type="text" value={theme.themePrimaryColor ?? ""} onChange={(e) => patch({ themePrimaryColor: e.target.value || null })} className={inputClass + " w-28"} placeholder="#a855f7" />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-[var(--compact-muted)]">{t("admin.site.themeAccentColor")}</label>
                <input type="text" value={theme.themeAccentColor ?? ""} onChange={(e) => patch({ themeAccentColor: e.target.value || null })} className={inputClass + " w-28"} placeholder="#6366f1" />
              </div>
            </div>
            <p className="mt-1 text-[11px] text-[var(--compact-muted)]">{t("admin.site.themeColorsHint")}</p>
          </div>
        </div>
        <div>
          <h3 className="mb-2 text-xs font-semibold text-[var(--compact-muted)]">{t("admin.site.quickActionsButtons")}</h3>
          <p className="mb-3 text-[11px] text-[var(--compact-muted)]">{t("admin.site.quickActionsButtonsHint")}</p>
          <div className="space-y-3">
            {(theme.quickActions ?? []).map((qa, i) => (
              <div key={i} className="grid gap-2 rounded-lg border border-[var(--compact-card-border)] p-3 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>{t("admin.site.quickActionLabel")}</label>
                  <input type="text" value={qa.label} onChange={(e) => { const next = [...(theme.quickActions ?? [])]; next[i] = { ...next[i], label: e.target.value }; patch({ quickActions: next }); }} className={inputClass} placeholder="Deposit" />
                </div>
                <div>
                  <label className={labelClass}>URL</label>
                  <input type="text" value={qa.url} onChange={(e) => { const next = [...(theme.quickActions ?? [])]; next[i] = { ...next[i], url: e.target.value }; patch({ quickActions: next }); }} className={inputClass} placeholder="/deposit" />
                </div>
                <div className="sm:col-span-2">
                  <PhotoUploadField label={t("admin.site.quickActionIcon")} hint="可选" value={qa.iconUrl ?? ""} onChange={(url) => { const next = [...(theme.quickActions ?? [])]; next[i] = { ...next[i], iconUrl: url || null }; patch({ quickActions: next }); }} />
                </div>
                <div className="sm:col-span-2 flex justify-end">
                  <button type="button" onClick={() => patch({ quickActions: (theme.quickActions ?? []).filter((_, j) => j !== i) })} className="admin-compact-btn admin-compact-btn-ghost text-red-600 text-xs">{t("admin.common.remove")}</button>
                </div>
              </div>
            ))}
            {(theme.quickActions ?? []).length < 6 && (
              <button type="button" onClick={() => patch({ quickActions: [...(theme.quickActions ?? []), { label: "", url: "/", iconUrl: null, iconKey: null, style: "gold" }] })} className="admin-compact-btn admin-compact-btn-ghost text-xs">+ {t("admin.site.addQuickAction")}</button>
            )}
          </div>
        </div>
        <div>
          <h3 className="mb-2 text-xs font-semibold text-[var(--compact-muted)]">{t("admin.site.gameCategoriesTitle")}</h3>
          <p className="mb-2 text-[11px] text-[var(--compact-muted)]">{t("admin.site.gameCategoriesHint")}</p>
          <div className="flex flex-wrap gap-2">
            {UI_GAME_CATEGORIES.map((cat) => {
              const selected = (theme.uiGameCategories ?? []).includes(cat);
              return (
                <label key={cat} className="inline-flex items-center gap-2 rounded-lg border border-[var(--compact-card-border)] px-3 py-2 cursor-pointer hover:bg-[var(--compact-card-bg)]">
                  <input type="checkbox" checked={selected} onChange={(e) => { const current = theme.uiGameCategories ?? []; const next = e.target.checked ? [...current, cat] : current.filter((c) => c !== cat); patch({ uiGameCategories: next }); }} className="rounded" />
                  <span className="text-xs font-medium text-[var(--compact-text)]">{cat}</span>
                </label>
              );
            })}
          </div>
          <p className="mt-2 text-[11px] text-[var(--compact-muted)]">{t("admin.site.gameCategoriesOrderNote")}</p>
        </div>
      </div>
      )}

      <div className="admin-card p-6 space-y-6">
        <h2 className="text-sm font-semibold text-[var(--compact-text)] border-b border-[var(--compact-card-border)] pb-2">{t("admin.site.sectionMarquee")}</h2>
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

      <div className="admin-card p-6 space-y-6">
        <h2 className="text-sm font-semibold text-[var(--compact-text)] border-b border-[var(--compact-card-border)] pb-2">{t("admin.site.sectionAgeGate")}</h2>
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

      <div className="admin-card p-6 space-y-6">
        <h2 className="text-sm font-semibold text-[var(--compact-text)] border-b border-[var(--compact-card-border)] pb-2">{t("admin.site.sectionDownloadBar")}</h2>
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
            <PhotoUploadField
              label={t("admin.site.imageUrl")}
              hint="200×200 App图标"
              value={theme.downloadBar?.imageUrl ?? ""}
              onChange={(url) => patchDownloadBar({ imageUrl: url || null })}
            />
          </div>
        </div>
      </div>

      <div className="admin-card p-6 space-y-6">
        <h2 className="text-sm font-semibold text-[var(--compact-text)] border-b border-[var(--compact-card-border)] pb-2">{t("admin.site.sectionActionBar")}</h2>
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
      </div>
      </>
      )}

      <div className="admin-card p-6 space-y-6">
        <h2 className="text-sm font-semibold text-[var(--compact-text)] border-b border-[var(--compact-card-border)] pb-2">{t("admin.site.sectionHeroBanners")}</h2>
        <p className="text-[13px] text-[var(--compact-muted)]">{t("admin.site.heroBannersDesc")}</p>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <button
            type="button"
            onClick={() => patch({ heroBanners: [...(theme.heroBanners ?? []), { ...emptyBanner }] })}
            className="admin-compact-btn admin-compact-btn-ghost text-xs py-1.5 px-3"
          >
            + {t("admin.site.addBanner")}
          </button>
        </div>
        {((theme.heroBanners ?? []).length === 0 ? (
          <p className="text-[13px] text-[var(--compact-muted)]">{t("admin.site.noBannersYet")}</p>
        ) : null)}
        {(theme.heroBanners ?? []).map((b, i) => (
          <div key={i} className="grid gap-3 rounded-lg border border-[var(--compact-card-border)] p-3 sm:grid-cols-3 relative">
            <div className="sm:col-span-3 flex flex-wrap gap-2 justify-end absolute top-2 right-2">
              <button type="button" onClick={() => { const list = [...(theme.heroBanners ?? [])]; const up = list[i - 1]; if (up) { list[i - 1] = list[i]; list[i] = up; patch({ heroBanners: list }); } }} disabled={i === 0} className="admin-compact-btn admin-compact-btn-ghost text-[10px] py-1 px-2 opacity-80">↑</button>
              <button type="button" onClick={() => { const list = [...(theme.heroBanners ?? [])]; const down = list[i + 1]; if (down) { list[i + 1] = list[i]; list[i] = down; patch({ heroBanners: list }); } }} disabled={i === (theme.heroBanners ?? []).length - 1} className="admin-compact-btn admin-compact-btn-ghost text-[10px] py-1 px-2 opacity-80">↓</button>
              <button type="button" onClick={() => patch({ heroBanners: (theme.heroBanners ?? []).filter((_, j) => j !== i) })} className="admin-compact-btn admin-compact-btn-ghost text-[10px] py-1 px-2 text-red-600 hover:bg-red-50">{t("admin.common.remove")}</button>
            </div>
            <div>
              <PhotoUploadField
                label={`${t("admin.site.imageUrl")} ${i + 1}`}
                hint="1200×450 推荐16:6"
                value={b.imageUrl ?? ""}
                onChange={(url) => {
                  const next = [...(theme.heroBanners ?? [])];
                  next[i] = { ...next[i], imageUrl: url };
                  patch({ heroBanners: next });
                }}
              />
            </div>
            <div>
              <label className={labelClass}>{t("admin.site.linkUrl")}</label>
              <input
                type="text"
                value={b.linkUrl ?? ""}
                onChange={(e) => {
                  const next = [...(theme.heroBanners ?? [])];
                  next[i] = { ...next[i], linkUrl: e.target.value || null };
                  patch({ heroBanners: next });
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
                  next[i] = { ...next[i], title: e.target.value || null };
                  patch({ heroBanners: next });
                }}
                className={inputClass}
                placeholder={t("admin.site.placeholderOptional")}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="admin-card p-6 space-y-6">
        <h2 className="text-sm font-semibold text-[var(--compact-text)] border-b border-[var(--compact-card-border)] pb-2">{t("admin.site.sectionSubsidiaries")}</h2>
        <p className="text-[13px] text-[var(--compact-muted)]">{t("admin.site.subsidiariesDesc")}</p>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <button
            type="button"
            onClick={() => patch({ subsidiaries: [...(theme.subsidiaries ?? []), { ...emptyBanner }] })}
            className="admin-compact-btn admin-compact-btn-ghost text-xs py-1.5 px-3"
          >
            + {t("admin.site.addSubsidiary")}
          </button>
        </div>
        {((theme.subsidiaries ?? []).length === 0 ? (
          <p className="text-[13px] text-[var(--compact-muted)]">{t("admin.site.noSubsidiariesYet")}</p>
        ) : null)}
        {(theme.subsidiaries ?? []).map((b, i) => (
          <div key={i} className="grid gap-3 rounded-lg border border-[var(--compact-card-border)] p-3 sm:grid-cols-3 relative">
            <div className="sm:col-span-3 flex flex-wrap gap-2 justify-end absolute top-2 right-2">
              <button type="button" onClick={() => { const list = [...(theme.subsidiaries ?? [])]; const up = list[i - 1]; if (up) { list[i - 1] = list[i]; list[i] = up; patch({ subsidiaries: list }); } }} disabled={i === 0} className="admin-compact-btn admin-compact-btn-ghost text-[10px] py-1 px-2 opacity-80">↑</button>
              <button type="button" onClick={() => { const list = [...(theme.subsidiaries ?? [])]; const down = list[i + 1]; if (down) { list[i + 1] = list[i]; list[i] = down; patch({ subsidiaries: list }); } }} disabled={i === (theme.subsidiaries ?? []).length - 1} className="admin-compact-btn admin-compact-btn-ghost text-[10px] py-1 px-2 opacity-80">↓</button>
              <button type="button" onClick={() => patch({ subsidiaries: (theme.subsidiaries ?? []).filter((_, j) => j !== i) })} className="admin-compact-btn admin-compact-btn-ghost text-[10px] py-1 px-2 text-red-600 hover:bg-red-50">{t("admin.common.remove")}</button>
            </div>
            <div>
              <PhotoUploadField
                label={`${t("admin.site.imageUrl")} ${i + 1}`}
                hint="300×150 Logo/品牌"
                value={b.imageUrl ?? ""}
                onChange={(url) => {
                  const next = [...(theme.subsidiaries ?? [])];
                  next[i] = { ...next[i], imageUrl: url };
                  patch({ subsidiaries: next });
                }}
              />
            </div>
            <div>
              <label className={labelClass}>{t("admin.site.linkUrl")}</label>
              <input
                type="text"
                value={b.linkUrl ?? ""}
                onChange={(e) => {
                  const next = [...(theme.subsidiaries ?? [])];
                  next[i] = { ...next[i], linkUrl: e.target.value || null };
                  patch({ subsidiaries: next });
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
                  next[i] = { ...next[i], title: e.target.value || null };
                  patch({ subsidiaries: next });
                }}
                className={inputClass}
                placeholder={t("admin.site.placeholderOptional")}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="admin-card p-6 space-y-6">
        <h2 className="text-sm font-semibold text-[var(--compact-text)] border-b border-[var(--compact-card-border)] pb-2">{t("admin.site.sectionImages")}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <PhotoUploadField
              label={t("admin.site.partnershipBadge")}
              hint="600×120 长条徽章"
              value={theme.partnershipBadgeUrl ?? ""}
              onChange={(url) => patch({ partnershipBadgeUrl: url || null })}
            />
          </div>
          <div>
            <PhotoUploadField
              label={t("admin.site.centerSlot")}
              hint="400×300 中间插槽"
              value={theme.centerSlotImageUrl ?? ""}
              onChange={(url) => patch({ centerSlotImageUrl: url || null })}
            />
          </div>
          <div>
            <PhotoUploadField
              label={t("admin.site.secondaryBanner")}
              hint="1200×300 次级横幅"
              value={theme.secondaryBannerUrl ?? ""}
              onChange={(url) => patch({ secondaryBannerUrl: url || null })}
            />
          </div>
          <div>
            <PhotoUploadField
              label={t("admin.site.liveTxBg")}
              hint="800×200 背景图"
              value={theme.liveTxBgImageUrl ?? ""}
              onChange={(url) => patch({ liveTxBgImageUrl: url || null })}
            />
          </div>
        </div>
      </div>

      {!isHomeMediaOnly && (
      <>
      <div className="admin-card p-6 space-y-6">
        <h2 className="text-sm font-semibold text-[var(--compact-text)] border-b border-[var(--compact-card-border)] pb-2">{t("admin.site.sectionDisplay")}</h2>
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

      {/* ── Vivid Portal 促销卡片配置 ── */}
      <div className="admin-card p-6 space-y-5">
        <h2 className="text-sm font-semibold text-[var(--compact-text)] border-b border-[var(--compact-card-border)] pb-2">
          Vivid Portal — Promo Card Settings
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          {/* 图片高度 */}
          <div>
            <label className={labelClass}>图片区高度（px，80~600）</label>
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
            <p className="mt-1 text-[11px] text-[var(--compact-muted)]">建议：160~240。调小则卡片更紧凑，调大则图片更突出。</p>
          </div>

          {/* 列数 */}
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
        </div>

        {/* 显示字段 Toggle */}
        <div>
          <p className="mb-2 text-xs font-medium text-[var(--compact-muted)]">卡片内显示内容</p>
          <div className="flex flex-wrap gap-3">
            {(
              [
                { key: "showPercent",  label: "百分比/高亮标签" },
                { key: "showSubtitle", label: "副标题小字" },
                { key: "showTnc",      label: "T&C 按钮" },
              ] as { key: keyof NonNullable<typeof theme.vividPromoCardConfig>; label: string }[]
            ).map(({ key, label }) => {
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
                  {label}
                </label>
              );
            })}
          </div>
        </div>

        {/* 实时预览提示 */}
        <div className="rounded-lg border border-[var(--compact-card-border)] bg-[var(--compact-card-bg)] p-3 text-[12px] text-[var(--compact-muted)]">
          💡 修改后点击页面底部 Save 即生效，刷新前台 Promotion / Bonus 页可看到变化。
        </div>
      </div>

      <div className="admin-card p-6">
        <p className="text-[13px] text-[var(--compact-muted)]">
          {t("admin.site.connectedNote")}
        </p>
      </div>
      </>
      )}
      <StickySaveBar
        onSave={save}
        saving={saving}
        success={saved}
        error={!!error}
        message={saved ? t("admin.site.saved") : error ? t(error) : undefined}
      />
    </div>
  );
}
