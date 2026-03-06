"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error === "INVALID_CREDENTIALS" ? "邮箱或密码错误" : data.error || "登录失败");
        return;
      }
      const next = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("next") || "/admin" : "/admin";
      router.replace(next);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-900 p-4" data-login-version="2025-02">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-200">
        <div className="bg-slate-800 px-6 py-4">
          <h1 className="text-lg font-semibold tracking-tight text-white">Backoffice 登录</h1>
          <p className="mt-0.5 text-sm text-slate-300">使用管理员账号登录</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4 p-6">
          <div>
            <label className="block text-sm font-medium text-slate-700">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              autoComplete="current-password"
            />
          </div>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? "登录中…" : "登录"}
          </button>
        </form>
      </div>
    </main>
  );
}
