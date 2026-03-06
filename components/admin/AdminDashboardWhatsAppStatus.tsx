"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Status = {
  ok: boolean;
  mode: string | null;
  blocked: string[] | null;
};

const POLL_MS = 60_000; // 1 分钟，减少 API 消耗

export function AdminDashboardWhatsAppStatus() {
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);

  function fetchStatus() {
    fetch("/api/admin/whatsapp/status", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setStatus({ ok: d.ok, mode: d.mode ?? null, blocked: d.blocked ?? null }))
      .catch(() => setStatus({ ok: false, mode: null, blocked: null }))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchStatus();
    let t: ReturnType<typeof setInterval> | null = null;
    const start = () => { if (!t) t = setInterval(fetchStatus, POLL_MS); };
    const stop = () => { if (t) { clearInterval(t); t = null; } };
    const onVis = () => { if (document.visibilityState === "visible") start(); else stop(); };
    start();
    document.addEventListener("visibilitychange", onVis);
    return () => { stop(); document.removeEventListener("visibilitychange", onVis); };
  }, []);

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-700">WhatsApp 状态</h2>
        <p className="mt-2 text-sm text-slate-500">检测中…</p>
      </div>
    );
  }

  const modeLabel = status?.mode === "baileys" ? "个人号" : status?.mode === "official" ? "商业号" : "未配置";
  const blockedCount = Array.isArray(status?.blocked) ? status.blocked.length : 0;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700">WhatsApp 状态</h2>
        <Link href="/admin/settings/whatsapp" className="text-xs text-sky-600 hover:underline">设置</Link>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span
            className="h-3 w-3 shrink-0 rounded-full"
            style={{
              backgroundColor: status?.ok ? "#22c55e" : "#ef4444"
            }}
            aria-hidden
          />
          <span className="text-sm font-medium text-slate-800">
            {status?.ok ? "在线" : "离线"}
          </span>
          <span className="text-xs text-slate-500">（{modeLabel}）</span>
        </div>
        {status?.mode === "baileys" && (
          <div className="text-sm text-slate-600">
            被 block 数量：{blockedCount > 0 ? <span className="font-medium text-amber-600">{blockedCount}</span> : <span className="text-green-600">0</span>}
            {blockedCount > 0 && (
              <span className="ml-1 text-xs text-slate-500">（个人号可检测是否被用户拉黑）</span>
            )}
          </div>
        )}
        {status?.mode === "official" && (
          <span className="text-xs text-slate-500">商业号无法在此检测 block，请在 Meta Business 查看</span>
        )}
      </div>
    </div>
  );
}
