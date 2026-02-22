"use client";

import { useEffect, useMemo, useState } from "react";

function uniq(list: Array<{ href: string; label?: string }>) {
  const seen = new Set<string>();
  const out: Array<{ href: string; label?: string }> = [];
  for (const item of list) {
    const v = item.href.trim();
    if (!v) continue;
    if (seen.has(v)) continue;
    seen.add(v);
    out.push({ href: v, label: item.label });
  }
  return out;
}

function isExternalUrl(href: string) {
  return /^https?:\/\//i.test(href) || href.startsWith("//");
}

export function ChatRedirectClient({
  targets,
  uiText
}: {
  targets: Array<{ href: string; label?: string }>;
  uiText?: Record<string, string>;
}) {
  const t = uiText ?? {};
  const [status, setStatus] = useState<"checking" | "redirecting" | "choose" | "failed">("checking");
  const [selected, setSelected] = useState<string | null>(null);

  const primaryTargets = useMemo(() => uniq(targets), [targets]);
  const shouldAutoRedirect = primaryTargets.length <= 1;

  const candidates = useMemo(() => {
    const list: Array<{ href: string; label?: string }> = [];
    for (const x of targets) list.push(x);
    // nginx reverse proxy path (production)
    list.push({ href: "/chat/", label: "客服入口" });
    // local dev fallback (chat-server)
    list.push({ href: "http://127.0.0.1:4000", label: "本地调试 (127.0.0.1:4000)" });
    list.push({ href: "http://localhost:4000", label: "本地调试 (localhost:4000)" });
    return uniq(list);
  }, [targets]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setStatus("checking");
      setSelected(null);

      // When multiple accounts are configured, show the chooser instead of forcing the first one.
      if (!shouldAutoRedirect) {
        setStatus("choose");
        return;
      }

      for (const item of candidates) {
        if (cancelled) return;
        setSelected(item.href);

        // External URLs: new-tab is often blocked in webviews; use same-window navigation.
        if (isExternalUrl(item.href)) {
          setStatus("redirecting");
          window.location.href = item.href;
          return;
        }

        // Same-origin: probe first so we don't navigate to a 404 dead end.
        try {
          const r = await fetch(item.href, { method: "GET", cache: "no-store" });
          if (r.ok) {
            setStatus("redirecting");
            window.location.href = item.href;
            return;
          }
        } catch {
          // ignore and try next
        }
      }

      if (!cancelled) setStatus("failed");
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [candidates, shouldAutoRedirect]);

  const title = t.chatredirecttitle ?? "正在打开 Live Chat...";
  const subtitle =
    t.chatredirectsubtitle ??
    "如果你在微信/内置浏览器里，打开新窗口可能会被拦截；我们会用同窗口方式打开。";
  const trying = t.chatredirecttrying ?? "正在尝试：";
  const manual = t.chatredirectmanual ?? "手动入口：";
  const openChatText = t.chatopentext ?? "打开 Live Chat";
  const isChoose = status === "choose";
  const manualItems = isChoose ? primaryTargets : candidates;

  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <h1 className="text-lg font-extrabold text-white">{title}</h1>
      <p className="mt-2 text-sm text-white/70">{subtitle}</p>

      {!isChoose ? (
        <div className="mt-6 rounded-xl border border-white/10 bg-black/25 p-4">
          <p className="text-xs font-semibold text-white/70">{trying}</p>
          <p className="mt-1 break-all text-sm text-[color:var(--rb-gold2)]">{selected ?? candidates[0]?.href ?? "/chat/"}</p>
          <p className="mt-2 text-xs text-white/55">
            {status === "checking" ? "..." : status === "redirecting" ? "Redirecting..." : "FAILED"}
          </p>
        </div>
      ) : null}

      {status === "failed" || status === "choose" ? (
        <div className="mt-6 space-y-3">
          <p className="text-sm font-semibold text-[color:var(--rb-gold2)]">
            {primaryTargets.length > 1
              ? (t.chatchooseaccounttitle ?? "请选择一个客服账号")
              : (t.chatredirectfailed ?? "无法自动打开 Live Chat")}
          </p>
          {primaryTargets.length > 1 ? (
            <p className="text-sm text-white/70">{t.chatchooseaccountsubtitle ?? "已配置多个 WhatsApp/Telegram 账号，请选择一个打开聊天。"}</p>
          ) : (
            <p className="text-sm text-white/70">
              {t.chatredirectreasons ??
                "常见原因：1) 线上 nginx 没有把 /chat/ 代理到 chat-server；2) chat-server 没跑；3) 后台 chatDefaultUrl/社交链接未配置。"}
            </p>
          )}
          <div className="rounded-xl border border-white/10 bg-black/25 p-4">
            <p className="text-xs font-semibold text-white/70">{manual}</p>
            <div className="mt-2 flex flex-col gap-2">
              {manualItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-sm text-white/85 hover:bg-white/10"
                >
                  {openChatText}
                  {item.label ? `（${item.label}）` : ""}：{item.href}
                </a>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

