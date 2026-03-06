"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/lib/i18n/context";

type Reply = {
  id: string;
  title: string;
  bodyText: string;
  isActive?: boolean;
  sortOrder?: number;
};

export function AdminTemplateListClient() {
  const { t } = useLocale();
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState<"add" | Reply | null>(null);
  const [saving, setSaving] = useState(false);

  function load() {
    setLoading(true);
    setError("");
    fetch("/api/admin/chat/canned-replies")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        setReplies(Array.isArray(d.replies) ? d.replies : []);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between gap-4 mb-4">
        <p className="text-sm text-slate-600">{t("admin.chatTemplates.totalTemplates").replace("{n}", String(replies.length))}</p>
        <button
          type="button"
          onClick={() => setModal("add")}
          className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-600"
        >
          {t("admin.chatTemplates.addTemplate")}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {error}（{t("admin.chatTemplates.errorHint")}）
        </div>
      )}

      {loading ? (
        <p className="text-slate-500">{t("admin.common.loading")}</p>
      ) : replies.length === 0 && !error ? (
        <p className="text-slate-500">{t("admin.chatTemplates.noTemplates")}</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/90">
                <th className="px-4 py-3.5 text-left text-[13px] font-semibold uppercase tracking-wide text-slate-800">{t("admin.chatTemplates.colTitle")}</th>
                <th className="px-4 py-3.5 text-left text-[13px] font-semibold uppercase tracking-wide text-slate-800">{t("admin.chatTemplates.colContent")}</th>
                <th className="px-4 py-3.5 text-right text-[13px] font-semibold uppercase tracking-wide text-slate-800">{t("admin.chatTemplates.colAction")}</th>
              </tr>
            </thead>
            <tbody>
              {replies.map((r) => (
                <tr key={r.id} className="border-b border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-900">{r.title}</td>
                  <td className="px-4 py-3 text-slate-700 max-w-md truncate">{r.bodyText}</td>
                  <td className="px-4 py-3 text-right">
                    <button type="button" onClick={() => setModal(r)} className="mr-2 text-sky-600 hover:underline">{t("admin.chatTemplates.edit")}</button>
                    <button type="button" onClick={() => deleteOne(r.id, load, { confirmDelete: t("admin.chatTemplates.confirmDelete"), deleteFailed: t("admin.chatTemplates.deleteFailed"), requestFailed: t("admin.chatTemplates.requestFailed") })} className="text-red-600 hover:underline">{t("admin.chatTemplates.delete")}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <TemplateModal
          reply={modal === "add" ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load(); }}
          saving={saving}
          setSaving={setSaving}
          t={t}
        />
      )}
    </div>
  );
}

function deleteOne(
  id: string,
  reload: () => void,
  messages: { confirmDelete: string; deleteFailed: string; requestFailed: string }
) {
  if (!confirm(messages.confirmDelete)) return;
  fetch(`/api/admin/chat/canned-replies/${id}`, { method: "DELETE" })
    .then((r) => (r.ok ? reload() : r.json().then((d) => alert(d.error || messages.deleteFailed))))
    .catch(() => alert(messages.requestFailed));
}

function TemplateModal({
  reply,
  onClose,
  onSaved,
  saving,
  setSaving,
  t
}: {
  reply: Reply | null;
  onClose: () => void;
  onSaved: () => void;
  saving: boolean;
  setSaving: (v: boolean) => void;
  t: (key: string) => string;
}) {
  const [title, setTitle] = useState(reply?.title ?? "");
  const [bodyText, setBodyText] = useState(reply?.bodyText ?? "");
  const saveError = t("admin.common.saveError");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !bodyText.trim()) return;
    setSaving(true);
    const url = reply ? `/api/admin/chat/canned-replies/${reply.id}` : "/api/admin/chat/canned-replies";
    const method = reply ? "PUT" : "POST";
    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), bodyText: bodyText.trim() })
    })
      .then((r) => {
        if (r.ok) onSaved();
        else return r.json().then((d) => Promise.reject(new Error(d.error || saveError)));
      })
      .catch((err) => alert(err.message))
      .finally(() => setSaving(false));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-lg font-semibold text-slate-800">{reply ? t("admin.chatTemplates.modalTitleEdit") : t("admin.chatTemplates.modalTitleAdd")}</h2>
        <form onSubmit={submit} className="mt-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">{t("admin.chatTemplates.colTitle")}</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={80}
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">{t("admin.chatTemplates.colContent")}</label>
            <textarea
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              maxLength={2000}
              rows={4}
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2 text-slate-700 hover:bg-slate-50">
              {t("admin.common.cancel")}
            </button>
            <button type="submit" disabled={saving} className="rounded-lg bg-sky-500 px-4 py-2 text-white hover:bg-sky-600 disabled:opacity-50">
              {saving ? t("admin.chatTemplates.saving") : t("admin.chatTemplates.save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
