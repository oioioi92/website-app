"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n/context";
import { useAdminApiContext } from "@/lib/admin-api-context";
import { TwoFactorSettingsClient } from "@/components/admin/TwoFactorSettingsClient";

const TIPS = [
  "Make sure all IP addresses belong to your staff.",
  "Set all unused staff or agent accounts to inactive.",
  "Use strong password and change password frequently.",
  "Please update your PC and browser to the latest version.",
  "Recommend to turn on Hide Mobile function.",
  "Recommend to turn on 2FA passcode.",
  "Recommend to restrict IP that allow to access your backend system.",
];

export function SecurityPageClient() {
  const { t } = useLocale();
  const { setForbidden } = useAdminApiContext();
  const [whitelist, setWhitelist] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<"success" | "error" | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings/ip-whitelist", { credentials: "include" })
      .then((r) => {
        if (r.status === 403) setForbidden(true);
        return r.ok ? r.json() : Promise.reject();
      })
      .then((d: { whitelist?: string }) => setWhitelist(d.whitelist ?? ""))
      .catch(() => setWhitelist(""))
      .finally(() => setLoading(false));
  }, [setForbidden]);

  function saveWhitelist() {
    setSaving(true);
    setSaveMsg(null);
    fetch("/api/admin/settings/ip-whitelist", {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ whitelist }),
    })
      .then((r) => {
        if (r.status === 403) setForbidden(true);
        return r.ok ? setSaveMsg("success") : Promise.reject();
      })
      .catch(() => setSaveMsg("error"))
      .finally(() => setSaving(false));
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Security</h1>
        <p className="mt-1 text-sm text-slate-500">Security tips, IP whitelist, 2FA, admin accounts</p>
      </div>

      <section className="rounded-xl border border-amber-200 bg-amber-50/90 p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-amber-800">Security Tips</h2>
        <ul className="list-inside list-disc space-y-1.5 text-sm text-amber-900">
          {TIPS.map((tip, i) => (
            <li key={i}>{tip}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-2 text-sm font-semibold text-slate-800">Whitelist IP address</h2>
        <p className="mb-3 text-xs text-slate-500">
          Whitelist IP addresses that are allowed to access your backend system. Leave empty if you do not want to restrict any IP address.
        </p>
        {loading ? (
          <p className="text-sm text-slate-500">{t("admin.common.loading") ?? "Loading…"}</p>
        ) : (
          <>
            <textarea
              value={whitelist}
              onChange={(e) => setWhitelist(e.target.value)}
              placeholder="1.1.1.1&#10;0.0.0.0"
              rows={4}
              className="w-full rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20"
            />
            <div className="mt-3 flex items-center gap-3">
              <button
                type="button"
                onClick={saveWhitelist}
                disabled={saving}
                className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50"
              >
                {saving ? (t("admin.common.saving") ?? "...") : (t("admin.common.save") ?? "Save")}
              </button>
              {saveMsg === "success" && <span className="text-sm text-emerald-600">{t("admin.site.saved") ?? "Saved."}</span>}
              {saveMsg === "error" && <span className="text-sm text-red-600">{t("admin.common.saveError") ?? "Save failed."}</span>}
            </div>
          </>
        )}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-2 text-sm font-semibold text-slate-800">Two-Factor Authentication (2FA)</h2>
        <p className="mb-4 text-xs text-slate-500">
          Use an authenticator app to add a second factor when signing in. Login history is available under Account & Security → Login History.
        </p>
        <TwoFactorSettingsClient />
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-2 text-sm font-semibold text-slate-800">Create Admin / Editor / Viewer</h2>
        <p className="mb-4 text-xs text-slate-500">
          Add and manage backend accounts: admin (full access), editor (content & theme), viewer (read-only). Go to Admin Accounts to create or edit.
        </p>
        <Link
          href="/admin/settings/account/admins"
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Open Admin Accounts →
        </Link>
      </section>
    </div>
  );
}
