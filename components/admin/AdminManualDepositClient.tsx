"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const CHANNEL_OPTIONS = [
  { value: "", label: "请选择或输入" },
  { value: "Cash", label: "Cash 现金" },
  { value: "Online Transfer", label: "Online Transfer 线上转账" },
  { value: "7-11", label: "7-11" },
  { value: "Bank Transfer", label: "Bank Transfer 银行转账" },
  { value: "E-Wallet", label: "E-Wallet 电子钱包" },
  { value: "OTHER", label: "其他（下方可填）" }
];

const API_ENDPOINT = "/api/admin/deposits";

export function AdminManualDepositClient() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [channelSelect, setChannelSelect] = useState("");
  const [channelCustom, setChannelCustom] = useState("");
  const [referenceNo, setReferenceNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const channel = channelSelect === "OTHER" ? channelCustom.trim() : channelSelect;

  function validate(): string | null {
    if (!userId.trim()) return "请填写会员 User ID (userRef)";
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) return "金额须为正数 (RM)";
    if (!channel) return "请选择或填写入款渠道";
    return null;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setTouched({ userId: true, amount: true, channel: true });

    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId.trim(),
          amount: Number(amount),
          channel,
          referenceNo: referenceNo.trim() || undefined
        })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || data.message || "创建失败，请稍后重试");
        return;
      }
      router.push("/admin/deposits/pending");
      router.refresh();
    } catch {
      setError("网络错误，请检查后重试");
    } finally {
      setLoading(false);
    }
  }

  const inputBase =
    "mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 transition";

  return (
    <form onSubmit={submit} className="mt-6 max-w-xl">
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50/80 px-5 py-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">入款信息</h2>
        </div>
        <div className="p-5 space-y-5">
          <div>
            <label htmlFor="manual-deposit-userId" className="block text-sm font-medium text-slate-700">
              会员 User ID (userRef) <span className="text-red-500">*</span>
            </label>
            <input
              id="manual-deposit-userId"
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, userId: true }))}
              placeholder="例如 JKJ00001"
              required
              className={inputBase}
              aria-describedby="userId-hint"
            />
            <p id="userId-hint" className="mt-1 text-xs text-slate-500">系统中该会员的唯一标识，与登录/注册所用一致</p>
          </div>

          <div>
            <label htmlFor="manual-deposit-amount" className="block text-sm font-medium text-slate-700">
              金额 (RM) <span className="text-red-500">*</span>
            </label>
            <input
              id="manual-deposit-amount"
              type="number"
              step="0.01"
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, amount: true }))}
              placeholder="0.00"
              required
              className={inputBase}
            />
          </div>

          <div>
            <label htmlFor="manual-deposit-channel" className="block text-sm font-medium text-slate-700">
              渠道 <span className="text-red-500">*</span>
            </label>
            <select
              id="manual-deposit-channel"
              value={channelSelect}
              onChange={(e) => setChannelSelect(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, channel: true }))}
              aria-required="true"
              className={inputBase}
            >
              {CHANNEL_OPTIONS.map((opt) => (
                <option key={opt.value || "empty"} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {channelSelect === "OTHER" && (
              <input
                type="text"
                value={channelCustom}
                onChange={(e) => setChannelCustom(e.target.value)}
                placeholder="输入其他渠道名称"
                className={`${inputBase} mt-2`}
              />
            )}
          </div>

          <div>
            <label htmlFor="manual-deposit-ref" className="block text-sm font-medium text-slate-700">
              凭证号 <span className="text-slate-400 font-normal">(可选)</span>
            </label>
            <input
              id="manual-deposit-ref"
              type="text"
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value)}
              placeholder="银行/支付流水号等"
              className={inputBase}
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700" role="alert">
              {error}
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 bg-slate-50/50 px-5 py-4">
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-sky-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-sky-600 disabled:opacity-50 transition"
          >
            {loading ? "提交中…" : "创建入款"}
          </button>
          <Link
            href="/admin/deposits/pending"
            className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
          >
            取消
          </Link>
        </div>
      </div>
    </form>
  );
}
