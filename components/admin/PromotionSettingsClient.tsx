"use client";

import { useEffect, useState } from "react";
import type { ThemeConfig } from "@/lib/public/theme";
import { useLocale } from "@/lib/i18n/context";

const inputClass =
  "admin-compact-input w-full rounded-lg border border-[var(--compact-card-border)] bg-[var(--compact-card-bg)] px-3 text-[var(--compact-text)] placeholder-[var(--compact-muted)] focus:border-[var(--compact-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--compact-primary)]";
const labelClass = "mb-1 block text-xs font-medium text-[var(--compact-muted)]";

const PROMO_UI_KEYS = [
  { key: "promomodalvariant", label: "弹窗风格", placeholder: "留空或 premium = 深色赌场风格；填 light = 白底蓝绿风格" },
  { key: "promomodalviewalltext", label: "「查看全部优惠」按钮文案", placeholder: "查看全部优惠" },
  { key: "promomodalclaimtext", label: "「立即领取」按钮文案", placeholder: "立即领取" },
  { key: "promomodalclosetext", label: "关闭按钮文案", placeholder: "关闭" },
  { key: "promomodaldetailsemptytext", label: "无内容时占位文案", placeholder: "暂无活动内容" },
] as const;

function getUiTextValue(uiText: Record<string, string> | undefined, key: string): string {
  if (!uiText) return "";
  const v = uiText[key];
  return typeof v === "string" ? v : "";
}

export function PromotionSettingsClient() {
  const { t } = useLocale();
  const [theme, setTheme] = useState<ThemeConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/theme")
      .then((r) => {
        if (!r.ok) throw new Error("FETCH_FAIL");
        return r.json();
      })
      .then((d: { theme: ThemeConfig }) => setTheme(d.theme))
      .catch(() => setError("FETCH_FAIL"))
      .finally(() => setLoading(false));
  }, []);

  function patchUiText(partial: Record<string, string>) {
    if (!theme) return;
    const nextUi = { ...(theme.uiText ?? {}), ...partial };
    setTheme({ ...theme, uiText: nextUi });
  }

  function save() {
    if (!theme) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    fetch("/api/admin/theme", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(theme),
    })
      .then((r) => {
        if (!r.ok) throw new Error("SAVE_FAIL");
        setSaved(true);
      })
      .catch(() => setError("SAVE_FAIL"))
      .finally(() => setSaving(false));
  }

  if (loading) return <div className="py-8 text-center text-[var(--compact-muted)]">{t("admin.site.loading")}</div>;
  if (error) return <div className="py-8 text-center text-[var(--compact-danger)]">{error === "FETCH_FAIL" ? t("admin.common.loadError") : t("admin.common.saveError")}</div>;
  if (!theme) return null;

  const uiText = theme.uiText ?? {};

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={save} disabled={saving} className="admin-compact-btn admin-compact-btn-primary">
          {saving ? "保存中…" : "保存"}
        </button>
        {saved && <span className="text-[13px] text-[var(--compact-success)]">已保存</span>}
        <a href="/promotion" target="_blank" rel="noreferrer" className="admin-compact-btn admin-compact-btn-ghost text-[13px]">
          打开前台活动页
        </a>
      </div>

      <div className="admin-card p-6 space-y-5">
        <h2 className="text-sm font-semibold text-[var(--compact-text)] border-b border-[var(--compact-card-border)] pb-2">
          优惠弹窗文案（Promotion Modal）
        </h2>
        <p className="text-[12px] text-[var(--compact-muted)]">
          以下文案用于前台点击活动卡片后弹出的条款弹窗。留空则使用系统默认值。
        </p>

        <div>
          <label className={labelClass}>{PROMO_UI_KEYS[0].label}</label>
          <select
            value={getUiTextValue(uiText, "promomodalvariant")}
            onChange={(e) => patchUiText({ promomodalvariant: e.target.value })}
            className={inputClass}
          >
            <option value="">Premium（深色赌场风格，默认）</option>
            <option value="light">Light（白底蓝绿风格）</option>
          </select>
          <p className="mt-0.5 text-[11px] text-[var(--compact-muted)]">{PROMO_UI_KEYS[0].placeholder}</p>
        </div>

        {PROMO_UI_KEYS.slice(1).map(({ key, label, placeholder }) => (
          <div key={key}>
            <label className={labelClass}>{label}</label>
            <input
              type="text"
              value={getUiTextValue(uiText, key)}
              onChange={(e) => patchUiText({ [key]: e.target.value })}
              className={inputClass}
              placeholder={placeholder}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
