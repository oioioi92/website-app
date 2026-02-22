"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#25D366] text-[10px] font-black text-[#063A1B]">
        WA
      </span>
    );
  }
  return (
    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#2AABEE] text-[10px] font-black text-[#052535]">
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

  const wa =
    list.find((x) => x.label.toLowerCase().includes("whatsapp"))?.url?.trim() ?? null;
  const tg =
    list.find((x) => x.label.toLowerCase().includes("telegram"))?.url?.trim() ?? null;

  const icon =
    resolveUiAssetByName("live") ??
    resolveUiAssetByName("chat") ??
    resolveUiAssetByName("livechat");
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
      if (p?.conversationId) setConversationId(p.conversationId);
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

  function sendMsg() {
    const text = input.trim();
    if (!text) return;
    if (!sockRef.current) return;
    if (!conversationId) {
      setMsgs((prev) => [
        ...prev,
        { id: `sys-${Date.now()}`, sender: "system", body: t.livechatwaittext ?? "正在建立会话，请稍后再发。", at: new Date().toLocaleTimeString() }
      ]);
      return;
    }
    sockRef.current.emit("visitor_message", { conversationId, bodyText: text });
    setMsgs((prev) => [...prev, { id: `local-${Date.now()}`, sender: "visitor", body: text, at: new Date().toLocaleTimeString() }]);
    setInput("");
  }

  return (
    <div className={`fixed right-3 z-50 ${isChatPage ? "bottom-[208px] lg:bottom-[156px]" : "bottom-[108px] lg:bottom-[34px]"}`}>
      {open ? (
        <section className="mb-2 w-[320px] max-w-[calc(100vw-24px)] overflow-hidden rounded-2xl border border-white/15 bg-[#080808]/95 shadow-[0_18px_44px_rgba(0,0,0,0.6)]">
          <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
            <div className="text-sm font-extrabold text-[color:var(--rb-gold2)]">{panelTitle}</div>
            <button type="button" onClick={() => setOpen(false)} className="rounded border border-white/20 px-2 py-1 text-xs text-white/80">
              X
            </button>
          </div>
          <div className="h-[300px] space-y-2 overflow-auto px-3 py-2">
            {msgs.length === 0 ? (
              <p className="text-xs text-white/60">{t.livechatwelcometext ?? "欢迎来到在线客服，请输入你的问题。"}</p>
            ) : (
              msgs.map((m) => (
                <div key={m.id} className="rounded-xl border border-white/10 bg-black/30 px-2 py-1.5">
                  <div className="mb-0.5 flex items-center justify-between text-[10px] text-white/50">
                    <span>{m.sender}</span>
                    <span>{m.at}</span>
                  </div>
                  <p className="whitespace-pre-wrap text-xs text-white/90">{m.body}</p>
                </div>
              ))
            )}
          </div>
          <div className="border-t border-white/10 p-2">
            <div className="mb-2 flex items-center gap-2 text-[10px] text-white/50">
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
      ) : null}
      <div className="mb-2 flex flex-col items-end gap-2">
        {wa ? (
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--front-success)]/45 bg-black/65 shadow-[0_10px_24px_rgba(0,0,0,0.52)] backdrop-blur transition hover:scale-105"
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
            className="group flex h-11 w-11 items-center justify-center rounded-full border border-sky-400/45 bg-black/65 shadow-[0_10px_24px_rgba(0,0,0,0.52)] backdrop-blur transition hover:scale-105"
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
        className="flex h-12 w-12 items-center justify-center rounded-full border border-[color:var(--front-gold)]/45 bg-black/65 shadow-[0_10px_24px_rgba(0,0,0,0.55)] backdrop-blur"
        style={{ animation: "liveFabFloat 3.2s ease-in-out infinite", animationDelay: "0.14s" }}
        aria-label={labelText}
        title={labelText}
      >
        {icon ? (
          <FallbackImage src={icon} alt="" className="h-6 w-6 object-contain" loading="eager" />
        ) : (
          <span className="text-[10px] font-extrabold text-[color:var(--rb-gold2)]">{labelText}</span>
        )}
      </button>
      <style jsx>{`
        @keyframes liveFabFloat {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-6px);
          }
          100% {
            transform: translateY(0px);
          }
        }
      `}</style>
    </div>
  );
}

