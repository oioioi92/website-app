"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocale } from "@/lib/i18n/context";
import { useAdminApiContext } from "@/lib/admin-api-context";

type AdminItem = { id: string; email: string; role: string; createdAt: string };

const ROLE_PERMISSIONS: Record<string, string> = {
  admin: "Full access: manage admins, approve deposits/withdrawals, edit content & theme, Settings & Security.",
  editor: "Can edit promotions & theme; cannot manage admins, approve deposits/withdrawals, or access Settings/Security.",
  viewer: "View only: reports, transactions, players/agents; no edit, no approval, no Settings/Security.",
};

const inputClass =
  "admin-compact-input w-full rounded-lg border border-[var(--compact-card-border)] bg-[var(--compact-card-bg)] px-3 text-[var(--compact-text)] focus:border-[var(--compact-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--compact-primary)]";
const labelClass = "mb-1 block text-xs font-medium text-[var(--compact-muted)]";

export function AdminAccountsClient() {
  const { t } = useLocale();
  const { setForbidden } = useAdminApiContext();
  const [items, setItems] = useState<AdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "editor" | "viewer">("editor");
  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetch("/api/admin/settings/admin-users", { credentials: "include" })
      .then((r) => {
        if (r.status === 403) {
          setForbidden(true);
          throw new Error("FORBIDDEN");
        }
        if (!r.ok) throw new Error("FETCH_FAIL");
        return r.json();
      })
      .then((data: { items?: AdminItem[] }) => setItems(Array.isArray(data.items) ? data.items : []))
      .catch((e) => setError(e.message === "FORBIDDEN" ? t("admin.adminAccounts.forbidden") : t("admin.adminAccounts.loadFailed")))
      .finally(() => setLoading(false));
  }, [t, setForbidden]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!message) return;
    const id = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(id);
  }, [message]);

  async function updateRole(id: string, newRole: string) {
    setUpdatingId(id);
    setMessage(null);
    try {
      const r = await fetch(`/api/admin/admins/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (r.status === 404) throw new Error("NOT_FOUND");
      if (!r.ok) throw new Error("UPDATE_FAIL");
      setMessage({ type: "success", text: t("admin.adminAccounts.roleUpdated") });
      load();
    } catch {
      setMessage({ type: "error", text: t("admin.adminAccounts.roleUpdateFailed") });
    } finally {
      setUpdatingId(null);
    }
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const em = email.trim().toLowerCase();
    const pw = password;
    if (!em) {
      setMessage({ type: "error", text: t("admin.adminAccounts.emailRequired") });
      return;
    }
    if (pw.length < 8) {
      setMessage({ type: "error", text: t("admin.adminAccounts.passwordMin8") });
      return;
    }
    setSubmitting(true);
    setMessage(null);
    fetch("/api/admin/settings/admin-users", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: em, password: pw, role }),
    })
      .then((r) => {
        if (r.status === 409) throw new Error("EMAIL_EXISTS");
        if (!r.ok) throw new Error("CREATE_FAIL");
        return r.json();
      })
      .then(() => {
        setMessage({ type: "success", text: t("admin.adminAccounts.created") });
        setEmail("");
        setPassword("");
        setRole("editor");
        load();
      })
      .catch((e) =>
        setMessage({
          type: "error",
          text: e.message === "EMAIL_EXISTS" ? t("admin.adminAccounts.emailExists") : t("admin.adminAccounts.createFailed"),
        })
      )
      .finally(() => setSubmitting(false));
  }

  if (loading && items.length === 0) {
    return <div className="text-[13px] text-[var(--compact-muted)]">{t("admin.common.loading")}</div>;
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-panel)] p-6">
        <h2 className="text-base font-semibold text-[var(--compact-text)] border-b border-[var(--compact-card-border)] pb-2 mb-4">
          {t("admin.adminAccounts.createTitle")}
        </h2>
        <p className="text-[13px] text-[var(--compact-muted)] mb-4">
          {t("admin.adminAccounts.createDesc")}
        </p>
        <form onSubmit={handleCreate} className="space-y-4 max-w-xl">
          <div>
            <label className={labelClass}>{t("admin.adminAccounts.email")}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
              placeholder="admin@example.com"
              autoComplete="off"
            />
          </div>
          <div>
            <label className={labelClass}>{t("admin.adminAccounts.password")}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
              placeholder="••••••••"
              minLength={8}
              autoComplete="new-password"
            />
            <p className="mt-1 text-[11px] text-[var(--compact-muted)]">{t("admin.adminAccounts.passwordHint")}</p>
          </div>
          <div>
            <label className={labelClass}>{t("admin.adminAccounts.role")}</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "admin" | "editor" | "viewer")}
              className={inputClass}
            >
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>
            <p className="mt-2 text-[12px] text-[var(--compact-muted)] font-medium">ROLE PERMISSIONS</p>
            <ul className="mt-1 text-[12px] text-[var(--compact-muted)] space-y-1 list-disc list-inside">
              <li><strong>Admin:</strong> {ROLE_PERMISSIONS.admin}</li>
              <li><strong>Editor:</strong> {ROLE_PERMISSIONS.editor}</li>
              <li><strong>Viewer:</strong> {ROLE_PERMISSIONS.viewer}</li>
            </ul>
          </div>
          {message && (
            <p className={`text-[13px] ${message.type === "success" ? "text-emerald-600" : "text-red-600"}`}>
              {message.text}
            </p>
          )}
          <button type="submit" disabled={submitting} className="admin-compact-btn admin-compact-btn-primary">
            {submitting ? t("admin.common.saving") : t("admin.adminAccounts.create")}
          </button>
        </form>
      </section>

      <section className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-panel)] p-6">
        <h2 className="text-base font-semibold text-[var(--compact-text)] border-b border-[var(--compact-card-border)] pb-2 mb-4">
          {t("admin.adminAccounts.existingTitle")}
        </h2>
        {items.length === 0 ? (
          <p className="text-[13px] text-[var(--compact-muted)]">{t("admin.adminAccounts.noAccounts")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px] text-left">
              <thead>
                <tr className="border-b border-[var(--admin-border)]">
                  <th className="py-2 pr-4 font-medium text-[var(--compact-text)]">Email</th>
                  <th className="py-2 pr-4 font-medium text-[var(--compact-text)]">Role</th>
                  <th className="py-2 pr-4 font-medium text-[var(--compact-text)]">Created</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} className="border-b border-[var(--admin-border)]/60">
                    <td className="py-2 pr-4 text-[var(--compact-text)]">{it.email}</td>
                    <td className="py-2 pr-4">
                      {it.role === "owner" ? (
                        <span className="text-[var(--compact-text)]">Owner</span>
                      ) : (
                        <>
                          <select
                            value={it.role}
                            disabled={updatingId === it.id}
                            onChange={(e) => updateRole(it.id, e.target.value)}
                            className="rounded border border-[var(--admin-border)] bg-[var(--admin-panel2)] px-2 py-1 text-[13px] text-[var(--compact-text)] disabled:opacity-50"
                          >
                            <option value="admin">Admin</option>
                            <option value="editor">Editor</option>
                            <option value="viewer">Viewer</option>
                          </select>
                          {updatingId === it.id && <span className="ml-1 text-[11px] text-[var(--compact-muted)]">…</span>}
                        </>
                      )}
                    </td>
                    <td className="py-2 text-[var(--compact-muted)]">
                      {it.createdAt ? new Date(it.createdAt).toLocaleString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-panel)] p-6 mt-6">
        <h2 className="text-base font-semibold text-[var(--compact-text)] border-b border-[var(--compact-card-border)] pb-2 mb-4">
          {t("admin.adminAccounts.roleChangeHistory") ?? "Role change history"}
        </h2>
        <RoleChangeHistory />
      </section>
    </div>
  );
}

type RoleChangeRow = { id: string; at: string; actorEmail: string; targetEmail: string; fromRole: string; toRole: string };

function RoleChangeHistory() {
  const { t } = useLocale();
  const [rows, setRows] = useState<RoleChangeRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/audit/role-changes?limit=20", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: { rows?: RoleChangeRow[] }) => setRows(Array.isArray(data.rows) ? data.rows : []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-[13px] text-[var(--compact-muted)]">{t("admin.common.loading")}</p>;
  if (rows.length === 0) return <p className="text-[13px] text-[var(--compact-muted)]">{t("admin.adminAccounts.noRoleChanges") ?? "No role changes yet."}</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[13px] text-left">
        <thead>
          <tr className="border-b border-[var(--admin-border)]">
            <th className="py-2 pr-4 font-medium text-[var(--compact-text)]">Time</th>
            <th className="py-2 pr-4 font-medium text-[var(--compact-text)]">By</th>
            <th className="py-2 pr-4 font-medium text-[var(--compact-text)]">Account</th>
            <th className="py-2 font-medium text-[var(--compact-text)]">Change</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-[var(--admin-border)]/60">
              <td className="py-2 pr-4 text-[var(--compact-muted)]">{new Date(r.at).toLocaleString()}</td>
              <td className="py-2 pr-4 text-[var(--compact-text)]">{r.actorEmail}</td>
              <td className="py-2 pr-4 text-[var(--compact-text)]">{r.targetEmail}</td>
              <td className="py-2 text-[var(--compact-text)]">{r.fromRole} → {r.toRole}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
