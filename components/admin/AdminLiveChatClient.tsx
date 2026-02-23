"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { io, type Socket } from "socket.io-client";

type QueueItem = {
  id: string;
  visitorSessionId: string;
  status: string;
  assignedStaff: string | null;
  lastMessageTime: string | null;
  waitingSeconds: number;
  firstResponseTimeSec: number | null;
};

type Template = { id: string; title: string; bodyText: string };

type ChatMessage = {
  id: string;
  senderType: string;
  bodyText: string;
  createdAt: string;
};

const FALLBACK_TEMPLATES: Template[] = [
  { id: "1", title: "Ong Ong Boss", bodyText: "Ong Ong Boss" },
  { id: "2", title: "Sila Tunggu Sebentar", bodyText: "Sila tunggu sebentar, kami akan semak." },
  { id: "3", title: "sudah refund", bodyText: "Sudah refund." },
  { id: "4", title: "wait withdraw", bodyText: "Sila tunggu, withdrawal sedang diproses." },
  { id: "5", title: "Kembali Deposit", bodyText: "Terima kasih, deposit telah diterima." },
  { id: "6", title: "Minta Maaf", bodyText: "Minta maaf, ini saja kami boleh bantu." },
  { id: "7", title: "Step Withdrawal", bodyText: "Sila ikut step withdrawal yang telah dihantar." },
  { id: "8", title: "Step Telegram", bodyText: "Sila follow step Telegram kami." },
  { id: "9", title: "Step Facebook", bodyText: "Sila follow step Facebook kami." },
  { id: "10", title: "Register Form", bodyText: "Sila isi borang pendaftaran." }
];

const MANAGE_TEMPLATES_VALUE = "__manage__";

