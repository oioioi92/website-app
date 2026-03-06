"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { io, type Socket } from "socket.io-client";
import { useLocale } from "@/lib/i18n/context";

type QueueItem = {
  id: string;
  visitorSessionId: string;
  status: string;
  assignedStaff: string | null;
  lastMessageTime: string | null;
  lastMessageText?: string | null;
  waitingSeconds: number;
  firstResponseTimeSec: number | null;
  pendingCustomerMsgAt?: string | null;
  firstReplyAt?: string | null;
  lastWaitMs?: number | null;
  openedAt?: string | null;
  openedByAgentId?: string | null;
  visitorName?: string | null;
  visitorEmail?: string | null;
  visitorPhone?: string | null;
  visitorIp?: string | null;
  visitorUa?: string | null;
  entryUrl?: string | null;
  referrer?: string | null;
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
const DEFAULT_QUICK_REPLIES_KEY = "admin_chat_default_quick_replies";
const SESSION_PIN_KEY = "admin_chat_session_pin";

const PIN_OPTIONS = [
  { value: "DEPOSIT", labelKey: "admin.chat.pinDeposit" },
  { value: "WITHDRAW", labelKey: "admin.chat.pinWithdraw" },
  { value: "GAME_BONUS", labelKey: "admin.chat.pinGameBonus" },
] as const;

export function AdminLiveChatClient() {
  const router = useRouter();
  const { t } = useLocale();
  const [items, setItems] = useState<QueueItem[]>([]);
  const [queueFetchedAt, setQueueFetchedAt] = useState<number>(0);
  const [tick, setTick] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("ALL");
  const [inputText, setInputText] = useState("");
  const [quickRepliesInput, setQuickRepliesInput] = useState("");
  const [defaultQuickRepliesSaved, setDefaultQuickRepliesSaved] = useState(false);
  const [defaultQuickRepliesPreview, setDefaultQuickRepliesPreview] = useState<string>("");
  const [templates, setTemplates] = useState<Template[]>(FALLBACK_TEMPLATES);
  const [hotkeyPanelOpen, setHotkeyPanelOpen] = useState(false);
  const [queueError, setQueueError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [wsConnected, setWsConnected] = useState(false);
  const [visitorInfoOpen, setVisitorInfoOpen] = useState(false);
  const [visitorLocation, setVisitorLocation] = useState<string | null>(null);
  const [optionsExpanded, setOptionsExpanded] = useState(false);
  const [statusLoading, setStatusLoading] = useState<string | null>(null);
  const [waitLogsOpen, setWaitLogsOpen] = useState(false);
  const [waitLogs, setWaitLogs] = useState<Array<{ customerMsgAt: string; agentReplyAt: string; waitMs: number; agentId: string }>>([]);
  const [sessionPin, setSessionPin] = useState<Record<string, string>>({});
  const socketRef = useRef<Socket | null>(null);
  const adminIdRef = useRef<string | null>(null);
  const messagesScrollRef = useRef<HTMLDivElement>(null);

  // 打开会话或消息更新时滚动到底部，显示最新一条消息
  useEffect(() => {
    const el = messagesScrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [selectedId, messages]);

  // 进入页面时从本地恢复「默认选项」，不用每次重填
  useEffect(() => {
    try {
      const saved = typeof localStorage !== "undefined" ? localStorage.getItem(DEFAULT_QUICK_REPLIES_KEY) : null;
      if (saved && typeof saved === "string" && saved.trim()) {
        setQuickRepliesInput(saved.trim());
        setDefaultQuickRepliesPreview(saved.trim());
      }
    } catch {
      // ignore
    }
  }, []);

  // Pin 分类：从 localStorage 恢复
  useEffect(() => {
    try {
      const raw = typeof localStorage !== "undefined" ? localStorage.getItem(SESSION_PIN_KEY) : null;
      if (raw) {
        const parsed = JSON.parse(raw) as Record<string, string>;
        if (parsed && typeof parsed === "object") setSessionPin(parsed);
      }
    } catch {
      // ignore
    }
  }, []);
  const setPinForConversation = (conversationId: string, value: string) => {
    setSessionPin((prev) => {
      const next = { ...prev };
      if (value) next[conversationId] = value;
      else delete next[conversationId];
      try {
        localStorage.setItem(SESSION_PIN_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  function loadQueue() {
    setLoading(true);
    setQueueError(null);
    fetch("/api/admin/chat/queue?sort=desc")
      .then((r) => r.json())
      .then((d) => {
        const list = d.items ?? [];
        setItems(list);
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

  // 队列轮询：30s 一次，页面不可见时暂停，减少 API 消耗
  useEffect(() => {
    loadQueue();
    loadTemplates();
    let t: ReturnType<typeof setInterval> | null = null;
    const startPoll = () => {
      if (!t) t = setInterval(loadQueue, 30000);
    };
    const stopPoll = () => {
      if (t) {
        clearInterval(t);
        t = null;
      }
    };
    const onVisibility = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") startPoll();
      else stopPoll();
    };
    startPoll();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stopPoll();
      document.removeEventListener("visibilitychange", onVisibility);
    };
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
    // 优先用当前输入，为空则用「默认选项」（设过一次就不用每次填）
    const rawOptions =
      quickRepliesInput.trim() ||
      (typeof localStorage !== "undefined" ? localStorage.getItem(DEFAULT_QUICK_REPLIES_KEY) || "" : "");
    const quickReplies = rawOptions
      .split(/[,，、]/)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 10);
    socketRef.current.emit("admin_message", {
      conversationId: selectedId,
      bodyText: text,
      ...(quickReplies.length > 0 ? { quickReplies } : {})
    });
    setInputText("");
    setTimeout(() => {
      loadQueue();
      if (waitLogsOpen && selectedId) void fetchWaitLogs(selectedId);
    }, 800);
  };

  const saveDefaultQuickReplies = () => {
    const v = quickRepliesInput.trim();
    try {
      if (v) {
        localStorage.setItem(DEFAULT_QUICK_REPLIES_KEY, v);
        setDefaultQuickRepliesPreview(v);
      } else {
        localStorage.removeItem(DEFAULT_QUICK_REPLIES_KEY);
        setDefaultQuickRepliesPreview("");
      }
      setDefaultQuickRepliesSaved(true);
      setTimeout(() => setDefaultQuickRepliesSaved(false), 2000);
    } catch {
      // ignore
    }
  };

  const patchStatus = async (conversationId: string, status: "open" | "closed") => {
    setStatusLoading(conversationId);
    try {
      const res = await fetch(`/api/admin/chat/conversations/${conversationId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status })
      });
      if (res.ok) loadQueue();
    } finally {
      setStatusLoading(null);
    }
  };

  const fetchWaitLogs = async (conversationId: string) => {
    const res = await fetch(`/api/admin/chat/conversations/${conversationId}/wait-logs`, { credentials: "include" });
    if (!res.ok) return;
    const data = (await res.json()) as { logs?: Array<{ customerMsgAt: string; agentReplyAt: string; waitMs: number; agentId: string }> };
    setWaitLogs(data.logs ?? []);
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

  /** 会话列表与详情头部的顾客展示名：优先姓名/邮箱/电话，否则「访客 #短ID」便于多顾客时区分 */
  const getVisitorDisplayLabel = (item: QueueItem) => {
    const name = (item.visitorName ?? "").trim();
    const email = (item.visitorEmail ?? "").trim();
    const phone = (item.visitorPhone ?? "").trim();
    if (name) return name;
    if (email) return email;
    if (phone) return phone;
    const sid = (item.visitorSessionId ?? "").trim();
    const shortId = sid.length > 8 ? sid.slice(-6) : sid || "—";
    return shortId ? `${t("admin.chat.visitor")} #${shortId}` : t("admin.chat.visitor");
  };

  /** 用于「查看顾客资料」跳转玩家列表的搜索词：优先电话、邮箱、姓名 */
  const getProfileSearchQuery = (item: QueueItem) => {
    const s = (x: string | null | undefined) => (x ?? "").trim();
    return s(item.visitorPhone) || s(item.visitorEmail) || s(item.visitorName) || "";
  };

  // 等待秒数：优先用服务端时间戳（刷新不归零），否则用拉取时的 waitingSeconds + 经过秒数
  const getLiveWaitingSeconds = (item: QueueItem) => {
    if (item.pendingCustomerMsgAt && !item.firstReplyAt) {
      const start = new Date(item.pendingCustomerMsgAt).getTime();
      return Math.floor((Date.now() - start) / 1000);
    }
    if (!queueFetchedAt) return item.waitingSeconds;
    const elapsed = Math.floor((Date.now() - queueFetchedAt) / 1000);
    return item.waitingSeconds + elapsed;
  };

  // 仅当存在「客户新消息且客服未回复」时才显示等待计时；无待回复消息时不计时
  const getTimeLabel = (item: QueueItem, liveSec: number) => {
    const hasPending = item.pendingCustomerMsgAt != null && item.firstReplyAt == null;
    if (!hasPending) {
      if (item.status === "closed") return { text: t("admin.chat.closedStatus"), isWaiting: false };
      if (item.firstResponseTimeSec != null) return { text: `${t("admin.chat.firstReplyTimeLabel")} ${Math.round(item.firstResponseTimeSec)}s`, isWaiting: false };
      return { text: t("admin.chat.receivedLabel"), isWaiting: false };
    }
    if (liveSec > 0) {
      const prefix = liveSec >= 180 ? t("admin.chat.urgentWaitPrefix") : liveSec >= 60 ? t("admin.chat.warnWaitPrefix") : "";
      return { text: `${prefix}${t("admin.chat.waitSecLabel")} ${liveSec}s`, isWaiting: true };
    }
    return { text: `${t("admin.chat.waitSecLabel")} 0s`, isWaiting: true };
  };

  // 选中会话变化时收起访客信息、位置与等待记录
  useEffect(() => {
    setVisitorInfoOpen(false);
    setVisitorLocation(null);
    setWaitLogsOpen(false);
    setWaitLogs([]);
  }, [selectedId]);

  // 展开访客信息时按 IP 拉取位置（仅公网 IP）
  useEffect(() => {
    if (!visitorInfoOpen || !selected?.visitorIp) {
      setVisitorLocation(null);
      return;
    }
    const ip = selected.visitorIp.trim();
    if (!ip || ip === "0.0.0.0" || ip === "127.0.0.1" || ip.startsWith("192.168.") || ip.startsWith("10.")) {
      setVisitorLocation(null);
      return;
    }
    let cancelled = false;
    fetch(`/api/admin/chat/geo?ip=${encodeURIComponent(ip)}`, { credentials: "include" })
      .then((r) => r.json())
      .then((d: { location?: string | null }) => {
        if (!cancelled && d?.location) setVisitorLocation(d.location);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [visitorInfoOpen, selected?.visitorIp]);

  return (
    <div className="flex flex-1 flex-col min-h-0 min-w-0 bg-slate-50 overflow-hidden">
      {/* 顶栏 */}
      <header className="flex shrink-0 items-center gap-3 bg-indigo-600 px-4 py-2.5 text-white shadow">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </span>
        <span className="text-sm font-semibold">{t("admin.nav.chat")}</span>
        <button
          type="button"
          onClick={() => setHotkeyPanelOpen((v) => !v)}
          className="ml-auto rounded-lg bg-white/20 px-2.5 py-1.5 text-xs font-medium hover:bg-white/30"
          title={t("admin.chat.hotkeyTitle")}
        >
          #
        </button>
      </header>

      {queueError && (
        <div className="shrink-0 bg-amber-100 border-b border-amber-300 px-4 py-2 text-sm text-amber-800">
          {t("admin.chat.queueErrorPrefix")}{queueError}{t("admin.chat.queueErrorSuffix")}
        </div>
      )}
      <div className="flex flex-1 min-h-0">
        {/* 左侧：会话列表（桌面版：Customer #N + last msg + waiting timer，NO IP） */}
        <aside className="w-80 shrink-0 border-r border-slate-200 bg-white overflow-y-auto flex flex-col">
          <div className="shrink-0 px-3 py-2 border-b border-slate-100">
            <p className="text-xs font-semibold text-amber-700">Conversations</p>
            <p className="text-[10px] text-slate-500 mt-0.5 hidden lg:block">List row: short customer info + last msg + waiting timer (NO IP)</p>
          </div>
          {loading && items.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">{t("admin.site.loading")}</div>
          ) : items.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">{t("admin.chat.noConversations")}</div>
          ) : (
            <ul className="p-1.5 space-y-0.5">
              {items.map((item) => {
                const liveSec = getLiveWaitingSeconds(item);
                const timeLabel = getTimeLabel(item, liveSec);
                const isUrgent = timeLabel.isWaiting && liveSec >= 180;
                const isWarn = timeLabel.isWaiting && liveSec >= 60 && liveSec < 180;
                const isSelected = selectedId === item.id;
                const isClosed = item.status === "closed";
                // DESKTOP-UI-DESIGN-SPEC §8: NO "system auto capture" text in list
                let lastMsg = (item.lastMessageText ?? "").trim();
                if (/system\s*auto|auto\s*capture|captured\s*automatically/i.test(lastMsg)) lastMsg = "";
                const lastMsgShort = lastMsg.length > 28 ? `${lastMsg.slice(0, 28)}…` : lastMsg;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(item.id)}
                      className={`w-full text-left rounded-md px-2.5 py-1.5 transition-all shadow-sm border leading-tight ${
                        isSelected
                          ? "bg-indigo-50 border-indigo-200 ring-1 ring-indigo-100"
                          : isClosed
                            ? "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                            : isUrgent
                              ? "bg-red-50/80 border-red-200 hover:bg-red-50"
                              : isWarn
                                ? "bg-amber-50/80 border-amber-200 hover:bg-amber-50"
                                : "bg-white border-slate-100 hover:bg-slate-50 hover:border-slate-200"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1.5 min-h-0">
                        <span className="text-xs font-semibold text-slate-800 truncate" title={item.visitorSessionId}>{getVisitorDisplayLabel(item)}</span>
                        <span className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] text-slate-400">
                            {item.lastMessageTime ? new Date(item.lastMessageTime).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : "—"}
                          </span>
                          <span
                            className={`rounded px-1 py-0.5 text-[10px] font-bold tabular-nums ${
                              timeLabel.isWaiting && liveSec >= 180
                                ? "bg-red-200/80 text-red-900"
                                : timeLabel.isWaiting && liveSec >= 60
                                  ? "bg-amber-200/80 text-amber-900"
                                  : "bg-slate-100 text-slate-600"
                            }`}
                            title={timeLabel.isWaiting ? t("admin.chat.timerTooltipWaiting") : t("admin.chat.timerTooltipReplied")}
                          >
                            {timeLabel.text}
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-1.5 mt-0.5">
                        <span className="text-[11px] text-slate-500 truncate min-w-0" title={lastMsg}>
                          {lastMsgShort || "—"}
                        </span>
                        {/* Pin 分类标签 + 状态 */}
                        <span className="flex items-center gap-1 shrink-0">
                          {sessionPin[item.id] && (
                            <span className="rounded px-1 py-0.5 text-[9px] font-medium bg-indigo-100 text-indigo-700">
                              {sessionPin[item.id] === "DEPOSIT" ? t("admin.chat.pinDeposit") : sessionPin[item.id] === "WITHDRAW" ? t("admin.chat.pinWithdraw") : t("admin.chat.pinGameBonus")}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400">
                            {item.status === "closed" ? "closed" : ""}{item.assignedStaff ? ` · ${item.assignedStaff}` : ""}
                          </span>
                        </span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>

        {/* 中间：Chat Panel（桌面版三栏之中栏） */}
        <section className="flex-1 flex flex-col bg-slate-100/60 min-w-0">
          <div className="hidden lg:block shrink-0 px-3 py-2 border-b border-slate-200 bg-white">
            <p className="text-xs font-semibold text-amber-700">Chat Panel</p>
          </div>
          {!selected ? (
            <div className="flex-1 flex items-center justify-center text-slate-500 p-8">
              <div className="text-center max-w-sm">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-200/80 text-slate-400">
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <p className="text-base font-medium text-slate-600">{t("admin.chat.selectSessionToReply")}</p>
                <p className="mt-1.5 text-sm text-slate-400">{t("admin.chat.clickSessionHint")}</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 flex flex-col">
              <div className="rounded-2xl border border-slate-200 bg-white shadow-md flex flex-col flex-1 min-h-0 overflow-hidden">
                {/* 头部一格：单行紧凑 会话 | 状态 | 访客信息 | 已连接 等待 */}
                <div className="px-4 py-2.5 bg-slate-50/50 border-b border-slate-100">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <span className="text-sm font-semibold text-slate-800">{t("admin.chat.sessionLabel")}：{getVisitorDisplayLabel(selected)}</span>
                    <Link
                      href={getProfileSearchQuery(selected) ? `/admin/players?search=${encodeURIComponent(getProfileSearchQuery(selected))}` : "/admin/players"}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
                    >
                      {t("admin.chat.viewProfile")}
                    </Link>
                    {(selected.pendingCustomerMsgAt != null && selected.firstReplyAt == null)
                      ? <span className="text-[11px] text-amber-600 font-medium">{t("admin.chat.customerPending")}</span>
                      : selected.status === "closed"
                        ? <span className="text-[11px] text-slate-500">{t("admin.chat.closedStatus")}</span>
                        : <span className="text-[11px] text-slate-500">{t("admin.chat.replied")}</span>}
                    {selected.assignedStaff && <span className="text-[11px] text-slate-400">{selected.assignedStaff}</span>}
                    {(selected.visitorIp || selected.visitorUa || selected.entryUrl || selected.referrer || selected.visitorName || selected.visitorEmail || selected.visitorPhone) && (
                      <button
                        type="button"
                        onClick={() => setVisitorInfoOpen((v) => !v)}
                        className="lg:hidden flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-800"
                      >
                        {t("admin.chat.visitorInfo")}
                        <span className="text-slate-400 text-xs">{visitorInfoOpen ? t("admin.chat.collapse") : t("admin.chat.expand")}</span>
                      </button>
                    )}
                    <span className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={!!statusLoading}
                        onClick={() => patchStatus(selected.id, "open")}
                        className="rounded border border-slate-300 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                      >
                        Open
                      </button>
                      {selected.status !== "closed" && (
                        <button
                          type="button"
                          disabled={!!statusLoading}
                          onClick={() => patchStatus(selected.id, "closed")}
                          className="rounded border border-slate-300 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                        >
                          Close
                        </button>
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setWaitLogsOpen((v) => !v);
                        if (!waitLogsOpen && selected) void fetchWaitLogs(selected.id);
                      }}
                      className="text-[11px] font-medium text-slate-500 hover:text-slate-700"
                    >
                      {waitLogsOpen ? `${t("admin.chat.waitLogs")} ▼` : `${t("admin.chat.waitLogs")} ▶`}
                    </button>
                    <span className="inline-flex items-center gap-1 flex-wrap">
                      <span className="text-[10px] text-slate-400 mr-0.5">{t("admin.chat.pinCategory")}:</span>
                      {PIN_OPTIONS.map((opt) => {
                        const isActive = sessionPin[selected.id] === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setPinForConversation(selected.id, isActive ? "" : opt.value)}
                            className={`rounded border px-2 py-0.5 text-[10px] font-medium ${
                              isActive
                                ? "border-indigo-400 bg-indigo-100 text-indigo-800"
                                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            {t(opt.labelKey)}
                          </button>
                        );
                      })}
                    </span>
                    <span className="ml-auto flex items-center gap-2">
                      {wsConnected ? (
                        <span className="text-xs text-emerald-600 font-medium">{t("admin.chat.connected")}</span>
                      ) : (
                        <span className="text-xs text-amber-600 font-medium">{t("admin.chat.notConnected")}</span>
                      )}
                      {(() => {
                        const sec = getLiveWaitingSeconds(selected);
                        const label = getTimeLabel(selected, sec);
                        return (
                          <span
                            className={`rounded px-2 py-0.5 text-xs font-bold tabular-nums ${
                              label.isWaiting && sec >= 180 ? "bg-red-200 text-red-900" : label.isWaiting && sec >= 60 ? "bg-amber-200 text-amber-900" : "bg-slate-200 text-slate-700"
                            }`}
                            title={label.isWaiting ? t("admin.chat.timerTooltipLabel") : t("admin.chat.timerTooltipReplied")}
                          >
                            {label.text}
                          </span>
                        );
                      })()}
                    </span>
                  </div>
                  {(() => {
                    const sec = getLiveWaitingSeconds(selected);
                    const label = getTimeLabel(selected, sec);
                    if (!label.isWaiting) return null;
                    if (sec >= 180)
                      return (
                        <div className="mt-2 rounded bg-red-100 border border-red-300 px-3 py-1.5 text-sm font-semibold text-red-900">
                          {t("admin.chat.urgentNotice")}
                        </div>
                      );
                    if (sec >= 60)
                      return (
                        <div className="mt-2 rounded bg-amber-50 border border-amber-300 px-3 py-1.5 text-sm font-medium text-amber-900">
                          {t("admin.chat.warnNotice")}
                        </div>
                      );
                    return null;
                  })()}
                  {(selected.visitorIp || selected.visitorUa || selected.entryUrl || selected.referrer || selected.visitorName || selected.visitorEmail || selected.visitorPhone) && visitorInfoOpen && (
                    <div className="lg:hidden mt-2 rounded-lg bg-white border border-slate-100 p-3 grid gap-2 text-sm text-slate-700">
                      {selected.visitorIp && (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 shrink-0">IP</span>
                          <span className="font-mono text-xs truncate">{selected.visitorIp}</span>
                        </div>
                      )}
                      {visitorLocation && (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 shrink-0">{t("admin.chat.location")}</span>
                          <span className="truncate">{visitorLocation}</span>
                        </div>
                      )}
                      {selected.visitorUa && (
                        <div>
                          <span className="text-slate-400 text-xs block mb-0.5">{t("admin.chat.deviceBrowser")}</span>
                          <p className="text-xs break-all text-slate-600" title={selected.visitorUa}>{selected.visitorUa.length > 80 ? `${selected.visitorUa.slice(0, 80)}…` : selected.visitorUa}</p>
                        </div>
                      )}
                      {selected.entryUrl && (
                        <div className="flex items-start gap-2">
                          <span className="text-slate-400 shrink-0 text-xs">{t("admin.chat.sourcePage")}</span>
                          <span className="text-xs truncate text-slate-600" title={selected.entryUrl}>{selected.entryUrl}</span>
                        </div>
                      )}
                      {(selected.visitorName || selected.visitorEmail || selected.visitorPhone) && (
                        <div className="pt-2 mt-1 border-t border-slate-200/60 space-y-1">
                          <p className="text-xs text-slate-500">{t("admin.chat.fromVisitor")}</p>
                          {selected.visitorName && <p>{t("admin.chat.name")}：{selected.visitorName}</p>}
                          {selected.visitorEmail && <p>{t("admin.chat.email")}：{selected.visitorEmail}</p>}
                          {selected.visitorPhone && <p>{t("admin.chat.phone")}：{selected.visitorPhone}</p>}
                        </div>
                      )}
                    </div>
                  )}
                  {waitLogsOpen && (
                    <div className="px-4 py-2 border-b border-slate-100 bg-slate-50/30">
                      <p className="text-[11px] font-medium text-slate-500 mb-1.5">{t("admin.chat.waitLogsTitle")}</p>
                      {waitLogs.length === 0 ? (
                        <p className="text-xs text-slate-400">{t("admin.chat.noWaitLogs")}</p>
                      ) : (
                        <div className="overflow-x-auto max-h-32 overflow-y-auto">
                          <table className="w-full text-[11px] text-slate-700">
                            <thead>
                              <tr className="border-b border-slate-200">
                                <th className="text-left py-1 pr-2">{t("admin.chat.customerMsgTime")}</th>
                                <th className="text-left py-1 pr-2">{t("admin.chat.agentReplyTime")}</th>
                                <th className="text-left py-1 pr-2">{t("admin.chat.wait")}</th>
                                <th className="text-left py-1">{t("admin.chat.agent")}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {waitLogs.map((log, i) => (
                                <tr key={i} className="border-b border-slate-100">
                                  <td className="py-1 pr-2">{new Date(log.customerMsgAt).toLocaleString("zh-CN")}</td>
                                  <td className="py-1 pr-2">{new Date(log.agentReplyAt).toLocaleString("zh-CN")}</td>
                                  <td className="py-1 pr-2 font-mono">{Math.round(log.waitMs / 1000)}s</td>
                                  <td className="py-1">{log.agentId}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div ref={messagesScrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0 bg-slate-50/30">
                  {messages.length === 0 ? (
                    <p className="text-slate-400 text-sm text-center py-8">{t("admin.chat.noMessages")}</p>
                  ) : (
                    messages.map((msg) => {
                      const isAdmin = msg.senderType === "admin";
                      const isVisitor = msg.senderType === "visitor";
                      const isSystem = msg.senderType === "system";
                      return (
                        <div
                          key={msg.id}
                          className={`flex gap-2.5 ${isAdmin ? "flex-row-reverse" : "flex-row"} ${isSystem ? "justify-center" : ""}`}
                        >
                          {!isSystem && (
                            <span
                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                                isAdmin ? "bg-indigo-500 text-white" : "bg-slate-300 text-slate-600"
                              }`}
                            >
                              {isAdmin ? t("admin.chat.agentLabel").slice(0, 1) : t("admin.chat.visitor").slice(0, 1)}
                            </span>
                          )}
                          <div
                            className={`max-w-[78%] rounded-2xl px-4 py-2.5 shadow-sm border ${
                              isSystem
                                ? "bg-amber-50/90 border-amber-200/60 text-amber-900 text-sm"
                                : isAdmin
                                  ? "rounded-tr-md bg-indigo-50 border-indigo-100 text-slate-800"
                                  : "rounded-tl-md bg-white border-slate-200 text-slate-800"
                            }`}
                          >
                            {!isSystem && (
                              <p className="text-[10px] font-medium text-slate-400 mb-1">
                                {isAdmin ? t("admin.chat.agentLabel") : t("admin.chat.visitor")}
                              </p>
                            )}
                            <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{msg.bodyText}</p>
                            <p className="text-[10px] text-slate-400 mt-1.5">
                              {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : ""}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </section>
        {/* 桌面版右侧：User Info (Drawer)，IP 仅在此处显示 */}
        {selected && (
          <aside id="chat-user-info-drawer" className="hidden w-72 shrink-0 flex-col border-l border-slate-200 bg-white overflow-y-auto lg:flex">
            <div className="shrink-0 px-3 py-2 border-b border-slate-100">
              <p className="text-xs font-semibold text-amber-700">User Info (Drawer)</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{t("admin.chat.ipOnlyInDrawer")}</p>
              <Link
                href={getProfileSearchQuery(selected) ? `/admin/players?search=${encodeURIComponent(getProfileSearchQuery(selected))}` : "/admin/players"}
                className="mt-2 inline-block rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
              >
                {t("admin.chat.viewInPlayerList")}
              </Link>
            </div>
            <div className="p-3 space-y-2 text-sm text-slate-700">
              {selected.visitorIp && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 shrink-0">IP</span>
                  <span className="font-mono text-xs truncate">{selected.visitorIp}</span>
                </div>
              )}
              {visitorLocation && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 shrink-0">{t("admin.chat.location")}</span>
                  <span className="truncate text-xs">{visitorLocation}</span>
                </div>
              )}
              {selected.visitorUa && (
                <div>
                  <span className="text-slate-400 text-xs block mb-0.5">{t("admin.chat.deviceBrowser")}</span>
                  <p className="text-xs break-all text-slate-600" title={selected.visitorUa}>{selected.visitorUa.length > 80 ? `${selected.visitorUa.slice(0, 80)}…` : selected.visitorUa}</p>
                </div>
              )}
              {selected.entryUrl && (
                <div className="flex items-start gap-2">
                  <span className="text-slate-400 shrink-0 text-xs">{t("admin.chat.sourcePage")}</span>
                  <span className="text-xs truncate text-slate-600" title={selected.entryUrl}>{selected.entryUrl}</span>
                </div>
              )}
              {(selected.visitorName || selected.visitorEmail || selected.visitorPhone) && (
                <div className="pt-2 mt-1 border-t border-slate-200/60 space-y-1">
                  <p className="text-xs text-slate-500">{t("admin.chat.fromVisitor")}</p>
                  {selected.visitorName && <p className="text-xs">{t("admin.chat.name")}：{selected.visitorName}</p>}
                  {selected.visitorEmail && <p className="text-xs">{t("admin.chat.email")}：{selected.visitorEmail}</p>}
                  {selected.visitorPhone && <p className="text-xs">{t("admin.chat.phone")}：{selected.visitorPhone}</p>}
                </div>
              )}
              {!selected.visitorIp && !selected.visitorUa && !selected.entryUrl && !selected.visitorName && !selected.visitorEmail && !selected.visitorPhone && (
                <p className="text-xs text-slate-400">—</p>
              )}
            </div>
          </aside>
        )}
      </div>

      {/* 底部：模板 + 输入区（紧凑布局，选项可折叠） */}
      <div className="shrink-0 border-t border-slate-200 bg-white shadow-[0_-4px_12px_rgba(0,0,0,0.04)] relative">
        <div className="flex flex-wrap items-center gap-1.5 px-2.5 py-1 border-b border-slate-100 bg-slate-50/80">
          <span className="shrink-0 text-[10px] font-medium text-slate-500">{t("admin.chat.quickReply")}</span>
          <select
            className="shrink-0 rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-800 hover:bg-emerald-100 focus:outline-none focus:ring-1 focus:ring-emerald-300"
            onChange={(e) => {
              const v = e.target.value;
              e.target.value = "";
              if (v === MANAGE_TEMPLATES_VALUE) {
                router.push("/admin/chat/templates");
                return;
              }
              const tmpl = templates.find((x) => x.id === v);
              if (tmpl) applyTemplate(tmpl.bodyText);
            }}
            value=""
          >
            <option value="">{t("admin.chat.selectTemplate")}</option>
            {templates.map((tmpl) => (
              <option key={tmpl.id} value={tmpl.id}>{tmpl.title}</option>
            ))}
            <option value={MANAGE_TEMPLATES_VALUE}>{t("admin.chat.manageTemplates")}</option>
          </select>
          <button
            type="button"
            onClick={() => setOptionsExpanded((x) => !x)}
            className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium ${optionsExpanded ? "bg-indigo-100 text-indigo-700" : "text-slate-500 hover:bg-slate-100"}`}
            title={t("admin.chat.optionsHint")}
          >
            {t("admin.chat.optionsLabel")} {optionsExpanded ? "▲" : "▼"}
          </button>
          <span className="shrink-0 text-[10px] text-slate-400">{t("admin.chat.hotkey")}</span>
        </div>
        {optionsExpanded && (
          <div className="border-b border-slate-100 bg-slate-50/30 px-2.5 py-1 space-y-1">
            <div className="flex gap-1.5 items-center flex-wrap">
              <input
                type="text"
                value={quickRepliesInput}
                onChange={(e) => setQuickRepliesInput(e.target.value)}
                placeholder={t("admin.chat.optionsPlaceholder")}
                className="flex-1 min-w-[140px] rounded border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-600 placeholder-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-200"
              />
              <button
                type="button"
                onClick={saveDefaultQuickReplies}
                className="shrink-0 rounded border border-slate-300 bg-white px-2 py-1 text-[10px] font-medium text-slate-600 hover:bg-slate-50"
                title={t("admin.chat.optionsHint")}
              >
                {defaultQuickRepliesSaved ? t("admin.chat.setAsDefaultDone") : t("admin.chat.setAsDefault")}
              </button>
            </div>
            {defaultQuickRepliesPreview && (
              <p className="text-[10px] text-slate-400">{t("admin.chat.currentDefault")}{defaultQuickRepliesPreview}</p>
            )}
          </div>
        )}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white relative">
          {showHotkeyPanel && (
            <div className="absolute bottom-full left-2.5 right-2.5 mb-1 max-h-40 overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-xl z-10">
              <p className="px-2 py-0.5 text-[10px] font-medium text-slate-500">{t("admin.chat.hotkeyPanelTitle")}</p>
              {templates.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => applyHotkey(t.bodyText)}
                  className="block w-full text-left px-2 py-1 text-[11px] text-slate-700 hover:bg-indigo-50"
                >
                  {t.title}
                </button>
              ))}
              <Link href="/admin/chat/templates" className="block px-2 py-1 text-[11px] text-indigo-600 hover:bg-indigo-50">
                {t("admin.chat.hotkeySettings")}
              </Link>
            </div>
          )}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); sendMessage(); } }}
            placeholder={t("admin.chat.inputPlaceholder")}
            aria-label={t("admin.chat.replyContentLabel")}
            className="min-w-0 flex-1 rounded border-2 border-slate-200 bg-slate-50/50 px-2.5 py-1.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-100"
          />
          <button type="button" onClick={sendMessage} className="rounded bg-indigo-600 p-1.5 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-400 shrink-0" title={t("admin.chat.send")}>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </button>
          <button type="button" className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 shrink-0" title={t("admin.chat.image")}>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" /></svg>
          </button>
          <button type="button" className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 shrink-0" title={t("admin.chat.attachment")}>
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
}
