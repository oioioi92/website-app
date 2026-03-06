"use client";

import { useState, useEffect } from "react";
import { useLocale } from "@/lib/i18n/context";

type DomainRow = { id: string; domain: string; type: "PRIMARY" | "BACKUP"; status: string; expiry: string; remark: string };

function newRow(): DomainRow {
  return {
    id: `dom_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    domain: "",
    type: "BACKUP",
    status: "OK",
    expiry: "",
    remark: "",
  };
}

export function DomainPageClient() {
  const { t } = useLocale();
  const [rows, setRows] = useState<DomainRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<"saved" | "error" | null>(null);
  const [dnsTarget, setDnsTarget] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings/domains", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: { rows?: DomainRow[]; dnsTarget?: string }) => {
        setRows(Array.isArray(d.rows) ? d.rows : []);
        setDnsTarget(d.dnsTarget ?? "");
      })
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, []);

  function save() {
    setSaving(true);
    setMessage(null);
    fetch("/api/admin/settings/domains", {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows, dnsTarget }),
    })
      .then((r) => (r.ok ? setMessage("saved") : Promise.reject()))
      .catch(() => setMessage("error"))
      .finally(() => setSaving(false));
  }

  function addRow() {
    setRows((prev) => [...prev, newRow()]);
  }

  function updateRow(id: string, patch: Partial<DomainRow>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function removeRow(id: string) {
    setRows((prev) => prev.filter((r) => r.id !== id));
  }

  if (loading) return <div className="text-sm text-slate-500">{t("admin.common.loading")}</div>;

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Domain</h1>
        <p className="mt-1 text-sm text-slate-500">Manage domains (primary/backup), status, expiry</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-700">Domain List</h2>
          <button
            type="button"
            onClick={addRow}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700"
          >
            ADD
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100 text-left">
                <th className="px-4 py-2 font-semibold text-slate-700">Domain</th>
                <th className="px-4 py-2 font-semibold text-slate-700">Type</th>
                <th className="px-4 py-2 font-semibold text-slate-700">Status</th>
                <th className="px-4 py-2 font-semibold text-slate-700">Expiry</th>
                <th className="px-4 py-2 font-semibold text-slate-700">Remark</th>
                <th className="px-4 py-2 font-semibold text-slate-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No domains. Click ADD to add one.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={r.domain}
                        onChange={(e) => updateRow(r.id, { domain: e.target.value })}
                        placeholder="example.com"
                        className="w-full min-w-[120px] rounded border border-slate-200 bg-white px-2 py-1 text-slate-800 focus:border-indigo-400 focus:outline-none"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <select
                        value={r.type}
                        onChange={(e) => updateRow(r.id, { type: e.target.value as "PRIMARY" | "BACKUP" })}
                        className="rounded border border-slate-200 bg-white px-2 py-1 text-slate-800 focus:border-indigo-400"
                      >
                        <option value="PRIMARY">PRIMARY</option>
                        <option value="BACKUP">BACKUP</option>
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={r.status}
                        onChange={(e) => updateRow(r.id, { status: e.target.value })}
                        placeholder="OK"
                        className="w-20 rounded border border-slate-200 bg-white px-2 py-1 text-slate-800 focus:border-indigo-400"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={r.expiry}
                        onChange={(e) => updateRow(r.id, { expiry: e.target.value })}
                        placeholder="2027-01-10"
                        className="w-28 rounded border border-slate-200 bg-white px-2 py-1 text-slate-800 focus:border-indigo-400"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        type="text"
                        value={r.remark}
                        onChange={(e) => updateRow(r.id, { remark: e.target.value })}
                        placeholder=""
                        className="w-full min-w-[80px] rounded border border-slate-200 bg-white px-2 py-1 text-slate-800 focus:border-indigo-400"
                      />
                    </td>
                    <td className="px-4 py-2">
                      <button
                        type="button"
                        onClick={() => removeRow(r.id)}
                        className="text-xs font-medium text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-slate-200 bg-slate-50/80 px-4 py-3">
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? "..." : "SAVE"}
          </button>
          {message === "saved" ? <span className="ml-3 text-sm text-emerald-600">Saved.</span> : null}
          {message === "error" ? <span className="ml-3 text-sm text-red-600">Save failed.</span> : null}
        </div>
      </div>

      <section className="rounded-xl border border-slate-200 bg-slate-50/50 p-5">
        <h2 className="mb-2 text-sm font-semibold text-slate-700">Link Domain to Cloudflare / DNS</h2>
        <p className="mb-3 text-xs text-slate-500">
          Point your domain DNS (e.g. CNAME) to the target below. Leave empty if not using a fixed target.
        </p>
        <label className="mb-1 block text-xs font-medium text-slate-600">DNS Target URL</label>
        <input
          type="text"
          value={dnsTarget}
          onChange={(e) => setDnsTarget(e.target.value)}
          placeholder="e.g. your-app.eu-southeast-1.elasticbeanstalk.com"
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-400/20"
        />
      </section>
    </div>
  );
}
