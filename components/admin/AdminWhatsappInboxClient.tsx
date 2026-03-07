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

  // 选中会话时拉消息，25s 轮询；页面不可见时暂停
  const POLL_MS = 25000;
  useEffect(() => {
    if (!selected) {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
      return;
    }
    loadMessages(selected);
    const startPoll = () => {
      if (!pollRef.current)
        pollRef.current = setInterval(() => loadMessages(selected), POLL_MS);
    };
    const stopPoll = () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
    startPoll();
    const onVisibility = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") startPoll();
      else stopPoll();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stopPoll();
      document.removeEventListener("visibilitychange", onVisibility);
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
    <div className="wa-inbox mt-4 md:mt-6 flex flex-col md:flex-row gap-3 md:gap-4 min-h-0 flex-1 md:flex-initial">
      {/* 左侧：会话列表 — 电话版先显示、限高；桌面版固定宽 */}
      <div className="w-full md:w-72 flex-shrink-0 rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col min-h-0 max-h-[35vh] md:max-h-[60vh]">
        <div className="border-b border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 shrink-0">{t("admin.whatsappInbox.panelConversations")}</div>
        {loadingConvs ? (
          <div className="py-8 text-center text-sm text-slate-500">{t("admin.whatsappInbox.loading")}</div>
        ) : convs.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-500">{t("admin.whatsappInbox.noConversations")}</div>
        ) : (
          <ul className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
            {convs.map((c) => (
              <li key={c.phone}>
                <button
                  type="button"
                  onClick={() => setSelected(c.phone)}
                  className={`w-full border-b border-slate-100 px-3 py-2.5 text-left text-sm hover:bg-slate-50 ${selected === c.phone ? "bg-sky-50" : ""}`}
                >
                  <div className="font-mono font-medium text-slate-800 truncate">{c.phone}</div>
                  {c.member && <div className="text-xs text-slate-500 truncate">{c.member.displayName || c.member.userRef}{t("admin.whatsappInbox.linkedMember")}</div>}
                  <div className="truncate text-xs text-slate-500">{c.preview}</div>
                  <div className="text-xs text-slate-400">{new Date(c.lastAt).toLocaleString()}</div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* 右侧：会话详情 + 回复 — 电话版全宽、占满剩余空间 */}
      <div className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col min-h-[50vh] md:min-h-0">
        {!selected ? (
          <div className="flex flex-1 items-center justify-center text-slate-500 text-sm text-center px-4">{t("admin.whatsappInbox.selectConversation")}</div>
        ) : (
          <>
            <div className="border-b border-slate-200 px-3 md:px-4 py-2 flex flex-wrap items-center gap-1 shrink-0">
              <span className="font-mono font-semibold text-slate-800 text-sm break-all">{selected}</span>
              {member && (
                <>
                  <span className="text-slate-400">·</span>
                  <Link href={"/admin/players?search=" + encodeURIComponent(member.userRef)} className="text-sm text-sky-600 hover:underline truncate max-w-[180px] md:max-w-none">
                    {member.displayName || member.userRef} → {t("admin.whatsappInbox.playerDetail")}
                  </Link>
                </>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-3 md:p-4 min-h-[120px] max-h-[40vh] md:max-h-[50vh] space-y-2 overscroll-contain">
              {loadingMsg ? (
                <div className="text-center text-slate-500 text-sm">{t("admin.whatsappInbox.loading")}</div>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.direction === "out" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] md:max-w-[80%] rounded-lg px-3 py-2 text-sm ${
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
            <div className="border-t border-slate-200 p-2 md:p-3 shrink-0 bg-slate-50/50">
              {outside24h && <p className="mb-1.5 text-xs text-amber-600">{t("admin.whatsappInbox.outside24hNote")}</p>}
              <div className="flex gap-2 items-end">
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendReply())}
                  placeholder={t("admin.whatsappInbox.replyPlaceholder")}
                  className="min-h-[44px] flex-1 min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  rows={2}
                />
                <button
                  type="button"
                  onClick={sendReply}
                  disabled={!reply.trim() || sending}
                  className="rounded-lg bg-sky-600 px-3 md:px-4 py-2 text-sm font-medium text-white disabled:opacity-50 hover:bg-sky-700 shrink-0"
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
