"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { FallbackImage } from "@/components/FallbackImage";
import { resolveUiAssetByName } from "@/lib/public/namedAssets";

type QuickLink = { label: string; href: string };
type ChatMsg = { id: string; sender: string; body: string; at: string };
type SocketMsg = { id?: string; senderType?: string; bodyText?: string; createdAt?: string };
const IMG_PREFIX = "[img]";

function parseImageBody(body: string): string | null {
  const txt = body.trim();
  if (!txt.startsWith(IMG_PREFIX)) return null;
  const url = txt.slice(IMG_PREFIX.length).trim();
  if (!/^https?:\/\//i.test(url)) return null;
  return url;
}

function BrandDot({ kind }: { kind: "whatsapp" | "telegram" }) {
  if (kind === "whatsapp") {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#25D366] text-[10px] font-black text-[#063A1B]">
        WA
      </span>
    );
  }
  return (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#2AABEE] text-[10px] font-black text-[#052535]">
      TG
    </span>
  );
}

export function EmbeddedChatClient({
  uiText,
  quickLinks
}: {
  uiText?: Record<string, string>;
  quickLinks: QuickLink[];
}) {
  const t = uiText ?? {};
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [status, setStatus] = useState<"connecting" | "online" | "offline" | "error">("connecting");
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
  const [syncCode, setSyncCode] = useState<string>("");
  const [syncDraft, setSyncDraft] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const randomSessionId = useMemo(() => {
    try {
      const key = "chat_session_id";
      const old = localStorage.getItem(key);
      if (old && old.length > 8) return old;
      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);
      const hex = Array.from(bytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      const sid = `v_${hex}`;
      localStorage.setItem(key, sid);
      return sid;
    } catch {
      return "v_fallback_session";
    }
  }, []);

  useEffect(() => {
    try {
      const old = (localStorage.getItem("chat_sync_code") ?? "").trim();
      if (!old) return;
      setSyncCode(old);
      setSyncDraft(old);
    } catch {
      // ignore storage errors
    }
  }, []);

  const sessionId = useMemo(() => {
    const normalized = syncCode
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "")
      .slice(0, 64);
    if (normalized.length >= 4) return `v_sync_${normalized}`;
    return randomSessionId;
  }, [randomSessionId, syncCode]);

  const cacheKey = useMemo(() => `chat_cache_${sessionId}`, [sessionId]);

  function applySyncCode() {
    const normalized = syncDraft
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "")
      .slice(0, 64);
    setSyncCode(normalized);
    try {
      if (normalized) localStorage.setItem("chat_sync_code", normalized);
      else localStorage.removeItem("chat_sync_code");
    } catch {
      // ignore storage errors
    }
    setMsgs([]);
    setConversationId(null);
  }

  useEffect(() => {
    try {
      const raw = localStorage.getItem(cacheKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { conversationId?: string | null; msgs?: ChatMsg[] };
      if (parsed.conversationId && typeof parsed.conversationId === "string") {
        setConversationId(parsed.conversationId);
      }
      if (Array.isArray(parsed.msgs) && parsed.msgs.length > 0) {
        setMsgs(parsed.msgs.slice(-120));
      }
    } catch {
      // ignore cache parse errors
    }
  }, [cacheKey]);

  useEffect(() => {
    try {
      localStorage.setItem(cacheKey, JSON.stringify({ conversationId, msgs: msgs.slice(-120) }));
    } catch {
      // ignore cache write errors
    }
  }, [cacheKey, conversationId, msgs]);

  useEffect(() => {
    const socketBaseUrl = process.env.NEXT_PUBLIC_CHAT_SERVER_URL?.trim() || window.location.origin;
    const s = io(socketBaseUrl, { path: "/ws-visitor", transports: ["websocket"] });
    socketRef.current = s;
    setStatus("connecting");

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
      setMsgs((prev) => {
        if (prev.length > 0) return prev;
        return [
          {
            id: "sys-welcome",
            sender: "system",
            body: t.livechatwelcometext ?? "客服已连接，请直接输入你的问题。",
            at: new Date().toLocaleTimeString()
          }
        ];
      });
    });

    s.on("message_history", (list: SocketMsg[]) => {
      const next = (Array.isArray(list) ? list : [])
        .map((m) => {
          const body = (m?.bodyText ?? "").trim();
          if (!body) return null;
          return {
            id: m?.id ?? `mh-${Date.now()}`,
            sender: m?.senderType ?? "unknown",
            body,
            at: m?.createdAt ? new Date(m.createdAt).toLocaleTimeString() : new Date().toLocaleTimeString()
          } as ChatMsg;
        })
        .filter((x): x is ChatMsg => Boolean(x));
      if (next.length > 0) setMsgs(next.slice(-120));
    });

    s.on("message_new", (m: SocketMsg) => {
      const body = (m?.bodyText ?? "").trim();
      if (!body) return;
      const id = m?.id ?? `m-${Date.now()}`;
      setMsgs((prev) => {
        if (prev.some((x) => x.id === id)) return prev;
        return [
          ...prev,
          {
            id,
            sender: m?.senderType ?? "unknown",
            body,
            at: m?.createdAt ? new Date(m.createdAt).toLocaleTimeString() : new Date().toLocaleTimeString()
          }
        ].slice(-120);
      });
    });

    s.on("disconnect", () => setStatus("offline"));
    s.on("error", () => setStatus("error"));

    return () => {
      s.disconnect();
      socketRef.current = null;
    };
  }, [sessionId, t.livechatwelcometext]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [msgs]);

  function send() {
    const body = input.trim();
    if (!body) return;
    if (!socketRef.current || !conversationId) return;
    socketRef.current.emit("visitor_message", { conversationId, bodyText: body });
    setInput("");
  }

  async function sendImage(file: File) {
    if (!socketRef.current || !conversationId) return;
    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/public/chat/upload-image", { method: "POST", body: fd });
      const data = (await res.json().catch(() => ({}))) as { publicUrl?: string };
      if (!res.ok || !data.publicUrl) return;
      socketRef.current.emit("visitor_message", { conversationId, bodyText: `${IMG_PREFIX}${data.publicUrl}` });
    } finally {
      setUploadingImage(false);
    }
  }

  const title = t.livechatpagetitle ?? "Live Chat";
  const placeholder = t.livechatplaceholder ?? "Type message...";
  const sendText = t.livechatsendtext ?? "Send";
  const waAsset = resolveUiAssetByName("whatsapp");
  const tgAsset = resolveUiAssetByName("telegram");
  const sortedQuickLinks = [...quickLinks].sort((a, b) => {
    const al = a.label.toLowerCase();
    const bl = b.label.toLowerCase();
    const rank = (x: string) => (x.includes("whatsapp") ? 0 : x.includes("telegram") ? 1 : 2);
    return rank(al) - rank(bl);
  });
  const statusText =
    status === "online"
      ? t.livechatonlinetext ?? "Online"
      : status === "connecting"
      ? "Connecting..."
      : status === "offline"
      ? "Offline"
      : "Error";

  return (
    <main
      className="fixed inset-0 z-[100] flex flex-col bg-[#080808] md:static md:z-auto md:block md:px-4 md:py-5"
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
        minHeight: "100dvh"
      }}
    >
      <section className="mx-auto flex min-h-0 max-w-[980px] flex-1 flex-col overflow-hidden rounded-none border-0 bg-transparent text-white antialiased md:rounded-2xl md:border md:border-white/15 md:bg-[#080808]/90">
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3">
          <h1 className="text-[20px] font-extrabold tracking-tight text-[color:var(--rb-gold2)] sm:text-[22px]">{title}</h1>
          <span className="rounded border border-white/20 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-white/75">{statusText}</span>
        </div>

        <div className="grid gap-2 border-b border-white/10 px-4 py-2 md:grid-cols-[1fr_auto_auto]">
          <input
            value={syncDraft}
            onChange={(e) => setSyncDraft(e.target.value)}
            placeholder={t.livechatsyncplaceholder ?? "跨设备同步码（同一账号填同一码）"}
            className="min-w-0 rounded-lg border border-white/15 bg-black/30 px-3 py-1.5 text-xs text-white/90 outline-none"
          />
          <button
            type="button"
            onClick={applySyncCode}
            className="rounded-lg border border-[color:var(--front-gold)]/35 bg-[color:var(--front-gold)]/15 px-3 py-1.5 text-xs font-semibold text-[color:var(--front-gold-light)]"
          >
            {t.livechatsyncapply ?? "应用同步码"}
          </button>
          <button
            type="button"
            onClick={() => {
              setSyncDraft("");
              setSyncCode("");
              try {
                localStorage.removeItem("chat_sync_code");
              } catch {
                // ignore storage errors
              }
            }}
            className="rounded-lg border border-white/20 bg-white/5 px-3 py-1.5 text-xs text-white/80"
          >
            {t.livechatsyncclear ?? "清除"}
          </button>
        </div>

        {sortedQuickLinks.length > 0 ? (
          <div className="flex flex-wrap gap-2 border-b border-white/10 px-4 py-2">
            {sortedQuickLinks.map((x) => {
              const lower = x.label.toLowerCase();
              const isWa = lower.includes("whatsapp");
              const isTg = lower.includes("telegram");
              return (
              <a
                key={`${x.label}-${x.href}`}
                href={x.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-[12px] font-medium tracking-wide text-white/90 hover:bg-white/10"
              >
                {isWa ? (
                  waAsset ? (
                    <FallbackImage src={waAsset} alt="" className="h-5 w-5 object-contain" />
                  ) : (
                    <BrandDot kind="whatsapp" />
                  )
                ) : null}
                {isTg ? (
                  tgAsset ? (
                    <FallbackImage src={tgAsset} alt="" className="h-5 w-5 object-contain" />
                  ) : (
                    <BrandDot kind="telegram" />
                  )
                ) : null}
                {x.label}
              </a>
              );
            })}
          </div>
        ) : null}

        <div ref={listRef} className="min-h-0 flex-1 space-y-2 overflow-auto px-4 py-3 md:h-[56vh] md:min-h-[340px] md:flex-none">
          {msgs.map((m) => (
            <div key={m.id} className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5">
              <div className="mb-1.5 flex items-center justify-between text-[11px] font-medium text-white/55">
                <span className="uppercase tracking-wide">{m.sender}</span>
                <span>{m.at}</span>
              </div>
              {parseImageBody(m.body) ? (
                <img src={parseImageBody(m.body) ?? ""} alt="chat-image" className="max-h-[280px] rounded-lg border border-white/10 object-contain" />
              ) : (
                <p className="whitespace-pre-wrap text-[14px] leading-6 text-white/92">{m.body}</p>
              )}
            </div>
          ))}
        </div>

        <div className="shrink-0 border-t border-white/10 p-3">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") send();
              }}
              placeholder={placeholder}
              className="min-w-0 flex-1 rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-[14px] font-medium text-white outline-none"
            />
            <button
              type="button"
              onClick={send}
              className="rounded-xl border border-[color:var(--front-success)]/35 bg-[color:var(--front-success)]/15 px-4 py-2 text-[13px] font-bold tracking-wide text-[color:var(--front-success-light)]"
            >
              {sendText}
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage || !conversationId}
              className="rounded-xl border border-sky-400/35 bg-sky-500/15 px-3 py-2 text-[13px] font-semibold tracking-wide text-sky-100 disabled:opacity-50"
            >
              {uploadingImage ? "上传中..." : "照片"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.currentTarget.value = "";
                if (file) void sendImage(file);
              }}
            />
          </div>
        </div>
      </section>
    </main>
  );
}

