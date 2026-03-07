"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type QuickTemplates = { deposit: string[]; withdraw: string[]; walletProblem: string[] };

const LABELS = {
  deposit: "Deposit Template（存款）",
  withdraw: "Withdraw Template（提款）",
  walletProblem: "Wallet Problem Template（钱包/账号问题）"
} as const;

export function LiveChatQuickTemplatesClient() {
  const [data, setData] = useState<QuickTemplates>({ deposit: [], withdraw: [], walletProblem: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveOk, setSaveOk] = useState(false);

  useEffect(() => {
    fetch("/api/admin/chat/settings/quick-templates", { credentials: "include" })
      .then((r) => r.json())
      .then((d: QuickTemplates & { error?: string }) => {
        if (d.error) return;
        setData({
          deposit: Array.isArray(d.deposit) ? d.deposit : [],
          withdraw: Array.isArray(d.withdraw) ? d.withdraw : [],
          walletProblem: Array.isArray(d.walletProblem) ? d.walletProblem : []
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const updateList = (key: keyof QuickTemplates, index: number, value: string) => {
    setData((prev) => {
      const arr = [...(prev[key] ?? [])];
      if (index >= arr.length) arr.push(value);
      else arr[index] = value;
      return { ...prev, [key]: arr.filter(Boolean) };
    });
  };

  const removeItem = (key: keyof QuickTemplates, index: number) => {
    setData((prev) => {
      const arr = [...(prev[key] ?? [])];
      arr.splice(index, 1);
      return { ...prev, [key]: arr };
    });
  };

  const addItem = (key: keyof QuickTemplates) => {
    setData((prev) => ({
      ...prev,
      [key]: [...(prev[key] ?? []), ""]
    }));
  };

  const handleSave = () => {
    setSaving(true);
    setSaveOk(false);
    fetch("/api/admin/chat/settings/quick-templates", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        deposit: (data.deposit ?? []).filter((s) => s.trim()),
        withdraw: (data.withdraw ?? []).filter((s) => s.trim()),
        walletProblem: (data.walletProblem ?? []).filter((s) => s.trim())
      })
    })
      .then((r) => r.json())
      .then(() => {
        setSaveOk(true);
        setTimeout(() => setSaveOk(false), 3000);
      })
      .finally(() => setSaving(false));
  };

  if (loading) return <p className="text-sm text-slate-500">加载中…</p>;

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-600">
        以下三类句子会在 Live Chat 底部以「Deposit Template / Withdraw Template / Wallet Problem Template」三个下拉框显示，客服选择后即可插入到输入框或发送。
      </p>
      {(Object.keys(LABELS) as (keyof QuickTemplates)[]).map((key) => (
        <div key={key} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-800">{LABELS[key]}</h3>
            <button
              type="button"
              onClick={() => addItem(key)}
              className="rounded border border-slate-300 bg-white px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              + 添加一句
            </button>
          </div>
          <ul className="space-y-2">
            {(data[key] ?? []).map((item, i) => (
              <li key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => updateList(key, i, e.target.value)}
                  placeholder="输入预设回复句"
                  className="flex-1 rounded border border-slate-300 px-2 py-1.5 text-sm text-slate-800"
                />
                <button
                  type="button"
                  onClick={() => removeItem(key, i)}
                  className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-600 hover:bg-slate-100"
                >
                  删除
                </button>
              </li>
            ))}
          </ul>
          {(data[key] ?? []).length === 0 && (
            <p className="text-xs text-slate-500 mt-1">暂无句子，点击「添加一句」添加。</p>
          )}
        </div>
      ))}
      {saveOk && <p className="text-sm text-emerald-600">已保存。</p>}
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
      >
        {saving ? "保存中…" : "保存"}
      </button>
    </div>
  );
}
