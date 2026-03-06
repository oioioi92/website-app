"use client";

import { useState, useEffect } from "react";
import { useLocale } from "@/lib/i18n/context";
import { StickySaveBar } from "@/components/admin/StickySaveBar";

const inputClass =
  "admin-compact-input w-full rounded-lg border border-[var(--compact-card-border)] bg-[var(--compact-card-bg)] px-3 text-[var(--compact-text)] placeholder-[var(--compact-muted)] focus:border-[var(--compact-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--compact-primary)]";
const labelClass = "mb-1 block text-xs font-medium text-[var(--compact-muted)]";

const defaultForm = { providerName: "", apiBaseUrl: "", apiKey: "", secret: "", enabled: true };

export function GameApiSettingsClient({ compact = false, inlineSave = false }: { compact?: boolean; inlineSave?: boolean }) {
  const { t } = useLocale();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [messageKey, setMessageKey] = useState<"loadError" | "saveError" | "saveSuccess" | null>(null);
  const [form, setForm] = useState(defaultForm);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings/game-api", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("loadError"))))
      .then((data) => setForm({ ...defaultForm, ...data }))
      .catch(() => setMessageKey("loadError"))
      .finally(() => setLoading(false));
  }, []);

  function patch(partial: Partial<typeof form>) {
    setForm((prev) => ({ ...prev, ...partial }));
    setMessageKey(null);
  }

  function save() {
    setSaving(true);
    setMessageKey(null);
    fetch("/api/admin/settings/game-api", {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    })
      .then((r) => {
        if (!r.ok) throw new Error("saveError");
        return r.json();
      })
      .then(() => setMessageKey("saveSuccess"))
      .catch(() => setMessageKey("saveError"))
      .finally(() => setSaving(false));
  }

  function testConnection() {
    setTesting(true);
    setTestResult(null);
    fetch("/api/admin/settings/game-api/test", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiBaseUrl: form.apiBaseUrl }),
    })
      .then((r) => r.json())
      .then((data) => setTestResult({ ok: data.ok ?? false, message: data.message ?? (data.ok ? "OK" : "Failed") }))
      .catch(() => setTestResult({ ok: false, message: "Request failed" }))
      .finally(() => setTesting(false));
  }

  if (loading) return <div className="text-[13px] text-[var(--compact-muted)]">{t("admin.common.loading")}</div>;

  const apiBlock = (
    <div className={compact ? "mb-5" : "space-y-4"}>
      <div className={`grid gap-3 ${compact ? "grid-cols-2 lg:grid-cols-4" : "sm:grid-cols-2"}`}>
        <div>
          <label className={labelClass}>{t("admin.settingsGameApi.providerName")}</label>
          <input type="text" value={form.providerName} onChange={(e) => patch({ providerName: e.target.value })} className={inputClass} placeholder="e.g. Provider A" />
        </div>
        <div>
          <label className={labelClass}>{t("admin.settingsGameApi.apiBase")}</label>
          <input type="text" value={form.apiBaseUrl} onChange={(e) => patch({ apiBaseUrl: e.target.value })} className={inputClass} placeholder="https://api.example.com" />
        </div>
        <div>
          <label className={labelClass}>API Key</label>
          <input type="text" value={form.apiKey} onChange={(e) => patch({ apiKey: e.target.value })} className={inputClass} placeholder="API key" />
        </div>
        <div>
          <label className={labelClass}>Secret</label>
          <input type="password" value={form.secret} onChange={(e) => patch({ secret: e.target.value })} className={inputClass} placeholder="••••••••" />
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <input type="checkbox" id="enabled" checked={form.enabled} onChange={(e) => patch({ enabled: e.target.checked })} className="rounded border-[var(--compact-card-border)]" />
        <label htmlFor="enabled" className="text-[13px] text-[var(--compact-text)]">{t("admin.settingsGameApi.enable")}</label>
        <button type="button" onClick={testConnection} disabled={testing || !form.apiBaseUrl} className="admin-compact-btn admin-compact-btn-ghost text-[13px]">
          {testing ? "..." : t("admin.settingsGameApi.testConnection")}
        </button>
        {testResult && <span className={`text-[13px] ${testResult.ok ? "text-green-600" : "text-[var(--compact-danger)]"}`}>{testResult.message}</span>}
        {inlineSave && (
          <>
            <button type="button" onClick={save} disabled={saving} className="admin-compact-btn admin-compact-btn-primary text-[13px]">
              {saving ? (t("admin.common.saving") ?? "保存中…") : (t("admin.common.save") ?? "Save")}
            </button>
            {messageKey === "saveSuccess" && <span className="text-[13px] text-green-600">{t("admin.settingsGameApi.saveSuccess")}</span>}
            {messageKey === "saveError" && <span className="text-[13px] text-[var(--compact-danger)]">{t("admin.settingsGameApi.saveError")}</span>}
          </>
        )}
        {messageKey === "loadError" && <span className="text-[13px] text-[var(--compact-danger)]">{t("admin.settingsGameApi.loadError")}</span>}
      </div>
    </div>
  );

  return (
    <div className={compact ? "" : "space-y-6"}>
      {!compact && (
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={testConnection} disabled={testing || !form.apiBaseUrl} className="admin-compact-btn admin-compact-btn-ghost">
            {testing ? "..." : t("admin.settingsGameApi.testConnection")}
          </button>
          {testResult && <span className={`text-[13px] ${testResult.ok ? "text-green-600" : "text-[var(--compact-danger)]"}`}>{testResult.message}</span>}
          {messageKey === "loadError" && <span className="text-[13px] text-[var(--compact-danger)]">{t("admin.settingsGameApi.loadError")}</span>}
        </div>
      )}
      <div className={compact ? "" : "admin-card p-6 space-y-4"}>
        {!compact && <h2 className="text-sm font-semibold text-[var(--compact-text)] border-b border-[var(--compact-card-border)] pb-2">{t("admin.settingsGameApi.sectionTitle")}</h2>}
        {compact ? apiBlock : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>{t("admin.settingsGameApi.providerName")}</label>
                <input type="text" value={form.providerName} onChange={(e) => patch({ providerName: e.target.value })} className={inputClass} placeholder="e.g. Provider A" />
              </div>
              <div>
                <label className={labelClass}>{t("admin.settingsGameApi.apiBase")}</label>
                <input type="text" value={form.apiBaseUrl} onChange={(e) => patch({ apiBaseUrl: e.target.value })} className={inputClass} placeholder="https://api.example.com" />
              </div>
              <div>
                <label className={labelClass}>API Key</label>
                <input type="text" value={form.apiKey} onChange={(e) => patch({ apiKey: e.target.value })} className={inputClass} placeholder="API key" />
              </div>
              <div>
                <label className={labelClass}>Secret</label>
                <input type="password" value={form.secret} onChange={(e) => patch({ secret: e.target.value })} className={inputClass} placeholder="••••••••" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="enabled-full" checked={form.enabled} onChange={(e) => patch({ enabled: e.target.checked })} className="rounded border-[var(--compact-card-border)]" />
              <label htmlFor="enabled-full" className="text-[13px] text-[var(--compact-text)]">{t("admin.settingsGameApi.enable")}</label>
            </div>
          </>
        )}
      </div>
      {!inlineSave && (
        <StickySaveBar
          onSave={save}
          saving={saving}
          success={messageKey === "saveSuccess"}
          error={messageKey === "saveError"}
          message={messageKey ? t(`admin.settingsGameApi.${messageKey}`) : undefined}
        />
      )}
    </div>
  );
}
