"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { io, type Socket } from "socket.io-client";
import { usePathname } from "next/navigation";
import { FallbackImage } from "@/components/FallbackImage";
import { resolveUiAssetByName } from "@/lib/public/namedAssets";

function BrandFabIcon({
  kind,
  asset
}: {
  kind: "whatsapp" | "telegram";
  asset: string | null;
}) {
  if (asset) {
    return <FallbackImage src={asset} alt="" className="h-6 w-6 object-contain" />;
  }
  if (kind === "whatsapp") {
    return (
      <span className="inline-flex h-8 w-8 items-center justify-center text-[10px] font-black text-[#25D366]">
        WA
      </span>
    );
  }
  return (
    <span className="inline-flex h-8 w-8 items-center justify-center text-[10px] font-black text-[#2AABEE]">
      TG
    </span>
  );
}

export function LiveChatFab({
  chatUrl,
  uiText,
  socialLinks
}: {
  chatUrl: string;
  uiText?: Record<string, string>;
  socialLinks?: Array<{ label: string; url: string }>;
}) {
  const t = uiText ?? {};
  void chatUrl;
  const pathname = usePathname();
  const isChatPage = pathname === "/chat";
  const list = socialLinks ?? [];
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<Array<{ id: string; sender: string; body: string; at: string }>>([]);
  const [status, setStatus] = useState<"idle" | "connecting" | "online" | "error">("idle");
  const sockRef = useRef<Socket | null>(null);
  const seededRef = useRef(false);
  const pendingMessageRef = useRef<string | null>(null);
  const [mobilePanelHeight, setMobilePanelHeight] = useState<number | null>(null);
  const [mobilePanelTop, setMobilePanelTop] = useState<number>(0);

  const wa =
    list.find((x) => x.label.toLowerCase().includes("whatsapp"))?.url?.trim() ?? null;
  const tg =
    list.find((x) => x.label.toLowerCase().includes("telegram"))?.url?.trim() ?? null;

  const icon =
    resolveUiAssetByName("customer-service") ??
    resolveUiAssetByName("support") ??
    resolveUiAssetByName("livechat") ??
    resolveUiAssetByName("live") ??
    resolveUiAssetByName("chat");
  const waIcon = resolveUiAssetByName("whatsapp");
  const tgIcon = resolveUiAssetByName("telegram");

  const labelText = t.livefablabel ?? "LIVE";
  const panelTitle = t.livechatpaneltitle ?? "Live Chat";
  const placeholder = t.livechatplaceholder ?? "Type message...";
  const sendText = t.livechatsendtext ?? "Send";
  const waLabel = t.whatsapplabel ?? "WhatsApp";
  const tgLabel = t.telegramlabel ?? "Telegram";

  const sessionId = useMemo(() => {
    try {
      const key = "chat_session_id";
      const existing = localStorage.getItem(key);
      if (existing && existing.length > 8) return existing;
      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);
      const hex = Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      const id = `v_${hex}`;
      localStorage.setItem(key, id);
      return id;
    } catch {
      return "v_fallback_session";
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    if (sockRef.current) return;
    setStatus("connecting");
    const socketBaseUrl = process.env.NEXT_PUBLIC_CHAT_SERVER_URL?.trim() || window.location.origin;
    const s = io(socketBaseUrl, { path: "/ws-visitor", transports: ["websocket"] });
    sockRef.current = s;

    s.on("connect", () => {
      setStatus("online");
      s.emit("visitor_hello", {
        sessionId,
        entryUrl: window.location.href,
        referrer: document.referrer || null
      });
    });
    s.on("conversation_open", (p: { conversationId?: string }) => {
      const cid = p?.conversationId ?? null;
      if (cid) setConversationId(cid);
      if (!seededRef.current) {
        seededRef.current = true;
        setMsgs((prev) => [
          ...prev,
          {
            id: `sys-${Date.now()}`,
            sender: "system",
            body: t.livechatreadytext ?? "客服已连接，你可以开始输入消息。",
            at: new Date().toLocaleTimeString()
          }
        ]);
      }
      const pending = pendingMessageRef.current;
      if (pending && cid && sockRef.current) {
        pendingMessageRef.current = null;
        sockRef.current.emit("visitor_message", { conversationId: cid, bodyText: pending });
        setMsgs((prev) => [...prev, { id: `local-${Date.now()}`, sender: "visitor", body: pending, at: new Date().toLocaleTimeString() }]);
      }
    });
    s.on("message_new", (m: { id?: string; senderType?: string; bodyText?: string; createdAt?: string }) => {
      const body = (m?.bodyText ?? "").trim();
      if (!body) return;
      setMsgs((prev) => [
        ...prev,
        {
          id: m?.id ?? `m-${Date.now()}-${Math.random()}`,
          sender: m?.senderType ?? "unknown",
          body,
          at: m?.createdAt ? new Date(m.createdAt).toLocaleTimeString() : new Date().toLocaleTimeString()
        }
      ]);
    });
    s.on("error", () => setStatus("error"));
    s.on("disconnect", () => setStatus("idle"));

    return () => {
      s.disconnect();
      sockRef.current = null;
      setStatus("idle");
    };
  }, [open, sessionId, t.livechatreadytext]);

  useEffect(() => {
    if (!open) {
      setMobilePanelHeight(null);
      setMobilePanelTop(0);
      return;
    }
    if (typeof window === "undefined" || !window.visualViewport) return;
    const vv = window.visualViewport;
    const update = () => {
      setMobilePanelTop(vv.offsetTop);
      setMobilePanelHeight(vv.height);
    };
    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
      setMobilePanelHeight(null);
      setMobilePanelTop(0);
    };
  }, [open]);

  function sendMsg() {
    const text = input.trim();
    if (!text) return;
    if (!sockRef.current) return;
    setInput("");
    if (!conversationId) {
      pendingMessageRef.current = text;
      return;
    }
    sockRef.current.emit("visitor_message", { conversationId, bodyText: text });
    setMsgs((prev) => [...prev, { id: `local-${Date.now()}`, sender: "visitor", body: text, at: new Date().toLocaleTimeString() }]);
  }

  const fullScreenPanel = open ? (
    <section
      className="fixed left-0 right-0 z-[9999] flex flex-col bg-[#080808] lg:!hidden"
      style={{
        top: mobilePanelTop,
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
        height: mobilePanelHeight ?? "100dvh",
        minHeight: mobilePanelHeight ?? "100dvh",
      }}
    >
          <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-3 py-2.5">
            <div className="text-sm font-extrabold text-[color:var(--rb-gold2)]">{panelTitle}</div>
            <button type="button" onClick={() => setOpen(false)} className="rounded border border-white/20 px-3 py-1.5 text-sm text-white/80">
              ✕
            </button>
          </div>
          <div className="min-h-0 flex-1 space-y-2 overflow-auto px-3 py-2 lg:h-[300px] lg:flex-none">
            {msgs.length === 0 ? (
              <p className="text-xs text-white/60">{t.livechatwelcometext ?? "欢迎来到在线客服，请输入你的问题。"}</p>
            ) : (
              msgs.map((m) => (
                <div key={m.id} className="rounded-xl border border-white/10 bg-black/30 px-2 py-1.5">
                  <div className="mb-0.5 flex items-center justify-between text-[10px] text-white/50">
                    <span>{m.sender}</span>
                    <span>{m.at}</span>
                  </div>
                  <p className="whitespace-pre-wrap break-words text-xs text-white/90 max-h-20 overflow-y-auto">{m.body}</p>
                </div>
              ))
            )}
          </div>
          <div className="shrink-0 border-t border-white/10 p-2">
            <div className="mb-1.5 flex flex-wrap items-center gap-1.5 text-[10px] text-white/50">
              <span>{status === "online" ? (t.livechatonlinetext ?? "Online") : status === "connecting" ? "Connecting..." : "Offline"}</span>
              {wa ? (
                <a href={wa} target="_blank" rel="noopener noreferrer" className="rounded border border-[color:var(--front-success)]/30 px-1.5 py-0.5 text-[color:var(--front-success-light)]">
                  {waLabel}
                </a>
              ) : null}
              {tg ? (
                <a href={tg} target="_blank" rel="noopener noreferrer" className="rounded border border-sky-400/30 px-1.5 py-0.5 text-sky-200">
                  {tgLabel}
                </a>
              ) : null}
            </div>
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendMsg();
                }}
                placeholder={placeholder}
                className="min-w-0 flex-1 rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-xs text-white outline-none"
              />
              <button
                type="button"
                onClick={sendMsg}
                className="rounded-xl border border-[color:var(--front-success)]/35 bg-[color:var(--front-success)]/15 px-3 py-2 text-xs font-bold text-[color:var(--front-success-light)]"
              >
                {sendText}
              </button>
            </div>
          </div>
        </section>
  ) : null;

  return (
    <>
      {typeof document !== "undefined" && fullScreenPanel ? createPortal(fullScreenPanel, document.body) : null}
      <div className="fixed right-3 top-1/2 z-50 -translate-y-1/2">
        {open ? (
          <section
            className="hidden flex-1 flex-col overflow-hidden rounded-2xl border border-white/15 bg-[#080808]/98 shadow-[0_18px_44px_rgba(0,0,0,0.6)] lg:flex lg:mb-2 lg:w-[320px] lg:max-w-[calc(100vw-24px)]"
            aria-hidden
          >
            <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-3 py-2.5">
              <div className="text-sm font-extrabold text-[color:var(--rb-gold2)]">{panelTitle}</div>
              <button type="button" onClick={() => setOpen(false)} className="rounded border border-white/20 px-3 py-1.5 text-sm text-white/80">✕</button>
            </div>
            <div className="min-h-0 flex-1 space-y-2 overflow-auto px-3 py-2 lg:h-[300px] lg:flex-none">
              {msgs.length === 0 ? (
                <p className="text-xs text-white/60">{t.livechatwelcometext ?? "欢迎来到在线客服，请输入你的问题。"}</p>
              ) : (
                msgs.map((m) => (
                  <div key={m.id} className="rounded-xl border border-white/10 bg-black/30 px-2 py-1.5">
                    <div className="mb-0.5 flex items-center justify-between text-[10px] text-white/50">
                      <span>{m.sender}</span>
                      <span>{m.at}</span>
                    </div>
                    <p className="whitespace-pre-wrap break-words text-xs text-white/90 max-h-20 overflow-y-auto">{m.body}</p>
                  </div>
                ))
              )}
            </div>
            <div className="shrink-0 border-t border-white/10 p-2">
              <div className="mb-1.5 flex flex-wrap items-center gap-1.5 text-[10px] text-white/50">
                <span>{status === "online" ? (t.livechatonlinetext ?? "Online") : status === "connecting" ? "Connecting..." : "Offline"}</span>
                {wa ? <a href={wa} target="_blank" rel="noopener noreferrer" className="rounded border border-[color:var(--front-success)]/30 px-1.5 py-0.5 text-[color:var(--front-success-light)]">{waLabel}</a> : null}
                {tg ? <a href={tg} target="_blank" rel="noopener noreferrer" className="rounded border border-sky-400/30 px-1.5 py-0.5 text-sky-200">{tgLabel}</a> : null}
              </div>
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") sendMsg(); }}
                  placeholder={placeholder}
                  className="min-w-0 flex-1 rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-xs text-white outline-none"
                />
                <button type="button" onClick={sendMsg} className="rounded-xl border border-[color:var(--front-success)]/35 bg-[color:var(--front-success)]/15 px-3 py-2 text-xs font-bold text-[color:var(--front-success-light)]">{sendText}</button>
              </div>
            </div>
          </section>
        ) : null}
        <div className="mb-2 flex flex-col items-end gap-2">
        {wa ? (
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-center p-1 transition hover:opacity-80"
            style={{ animation: "liveFabFloat 3.2s ease-in-out infinite" }}
            aria-label={waLabel}
            title={waLabel}
          >
            <BrandFabIcon kind="whatsapp" asset={waIcon} />
          </a>
        ) : null}
        {tg ? (
          <a
            href={tg}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-center p-1 transition hover:opacity-80"
            style={{ animation: "liveFabFloat 3.2s ease-in-out infinite", animationDelay: "0.28s" }}
            aria-label={tgLabel}
            title={tgLabel}
          >
            <BrandFabIcon kind="telegram" asset={tgIcon} />
          </a>
        ) : null}
      </div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex flex-col items-center justify-center gap-0.5 p-1 transition hover:opacity-80"
        style={{ animation: "liveFabFloat 3.2s ease-in-out infinite", animationDelay: "0.14s" }}
        aria-label={labelText}
        title={labelText}
      >
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#322B50] p-1.5" aria-hidden>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.95)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </span>
        <span className="text-[10px] font-medium text-white/95">Support</span>
      </button>
      <style jsx>{`
        @keyframes liveFabFloat {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
      </div>
    </>
  );
}

