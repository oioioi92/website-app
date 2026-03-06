"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n/context";
import type { ThemeConfig } from "@/lib/public/theme";

const inputClass =
  "admin-compact-input w-full rounded-lg border border-[var(--compact-card-border)] bg-[var(--compact-card-bg)] px-3 text-[var(--compact-text)] placeholder-[var(--compact-muted)] focus:border-[var(--compact-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--compact-primary)]";
const labelClass = "mb-1 block text-xs font-medium text-[var(--compact-muted)]";

const UI_TEXT_KEYS = [
  { key: "promomodalviewalltext", label: "View All 按钮文案" },
  { key: "promomodalclaimtext", label: "Claim 按钮文案" },
  { key: "promomodalclosetext", label: "关闭按钮文案" },
  { key: "promomodaldetailsemptytext", label: "空状态文案" },
  { key: "promomodalvariant", label: "弹窗样式 variant（可选）" },
] as const;

/** 优惠弹窗全局文案（theme.uiText），与 Theme 页一致通过 PUT /api/admin/theme 保存。 */
export function PromotionSettingsClient() {
  const { t } = useLocale();
  const [theme, setTheme] = useState<ThemeConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/theme", { credentials: "include" })
      .then((r) => {
        if (!r.ok) throw new Error("FETCH_FAIL");
        return r.json();
      })
      .then((d: { theme: ThemeConfig }) => setTheme(d.theme))
      .catch(() => setError("admin.site.fetchError"))
      .finally(() => setLoading(false));
  }, []);

  function patchUiText(key: string, value: string) {
    if (!theme) return;
    setTheme({
      ...theme,
      uiText: { ...(theme.uiText ?? {}), [key]: value || undefined },
    });
  }

  function save() {
    if (!theme) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    fetch("/api/admin/theme", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(theme),
    })
      .then((r) => {
        if (!r.ok) throw new Error("SAVE_FAIL");
        setSaved(true);
      })
      .catch(() => setError("admin.site.saveError"))
      .finally(() => setSaving(false));
  }

  if (loading) return <div className="py-8 text-center text-[var(--compact-muted)]">{t("admin.site.loading")}</div>;
  if (error) return <div className="py-8 text-center text-[var(--compact-danger)]">{t(error)}</div>;
  if (!theme) return null;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-panel)] p-6">
        <h2 className="text-sm font-semibold text-[var(--compact-text)] border-b border-[var(--compact-card-border)] pb-2 mb-4">
          优惠弹窗文案（uiText）
        </h2>
        <p className="text-[13px] text-[var(--compact-muted)] mb-4">
          这些文案用于前台活动弹窗的按钮与空状态，与 Theme 共用同一套配置，保存后整站生效。
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {UI_TEXT_KEYS.map(({ key, label }) => (
            <div key={key}>
              <label className={labelClass}>{label}</label>
              <input
                type="text"
                value={theme.uiText?.[key] ?? ""}
                onChange={(e) => patchUiText(key, e.target.value)}
                className={inputClass}
                placeholder={key === "promomodalvariant" ? "留空或填 premium" : ""}
              />
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center gap-3">
          <button type="button" onClick={save} disabled={saving} className="admin-compact-btn admin-compact-btn-primary">
            {saving ? t("admin.site.saving") : t("admin.site.saveConfig")}
          </button>
          {saved && <span className="text-[13px] text-[var(--compact-success)]">{t("admin.site.saved")}</span>}
        </div>
      </div>
      <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-panel)] p-4">
        <p className="text-[12px] text-[var(--admin-muted)]">
          更多主题与前台展示配置请前往{" "}
          <Link href="/admin/settings/theme" className="text-[var(--admin-primary)] hover:underline">
            Theme
          </Link>
          ；活动列表与编辑请使用{" "}
          <Link href="/admin/settings/promotions/list" className="text-[var(--admin-primary)] hover:underline">
            Promotion List
          </Link>
          。
        </p>
      </div>
    </div>
  );
}
