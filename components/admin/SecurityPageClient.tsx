"use client";

import { useState, useEffect } from "react";
import { useLocale } from "@/lib/i18n/context";
import { ActivityLogClient } from "@/components/admin/ActivityLogClient";
import { LoginHistoryClient } from "@/components/admin/LoginHistoryClient";
import { AdminUsersClient } from "@/components/admin/AdminUsersClient";
import { TwoFactorSettingsClient } from "@/components/admin/TwoFactorSettingsClient";
import { StickySaveBar } from "@/components/admin/StickySaveBar";

const TIP_KEYS = ["tip1", "tip2", "tip3", "tip4", "tip5", "tip6", "tip7"] as const;

export function SecurityPageClient() {
  const { t } = useLocale();
  const [whitelist, setWhitelist] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<"success" | "error" | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings/ip-whitelist", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: { whitelist?: string }) => setWhitelist(d.whitelist ?? ""))
      .catch(() => setWhitelist(""))
      .finally(() => setLoading(false));
  }, []);

  function saveWhitelist() {
    setSaving(true);
    setSaveMsg(null);
    fetch("/api/admin/settings/ip-whitelist", {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ whitelist }),
    })
      .then((r) => (r.ok ? setSaveMsg("success") : Promise.reject()))
      .catch(() => setSaveMsg("error"))
      .finally(() => setSaving(false));
  }

  return (
    <div className="max-w-4xl space-y-8">
      <header className="admin-page-title">
        <h1>{t("admin.security.pageTitle")}</h1>
        <p>{t("admin.security.pageSubtitle")}</p>
      </header>

      <section className="admin-card rounded-xl border-amber-200/80 bg-amber-50/80 p-5">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-amber-800">
          {t("admin.security.tipsTitle")}
        </h2>
        <ul className="list-inside list-disc space-y-1.5 text-sm text-amber-900">
          {TIP_KEYS.map((key) => (
            <li key={key}>{t(`admin.security.${key}`)}</li>
          ))}
        </ul>
      </section>

      <section className="admin-card p-5">
        <h2 className="mb-2 text-sm font-semibold text-[var(--admin-text)]">
          {t("admin.security.whitelistTitle")}
        </h2>
        <p className="mb-3 text-xs text-[var(--admin-muted)]">
          {t("admin.security.whitelistDesc")}
        </p>
        {loading ? (
          <p className="text-sm text-[var(--admin-muted)]">{t("admin.common.loading")}</p>
        ) : (
          <>
            <textarea
              value={whitelist}
              onChange={(e) => setWhitelist(e.target.value)}
              placeholder={t("admin.security.whitelistPlaceholder")}
              rows={4}
              className="w-full rounded-lg border border-[var(--admin-border)] bg-[var(--admin-panel2)] px-3 py-2 text-sm text-[var(--admin-text)] placeholder-[var(--admin-muted)] focus:border-[var(--admin-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--admin-primary)]/20"
            />
            <div className="mt-3 flex items-center gap-3">
              <button
                type="button"
                onClick={saveWhitelist}
                disabled={saving}
                className="admin-compact-btn admin-compact-btn-primary"
              >
                {saving ? t("admin.security.saving") : t("admin.security.save")}
              </button>
              {saveMsg === "success" && (
                <span className="text-sm text-[var(--admin-success)]">{t("admin.security.saved")}</span>
              )}
              {saveMsg === "error" && (
                <span className="text-sm text-[var(--admin-danger)]">{t("admin.security.saveFailed")}</span>
              )}
            </div>
          </>
        )}
      </section>

      <section className="admin-card">
        <TwoFactorSettingsClient />
      </section>

      <section className="admin-card p-5">
        <h2 className="mb-2 text-sm font-semibold text-[var(--admin-text)]">
          {t("admin.security.loginHistoryTitle")}
        </h2>
        <p className="mb-4 text-xs text-[var(--admin-muted)]">
          {t("admin.security.loginHistoryDesc")}
        </p>
        <LoginHistoryClient />
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-[var(--admin-text)]">
          {t("admin.security.activityLogTitle")}
        </h2>
        <p className="mb-4 text-xs text-[var(--admin-muted)]">
          {t("admin.security.activityLogDesc")}
        </p>
        <ActivityLogClient />
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-[var(--admin-text)]">
          {t("admin.security.adminUsersTitle")}
        </h2>
        <p className="mb-4 text-xs text-[var(--admin-muted)]">
          {t("admin.security.adminUsersDesc")}
        </p>
        <AdminUsersClient />
      </section>

      <StickySaveBar
        onSave={saveWhitelist}
        saving={saving}
        success={saveMsg === "success"}
        error={saveMsg === "error"}
        message={
          saveMsg === "success"
            ? t("admin.security.saved")
            : saveMsg === "error"
              ? t("admin.security.saveFailed")
              : undefined
        }
      />
    </div>
  );
}
