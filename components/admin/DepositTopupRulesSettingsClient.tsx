"use client";

import { useState, useEffect } from "react";
import { useLocale } from "@/lib/i18n/context";
import { StickySaveBar } from "@/components/admin/StickySaveBar";

const inputClass =
  "admin-compact-input w-full rounded-lg border border-[var(--compact-card-border)] bg-[var(--compact-card-bg)] px-3 text-[var(--compact-text)] placeholder-[var(--compact-muted)] focus:border-[var(--compact-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--compact-primary)]";
const labelClass = "mb-1 block text-xs font-medium text-[var(--compact-muted)]";

type FormState = {
  enabled: boolean;
  maxBalanceForTopup: string;
};

export function DepositTopupRulesSettingsClient() {
  const { t } = useLocale();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [messageKey, setMessageKey] = useState<"loadError" | "saveError" | "saveSuccess" | null>(null);
  const [form, setForm] = useState<FormState>({ enabled: false, maxBalanceForTopup: "" });

  useEffect(() => {
    fetch("/api/admin/settings/deposit-topup-rules", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("loadError"))))
      .then((data) => {
        setForm({
          enabled: Boolean(data.enabled),
          maxBalanceForTopup:
            data.maxBalanceForTopup != null && Number.isFinite(Number(data.maxBalanceForTopup))
              ? String(data.maxBalanceForTopup)
              : "",
        });
      })
      .catch(() => setMessageKey("loadError"))
      .finally(() => setLoading(false));
  }, []);

  function patch(partial: Partial<FormState>) {
    setForm((prev) => ({ ...prev, ...partial }));
    setMessageKey(null);
  }

  function save() {
    setSaving(true);
    setMessageKey(null);
    const maxNum = form.maxBalanceForTopup.trim() === "" ? null : Number(form.maxBalanceForTopup);
    const payload = {
      enabled: form.enabled,
      maxBalanceForTopup: maxNum != null && Number.isFinite(maxNum) && maxNum >= 0 ? maxNum : null,
    };
    fetch("/api/admin/settings/deposit-topup-rules", {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
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
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={save} disabled={saving} className="admin-compact-btn admin-compact-btn-primary">
          {saving ? t("admin.settingsBank.saving") : t("admin.settingsBank.save")}
        </button>
        {messageKey && (
          <span
            className={`text-[13px] ${
              messageKey === "saveError" || messageKey === "loadError" ? "text-[var(--compact-danger)]" : "text-[var(--compact-success)]"
            }`}
          >
            {messageKey === "saveSuccess" ? t("admin.settingsBank.saveSuccess") : t(`admin.settingsBank.${messageKey}`)}
          </span>
        )}
      </div>
      <div className="admin-card p-6 space-y-4">
        <h2 className="text-sm font-semibold text-[var(--compact-text)] border-b border-[var(--compact-card-border)] pb-2">
          Deposit / Topup Rules
        </h2>
        <p className="text-xs text-[var(--compact-muted)]">{t("admin.settingsSection.depositTopupRulesSubtitle")}</p>
        <div className="flex flex-col gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.enabled}
              onChange={(e) => patch({ enabled: e.target.checked })}
              className="rounded border-[var(--compact-card-border)]"
            />
            <span className="text-sm font-medium text-[var(--compact-text)]">Enable rule</span>
          </label>
          <div>
            <label className={labelClass}>Max balance for topup (leave empty = no limit)</label>
            <input
              type="number"
              min={0}
              step={1}
              value={form.maxBalanceForTopup}
              onChange={(e) => patch({ maxBalanceForTopup: e.target.value })}
              className={inputClass}
              placeholder="e.g. 100"
            />
            <p className="mt-1 text-[11px] text-[var(--compact-muted)]">
              When enabled: member cannot deposit/topup if wallet balance is at or above this amount.
            </p>
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
