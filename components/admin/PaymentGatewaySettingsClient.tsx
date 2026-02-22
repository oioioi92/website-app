"use client";

import { useState, useEffect } from "react";

const inputClass =
  "admin-compact-input w-full rounded-lg border border-[var(--compact-card-border)] bg-[var(--compact-card-bg)] px-3 text-[var(--compact-text)] placeholder-[var(--compact-muted)] focus:border-[var(--compact-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--compact-primary)]";
const labelClass = "mb-1 block text-xs font-medium text-[var(--compact-muted)]";

const defaultForm = { gatewayName: "", apiBaseUrl: "", merchantId: "", apiKey: "", feeRate: "", enabled: true };

export function PaymentGatewaySettingsClient() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    fetch("/api/admin/settings/payment-gateway", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("加载失败"))))
      .then((data) => setForm({ ...defaultForm, ...data }))
      .catch(() => setMessage("加载失败"))
      .finally(() => setLoading(false));
  }, []);

  function patch(partial: Partial<typeof form>) {
    setForm((prev) => ({ ...prev, ...partial }));
    setMessage(null);
  }

  function save() {
    setSaving(true);
    setMessage(null);
    fetch("/api/admin/settings/payment-gateway", {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    })
      .then((r) => {
        if (!r.ok) throw new Error("保存失败");
        return r.json();
      })
      .then(() => setMessage("已保存到后台"))
      .catch(() => setMessage("保存失败"))
      .finally(() => setSaving(false));
  }

  if (loading) return <div className="text-[13px] text-[var(--compact-muted)]">加载中…</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={save} disabled={saving} className="admin-compact-btn admin-compact-btn-primary">
          {saving ? "保存中…" : "保存"}
        </button>
        {message && <span className={`text-[13px] ${message.includes("失败") ? "text-[var(--compact-danger)]" : "text-[var(--compact-muted)]"}`}>{message}</span>}
      </div>
      <div className="admin-card p-6 space-y-4">
        <h2 className="text-sm font-semibold text-[var(--compact-text)] border-b border-[var(--compact-card-border)] pb-2">入款支付网关</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>渠道名称</label>
            <input type="text" value={form.gatewayName} onChange={(e) => patch({ gatewayName: e.target.value })} className={inputClass} placeholder="e.g. Gateway A" />
          </div>
          <div>
            <label className={labelClass}>API 基础地址</label>
            <input type="text" value={form.apiBaseUrl} onChange={(e) => patch({ apiBaseUrl: e.target.value })} className={inputClass} placeholder="https://pay.example.com" />
          </div>
          <div>
            <label className={labelClass}>商户 ID</label>
            <input type="text" value={form.merchantId} onChange={(e) => patch({ merchantId: e.target.value })} className={inputClass} placeholder="Merchant ID" />
          </div>
          <div>
            <label className={labelClass}>API Key</label>
            <input type="text" value={form.apiKey} onChange={(e) => patch({ apiKey: e.target.value })} className={inputClass} placeholder="API key" />
          </div>
          <div>
            <label className={labelClass}>费率 (%)</label>
            <input type="text" value={form.feeRate} onChange={(e) => patch({ feeRate: e.target.value })} className={inputClass} placeholder="e.g. 1.5" />
          </div>
          <div className="flex items-center gap-2 sm:col-span-2">
            <input type="checkbox" id="enabled" checked={form.enabled} onChange={(e) => patch({ enabled: e.target.checked })} className="rounded border-[var(--compact-card-border)]" />
            <label htmlFor="enabled" className="text-[13px] text-[var(--compact-text)]">启用</label>
          </div>
        </div>
      </div>
    </div>
  );
}
