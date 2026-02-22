"use client";

import { useEffect, useState } from "react";

type Item = {
  id: string;
  visitorSessionId: string;
  status: string;
  assignedStaff: string | null;
  lastMessageTime: string | null;
  waitingSeconds: number;
  firstResponseTimeSec: number | null;
};

export function AdminChatQueueClient() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    setError("");
    fetch("/api/admin/chat/queue?sort=desc")
      .then((r) => r.json())
      .then((d) => {
        setItems(d.items ?? []);
        if (d.error) setError(d.error);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, []);

  if (loading && items.length === 0) return <p className="mt-4 text-slate-500">加载中…</p>;
  if (error && items.length === 0) return <p className="mt-4 text-amber-600">队列暂不可用：{error}</p>;

  return (
    <div className="mt-4">
      {items.length === 0 ? (
        <p className="text-slate-500">当前无排队会话（或未配置 CHAT_SERVER_* 与 chat-server 队列接口）</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/90">
                <th className="px-4 py-3.5 text-left text-[13px] font-semibold uppercase tracking-wide text-slate-800">User / Session</th>
                <th className="px-4 py-3.5 text-left text-[13px] font-semibold uppercase tracking-wide text-slate-800">最后消息时间</th>
                <th className="px-4 py-3.5 text-right text-[13px] font-semibold uppercase tracking-wide text-slate-800">等待(秒)</th>
                <th className="px-4 py-3.5 text-right text-[13px] font-semibold uppercase tracking-wide text-slate-800">首次响应(秒)</th>
                <th className="px-4 py-3.5 text-left text-[13px] font-semibold uppercase tracking-wide text-slate-800">状态 / 处理人</th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => {
                const warn = r.waitingSeconds >= 180 ? "bg-red-100" : r.waitingSeconds >= 60 ? "bg-amber-50" : "";
                return (
                  <tr key={r.id} className={`border-b border-slate-100 ${warn}`}>
                    <td className="px-4 py-3 font-mono text-[15px] font-medium text-slate-900">{r.visitorSessionId.slice(0, 16)}…</td>
                    <td className="px-4 py-3 text-[15px] font-medium text-slate-900">{r.lastMessageTime ? new Date(r.lastMessageTime).toLocaleString() : "-"}</td>
                    <td className="px-4 py-3 text-right text-[15px] font-medium text-slate-900">{r.waitingSeconds}</td>
                    <td className="px-4 py-3 text-right text-[15px] font-medium text-slate-900">{r.firstResponseTimeSec != null ? Math.round(r.firstResponseTimeSec) : "-"}</td>
                    <td className="px-4 py-3 text-[15px] font-medium text-slate-900">{r.status} {r.assignedStaff ? ` / ${r.assignedStaff}` : ""}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-2 text-xs text-slate-400">每 10 秒自动刷新</p>
    </div>
  );
}
