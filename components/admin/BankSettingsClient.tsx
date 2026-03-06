"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocale } from "@/lib/i18n/context";
import { useAdminApiContext } from "@/lib/admin-api-context";
import type { BankItem } from "@/app/api/admin/settings/bank/route";

const inputClass =
  "admin-compact-input w-full rounded-lg border border-[var(--compact-card-border)] bg-[var(--compact-card-bg)] px-3 text-[var(--compact-text)] placeholder-[var(--compact-muted)] focus:border-[var(--compact-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--compact-primary)]";
const labelClass = "mb-1 block text-xs font-medium text-[var(--compact-muted)]";

const emptyItem = (): BankItem => ({
  id: `new-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  bankName: "",
  bankCode: "",
  accountName: "",
  accountNumber: "",
  dailyLimit: "",
  singleLimit: "",
  maintenanceMode: false,
});

export function BankSettingsClient() {
  const { t } = useLocale();
  const { setForbidden } = useAdminApiContext();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [messageKey, setMessageKey] = useState<"loadError" | "saveError" | "saveSuccess" | null>(null);
  const [items, setItems] = useState<BankItem[]>([]);

  const load = useCallback(() => {
    setLoading(true);
    setMessageKey(null);
    fetch("/api/admin/settings/bank", { credentials: "include" })
      .then((r) => {
        if (r.status === 403) setForbidden(true);
        return r.ok ? r.json() : Promise.reject(new Error("loadError"));
      })
      .then((data: { items?: BankItem[] }) => setItems(Array.isArray(data.items) ? data.items : []))
      .catch(() => setMessageKey("loadError"))
      .finally(() => setLoading(false));
  }, [setForbidden]);

  useEffect(() => {
    load();
  }, [load]);

  function patchItem(id: string, partial: Partial<BankItem>) {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...partial } : it)));
    setMessageKey(null);
  }

  function addItem() {
    setItems((prev) => [...prev, emptyItem()]);
    setMessageKey(null);
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((it) => it.id !== id));
    setMessageKey(null);
  }

  function save() {
    setSaving(true);
    setMessageKey(null);
    fetch("/api/admin/settings/bank", {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    })
      .then((r) => {
        if (!r.ok) throw new Error("saveError");
        return r.json();
      })
      .then(() => {
        setMessageKey("saveSuccess");
        load();
      })
      .catch(() => setMessageKey("saveError"))
      .finally(() => setSaving(false));
  }

  if (loading && items.length === 0) {
    return <div className="text-[13px] text-[var(--compact-muted)]">{t("admin.common.loading")}</div>;
  }

  return (
    <div className="space-y-6 [&_.admin-card]:rounded-2xl [&_.admin-card]:shadow-md [&_.admin-card]:border-slate-200/80">
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={save} disabled={saving} className="admin-compact-btn admin-compact-btn-primary rounded-xl px-5 py-2.5 font-medium shadow-sm">
          {saving ? t("admin.settingsBank.saving") : t("admin.settingsBank.save")}
        </button>
        <button type="button" onClick={addItem} className="admin-compact-btn admin-compact-btn-ghost rounded-xl px-5 py-2.5 font-medium">
          {t("admin.settingsBank.addBank") ?? "新增银行"}
        </button>
        {messageKey && (
          <span className={`text-[13px] ${messageKey === "saveError" || messageKey === "loadError" ? "text-[var(--compact-danger)]" : "text-[var(--compact-muted)]"}`}>
            {t(`admin.settingsBank.${messageKey}`)}
          </span>
        )}
      </div>

      {items.length === 0 ? (
        <div className="admin-card p-6 rounded-2xl border border-slate-200/80 bg-white shadow-md">
          <p className="text-[13px] text-[var(--compact-muted)] mb-4">{t("admin.settingsBank.noBanks") ?? "暂无银行账户，点击「新增银行」添加。"}</p>
          <button type="button" onClick={addItem} className="admin-compact-btn admin-compact-btn-ghost text-[13px]">
            {t("admin.settingsBank.addBank") ?? "新增银行"}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((it) => (
            <div key={it.id} className="admin-card p-6 space-y-4 rounded-2xl border border-slate-200/80 bg-white shadow-md">
              <div className="flex items-center justify-between border-b border-[var(--compact-card-border)] pb-2">
                <h2 className="text-sm font-semibold text-[var(--compact-text)]">
                  {(it.bankName || it.bankCode || t("admin.settingsBank.bankCardTitle")) ?? "银行账户"}
                </h2>
                <button
                  type="button"
                  onClick={() => removeItem(it.id)}
                  className="text-[12px] text-red-600 hover:text-red-700 hover:underline"
                >
                  {t("admin.settingsBank.remove") ?? "删除"}
                </button>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>{t("admin.settingsBank.bankName")}</label>
                  <input
                    type="text"
                    value={it.bankName}
                    onChange={(e) => patchItem(it.id, { bankName: e.target.value })}
                    className={inputClass}
                    placeholder="e.g. Maybank"
                  />
                </div>
                <div>
                  <label className={labelClass}>{t("admin.settingsBank.bankCode")}</label>
                  <input
                    type="text"
                    value={it.bankCode}
                    onChange={(e) => patchItem(it.id, { bankCode: e.target.value })}
                    className={inputClass}
                    placeholder="e.g. MBB"
                  />
                </div>
                <div>
                  <label className={labelClass}>{t("admin.settingsBank.accountName")}</label>
                  <input
                    type="text"
                    value={it.accountName}
                    onChange={(e) => patchItem(it.id, { accountName: e.target.value })}
                    className={inputClass}
                    placeholder="Account name"
                  />
                </div>
                <div>
                  <label className={labelClass}>{t("admin.settingsBank.accountNumber")}</label>
                  <input
                    type="text"
                    value={it.accountNumber}
                    onChange={(e) => patchItem(it.id, { accountNumber: e.target.value })}
                    className={inputClass}
                    placeholder="Account number"
                  />
                </div>
                <div>
                  <label className={labelClass}>{t("admin.settingsBank.singleLimit")}</label>
                  <input
                    type="text"
                    value={it.singleLimit}
                    onChange={(e) => patchItem(it.id, { singleLimit: e.target.value })}
                    className={inputClass}
                    placeholder="e.g. 50000"
                  />
                </div>
                <div>
                  <label className={labelClass}>{t("admin.settingsBank.dailyLimit")}</label>
                  <input
                    type="text"
                    value={it.dailyLimit}
                    onChange={(e) => patchItem(it.id, { dailyLimit: e.target.value })}
                    className={inputClass}
                    placeholder="e.g. 200000"
                  />
                </div>
                <div className="flex items-center gap-2 sm:col-span-2">
                  <input
                    type="checkbox"
                    id={`maintenance-${it.id}`}
                    checked={it.maintenanceMode}
                    onChange={(e) => patchItem(it.id, { maintenanceMode: e.target.checked })}
                    className="rounded border-[var(--compact-card-border)]"
                  />
                  <label htmlFor={`maintenance-${it.id}`} className="text-[13px] text-[var(--compact-text)]">
                    {t("admin.settingsBank.maintenance")}
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
