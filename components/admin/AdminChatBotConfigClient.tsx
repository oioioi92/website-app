"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type BotConfig = {
  enabled?: boolean;
  welcomeEnabled?: boolean;
  welcomeReply?: string;
  welcomeQuickReplies?: string[];
  offlineEnabled?: boolean;
  offlineReply?: string;
  [key: string]: unknown;
};

export function AdminChatBotConfigClient() {
  const [config, setConfig] = useState<BotConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveOk, setSaveOk] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    fetch("/api/admin/chat/bot/config", { credentials: "include" })
      .then((r) => r.json())
      .then((data: { ok?: boolean; config?: BotConfig; error?: string }) => {
        if (cancelled) return;
        if (!data?.ok) {
          setError(data?.error ?? "加载失败");
          setConfig({
            enabled: true,
            welcomeEnabled: true,
            welcomeReply: "您好，客服在线，请直接输入问题。",
            welcomeQuickReplies: [],
            offlineEnabled: true,
            offlineReply: "客服暂时忙碌中，我们已收到你的消息，会尽快回复。"
          });
          return;
        }
        if (data.config) {
          setConfig({
            ...data.config,
            welcomeReply: data.config.welcomeReply ?? "您好，客服在线，请直接输入问题。",
            welcomeQuickReplies: Array.isArray(data.config.welcomeQuickReplies)
              ? [...data.config.welcomeQuickReplies]
              : [],
            offlineReply: data.config.offlineReply ?? "客服暂时忙碌中，我们已收到你的消息，会尽快回复。"
          });
        } else {
          setConfig({
            enabled: true,
            welcomeEnabled: true,
            welcomeReply: "您好，客服在线，请直接输入问题。",
            welcomeQuickReplies: [],
            offlineEnabled: true,
            offlineReply: "客服暂时忙碌中，我们已收到你的消息，会尽快回复。"
          });
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e?.message ?? "加载失败");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const update = (patch: Partial<BotConfig>) => {
    setConfig((prev) => (prev ? { ...prev, ...patch } : null));
  };

  const setQuickReply = (index: number, value: string) => {
    setConfig((prev) => {
      if (!prev) return prev;
      const arr = [...(prev.welcomeQuickReplies ?? [])];
      if (index >= arr.length) arr.push(value);
      else arr[index] = value;
      return { ...prev, welcomeQuickReplies: arr.filter(Boolean).slice(0, 10) };
    });
  };

  const removeQuickReply = (index: number) => {
    setConfig((prev) => {
      if (!prev) return prev;
      const arr = [...(prev.welcomeQuickReplies ?? [])];
      arr.splice(index, 1);
      return { ...prev, welcomeQuickReplies: arr };
    });
  };

  const addQuickReply = () => {
    setConfig((prev) => {
      if (!prev) return prev;
      const arr = [...(prev.welcomeQuickReplies ?? [])];
      if (arr.length >= 10) return prev;
      arr.push("");
      return { ...prev, welcomeQuickReplies: arr };
    });
  };

  const handleSave = () => {
    if (!config) return;
    setSaving(true);
    setSaveOk(false);
    setError(null);
    fetch("/api/admin/chat/bot/config", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        ...config,
        welcomeQuickReplies: (config.welcomeQuickReplies ?? []).filter((s) => String(s).trim()).slice(0, 10)
      })
    })
      .then((r) => r.json())
      .then((data: { ok?: boolean; error?: string }) => {
        if (data?.ok) {
          setSaveOk(true);
          setTimeout(() => setSaveOk(false), 3000);
        } else {
          setError(data?.error ?? "保存失败");
        }
      })
      .catch((e) => setError(e?.message ?? "保存失败"))
      .finally(() => setSaving(false));
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-slate-500">加载配置中…</p>
      </div>
    );
  }

  if (error && !config) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm text-amber-600">{error}</p>
        <p className="mt-1 text-xs text-slate-500">请确认 CHAT_SERVER 已配置且 chat-server 已启动。</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-2">
          <Link href="/admin/chat" className="text-sm font-medium text-sky-600 hover:underline">← Live Chat</Link>
        </div>
        <h2 className="text-lg font-semibold text-slate-800">欢迎语与选项按钮</h2>
        <p className="mt-1 text-sm text-slate-500">顾客进入 Live Chat 时，系统会发送首条文案；若填写下方选项，顾客会看到可点击的按钮，点击后自动发送该选项并可能触发关键词自动回复。</p>

        <div className="mt-4 space-y-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config?.welcomeEnabled ?? true}
              onChange={(e) => update({ welcomeEnabled: e.target.checked })}
              className="rounded border-slate-300"
            />
            <span className="text-sm font-medium text-slate-700">启用欢迎语</span>
          </label>

          <div>
            <label className="block text-sm font-medium text-slate-700">首条回复文案（欢迎语）</label>
            <textarea
              value={config?.welcomeReply ?? ""}
              onChange={(e) => update({ welcomeReply: e.target.value })}
              rows={3}
              maxLength={500}
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-200"
              placeholder="您好，客服在线，请直接输入问题。也可使用 {{visitorName}}、{{waitingCount}} 等变量。"
            />
            <p className="mt-0.5 text-xs text-slate-500">最多 500 字。变量：{"{{visitorName}}"}、{"{{waitingCount}}"} 等见下方说明。</p>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700">选项按钮（顾客可点击，最多 10 个）</label>
              <button
                type="button"
                onClick={addQuickReply}
                disabled={((config?.welcomeQuickReplies ?? []).length >= 10)}
                className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                + 添加选项
              </button>
            </div>
            <ul className="mt-2 space-y-2">
              {(config?.welcomeQuickReplies ?? []).map((item, i) => (
                <li key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => setQuickReply(i, e.target.value)}
                    maxLength={80}
                    placeholder={`选项 ${i + 1}`}
                    className="flex-1 rounded border border-slate-300 px-2 py-1.5 text-sm text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => removeQuickReply(i)}
                    className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-slate-100"
                  >
                    删除
                  </button>
                </li>
              ))}
            </ul>
            {((config?.welcomeQuickReplies ?? []).length === 0) && (
              <p className="mt-1 text-xs text-slate-500">不填则只显示首条文案，不显示选项按钮。</p>
            )}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700">离线回复（客服未认领时顾客发消息的自动回复）</h3>
          <label className="mt-2 flex items-center gap-2">
            <input
              type="checkbox"
              checked={config?.offlineEnabled !== false}
              onChange={(e) => update({ offlineEnabled: e.target.checked })}
              className="rounded border-slate-300"
            />
            <span className="text-sm text-slate-600">启用离线自动回复</span>
          </label>
          <textarea
            value={config?.offlineReply ?? ""}
            onChange={(e) => update({ offlineReply: e.target.value })}
            rows={2}
            maxLength={500}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-200"
            placeholder="客服暂时忙碌中，我们已收到你的消息，会尽快回复。"
          />
        </div>

        {error && <p className="mt-4 text-sm text-amber-600">{error}</p>}
        {saveOk && <p className="mt-4 text-sm text-emerald-600">已保存。</p>}
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? "保存中…" : "保存"}
          </button>
        </div>
      </div>
    </div>
  );
}
