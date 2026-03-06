"use client";

import { useState, useEffect } from "react";
import { useLocale } from "@/lib/i18n/context";
import { PhotoUploadField } from "@/components/admin/PhotoUploadField";

type ProviderRow = {
  id: string;
  name: string;
  code: string | null;
  logoUrl: string | null;
  isActive: boolean;
  sortOrder: number;
};

export function GameProvidersSettingsClient() {
  const { t } = useLocale();
  const [list, setList] = useState<ProviderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings/game-providers", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Failed"))))
      .then((data: ProviderRow[]) => setList(Array.isArray(data) ? data : []))
      .catch(() => setError("admin.gameProviders.loadFailed"))
      .finally(() => setLoading(false));
  }, []);

  function patchLocal(id: string, partial: Partial<ProviderRow>) {
    setList((prev) => prev.map((p) => (p.id === id ? { ...p, ...partial } : p)));
  }

  async function saveProvider(id: string, row: ProviderRow) {
    setSavingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/settings/game-providers/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: row.name,
          code: row.code || null,
          logoUrl: row.logoUrl || null,
          isActive: row.isActive,
          sortOrder: row.sortOrder,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error === "NOT_FOUND" ? "admin.gameProviders.notFound" : "admin.gameProviders.saveFailed");
      }
    } catch {
      setError("admin.gameProviders.saveFailed");
    } finally {
      setSavingId(null);
    }
  }

  if (loading) {
    return <p className="text-sm text-[var(--admin-muted)]">{t("admin.common.loading")}</p>;
  }

  if (list.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-panel2)] p-6 text-center">
        <p className="text-sm text-[var(--admin-muted)]">{t("admin.gameProviders.noProviders")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
          {t(error) ?? error}
        </p>
      )}
      <p className="text-[13px] text-[var(--admin-muted)]">{t("admin.gameProviders.hint")}</p>
      <div className="overflow-x-auto rounded-xl border border-[var(--admin-border)] bg-[var(--admin-panel2)]">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--admin-border)] bg-[var(--admin-panel)]">
              <th className="px-4 py-3 font-semibold text-[var(--admin-text)]">{t("admin.gameProviders.logo")}</th>
              <th className="px-4 py-3 font-semibold text-[var(--admin-text)]">{t("admin.gameProviders.name")}</th>
              <th className="px-4 py-3 font-semibold text-[var(--admin-text)]">{t("admin.gameProviders.code")}</th>
              <th className="px-4 py-3 font-semibold text-[var(--admin-text)]">{t("admin.gameProviders.active")}</th>
              <th className="px-4 py-3 font-semibold text-[var(--admin-text)]">{t("admin.gameProviders.actions")}</th>
            </tr>
          </thead>
          <tbody>
            {list.map((row) => (
              <tr key={row.id} className="border-b border-[var(--admin-border)] last:border-0">
                <td className="px-4 py-3 align-top">
                  <div className="w-[140px]">
                    <PhotoUploadField
                      label=""
                      hint=""
                      value={row.logoUrl ?? ""}
                      onChange={(url) => {
                        patchLocal(row.id, { logoUrl: url || null });
                        saveProvider(row.id, { ...row, logoUrl: url || null });
                      }}
                    />
                  </div>
                </td>
                <td className="px-4 py-3 align-middle">
                  <input
                    type="text"
                    value={row.name}
                    onChange={(e) => patchLocal(row.id, { name: e.target.value })}
                    className="w-full max-w-[180px] rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg)] px-2 py-1.5 text-[13px] text-[var(--admin-text)]"
                  />
                </td>
                <td className="px-4 py-3 align-middle">
                  <input
                    type="text"
                    value={row.code ?? ""}
                    onChange={(e) => patchLocal(row.id, { code: e.target.value || null })}
                    placeholder="—"
                    className="w-full max-w-[120px] rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg)] px-2 py-1.5 text-[13px] text-[var(--admin-text)]"
                  />
                </td>
                <td className="px-4 py-3 align-middle">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={row.isActive}
                      onChange={(e) => patchLocal(row.id, { isActive: e.target.checked })}
                      className="rounded border-[var(--admin-border)]"
                    />
                    <span className="text-[13px] text-[var(--admin-muted)]">{row.isActive ? "✓" : "—"}</span>
                  </label>
                </td>
                <td className="px-4 py-3 align-middle">
                  <button
                    type="button"
                    disabled={savingId === row.id}
                    onClick={() => saveProvider(row.id, list.find((p) => p.id === row.id) ?? row)}
                    className="admin-compact-btn admin-compact-btn-primary text-xs py-1.5 px-3 disabled:opacity-50"
                  >
                    {savingId === row.id ? t("admin.common.saving") : t("admin.common.save")}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
