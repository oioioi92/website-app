"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const REFRESH_MS = 30_000;

type Counter = { chatUnread: number; pendingTx: number };

const QUICK_ITEMS = [
  { key: "chat", href: "/admin/chat", label: "Live Chat", badgeKey: "chatUnread" as const, icon: "chat" },
  { key: "pending", href: "/admin/deposits/pending", label: "Pending", badgeKey: "pendingTx" as const, icon: "pending" },
  { key: "players", href: "/admin/players", label: "Player List", badgeKey: null, icon: "players" },
  { key: "reports", href: "/admin/reports", label: "Reports", badgeKey: null, icon: "reports" },
];

function IconChat() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}
function IconPending() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}
function IconPlayers() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}
function IconReports() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h2a2 2 0 01-2-2z" />
    </svg>
  );
}
function IconMore() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function QuickIcon({ icon }: { icon: string }) {
  switch (icon) {
    case "chat": return <IconChat />;
    case "pending": return <IconPending />;
    case "players": return <IconPlayers />;
    case "reports": return <IconReports />;
    default: return <IconChat />;
  }
}

function QuickLink({ href, label, icon, badge, active }: { href: string; label: string; icon: string; badge?: number; active: boolean }) {
  return (
    <Link
      href={href}
      className={`admin-quick-action-link ${active ? "admin-quick-action-link--active" : ""}`}
      title={label}
      aria-label={label}
    >
      <span className="admin-quick-action-icon"><QuickIcon icon={icon} /></span>
      {badge != null && badge > 0 && (
        <span className="admin-quick-action-badge" aria-label={`${badge} pending`}>
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  );
}

export function AdminQuickActionBar() {
  const pathname = usePathname() ?? "";
  const [counters, setCounters] = useState<Counter>({ chatUnread: 0, pendingTx: 0 });
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  const fetchCounters = () => {
    fetch("/api/admin/dashboard-counters", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d && typeof d.chatUnread === "number" && typeof d.pendingTx === "number")
          setCounters({ chatUnread: d.chatUnread, pendingTx: d.pendingTx });
      })
      .catch(() => {});
  };

  useEffect(() => { fetchCounters(); const t = setInterval(fetchCounters, REFRESH_MS); return () => clearInterval(t); }, []);
  useEffect(() => { const onFocus = () => fetchCounters(); window.addEventListener("focus", onFocus); return () => window.removeEventListener("focus", onFocus); }, []);
  useEffect(() => {
    const close = (e: MouseEvent) => { if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false); };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const isActive = (href: string) => {
    if (href === "/admin/chat") return pathname.startsWith("/admin/chat");
    if (href === "/admin/deposits/pending") return pathname.startsWith("/admin/deposits/pending");
    if (href === "/admin/players") return pathname.startsWith("/admin/players");
    if (href === "/admin/reports") return pathname.startsWith("/admin/reports");
    return false;
  };

  const primaryItems = QUICK_ITEMS.slice(0, 2);
  const overflowItems = QUICK_ITEMS.slice(2);

  return (
    <div className="admin-quick-action-bar">
      <div className="admin-quick-action-bar__primary">
        {primaryItems.map((item) => (
          <QuickLink key={item.key} href={item.href} label={item.label} icon={item.icon} badge={item.badgeKey ? counters[item.badgeKey] : undefined} active={isActive(item.href)} />
        ))}
      </div>
      <div className="admin-quick-action-bar__secondary">
        {overflowItems.map((item) => (
          <QuickLink key={item.key} href={item.href} label={item.label} icon={item.icon} badge={item.badgeKey ? counters[item.badgeKey] : undefined} active={isActive(item.href)} />
        ))}
      </div>
      <div className="admin-quick-action-bar__more" ref={moreRef}>
        <button type="button" onClick={() => setMoreOpen((v) => !v)} className="admin-quick-action-link admin-quick-action-link--more" title="More" aria-label="More menu" aria-expanded={moreOpen}>
          <span className="admin-quick-action-icon"><IconMore /></span>
        </button>
        {moreOpen && (
          <div className="admin-quick-action-more-dropdown">
            {overflowItems.map((item) => (
              <Link key={item.key} href={item.href} onClick={() => setMoreOpen(false)} className={`admin-quick-action-more-item ${isActive(item.href) ? "admin-quick-action-more-item--active" : ""}`}>
                <QuickIcon icon={item.icon} />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
