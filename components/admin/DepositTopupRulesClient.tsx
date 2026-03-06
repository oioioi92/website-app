"use client";

import { useState, useEffect } from "react";
import { useLocale } from "@/lib/i18n/context";
import { useAdminApiContext } from "@/lib/admin-api-context";

const inputClass =
  "admin-compact-input w-full rounded-lg border border-[var(--compact-card-border)] bg-[var(--compact-card-bg)] px-3 py-2 text-[var(--compact-text)] placeholder-[var(--compact-muted)] focus:border-[var(--compact-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--compact-primary)]";
const labelClass = "mb-1 block text-xs font-medium text-[var(--compact-muted)]";

type Form = { enabled: boolean; maxBalanceForTopup: string };

export function DepositTopupRulesClient() {
  const { t } = useLocale();
  const { setForbidden } = useAdminApiContext();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<"error" | "saved" | null>(null);
  const [form, setForm] = useState<Form>({ enabled: false, maxBalanceForTopup: "" });

  useEffect(() => {
    fetch("/api/admin/settings/deposit-topup-rules", { credentials: "include" })
      .then((r) => {
        if (r.status === 403) setForbidden(true);
        return r.ok ? r.json() : Promise.reject(new Error("load"));
      })
      .then((data: { enabled?: boolean; maxBalanceForTopup?: number | null }) => {
        setForm({
          enabled: Boolean(data.enabled),
          maxBalanceForTopup:
            data.maxBalanceForTopup != null && data.maxBalanceForTopup > 0
              ? String(data.maxBalanceForTopup)
              : "",
        });
      })
      .catch(() => setMessage("error"))
      .finally(() => setLoading(false));
  }, [setForbidden]);

  function patch(partial: Partial<Form>) {
    setForm((prev) => ({ ...prev, ...partial }));
    setMessage(null);
  }

  function save() {
    setSaving(true);
    setMessage(null);
    const maxNum = form.maxBalanceForTopup.trim() === "" ? null : Number(form.maxBalanceForTopup);
    fetch("/api/admin/settings/deposit-topup-rules", {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        enabled: form.enabled,
        maxBalanceForTopup: maxNum != null && Number.isFinite(maxNum) && maxNum >= 0 ? maxNum : null,
      }),
    })
      .then((r) => {
        if (!r.ok) throw new Error("save");
        return r.json();
      })
      .then(() => setMessage("saved"))
      .catch(() => setMessage("error"))
      .finally(() => setSaving(false));
  }

  if (loading) return <div className="text-[13px] text-[var(--compact-muted)]">{t("admin.common.loading") ?? "加载中…"}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={save} disabled={saving} className="admin-compact-btn admin-compact-btn-primary">
          {saving ? (t("admin.common.saving") ?? "保存中…") : (t("admin.common.save") ?? "保存")}
        </button>
        {message === "saved" && <span className="text-[13px] text-green-600">{t("admin.site.saved") ?? "已保存"}</span>}
        {message === "error" && <span className="text-[13px] text-[var(--compact-danger)]">{t("admin.common.saveError") ?? "加载或保存失败"}</span>}
      </div>
      <div className="admin-card max-w-xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-[var(--compact-text)] border-b border-[var(--compact-card-border)] pb-2">
          充值 / Topup 限制规则
        </h2>
        <p className="text-[13px] text-[var(--compact-muted)]">
          当会员的<strong>钱包余额</strong>（及可选游戏余额）达到或超过设定金额时，不允许再充值（deposit/topup）。即：余额低于该金额才可以充值。
        </p>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="topup-rules-enabled"
            checked={form.enabled}
            onChange={(e) => patch({ enabled: e.target.checked })}
            className="rounded border-[var(--compact-card-border)]"
          />
          <label htmlFor="topup-rules-enabled" className="text-[13px] text-[var(--compact-text)]">
            启用「余额高于门槛则不可充值」规则
          </label>
        </div>
        {form.enabled && (
          <div>
            <label className={labelClass}>
              门槛金额（钱包余额 ≥ 此金额时不可 topup，单位与钱包一致，如 RM）
            </label>
            <input
              type="number"
              min={0}
              step={0.01}
              value={form.maxBalanceForTopup}
              onChange={(e) => patch({ maxBalanceForTopup: e.target.value })}
              className={inputClass}
              placeholder="e.g. 100"
            />
            <p className="mt-1 text-[12px] text-[var(--compact-muted)]">
              例：填 100 表示当会员钱包余额 ≥ 100 时，无法再发起充值；需余额低于 100 才能 topup。
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
