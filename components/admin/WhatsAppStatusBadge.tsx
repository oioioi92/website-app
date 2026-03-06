"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const POLL_INTERVAL_MS = 30_000;

export function WhatsAppStatusBadge() {
  const [ok, setOk] = useState<boolean | null>(null);
  const [mode, setMode] = useState<string | null>(null);

  function fetchStatus() {
    fetch("/api/admin/whatsapp/status", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => {
        setOk(d.ok === true);
        setMode(d.mode ?? null);
      })
      .catch(() => {
        setOk(false);
        setMode(null);
      });
  }

  useEffect(() => {
    fetchStatus();
    const t = setInterval(fetchStatus, POLL_INTERVAL_MS);
    return () => clearInterval(t);
  }, []);

  const loading = ok === null && mode === null;
  const title = loading
    ? "WhatsApp 状态检测中…"
    : ok
      ? "WhatsApp 发信: 在线"
      : "WhatsApp 发信: 离线（请检查商业号配置或 wa:link 是否已连接）";
  const label = loading ? "WA" : mode === "baileys" ? "WA(个人)" : mode === "official" ? "WA(商业)" : "WA";

  return (
    <Link
      href="/admin/settings/whatsapp"
      title={title}
      className="flex items-center gap-1.5 rounded px-2 py-1 text-[12px] font-medium hover:bg-black/5"
    >
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={{
          backgroundColor: loading ? "#94a3b8" : ok ? "var(--compact-success, #22c55e)" : "var(--compact-danger, #ef4444)"
        }}
        aria-hidden
      />
      <span className="text-[var(--compact-muted)]">{label}</span>
    </Link>
  );
}
