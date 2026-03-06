"use client";

import { useState } from "react";

const inputClass =
  "admin-compact-input w-full rounded-lg border border-[var(--compact-card-border)] bg-[var(--compact-card-bg)] px-3 text-[var(--compact-text)]";

const labelClass = "mb-1 block text-xs font-medium text-[var(--compact-muted)]";

export function AdminPasswordSettingsClient() {
  const [current, setCurrent] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (newPass !== confirm) {
      setMessage({ type: "err", text: "两次输入的新密码不一致" });
      return;
    }
    if (newPass.length < 6) {
      setMessage({ type: "err", text: "新密码至少 6 位" });
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/me/password", {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: current, newPassword: newPass })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setMessage({ type: "ok", text: "密码已修改" });
        setCurrent("");
        setNewPass("");
        setConfirm("");
      } else {
        const err = data.error === "CURRENT_PASSWORD_WRONG" ? "当前密码错误" : data.error === "PASSWORD_TOO_SHORT" ? "新密码至少 6 位" : "修改失败";
        setMessage({ type: "err", text: err });
      }
    } catch {
      setMessage({ type: "err", text: "网络错误" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-card p-6 max-w-md">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className={labelClass}>当前密码</label>
          <input
            type="password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            className={inputClass}
            required
            autoComplete="current-password"
          />
        </div>
        <div>
          <label className={labelClass}>新密码</label>
          <input
            type="password"
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
            className={inputClass}
            required
            minLength={6}
            autoComplete="new-password"
          />
        </div>
        <div>
          <label className={labelClass}>确认新密码</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className={inputClass}
            required
            autoComplete="new-password"
          />
        </div>
        {message && (
          <p className={`text-[13px] ${message.type === "ok" ? "text-[var(--compact-success)]" : "text-[var(--compact-danger)]"}`}>
            {message.text}
          </p>
        )}
        <button type="submit" disabled={saving} className="admin-compact-btn admin-compact-btn-primary">
          {saving ? "提交中…" : "修改密码"}
        </button>
      </form>
    </div>
  );
}
