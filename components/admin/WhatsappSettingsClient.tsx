"use client";

import { useState, useEffect } from "react";
import { useLocale } from "@/lib/i18n/context";
import { StickySaveBar } from "@/components/admin/StickySaveBar";

const inputClass =
  "admin-compact-input w-full rounded-lg border border-[var(--compact-card-border)] bg-[var(--compact-card-bg)] px-3 text-[var(--compact-text)] placeholder-[var(--compact-muted)] focus:border-[var(--compact-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--compact-primary)]";
const labelClass = "mb-0.5 block text-[11px] font-medium text-[var(--compact-muted)]";

export function WhatsappSettingsClient() {
  const { t } = useLocale();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [messageKey, setMessageKey] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [registerTemplate, setRegisterTemplate] = useState("");
  const [hasEnv, setHasEnv] = useState(false);
  const [hasBaileys, setHasBaileys] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings/whatsapp", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("load"))))
      .then((data) => {
        setEnabled(!!data.enabled);
        setRegisterTemplate(data.registerTemplate ?? t("admin.whatsappSettings.registerTemplatePlaceholder"));
        setHasEnv(!!data.hasEnv);
        setHasBaileys(!!data.hasBaileys);
      })
      .catch(() => setMessageKey("admin.whatsappSettings.loadError"))
      .finally(() => setLoading(false));
  }, []);

  function save() {
    setSaving(true);
    setMessageKey(null);
    fetch("/api/admin/settings/whatsapp", {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled, registerTemplate })
    })
      .then((r) => {
        if (!r.ok) throw new Error("save");
        return r.json();
      })
      .then(() => setMessageKey("admin.whatsappSettings.saved"))
      .catch(() => setMessageKey("admin.whatsappSettings.saveError"))
      .finally(() => setSaving(false));
  }

  function testConnection() {
    setTesting(true);
    setTestResult(null);
    fetch("/api/admin/settings/whatsapp/test", { method: "POST", credentials: "include" })
      .then((r) => r.json())
      .then((data) => setTestResult({ ok: data.ok ?? false, message: data.message ?? (data.ok ? "OK" : "Failed") }))
      .catch(() => setTestResult({ ok: false, message: "Request failed" }))
      .finally(() => setTesting(false));
  }

  if (loading) return <div className="text-[13px] text-[var(--compact-muted)]">{t("admin.whatsappSettings.loading")}</div>;

  const isError = messageKey === "admin.whatsappSettings.loadError" || messageKey === "admin.whatsappSettings.saveError";
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={testConnection} disabled={testing} className="admin-compact-btn admin-compact-btn-ghost text-xs py-1.5 px-3">
          {testing ? "..." : t("admin.settingsGameApi.testConnection")}
        </button>
        {testResult && <span className={`text-[12px] ${testResult.ok ? "text-green-600" : "text-red-600"}`}>{testResult.message}</span>}
        {messageKey === "admin.whatsappSettings.loadError" && <span className="text-[12px] text-[var(--compact-danger)]">{t("admin.whatsappSettings.loadError")}</span>}
      </div>
      <div className="admin-card p-4 space-y-3">
        <h2 className="text-xs font-semibold text-[var(--compact-text)] border-b border-[var(--compact-card-border)] pb-1.5">{t("admin.whatsappSettings.sendConfig")}</h2>
        {hasEnv ? (
          <p className="text-[12px] text-green-600 leading-snug">
            {hasBaileys ? t("admin.whatsappSettings.hasEnvBaileys") : t("admin.whatsappSettings.hasEnvOfficial")}
          </p>
        ) : (
          <>
            <p className="text-[12px] text-amber-600 leading-snug">{t("admin.whatsappSettings.configHint")}</p>
            <ul className="text-[11px] text-[var(--compact-muted)] list-disc list-inside space-y-0.5 leading-snug">
              <li>{t("admin.whatsappSettings.configApi")}</li>
              <li>{t("admin.whatsappSettings.configBaileys")}</li>
            </ul>
          </>
        )}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="wa-enabled"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="rounded border-[var(--compact-card-border)]"
          />
          <label htmlFor="wa-enabled" className="text-[12px] text-[var(--compact-text)] leading-tight">
            {t("admin.whatsappSettings.enabledLabel")}
          </label>
        </div>
        <div>
          <label className={labelClass}>{t("admin.whatsappSettings.registerTemplateLabel")}</label>
          <textarea
            value={registerTemplate}
            onChange={(e) => setRegisterTemplate(e.target.value)}
            className={inputClass + " min-h-[72px] py-1.5 px-2 text-[13px] resize-y"}
            placeholder={t("admin.whatsappSettings.registerTemplatePlaceholder")}
            rows={3}
          />
        </div>
      </div>
      <StickySaveBar
        onSave={save}
        saving={saving}
        success={messageKey === "admin.whatsappSettings.saved"}
        error={isError}
        message={messageKey ? t(messageKey) : undefined}
      />
    </div>
  );
}