export function AdminLiveChatClient() {
  const router = useRouter();
  const [items, setItems] = useState<QueueItem[]>([]);
  const [queueFetchedAt, setQueueFetchedAt] = useState<number>(0);
  const [tick, setTick] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("ALL");
  const [inputText, setInputText] = useState("");
  const [templates, setTemplates] = useState<Template[]>(FALLBACK_TEMPLATES);
  const [hotkeyPanelOpen, setHotkeyPanelOpen] = useState(false);
  const [queueError, setQueueError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [wsConnected, setWsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const adminIdRef = useRef<string | null>(null);

  function loadQueue() {
    setLoading(true);
    setQueueError(null);
    fetch("/api/admin/chat/queue?sort=desc")
      .then((r) => r.json())
      .then((d) => {
        setItems(d.items ?? []);
        setQueueFetchedAt(Date.now());
        if (d.message || d.error) setQueueError(d.message || d.error);
      })
      .finally(() => setLoading(false));
  }

  function loadTemplates() {
    fetch("/api/admin/chat/canned-replies")
      .then((r) => r.json())
      .then((d) => {
        const list = Array.isArray(d.replies) ? d.replies : [];
        if (list.length > 0) {
          setTemplates(list.map((r: { id: string; title: string; bodyText: string }) => ({ id: r.id, title: r.title, bodyText: r.bodyText })));
        }
      })
      .catch(() => {});
  }

  useEffect(() => {
    loadQueue();
    loadTemplates();
    const t = setInterval(loadQueue, 10000);
    return () => clearInterval(t);
  }, []);

  // 读秒：每秒更新一次，用于实时显示每位顾客的等待时长
  useEffect(() => {
    const interval = setInterval(() => setTick((n) => n + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  // WebSocket：连接 chat-server 并鉴权，供收发消息
  useEffect(() => {
    const baseUrl = (typeof window !== "undefined" && process.env.NEXT_PUBLIC_CHAT_SERVER_URL?.trim()) || "";
    if (!baseUrl) return;

    let mounted = true;
    fetch("/api/admin/chat/token", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (!mounted || !d?.token) return;
        const s = io(baseUrl, { path: "/ws-admin", transports: ["websocket"] });
        socketRef.current = s;
        s.on("connect", () => {
          s.emit("admin_auth", { token: d.token });
        });
        s.on("admin_authed", (p: { ok?: boolean; adminId?: string }) => {
          if (p?.ok && p?.adminId) {
            adminIdRef.current = p.adminId;
            setWsConnected(true);
          }
        });
        s.on("error", (e: { error?: string }) => {
          if (e?.error === "UNAUTHORIZED") setWsConnected(false);
        });
        s.on("disconnect", () => setWsConnected(false));
      })
      .catch(() => {});

    return () => {
      mounted = false;
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setWsConnected(false);
      adminIdRef.current = null;
    };
  }, []);

  // 选中会话时：加入房间并接收历史 + 新消息
  useEffect(() => {
    if (!selectedId || !socketRef.current || !adminIdRef.current) {
      setMessages([]);
      return;
    }
    setMessages([]);
    const s = socketRef.current;
    s.emit("admin_join", { conversationId: selectedId });

    const onHistory = (list: Array<{ id?: string; senderType?: string; bodyText?: string; createdAt?: string }>) => {
      const next = (Array.isArray(list) ? list : []).map((m) => ({
        id: m?.id ?? `h-${Date.now()}`,
        senderType: m?.senderType ?? "unknown",
        bodyText: (m?.bodyText ?? "").trim(),
        createdAt: m?.createdAt ?? new Date().toISOString()
      }));
      setMessages(next);
    };
    const onNew = (m: { id?: string; senderType?: string; bodyText?: string; createdAt?: string }) => {
      if (!m?.bodyText) return;
      setMessages((prev) => [
        ...prev,
        {
          id: m.id ?? `n-${Date.now()}`,
          senderType: m.senderType ?? "unknown",
          bodyText: (m.bodyText ?? "").trim(),
          createdAt: m.createdAt ?? new Date().toISOString()
        }
      ]);
    };
    s.on("message_history", onHistory);
    s.on("message_new", onNew);
    return () => {
      s.off("message_history", onHistory);
      s.off("message_new", onNew);
    };
  }, [selectedId]);

  const sendMessage = () => {
    const text = inputText.trim();
    if (!text || !selectedId || !socketRef.current) return;
    socketRef.current.emit("admin_message", { conversationId: selectedId, bodyText: text });
    setInputText("");
  };

  const applyTemplate = (body: string) => {
    setInputText((prev) => (prev ? `${prev}\n${body}` : body));
  };

  const applyHotkey = (body: string) => {
    setInputText((prev) => {
      const withoutHash = prev.replace(/#\s*$/, "").trimEnd();
      return withoutHash ? `${withoutHash} ${body}` : body;
    });
    setHotkeyPanelOpen(false);
  };

  const showHotkeyPanel = hotkeyPanelOpen || inputText.includes("#");

  const selected = selectedId ? items.find((i) => i.id === selectedId) : null;

  // 根据上次拉取时间计算当前实时等待秒数（顾客一来就开始读秒，便于监控）
  const getLiveWaitingSeconds = (item: QueueItem) => {
    if (!queueFetchedAt) return item.waitingSeconds;
    const elapsed = Math.floor((Date.now() - queueFetchedAt) / 1000);
    return item.waitingSeconds + elapsed;
  };

  return (
    <div className="flex flex-1 flex-col min-h-0 min-w-0 bg-white overflow-hidden">
      {/* 顶栏：只保留 Live Chat、# 热键、一个设置按钮（原红框区域已删） */}
      <header className="flex shrink-0 items-center justify-between gap-3 bg-indigo-600 px-4 py-2.5 text-white">
        <span className="flex items-center gap-2 text-sm font-semibold">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Live Chat
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setHotkeyPanelOpen((v) => !v)}
            className="rounded-lg bg-indigo-500/70 px-3 py-1.5 text-sm font-medium hover:bg-indigo-500/90"
            title="按 # 或点此唤出热键选择"
          >
            #
          </button>
          <Link
            href="/admin/chat/templates"
            className="rounded-lg bg-indigo-500/70 px-3 py-1.5 text-sm font-medium hover:bg-indigo-500/90"
          >
            模板
          </Link>
          <Link
            href="/admin/chat/bot"
            className="rounded-lg bg-indigo-500/70 px-3 py-1.5 text-sm font-medium hover:bg-indigo-500/90"
          >
            设置
          </Link>
        </div>
      </header>

      {queueError && (
        <div className="shrink-0 bg-amber-100 border-b border-amber-300 px-4 py-2 text-sm text-amber-800">
          Live Chat 服务未连接：{queueError}。请配置 CHAT_SERVER_INTERNAL_URL 并启动 chat-server（<code>services/chat-server</code>）。部署与故障排查见项目文档 <strong>docs/LIVE-CHAT-上线检查.md</strong>。
        </div>
      )}
      <div className="flex flex-1 min-h-0">
        {/* 左侧：会话列表 - 加宽、字号加大，每行带实时读秒 */}
        <aside className="w-80 shrink-0 border-r border-slate-200 bg-slate-50/50 overflow-y-auto">
          <p className="px-4 py-2 text-xs text-slate-500 border-b border-slate-200 bg-white/80">
            排队读秒：顾客发消息起计 · 超 60s 黄牌、180s 红牌
          </p>
          {loading && items.length === 0 ? (
            <div className="p-5 text-center text-slate-500">加载中…</div>
          ) : items.length === 0 ? (
            <div className="p-5 text-center text-slate-500">暂无会话</div>
          ) : (
            <ul className="divide-y divide-slate-200">
              {items.map((item) => {
                const liveSec = getLiveWaitingSeconds(item);
                const warnClass =
                  liveSec >= 180 ? "bg-red-100 border-l-4 border-red-500" : liveSec >= 60 ? "bg-amber-50 border-l-4 border-amber-400" : "";
                const isSelected = selectedId === item.id;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(item.id)}
                      className={`w-full text-left px-5 py-4 transition ${isSelected ? "bg-sky-100 border-l-4 border-sky-500" : warnClass || "hover:bg-slate-100"} ${!isSelected && !warnClass ? "border-l-4 border-transparent" : ""}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[15px] font-semibold text-slate-900 truncate">{item.visitorSessionId}</span>
                        <span className="text-sm text-slate-500 shrink-0">
                          {item.lastMessageTime ? new Date(item.lastMessageTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : "—"}
                        </span>
                      </div>
                      <div className="mt-1.5 flex items-center justify-between gap-2">
                        <span className="text-sm text-slate-500">
                          {item.status}{item.assignedStaff ? ` / ${item.assignedStaff}` : ""}
                        </span>
                        <span
                          className={`shrink-0 rounded px-2 py-0.5 text-sm font-bold tabular-nums ${
                            liveSec >= 180 ? "bg-red-200 text-red-900" : liveSec >= 60 ? "bg-amber-200 text-amber-900" : "bg-slate-200 text-slate-700"
                          }`}
                          title="顾客等待时长（秒），超 60s 黄牌、超 180s 红牌"
                        >
                          等待 {liveSec}s
                        </span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        {/* 右侧：对话区 - 充分利用空间 */}
        <section className="flex-1 flex flex-col bg-slate-100/50 min-w-0">
          {!selected ? (
            <div className="flex-1 flex items-center justify-center text-slate-500 p-8">
              <div className="text-center max-w-md">
                <p className="text-lg font-medium">选择左侧会话开始回复</p>
                <p className="mt-2 text-base">点击会话可查看对话并发送消息</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-6 flex flex-col">
              <div className="rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col flex-1 min-h-0">
                <div className="flex items-center justify-between gap-4 flex-wrap px-4 py-3 border-b border-slate-200">
                  <p className="text-base font-medium text-slate-700">会话：{selected.visitorSessionId}</p>
                  <span className="flex items-center gap-2">
                    {wsConnected ? (
                      <span className="text-xs text-emerald-600 font-medium">已连接</span>
                    ) : (
                      <span className="text-xs text-amber-600 font-medium">未连接</span>
                    )}
                    <span
                      className={`rounded-lg px-3 py-1.5 text-sm font-bold tabular-nums ${
                        getLiveWaitingSeconds(selected) >= 180 ? "bg-red-200 text-red-900" : getLiveWaitingSeconds(selected) >= 60 ? "bg-amber-200 text-amber-900" : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      等待 {getLiveWaitingSeconds(selected)}s
                    </span>
                  </span>
                </div>
                <p className="px-4 py-1 text-sm text-slate-500">状态 {selected.status}{selected.assignedStaff ? ` · 处理人 ${selected.assignedStaff}` : ""}</p>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
                  {messages.length === 0 ? (
                    <p className="text-slate-500 text-sm">暂无消息（发送后与访客的对话将在此显示）</p>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`rounded-lg px-3 py-2 max-w-[85%] ${msg.senderType === "admin" ? "ml-auto bg-sky-100 text-sky-900" : msg.senderType === "visitor" ? "mr-auto bg-slate-100 text-slate-900" : "mx-auto bg-amber-50 text-amber-900"}`}
                      >
                        <p className="text-[10px] font-medium text-slate-500 mb-0.5">{msg.senderType}</p>
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.bodyText}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString() : ""}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* 底部：系统回复(Template) 下拉 + 输入；Hotkey 隐藏，按 # 唤出 */}
      <div className="shrink-0 border-t border-slate-200 bg-white relative">
        <div className="flex items-center gap-2 px-2 py-1 border-b border-slate-100">
          <span className="shrink-0 text-[10px] font-medium uppercase text-slate-400">系统回复</span>
          <select
            className="shrink-0 rounded border border-emerald-400/80 bg-emerald-50/80 px-1.5 py-0.5 text-[10px] font-medium text-emerald-800 hover:bg-emerald-100"
            onChange={(e) => {
              const v = e.target.value;
              e.target.value = "";
              if (v === MANAGE_TEMPLATES_VALUE) {
                router.push("/admin/chat/templates");
                return;
              }
              const t = templates.find((x) => x.id === v);
              if (t) applyTemplate(t.bodyText);
            }}
            value=""
          >
            <option value="">(Select Template)</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
            <option value={MANAGE_TEMPLATES_VALUE}>— 编辑/新增模板 —</option>
          </select>
          <span className="shrink-0 text-[10px] text-slate-400">按 # 唤出热键</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50/50 relative">
          {showHotkeyPanel && (
            <div className="absolute bottom-full left-2 right-14 mb-1 max-h-48 overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg z-10">
              <p className="px-2 py-1 text-[10px] font-medium text-slate-500">选择热键插入</p>
              {templates.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => applyHotkey(t.bodyText)}
                  className="block w-full text-left px-3 py-1.5 text-xs text-slate-800 hover:bg-slate-100"
                >
                  {t.title}
                </button>
              ))}
              <Link href="/admin/chat/templates" className="block px-3 py-1.5 text-xs text-sky-600 hover:bg-slate-100">
                热键设置 →
              </Link>
            </div>
          )}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); sendMessage(); } }}
            placeholder="输入消息… 按 # 唤出热键，Enter 发送"
            className="flex-1 min-w-0 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
          <button type="button" onClick={sendMessage} className="rounded-lg p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-700" title="发送">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </button>
          <button type="button" className="rounded-lg p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-700" title="图片">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" /></svg>
          </button>
          <button type="button" className="rounded-lg p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-700" title="附件">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
