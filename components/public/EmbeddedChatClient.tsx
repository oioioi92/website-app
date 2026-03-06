"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { FallbackImage } from "@/components/FallbackImage";
import { resolveUiAssetByName } from "@/lib/public/namedAssets";
import { VividTopbar } from "@/components/vivid/VividTopbar";
import { VividFooter } from "@/components/vivid/VividFooter";
import "@/styles/vivid-portal.css";

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
  quickLinks,
  vivid = false,
  siteName = "KINGDOM888",
  loginUrl = "/login",
  registerUrl = "/register-wa",
}: {
  uiText?: Record<string, string>;
  quickLinks: QuickLink[];
  vivid?: boolean;
  siteName?: string;
  loginUrl?: string;
  registerUrl?: string;
}) {
  const t = uiText ?? {};
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [status, setStatus] = useState<"connecting" | "online" | "offline" | "error">("connecting");
  const [input, setInput] = useState("");
  const [msgs, setMsgs] = useState<ChatMsg[]>([]);
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

  const sessionId = randomSessionId;

  const cacheKey = useMemo(() => `chat_cache_${sessionId}`, [sessionId]);

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

  /* ── Vivid 版本 ── */
  if (vivid) {
    const statusColor = status === "online" ? "#22c55e" : status === "connecting" ? "#f59e0b" : "#ef4444";
    return (
      <div className="vp-shell" style={{ minHeight: "100dvh", display: "flex", flexDirection: "column" }}>
        <VividTopbar siteName={siteName} loginUrl={loginUrl} registerUrl={registerUrl} />

        <div className="vp-w" style={{ flex: 1, paddingTop: 24, paddingBottom: 40 }}>

          {/* Page title row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#fff" }}>
              💬 {title}
            </h1>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "4px 12px", borderRadius: 999,
              background: `${statusColor}20`, border: `1px solid ${statusColor}55`,
              fontSize: 12, fontWeight: 700, color: statusColor,
            }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: statusColor, display: "inline-block" }} />
              {statusText}
            </span>
          </div>

          {/* Quick links (WA / TG) */}
          {sortedQuickLinks.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              {sortedQuickLinks.map((x) => {
                const lower = x.label.toLowerCase();
                const isWa = lower.includes("whatsapp");
                const isTg = lower.includes("telegram");
                const bg = isWa ? "rgba(37,211,102,0.15)" : isTg ? "rgba(42,171,238,0.15)" : "rgba(176,96,255,0.15)";
                const border = isWa ? "rgba(37,211,102,0.4)" : isTg ? "rgba(42,171,238,0.4)" : "rgba(176,96,255,0.4)";
                const color = isWa ? "#4ade80" : isTg ? "#7dd3fc" : "#d4a0ff";
                return (
                  <a
                    key={`${x.label}-${x.href}`}
                    href={x.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 8,
                      padding: "8px 16px", borderRadius: 12,
                      background: bg, border: `1px solid ${border}`,
                      color, fontSize: 13, fontWeight: 700, textDecoration: "none",
                      transition: "opacity .15s",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = "0.8"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = "1"; }}
                  >
                    {isWa ? (waAsset ? <FallbackImage src={waAsset} alt="" className="h-5 w-5 object-contain" /> : <BrandDot kind="whatsapp" />) : null}
                    {isTg ? (tgAsset ? <FallbackImage src={tgAsset} alt="" className="h-5 w-5 object-contain" /> : <BrandDot kind="telegram" />) : null}
                    {x.label}
                  </a>
                );
              })}
            </div>
          )}

          {/* Chat window */}
          <div style={{
            background: "var(--vp-card)",
            border: "1px solid rgba(176,96,255,0.25)",
            borderRadius: 18,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            minHeight: 520,
            maxHeight: "calc(100dvh - 260px)",
          }}>
            {/* Messages */}
            <div
              ref={listRef}
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "16px 16px 8px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                scrollbarWidth: "thin",
                scrollbarColor: "rgba(176,96,255,0.25) transparent",
              }}
            >
              {msgs.length === 0 && (
                <div style={{ textAlign: "center", padding: "40px 0", color: "rgba(255,255,255,0.35)", fontSize: 14 }}>
                  Connecting to support...
                </div>
              )}
              {msgs.map((m) => {
                const isAgent = m.sender === "agent" || m.sender === "system";
                const imgUrl = parseImageBody(m.body);
                return (
                  <div
                    key={m.id}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: isAgent ? "flex-start" : "flex-end",
                      gap: 3,
                    }}
                  >
                    <div style={{
                      maxWidth: "75%",
                      background: isAgent
                        ? "rgba(176,96,255,0.18)"
                        : "linear-gradient(135deg,#b060ff,#7c6cfc)",
                      border: isAgent ? "1px solid rgba(176,96,255,0.3)" : "none",
                      borderRadius: isAgent ? "4px 16px 16px 16px" : "16px 4px 16px 16px",
                      padding: imgUrl ? "4px" : "10px 14px",
                      color: "#fff",
                    }}>
                      {imgUrl ? (
                        <img src={imgUrl} alt="" style={{ maxHeight: 200, maxWidth: "100%", borderRadius: 12, display: "block" }} />
                      ) : (
                        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, wordBreak: "break-word", whiteSpace: "pre-wrap" }}>
                          {m.body}
                        </p>
                      )}
                    </div>
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", paddingLeft: 4, paddingRight: 4 }}>
                      {m.sender === "system" ? "Support" : m.sender} · {m.at}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Input bar */}
            <div style={{
              padding: "12px 14px",
              borderTop: "1px solid rgba(176,96,255,0.2)",
              display: "flex",
              gap: 8,
              alignItems: "center",
              background: "rgba(0,0,0,0.25)",
            }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") send(); }}
                placeholder={placeholder}
                style={{
                  flex: 1,
                  height: 44,
                  borderRadius: 12,
                  border: "1.5px solid rgba(176,96,255,0.3)",
                  background: "rgba(255,255,255,0.06)",
                  color: "#fff",
                  fontSize: 14,
                  padding: "0 14px",
                  outline: "none",
                }}
                onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "#b060ff"; }}
                onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "rgba(176,96,255,0.3)"; }}
              />
              <button
                type="button"
                onClick={send}
                style={{
                  height: 44,
                  padding: "0 20px",
                  borderRadius: 12,
                  background: "linear-gradient(135deg,#b060ff,#7c6cfc)",
                  border: "none",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  boxShadow: "0 0 16px rgba(176,96,255,0.45)",
                }}
              >
                {sendText}
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage || !conversationId}
                style={{
                  height: 44,
                  padding: "0 14px",
                  borderRadius: 12,
                  background: "rgba(125,211,252,0.12)",
                  border: "1.5px solid rgba(125,211,252,0.35)",
                  color: "#7dd3fc",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  opacity: (uploadingImage || !conversationId) ? 0.5 : 1,
                }}
              >
                {uploadingImage ? "…" : "📷"}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                style={{ display: "none" }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.currentTarget.value = "";
                  if (file) void sendImage(file);
                }}
              />
            </div>
          </div>
        </div>

        <VividFooter siteName={siteName} />
      </div>
    );
  }

  /* ── 旧版本（non-vivid）── */
  return (
    <main
      className="fixed inset-0 z-[100] flex min-w-0 flex-col overflow-x-hidden bg-[#080808] md:static md:z-auto md:block md:overflow-visible md:px-4 md:py-5"
      style={{
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
        minHeight: "100dvh"
      }}
    >
      <section className="mx-auto flex min-h-0 min-w-0 max-w-[980px] flex-1 flex-col overflow-hidden rounded-none border-0 bg-transparent text-white antialiased md:rounded-2xl md:border md:border-white/15 md:bg-[#080808]/90">
        <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3">
          <h1 className="text-[20px] font-extrabold tracking-tight text-[color:var(--rb-gold2)] sm:text-[22px]">{title}</h1>
          <span className="rounded border border-white/20 px-2 py-0.5 text-[11px] font-semibold tracking-wide text-white/75">{statusText}</span>
        </div>

        {sortedQuickLinks.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 border-b border-white/10 px-3 py-1.5 md:gap-2 md:px-4 md:py-2">
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
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-2 py-1 text-[11px] font-medium text-white/90 hover:bg-white/10 md:rounded-xl md:px-3 md:py-1.5 md:text-[12px]"
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

        <div
          ref={listRef}
          className="min-h-0 flex-1 space-y-3 overflow-x-hidden overflow-y-auto px-3 py-3 md:px-4 md:py-3 md:h-[56vh] md:min-h-[340px] md:flex-none"
        >
          {msgs.map((m) => (
            <div
              key={m.id}
              className="min-w-0 max-w-full rounded-xl border border-white/12 bg-black/40 px-3 py-2.5 md:px-3 md:py-2.5"
            >
              <div className="mb-1.5 flex min-w-0 items-center justify-between gap-2">
                <span className="min-w-0 truncate text-[11px] font-semibold uppercase tracking-wide text-white/80 md:text-[11px]">
                  {m.sender}
                </span>
                <span className="shrink-0 text-[10px] tabular-nums text-white/60 md:text-[11px]">{m.at}</span>
              </div>
              {parseImageBody(m.body) ? (
                <img
                  src={parseImageBody(m.body) ?? ""}
                  alt=""
                  className="max-h-[200px] w-full rounded-lg border border-white/10 object-contain md:max-h-[280px]"
                />
              ) : (
                <p className="min-w-0 break-words whitespace-pre-wrap text-[14px] leading-relaxed text-white/95 md:text-[14px] md:leading-6">
                  {m.body}
                </p>
              )}
            </div>
          ))}
        </div>

        <div className="flex min-h-[52px] shrink-0 items-center border-t border-white/10 px-3 pb-[env(safe-area-inset-bottom)] pt-2 md:min-h-[52px] md:p-3">
          <div className="flex w-full min-w-0 items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") send();
              }}
              placeholder={placeholder}
              className="min-h-[44px] min-w-0 flex-1 rounded-xl border border-white/15 bg-black/40 px-3 py-2.5 text-[15px] text-white placeholder:text-white/50 outline-none md:min-h-0 md:px-3 md:py-2 md:text-[14px]"
            />
            <button
              type="button"
              onClick={send}
              className="min-h-[44px] shrink-0 rounded-xl border border-[color:var(--front-success)]/40 bg-[color:var(--front-success)]/25 px-4 py-2.5 text-[14px] font-bold text-[color:var(--front-success-light)] md:px-4 md:py-2 md:text-[13px]"
            >
              {sendText}
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage || !conversationId}
              className="min-h-[44px] shrink-0 rounded-xl border border-sky-400/35 bg-sky-500/15 px-3 py-2.5 text-[12px] font-semibold text-sky-100 disabled:opacity-50 md:px-3 md:py-2 md:text-[13px]"
            >
              {uploadingImage ? "…" : "照片"}
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

