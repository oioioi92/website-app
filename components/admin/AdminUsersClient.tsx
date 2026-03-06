"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/lib/i18n/context";

type AdminUserRow = { id: string; email: string; role: string; createdAt: string };

const ROLE_OPTIONS = [{ value: "admin", label: "Admin" }, { value: "editor", label: "Editor" }, { value: "viewer", label: "Viewer" }];

export function AdminUsersClient() {
  const { t } = useLocale();
  const [items, setItems] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("admin");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  function load() {
    setLoading(true);
    fetch("/api/admin/settings/admin-users", { credentials: "include" })
      .then((r) => {
        if (r.status === 403) {
          setForbidden(true);
          return { items: [] };
        }
        if (!r.ok) throw new Error("fetch");
        return r.json();
      })
      .then((d: { items?: AdminUserRow[] }) => setItems(d.items ?? []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (!email.trim() || !password) {
      setMessage({ type: "error", text: t("admin.adminUsers.emailPasswordRequired") });
      return;
    }
    if (password.length < 8) {
      setMessage({ type: "error", text: t("admin.adminUsers.passwordMinLength") });
      return;
    }
    setSubmitting(true);
    fetch("/api/admin/settings/admin-users", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase(), password, role }),
    })
      .then(async (r) => {
        const data = await r.json().catch(() => ({}));
        if (r.ok && data.ok) {
          setMessage({ type: "success", text: t("admin.adminUsers.created") });
          setEmail("");
          setPassword("");
          load();
          return;
        }
        if (data.error === "EMAIL_ALREADY_EXISTS") {
          setMessage({ type: "error", text: t("admin.adminUsers.emailExists") });
          return;
        }
        if (data.error === "PASSWORD_TOO_SHORT") {
          setMessage({ type: "error", text: t("admin.adminUsers.passwordMinLength") });
          return;
        }
        if (r.status === 403) {
          setMessage({ type: "error", text: t("admin.adminUsers.forbidden") });
          return;
        }
        setMessage({ type: "error", text: data.error || t("admin.common.loadError") });
      })
      .finally(() => setSubmitting(false));
  }

  if (forbidden) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 text-sm text-amber-800">
        {t("admin.adminUsers.forbidden")}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreate} className="admin-card flex flex-col gap-4 p-5">
        <h3 className="text-sm font-semibold text-[var(--admin-text)]">
          {t("admin.adminUsers.createTitle")}
        </h3>
        <p className="text-xs text-[var(--admin-muted)]">
          {t("admin.adminUsers.createDesc")}
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--admin-muted)]">
              {t("admin.adminUsers.email")}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="admin-compact-input w-full rounded-lg border border-[var(--admin-border)] bg-[var(--admin-panel2)] px-3 py-2 text-[var(--admin-text)]"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--admin-muted)]">
              {t("admin.adminUsers.password")}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength={8}
              className="admin-compact-input w-full rounded-lg border border-[var(--admin-border)] bg-[var(--admin-panel2)] px-3 py-2 text-[var(--admin-text)]"
              required
            />
            <p className="mt-0.5 text-[11px] text-[var(--admin-muted)]">
              {t("admin.adminUsers.passwordHint")}
            </p>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--admin-muted)]">
              {t("admin.adminUsers.role")}
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="admin-compact-input w-full rounded-lg border border-[var(--admin-border)] bg-[var(--admin-panel2)] px-3 py-2 text-[var(--admin-text)]"
            >
              {ROLE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-panel2)] px-4 py-3">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--admin-muted)]">
            {t("admin.adminUsers.rolePermissionsTitle")}
          </h4>
          <ul className="space-y-1.5 text-[13px] text-[var(--admin-text)]">
            <li><strong>Admin</strong>: {t("admin.adminUsers.roleAdminDesc")}</li>
            <li><strong>Editor</strong>: {t("admin.adminUsers.roleEditorDesc")}</li>
            <li><strong>Viewer</strong>: {t("admin.adminUsers.roleViewerDesc")}</li>
          </ul>
        </div>
        {message && (
          <p className={`text-sm ${message.type === "success" ? "text-[var(--admin-success)]" : "text-[var(--admin-danger)]"}`}>
            {message.text}
          </p>
        )}
        <div>
          <button
            type="submit"
            disabled={submitting}
            className="admin-compact-btn admin-compact-btn-primary"
          >
            {submitting ? "..." : t("admin.adminUsers.create")}
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-xl border border-[var(--admin-border)] bg-[var(--admin-panel)]">
        <div className="border-b border-[var(--admin-border)] bg-[var(--admin-panel2)] px-4 py-3">
          <h3 className="text-sm font-semibold text-[var(--admin-text)]">
            {t("admin.adminUsers.listTitle")}
          </h3>
        </div>
        {loading ? (
          <div className="px-4 py-8 text-center text-sm text-[var(--admin-muted)]">
            {t("admin.common.loading")}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[400px] text-sm">
              <thead>
                <tr className="border-b border-[var(--admin-border)] bg-[var(--admin-panel2)] text-left">
                  <th className="px-4 py-2 font-semibold text-[var(--admin-text)]">{t("admin.adminUsers.email")}</th>
                  <th className="px-4 py-2 font-semibold text-[var(--admin-text)]">{t("admin.adminUsers.role")}</th>
                  <th className="px-4 py-2 font-semibold text-[var(--admin-text)]">{t("admin.adminUsers.createdAt")}</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-[var(--admin-muted)]">
                      {t("admin.common.noRecords")}
                    </td>
                  </tr>
                ) : (
                  items.map((r) => (
                    <tr key={r.id} className="border-b border-[var(--admin-border)] hover:bg-[var(--admin-panel2)]/50">
                      <td className="px-4 py-2 font-medium text-[var(--admin-text)]">{r.email}</td>
                      <td className="px-4 py-2 text-[var(--admin-muted)]">{r.role}</td>
                      <td className="px-4 py-2 text-[var(--admin-muted)]">
                        {new Date(r.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
