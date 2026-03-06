"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/lib/i18n/context";

type Row = {
  id: string;
  memberId: string;
  userRef: string;
  displayName: string | null;
  tempPasswordPlain: string;
  messageText?: string;
  createdAt: string;
  sentAt: string | null;
};

function getCopyMessageTemplate(t: (key: string) => string, userRef: string, tempPassword: string) {
  const template = t("admin.registerPending.copyTemplateDefault");
  return template.replace(/\{\{userRef\}\}/g, userRef).replace(/\{\{tempPassword\}\}/g, tempPassword);
}

export function AdminRegisterPendingClient() {
  const { t } = useLocale();
  const [items, setItems] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function load() {
    setLoading(true);
    fetch("/api/admin/register-pending", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  function copyText(row: Row) {
    const text = row.messageText ?? getCopyMessageTemplate(t, row.userRef, row.tempPasswordPlain);
    void navigator.clipboard.writeText(text).then(() => {
      setCopiedId(row.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

  async function markSent(id: string) {
    const res = await fetch(`/api/admin/register-pending/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sent: true })
    });
    if (res.ok) load();
  }

  if (loading) {
    return <div className="mt-6 py-12 text-center text-slate-500">{t("admin.registerPending.loading")}</div>;
  }
  if (items.length === 0) {
    return <div className="mt-6 py-16 text-center text-slate-500">{t("admin.registerPending.noAccounts")}</div>;
  }

  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-[15px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              <th className="px-4 py-3 text-left font-semibold text-slate-700">Phone / ID</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">{t("admin.registerPending.displayName")}</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">{t("admin.registerPending.tempPassword")}</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">{t("admin.registerPending.status")}</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">{t("admin.registerPending.regTime")}</th>
              <th className="px-4 py-3 text-left font-semibold text-slate-700">{t("admin.registerPending.action")}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id} className="border-b border-slate-100">
                <td className="px-4 py-3 font-mono text-slate-800">{r.userRef}</td>
                <td className="px-4 py-3 text-slate-600">{r.displayName ?? "—"}</td>
                <td className="px-4 py-3 font-mono text-slate-800">{r.tempPasswordPlain}</td>
                <td className="px-4 py-3 text-slate-600">{r.sentAt ? t("admin.registerPending.sentAuto") : t("admin.registerPending.pendingSend")}</td>
                <td className="px-4 py-3 text-slate-600">{new Date(r.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => copyText(r)}
                    className="mr-2 rounded bg-sky-100 px-2 py-1 text-sm text-sky-700 hover:bg-sky-200"
                  >
                    {copiedId === r.id ? t("admin.registerPending.copied") : t("admin.registerPending.copyText")}
                  </button>
                  {!r.sentAt && (
                    <button
                      type="button"
                      onClick={() => markSent(r.id)}
                      className="rounded bg-slate-100 px-2 py-1 text-sm text-slate-700 hover:bg-slate-200"
                    >
                      {t("admin.registerPending.markedSent")}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
