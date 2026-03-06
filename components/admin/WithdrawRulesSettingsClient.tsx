"use client";

import { useState, useEffect } from "react";
import { useLocale } from "@/lib/i18n/context";
import { useAdminApiContext } from "@/lib/admin-api-context";
import { StickySaveBar } from "@/components/admin/StickySaveBar";

const inputClass =
  "admin-compact-input w-full rounded-lg border border-[var(--compact-card-border)] bg-[var(--compact-card-bg)] px-3 text-[var(--compact-text)] placeholder-[var(--compact-muted)] focus:border-[var(--compact-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--compact-primary)]";
const labelClass = "mb-1 block text-xs font-medium text-[var(--compact-muted)]";

type FormState = {
  enabled: boolean;
  minAmount: string;
  maxAmount: string;
  dailyLimitCount: string;
};

export function WithdrawRulesSettingsClient() {
  const { t } = useLocale();
  const { setForbidden } = useAdminApiContext();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [messageKey, setMessageKey] = useState<"loadError" | "saveError" | "saveSuccess" | null>(null);
  const [form, setForm] = useState<FormState>({
    enabled: false,
    minAmount: "",
    maxAmount: "",
    dailyLimitCount: "",
  });

  useEffect(() => {
    fetch("/api/admin/settings/withdraw-rules", { credentials: "include" })
      .then((r) => {
        if (r.status === 403) setForbidden(true);
        return r.ok ? r.json() : Promise.reject(new Error("loadError"));
      })
      .then((data) => {
        setForm({
          enabled: Boolean(data.enabled),
          minAmount: data.minAmount != null && Number.isFinite(Number(data.minAmount)) ? String(data.minAmount) : "",
          maxAmount: data.maxAmount != null && Number.isFinite(Number(data.maxAmount)) ? String(data.maxAmount) : "",
          dailyLimitCount:
            data.dailyLimitCount != null && Number.isFinite(Number(data.dailyLimitCount))
              ? String(data.dailyLimitCount)
              : "",
        });
      })
      .catch(() => setMessageKey("loadError"))
      .finally(() => setLoading(false));
  }, [setForbidden]);

  function patch(partial: Partial<FormState>) {
    setForm((prev) => ({ ...prev, ...partial }));
    setMessageKey(null);
  }

  function save() {
    setSaving(true);
    setMessageKey(null);
    const minNum = form.minAmount.trim() === "" ? null : Number(form.minAmount);
    const maxNum = form.maxAmount.trim() === "" ? null : Number(form.maxAmount);
    const dailyNum = form.dailyLimitCount.trim() === "" ? null : Number(form.dailyLimitCount);
    const payload = {
      enabled: form.enabled,
      minAmount: minNum != null && Number.isFinite(minNum) && minNum >= 0 ? minNum : null,
      maxAmount: maxNum != null && Number.isFinite(maxNum) && maxNum >= 0 ? maxNum : null,
      dailyLimitCount: dailyNum != null && Number.isFinite(dailyNum) && dailyNum >= 0 ? dailyNum : null,
    };
    fetch("/api/admin/settings/withdraw-rules", {
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

  if (loading)
    return <div className="text-[13px] text-[var(--compact-muted)]">{t("admin.common.loading") ?? "加载中…"}</div>;

  return (
    <div className="space-y-6">
      <div className="admin-card p-6 space-y-4">
        <h2 className="text-sm font-semibold text-[var(--compact-text)] border-b border-[var(--compact-card-border)] pb-2">
          {t("admin.settingsWithdrawRules.title") ?? "Withdraw Rules"}
        </h2>
        <p className="text-xs text-[var(--compact-muted)]">
          {t("admin.settingsWithdrawRules.subtitle") ?? "提现限额与每日次数限制，启用后会员提现需满足以下规则。"}
        </p>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={form.enabled}
            onChange={(e) => patch({ enabled: e.target.checked })}
            className="rounded border-[var(--compact-card-border)]"
          />
          <span className="text-sm font-medium text-[var(--compact-text)]">
            {t("admin.settingsWithdrawRules.enableRule") ?? "Enable rule"}
          </span>
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>
              {t("admin.settingsWithdrawRules.minAmount") ?? "Min amount per withdrawal (leave empty = no limit)"}
            </label>
            <input
              type="number"
              min={0}
              step={1}
              value={form.minAmount}
              onChange={(e) => patch({ minAmount: e.target.value })}
              className={inputClass}
              placeholder="e.g. 50"
            />
          </div>
          <div>
            <label className={labelClass}>
              {t("admin.settingsWithdrawRules.maxAmount") ?? "Max amount per withdrawal (leave empty = no limit)"}
            </label>
            <input
              type="number"
              min={0}
              step={1}
              value={form.maxAmount}
              onChange={(e) => patch({ maxAmount: e.target.value })}
              className={inputClass}
              placeholder="e.g. 50000"
            />
          </div>
          <div>
            <label className={labelClass}>
              {t("admin.settingsWithdrawRules.dailyLimitCount") ?? "Daily withdrawal count limit (leave empty = no limit)"}
            </label>
            <input
              type="number"
              min={0}
              step={1}
              value={form.dailyLimitCount}
              onChange={(e) => patch({ dailyLimitCount: e.target.value })}
              className={inputClass}
              placeholder="e.g. 3"
            />
          </div>
        </div>
      </div>
      <StickySaveBar
        onSave={save}
        saving={saving}
        success={messageKey === "saveSuccess"}
        error={messageKey === "saveError" || messageKey === "loadError"}
        message={
          messageKey === "saveSuccess"
            ? (t("admin.settingsWithdrawRules.saveSuccess") ?? t("admin.settingsBank.saveSuccess") ?? "已保存")
            : messageKey === "saveError"
              ? (t("admin.settingsWithdrawRules.saveError") ?? "保存失败")
              : messageKey === "loadError"
                ? (t("admin.settingsWithdrawRules.loadError") ?? "加载失败")
                : undefined
        }
      />
    </div>
  );
}
