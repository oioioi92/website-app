"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const inputClass =
  "admin-compact-input w-full rounded-lg border border-[var(--compact-card-border)] bg-[var(--compact-card-bg)] px-3 text-[var(--compact-text)] placeholder-[var(--compact-muted)] focus:border-[var(--compact-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--compact-primary)]";
const labelClass = "mb-1 block text-xs font-medium text-[var(--compact-muted)]";

type Form = {
  title: string;
  subtitle: string;
  coverUrl: string;
  detailJson: string;
  ctaLabel: string;
  ctaUrl: string;
  isActive: boolean;
  sortOrder: number;
};

export function PromotionEditClient({ id }: { id: string }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState<Form>({
    title: "",
    subtitle: "",
    coverUrl: "",
    detailJson: "{}",
    ctaLabel: "",
    ctaUrl: "",
    isActive: true,
    sortOrder: 0
  });

  useEffect(() => {
    fetch(`/api/admin/promotions/${id}`, { credentials: "include" })
      .then((r) => {
        if (r.status === 404) throw new Error("未找到");
        if (!r.ok) throw new Error("加载失败");
        return r.json();
      })
      .then((data) => {
        setForm({
          title: data.title ?? "",
          subtitle: data.subtitle ?? "",
          coverUrl: data.coverUrl ?? "",
          detailJson: typeof data.detailJson === "string" ? data.detailJson : JSON.stringify(data.detailJson ?? {}, null, 2),
          ctaLabel: data.ctaLabel ?? "",
          ctaUrl: data.ctaUrl ?? "",
          isActive: data.isActive ?? true,
          sortOrder: data.sortOrder ?? 0
        });
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  function patch(partial: Partial<Form>) {
    setForm((prev) => ({ ...prev, ...partial }));
    setError(null);
    setMessage(null);
  }

  function save() {
    setSaving(true);
    setError(null);
    setMessage(null);
    let detailJson: unknown;
    try {
      detailJson = form.detailJson.trim() ? JSON.parse(form.detailJson) : {};
    } catch {
      setError("detailJson 不是合法 JSON");
      setSaving(false);
      return;
    }
    fetch(`/api/admin/promotions/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        subtitle: form.subtitle || null,
        coverUrl: form.coverUrl || null,
        detailJson,
        ctaLabel: form.ctaLabel || null,
        ctaUrl: form.ctaUrl || null,
        isActive: form.isActive,
        sortOrder: form.sortOrder
      })
    })
      .then((r) => {
        if (!r.ok) throw new Error("保存失败");
        return r.json();
      })
      .then(() => {
        setMessage("已保存到后台");
      })
      .catch((e) => setError(e.message))
      .finally(() => setSaving(false));
  }

  if (loading) return <div className="text-[13px] text-[var(--compact-muted)]">加载中…</div>;
  if (error && !form.title) return <div className="text-[13px] text-[var(--compact-danger)]">{error}</div>;

  return (
    <div className="mt-6 space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={save} disabled={saving} className="admin-compact-btn admin-compact-btn-primary">
          {saving ? "保存中…" : "保存"}
        </button>
        <Link href="/admin/promotions" className="admin-compact-btn admin-compact-btn-ghost text-[13px]">
          返回列表
        </Link>
        {message && <span className="text-[13px] text-[var(--compact-muted)]">{message}</span>}
        {error && <span className="text-[13px] text-[var(--compact-danger)]">{error}</span>}
      </div>
      <div className="admin-card p-6 space-y-4">
        <h2 className="text-sm font-semibold text-[var(--compact-text)] border-b border-[var(--compact-card-border)] pb-2">优惠信息</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass}>标题</label>
            <input type="text" value={form.title} onChange={(e) => patch({ title: e.target.value })} className={inputClass} placeholder="标题" />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>副标题</label>
            <input type="text" value={form.subtitle} onChange={(e) => patch({ subtitle: e.target.value })} className={inputClass} placeholder="副标题" />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>封面图 URL</label>
            <input type="text" value={form.coverUrl} onChange={(e) => patch({ coverUrl: e.target.value })} className={inputClass} placeholder="https://..." />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>详情 JSON</label>
            <textarea rows={6} value={form.detailJson} onChange={(e) => patch({ detailJson: e.target.value })} className={inputClass} placeholder="{}" />
          </div>
          <div>
            <label className={labelClass}>CTA 文案</label>
            <input type="text" value={form.ctaLabel} onChange={(e) => patch({ ctaLabel: e.target.value })} className={inputClass} placeholder="立即领取" />
          </div>
          <div>
            <label className={labelClass}>CTA 链接</label>
            <input type="text" value={form.ctaUrl} onChange={(e) => patch({ ctaUrl: e.target.value })} className={inputClass} placeholder="https://..." />
          </div>
          <div>
            <label className={labelClass}>排序</label>
            <input type="number" value={form.sortOrder} onChange={(e) => patch({ sortOrder: Number(e.target.value) || 0 })} className={inputClass} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isActive" checked={form.isActive} onChange={(e) => patch({ isActive: e.target.checked })} className="rounded border-[var(--compact-card-border)]" />
            <label htmlFor="isActive" className="text-[13px] text-[var(--compact-text)]">启用</label>
          </div>
        </div>
      </div>
    </div>
  );
}
