"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

const FEATURES = [
  { icon: "👥", label: "DOWNLINE COMMISSION SYSTEM" },
  { icon: "💰", label: "EXCLUSIVE FREE CREDIT SYSTEM" },
  { icon: "👤", label: "MORE THAN 20K PLAYERS ONLINE" },
  { icon: "🕐", label: "24 HOURS FAST SUPPORT" },
  { icon: "✓", label: "100% TRUSTED PLATFORM" }
];

export function LoginSplitClient() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/public/member/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
        credentials: "include"
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        router.push("/");
        router.refresh();
        return;
      }
      if (data.error === "INVALID_CREDENTIALS") setError("手机号或密码错误。");
      else if (data.error === "ACCOUNT_DISABLED") setError("账号已停用。");
      else if (data.error === "RATE_LIMITED") setError("请求过于频繁，请稍后再试。");
      else setError("登录失败，请重试。");
    } catch {
      setError("网络错误，请重试。");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col lg:flex-row bg-[color:var(--p44-grey-bg)]">
      <div className="flex-1 flex flex-col justify-center p-8 lg:p-12">
        <div className="rounded-2xl border border-[color:var(--p44-grey-light)]/30 bg-[color:var(--p44-grey-panel)]/80 overflow-hidden max-w-2xl">
          <div className="aspect-[4/3] bg-gradient-to-br from-[color:var(--p44-grey-panel)] to-black flex items-end p-6">
            <div>
              <p className="text-2xl font-black">
                <span className="text-[color:var(--p44-green)]">FAST PLAY</span>{" "}
                <span className="text-[color:var(--p44-red)]">REAL REWARDS</span>
              </p>
              <p className="text-sm text-white/80 mt-1">Your reliable gaming partner</p>
            </div>
          </div>
          <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURES.map((f) => (
              <div key={f.label} className="flex items-center gap-3 text-white/90 text-xs font-medium">
                <span className="text-lg">{f.icon}</span>
                <span>{f.label}</span>
              </div>
            ))}
          </div>
          <div className="px-6 pb-6 flex flex-wrap gap-2">
            <span className="rounded bg-white/10 px-2 py-1 text-[10px] text-white/70">PAGCOR</span>
            <span className="rounded bg-white/10 px-2 py-1 text-[10px] text-white/70">bmm testlabs</span>
            <span className="rounded bg-white/10 px-2 py-1 text-[10px] text-white/70">ThreatMetrix</span>
          </div>
        </div>
      </div>
      <div className="w-full lg:w-[420px] shrink-0 flex items-center justify-center p-8 bg-[color:var(--p44-grey-panel)]/30 border-t lg:border-t-0 lg:border-l border-[color:var(--p44-grey-light)]/20">
        <div className="w-full max-w-sm rounded-2xl border border-[color:var(--p44-grey-light)]/30 bg-[color:var(--p44-header-bg)] p-6 shadow-xl">
          <h1 className="text-xl font-extrabold text-[color:var(--p44-text-dark)]">SIGN IN</h1>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-[color:var(--p44-text-dark)]/80">Mobile No *</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+60xxxxxxxxx"
                className="mt-1 w-full rounded-lg border border-[color:var(--p44-grey-light)] bg-white px-3 py-2.5 text-sm text-[color:var(--p44-text-dark)] outline-none focus:border-[color:var(--p44-green)]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[color:var(--p44-text-dark)]/80">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder=""
                className="mt-1 w-full rounded-lg border border-[color:var(--p44-grey-light)] bg-white px-3 py-2.5 text-sm text-[color:var(--p44-text-dark)] outline-none focus:border-[color:var(--p44-green)]"
                required
              />
              <p className="mt-1 text-right text-xs">
                <Link href="#" className="text-[color:var(--p44-text-dark)]/70 hover:underline">Forgot password?</Link>
              </p>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-[color:var(--p44-text-dark)] py-3 text-sm font-bold text-white hover:opacity-90 disabled:opacity-60"
            >
              {submitting ? "登录中…" : "LOGIN"}
            </button>
          </form>
          <p className="mt-4 text-center text-sm text-[color:var(--p44-text-dark)]/80">
            Don&apos;t have an account yet?{" "}
            <Link href="/register" className="font-bold text-[color:var(--p44-text-dark)] underline">SIGN UP NOW</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
