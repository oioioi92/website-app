"use client";

import { useState, useEffect } from "react";

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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    fetch("/api/admin/settings/bank", { credentials: "include" })
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
    fetch("/api/admin/settings/bank", {
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
        <h2 className="text-sm font-semibold text-[var(--compact-text)] border-b border-[var(--compact-card-border)] pb-2">出款银行账户</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>银行名称</label>
            <input type="text" value={form.bankName} onChange={(e) => patch({ bankName: e.target.value })} className={inputClass} placeholder="e.g. Maybank" />
          </div>
          <div>
            <label className={labelClass}>银行代码</label>
            <input type="text" value={form.bankCode} onChange={(e) => patch({ bankCode: e.target.value })} className={inputClass} placeholder="e.g. MBB" />
          </div>
          <div>
            <label className={labelClass}>户名</label>
            <input type="text" value={form.accountName} onChange={(e) => patch({ accountName: e.target.value })} className={inputClass} placeholder="Account name" />
          </div>
          <div>
            <label className={labelClass}>账号</label>
            <input type="text" value={form.accountNumber} onChange={(e) => patch({ accountNumber: e.target.value })} className={inputClass} placeholder="Account number" />
          </div>
          <div>
            <label className={labelClass}>单笔限额</label>
            <input type="text" value={form.singleLimit} onChange={(e) => patch({ singleLimit: e.target.value })} className={inputClass} placeholder="e.g. 50000" />
          </div>
          <div>
            <label className={labelClass}>每日限额</label>
            <input type="text" value={form.dailyLimit} onChange={(e) => patch({ dailyLimit: e.target.value })} className={inputClass} placeholder="e.g. 200000" />
          </div>
          <div className="flex items-center gap-2 sm:col-span-2">
            <input type="checkbox" id="maintenance" checked={form.maintenanceMode} onChange={(e) => patch({ maintenanceMode: e.target.checked })} className="rounded border-[var(--compact-card-border)]" />
            <label htmlFor="maintenance" className="text-[13px] text-[var(--compact-text)]">维护中（出款暂停）</label>
          </div>
        </div>
      </div>
    </div>
  );
}
