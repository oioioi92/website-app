"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/lib/i18n/context";

export default function AdminLoginPage() {
  const router = useRouter();
  const { t } = useLocale();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorKey, setErrorKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"credentials" | "totp">("credentials");
  const [totpCode, setTotpCode] = useState("");
  const [totpLoading, setTotpLoading] = useState(false);
  const [totpError, setTotpError] = useState("");

  useEffect(() => {
    fetch("/api/admin/login/status", { credentials: "include" })
      .then((r) => r.json())
      .then((d: { requiresTotp?: boolean; email?: string }) => {
        if (d.requiresTotp && d.email) {
          setStep("totp");
          setEmail(d.email);
        }
      })
      .catch(() => {});
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorKey("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include"
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorKey(data.error === "INVALID_CREDENTIALS" ? "admin.login.errorInvalidCredentials" : "admin.login.errorGeneric");
        return;
      }
      if (data.requiresTotp) {
        setStep("totp");
        return;
      }
      const next = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("next") || "/admin" : "/admin";
      router.replace(next);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function onTotpSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTotpError("");
    setTotpLoading(true);
    try {
      const res = await fetch("/api/admin/login/verify-totp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: totpCode }),
        credentials: "include"
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setTotpError(data.error === "INVALID_CODE" ? "admin.login.totpInvalidCode" : "admin.login.totpError");
        return;
      }
      const next = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("next") || "/admin" : "/admin";
      router.replace(next);
      router.refresh();
    } finally {
      setTotpLoading(false);
    }
  }

  if (step === "totp") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-900 p-4" data-login-version="2025-02">
        <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-200">
          <div className="bg-slate-800 px-6 py-4">
            <h1 className="text-lg font-semibold tracking-tight text-white">{t("admin.login.totpTitle")}</h1>
            <p className="mt-0.5 text-sm text-slate-300">{t("admin.login.totpSubtitle")} — {email}</p>
          </div>
          <form onSubmit={onTotpSubmit} className="space-y-4 p-6">
            <div>
              <label className="block text-sm font-medium text-slate-700">{t("admin.login.totpCodeLabel")}</label>
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                placeholder="000000"
                className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-center text-lg tracking-[0.3em] text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            {totpError && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{t(totpError)}</p>}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setStep("credentials"); setTotpCode(""); setTotpError(""); }}
                className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {t("admin.login.back")}
              </button>
              <button
                type="submit"
                disabled={totpLoading || totpCode.length !== 6}
                className="flex-1 rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {totpLoading ? t("admin.login.verifying") : t("admin.login.verify")}
              </button>
            </div>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-900 p-4" data-login-version="2025-02">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-200">
        <div className="bg-slate-800 px-6 py-4">
          <h1 className="text-lg font-semibold tracking-tight text-white">{t("admin.login.title")}</h1>
          <p className="mt-0.5 text-sm text-slate-300">{t("admin.login.subtitle")}</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4 p-6">
          <div>
            <label className="block text-sm font-medium text-slate-700">{t("admin.login.email")}</label>
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
            <label className="block text-sm font-medium text-slate-700">{t("admin.login.password")}</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              autoComplete="current-password"
            />
          </div>
          {errorKey && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{t(errorKey)}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? t("admin.login.submitting") : t("admin.login.submit")}
          </button>
        </form>
      </div>
    </main>
  );
}
