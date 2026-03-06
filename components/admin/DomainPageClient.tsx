"use client";

import { useState, useEffect, useCallback } from "react";
import { useAdminApiContext } from "@/lib/admin-api-context";
import { useLocale } from "@/lib/i18n/context";

export function DomainPageClient() {
  const { t } = useLocale();
  const { setForbidden } = useAdminApiContext();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<"success" | "error" | null>(null);
  const [domains, setDomains] = useState<string[]>([]);
  const [newDomain, setNewDomain] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/settings/domains", { credentials: "include" })
      .then((r) => {
        if (r.status === 403) setForbidden(true);
        return r.ok ? r.json() : Promise.reject(new Error("load"));
      })
      .then((data: { domains?: string[] }) => setDomains(Array.isArray(data.domains) ? data.domains : []))
      .catch(() => setDomains([]))
      .finally(() => setLoading(false));
  }, [setForbidden]);

  useEffect(() => {
    load();
  }, [load]);

  function addDomain() {
    const d = newDomain.trim().toLowerCase();
    if (!d) return;
    if (domains.includes(d)) {
      setNewDomain("");
      return;
    }
    setDomains((prev) => [...prev, d]);
    setNewDomain("");
    setMessage(null);
  }

  function removeDomain(index: number) {
    setDomains((prev) => prev.filter((_, i) => i !== index));
    setMessage(null);
  }

  function save() {
    setSaving(true);
    setMessage(null);
    fetch("/api/admin/settings/domains", {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domains }),
    })
      .then((r) => {
        if (!r.ok) throw new Error("save");
        setMessage("success");
      })
      .catch(() => setMessage("error"))
      .finally(() => setSaving(false));
  }

  if (loading) {
    return (
      <p className="text-sm text-[var(--admin-muted)]">
        {t("admin.common.loading") ?? "加载中…"}
      </p>
    );
  }

  return (
    <div className="max-w-2xl space-y-6 rounded-xl border border-[var(--admin-border)] bg-[var(--admin-panel)] p-6">
      <h2 className="text-base font-semibold text-[var(--admin-text)]">
        {t("admin.domain.title") ?? "允许的域名"}
      </h2>
      <p className="text-[13px] text-[var(--admin-muted)]">
        {t("admin.domain.hint") ?? "配置允许访问前台的域名列表，每行一个。留空表示不限制。"}
      </p>

      <div className="flex flex-wrap items-end gap-2">
        <div className="min-w-[200px] flex-1">
          <label className="mb-1 block text-xs font-medium text-[var(--admin-muted)]">
            {t("admin.domain.addLabel") ?? "添加域名"}
          </label>
          <input
            type="text"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addDomain())}
            placeholder="example.com"
            className="admin-compact-input w-full rounded-lg border border-[var(--admin-border)] bg-[var(--admin-panel2)] px-3 py-2 text-[var(--admin-text)]"
          />
        </div>
        <button
          type="button"
          onClick={addDomain}
          disabled={!newDomain.trim()}
          className="admin-compact-btn admin-compact-btn-ghost"
        >
          {t("admin.domain.add") ?? "添加"}
        </button>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium text-[var(--admin-muted)]">
            {t("admin.domain.listLabel") ?? "当前列表"}（{domains.length}）
          </span>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="admin-compact-btn admin-compact-btn-primary"
          >
            {saving ? (t("admin.common.saving") ?? "保存中…") : (t("admin.common.save") ?? "保存")}
          </button>
        </div>
        {domains.length === 0 ? (
          <p className="rounded-lg border border-dashed border-[var(--admin-border)] bg-[var(--admin-panel2)] py-4 text-center text-[13px] text-[var(--admin-muted)]">
            {t("admin.domain.empty") ?? "暂无域名，可留空保存表示不限制。"}
          </p>
        ) : (
          <ul className="space-y-2">
            {domains.map((d, i) => (
              <li
                key={`${d}-${i}`}
                className="flex items-center justify-between rounded-lg border border-[var(--admin-border)] bg-[var(--admin-panel2)] px-3 py-2 text-[13px] text-[var(--admin-text)]"
              >
                <span className="font-mono">{d}</span>
                <button
                  type="button"
                  onClick={() => removeDomain(i)}
                  className="admin-compact-btn admin-compact-btn-ghost text-red-600 hover:bg-red-500/10"
                >
                  {t("admin.common.remove") ?? "移除"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {message === "success" && (
        <p className="text-sm text-emerald-600">{t("admin.domain.saved") ?? "已保存"}</p>
      )}
      {message === "error" && (
        <p className="text-sm text-red-600">{t("admin.common.saveError") ?? "保存失败"}</p>
      )}
    </div>
  );
}
