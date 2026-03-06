"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n/context";

type Conv = {
  phone: string;
  lastAt: string;
  preview: string;
  memberId: string | null;
  member: { id: string; userRef: string; displayName: string | null } | null;
};

type Msg = {
  id: string;
  direction: string;
  content: string;
  createdAt: string;
};

export function AdminWhatsappInboxClient() {
  const { t } = useLocale();
  const [convs, setConvs] = useState<Conv[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [member, setMember] = useState<Conv["member"]>(null);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState(false);
  const [reply, setReply] = useState("");
  const [sending, setSending] = useState(false);
  const [outside24h, setOutside24h] = useState(false);
  const listEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function loadConvs() {
    setLoadingConvs(true);
    fetch("/api/admin/whatsapp/conversations", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setConvs(d.items ?? []))
      .finally(() => setLoadingConvs(false));
  }

  function loadMessages(phone: string) {
    setLoadingMsg(true);
    setMessages([]);
    setMember(null);
    fetch("/api/admin/whatsapp/conversations/" + encodeURIComponent(phone), { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        setMessages(d.items ?? []);
        setMember(d.member ?? null);
      })
      .finally(() => setLoadingMsg(false));
  }

  useEffect(() => {
    loadConvs();
  }, []);

  useEffect(() => {
    if (selected) {
      loadMessages(selected);
      pollRef.current = setInterval(() => loadMessages(selected), 8000);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [selected]);

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendReply() {
    if (!selected || !reply.trim() || sending) return;
    setSending(true);
    setOutside24h(false);
    const res = await fetch("/api/admin/whatsapp/send", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: selected, text: reply.trim() })
    });
    const data = await res.json().catch(() => ({}));
    setSending(false);
    if (data.ok) {
      setReply("");
      setOutside24h(false);
      loadMessages(selected);
      loadConvs();
    } else {
      if (data.outside24h) setOutside24h(true);
    }
  }

  return (
    <div className="mt-6 flex gap-4">
      <div className="w-72 flex-shrink-0 rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">{t("admin.whatsappInbox.panelConversations")}</div>
        {loadingConvs ? (
          <div className="py-8 text-center text-sm text-slate-500">{t("admin.whatsappInbox.loading")}</div>
        ) : convs.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-500">{t("admin.whatsappInbox.noConversations")}</div>
        ) : (
          <ul className="max-h-[60vh] overflow-y-auto">
            {convs.map((c) => (
              <li key={c.phone}>
                <button
                  type="button"
                  onClick={() => setSelected(c.phone)}
                  className={`w-full border-b border-slate-100 px-3 py-2.5 text-left text-sm hover:bg-slate-50 ${selected === c.phone ? "bg-sky-50" : ""}`}
                >
                  <div className="font-mono font-medium text-slate-800">{c.phone}</div>
                  {c.member && <div className="text-xs text-slate-500">{c.member.displayName || c.member.userRef}{t("admin.whatsappInbox.linkedMember")}</div>}
                  <div className="truncate text-xs text-slate-500">{c.preview}</div>
                  <div className="text-xs text-slate-400">{new Date(c.lastAt).toLocaleString()}</div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col">
        {!selected ? (
          <div className="flex flex-1 items-center justify-center text-slate-500">{t("admin.whatsappInbox.selectConversation")}</div>
        ) : (
          <>
            <div className="border-b border-slate-200 px-4 py-2 flex items-center justify-between">
              <div>
                <span className="font-mono font-semibold text-slate-800">{selected}</span>
                {member && (
                  <>
                    <span className="mx-2 text-slate-400">·</span>
                    <Link href={"/admin/players?search=" + encodeURIComponent(member.userRef)} className="text-sm text-sky-600 hover:underline">
                      {member.displayName || member.userRef} → {t("admin.whatsappInbox.playerDetail")}
                    </Link>
                  </>
                )}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 min-h-[200px] max-h-[50vh] space-y-2">
              {loadingMsg ? (
                <div className="text-center text-slate-500">{t("admin.whatsappInbox.loading")}</div>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.direction === "out" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                        m.direction === "out" ? "bg-sky-500 text-white" : "bg-slate-100 text-slate-800"
                      }`}
                    >
                      <div className="whitespace-pre-wrap break-words">{m.content}</div>
                      <div className={`mt-1 text-xs ${m.direction === "out" ? "text-sky-100" : "text-slate-500"}`}>
                        {new Date(m.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={listEndRef} />
            </div>
            <div className="border-t border-slate-200 p-3">
              {outside24h && <p className="mb-2 text-xs text-amber-600">{t("admin.whatsappInbox.outside24hNote")}</p>}
              <div className="flex gap-2">
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendReply())}
                  placeholder={t("admin.whatsappInbox.replyPlaceholder")}
                  className="min-h-[44px] flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  rows={2}
                />
                <button
                  type="button"
                  onClick={sendReply}
                  disabled={!reply.trim() || sending}
                  className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 hover:bg-sky-700"
                >
                  {sending ? t("admin.whatsappInbox.sending") : t("admin.whatsappInbox.send")}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
