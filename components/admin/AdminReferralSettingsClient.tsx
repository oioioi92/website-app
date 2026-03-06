"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLocale } from "@/lib/i18n/context";
import { useAdminApiContext } from "@/lib/admin-api-context";
import { StickySaveBar } from "@/components/admin/StickySaveBar";
import type { ReferralConfig } from "@/app/api/admin/settings/referral/route";

const PLATFORMS: { value: string; label: string }[] = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "telegram", label: "Telegram" },
  { value: "facebook", label: "Facebook" },
  { value: "twitter", label: "Twitter / X" },
  { value: "copy", label: "复制链接 Copy" },
];

export function AdminReferralSettingsClient() {
  const { t } = useLocale();
  const { setForbidden } = useAdminApiContext();
  const [config, setConfig] = useState<ReferralConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings/referral", { credentials: "include" })
      .then((r) => {
        if (r.status === 403) setForbidden(true);
        return r.ok ? r.json() : { config: null };
      })
      .then((d: { config?: ReferralConfig }) => {
        setConfig(d.config ?? { maxGenerations: 3, sharePlatforms: ["whatsapp", "telegram", "copy"] });
      })
      .finally(() => setLoading(false));
  }, [setForbidden]);

  const handleSave = () => {
    if (!config) return;
    setSaving(true);
    setSaveSuccess(false);
    setSaveError(false);
    fetch("/api/admin/settings/referral", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(config),
    })
      .then((r) => {
        if (r.ok) {
          setSaveSuccess(true);
          return;
        }
        throw new Error("Save failed");
      })
      .catch(() => setSaveError(true))
      .finally(() => setSaving(false));
  };

  const togglePlatform = (value: string) => {
    if (!config) return;
    const next = config.sharePlatforms.includes(value)
      ? config.sharePlatforms.filter((p) => p !== value)
      : [...config.sharePlatforms, value];
    setConfig({ ...config, sharePlatforms: next });
  };

  if (loading || !config) {
    return <p className="text-[var(--admin-muted)]">{t("admin.common.loading") ?? "Loading…"}</p>;
  }

  return (
    <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-panel)] p-6 max-w-xl">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-[var(--admin-text)] mb-2">
            {t("admin.referralGeneral.maxGenerationsLabel")}
          </label>
          <p className="text-[12px] text-[var(--admin-muted)] mb-2">
            {t("admin.referralGeneral.maxGenerationsHint")}
          </p>
          <select
            value={config.maxGenerations}
            onChange={(e) => setConfig({ ...config, maxGenerations: Number(e.target.value) })}
            className="w-full max-w-[120px] rounded-lg border border-[var(--admin-border)] bg-[var(--admin-panel2)] px-3 py-2 text-[var(--admin-text)]"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
              <option key={n} value={n}>{n} {t("admin.referralGeneral.genUnit")}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[var(--admin-text)] mb-2">
            {t("admin.referralGeneral.shareChannelsLabel")}
          </label>
          <p className="text-[12px] text-[var(--admin-muted)] mb-2">
            {t("admin.referralGeneral.shareChannelsHint")}
          </p>
          <div className="flex flex-wrap gap-3">
            {PLATFORMS.map((p) => (
              <label key={p.value} className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.sharePlatforms.includes(p.value)}
                  onChange={() => togglePlatform(p.value)}
                  className="rounded border-[var(--admin-border)]"
                />
                <span className="text-[13px] text-[var(--admin-text)]">{p.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Link href="/admin/settings" className="admin-compact-btn admin-compact-btn-ghost">
            {t("admin.settingsSection.backToSettings") ?? "Back to Settings"}
          </Link>
        </div>
      </div>
      <StickySaveBar
        onSave={handleSave}
        saving={saving}
        success={saveSuccess}
        error={saveError}
        message={saveSuccess ? (t("admin.site.saved") ?? "Saved") : saveError ? (t("admin.common.saveError") ?? "Save failed") : undefined}
      />
    </div>
  );
}
