"use client";

import { useState, useEffect } from "react";
import { useLocale } from "@/lib/i18n/context";
import { StickySaveBar } from "@/components/admin/StickySaveBar";

const inputClass =
  "admin-compact-input w-full rounded-lg border border-[var(--compact-card-border)] bg-[var(--compact-card-bg)] px-3 text-[var(--compact-text)] placeholder-[var(--compact-muted)] focus:border-[var(--compact-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--compact-primary)]";
const labelClass = "mb-1 block text-xs font-medium text-[var(--compact-muted)]";

const defaultForm = {
  bankName: "",
  bankCode: "",
  accountName: "",
  accountNumber: "",
  dailyLimit: "",
  singleLimit: "",
  maintenanceMode: false
};

export function BankSettingsClient() {
  const { t } = useLocale();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [messageKey, setMessageKey] = useState<"loadError" | "saveError" | "saveSuccess" | null>(null);
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    fetch("/api/admin/settings/bank", { credentials: "include" })
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
    fetch("/api/admin/settings/bank", {
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

  if (loading) return <div className="text-[13px] text-[var(--compact-muted)]">{t("admin.common.loading")}</div>;

  return (
    <div className="space-y-6 [&_.admin-card]:rounded-2xl [&_.admin-card]:shadow-md [&_.admin-card]:border-slate-200/80">
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={save} disabled={saving} className="admin-compact-btn admin-compact-btn-primary rounded-xl px-5 py-2.5 font-medium shadow-sm">
          {saving ? t("admin.settingsBank.saving") : t("admin.settingsBank.save")}
        </button>
        {messageKey && <span className={`text-[13px] ${messageKey === "saveError" || messageKey === "loadError" ? "text-[var(--compact-danger)]" : "text-[var(--compact-muted)]"}`}>{t(`admin.settingsBank.${messageKey}`)}</span>}
      </div>
      <div className="admin-card p-6 space-y-4 rounded-2xl border border-slate-200/80 bg-white shadow-md">
        <h2 className="text-sm font-semibold text-[var(--compact-text)] border-b border-[var(--compact-card-border)] pb-2">{t("admin.settingsBank.sectionTitle")}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>{t("admin.settingsBank.bankName")}</label>
            <input type="text" value={form.bankName} onChange={(e) => patch({ bankName: e.target.value })} className={inputClass} placeholder="e.g. Maybank" />
          </div>
          <div>
            <label className={labelClass}>{t("admin.settingsBank.bankCode")}</label>
            <input type="text" value={form.bankCode} onChange={(e) => patch({ bankCode: e.target.value })} className={inputClass} placeholder="e.g. MBB" />
          </div>
          <div>
            <label className={labelClass}>{t("admin.settingsBank.accountName")}</label>
            <input type="text" value={form.accountName} onChange={(e) => patch({ accountName: e.target.value })} className={inputClass} placeholder="Account name" />
          </div>
          <div>
            <label className={labelClass}>{t("admin.settingsBank.accountNumber")}</label>
            <input type="text" value={form.accountNumber} onChange={(e) => patch({ accountNumber: e.target.value })} className={inputClass} placeholder="Account number" />
          </div>
          <div>
            <label className={labelClass}>{t("admin.settingsBank.singleLimit")}</label>
            <input type="text" value={form.singleLimit} onChange={(e) => patch({ singleLimit: e.target.value })} className={inputClass} placeholder="e.g. 50000" />
          </div>
          <div>
            <label className={labelClass}>{t("admin.settingsBank.dailyLimit")}</label>
            <input type="text" value={form.dailyLimit} onChange={(e) => patch({ dailyLimit: e.target.value })} className={inputClass} placeholder="e.g. 200000" />
          </div>
          <div className="flex items-center gap-2 sm:col-span-2">
            <input type="checkbox" id="maintenance" checked={form.maintenanceMode} onChange={(e) => patch({ maintenanceMode: e.target.checked })} className="rounded border-[var(--compact-card-border)]" />
            <label htmlFor="maintenance" className="text-[13px] text-[var(--compact-text)]">{t("admin.settingsBank.maintenance")}</label>
          </div>
        </div>
      </div>
      <StickySaveBar
        onSave={save}
        saving={saving}
        success={messageKey === "saveSuccess"}
        error={messageKey === "saveError" || messageKey === "loadError"}
        message={messageKey === "saveSuccess" ? t("admin.settingsBank.saveSuccess") : messageKey ? t(`admin.settingsBank.${messageKey}` as "admin.settingsBank.saveError") : undefined}
      />
    </div>
  );
}
