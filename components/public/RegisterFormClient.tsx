"use client";

import Link from "next/link";
import { useState } from "react";

export function RegisterFormClient() {
  const [displayName, setDisplayName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [phone, setPhone] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "alreadyRegistered" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [successHint, setSuccessHint] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");
    try {
      const res = await fetch("/api/public/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: phone.trim(),
          displayName: displayName.trim(),
          dateOfBirth: dateOfBirth.trim(),
          bankName: bankName.trim(),
          bankAccount: bankAccount.trim()
        })
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setSuccessHint(typeof data.hint === "string" ? data.hint : "请查收 WhatsApp 获取登录 ID 与临时密码");
        setStatus("success");
        return;
      }
      if (res.ok && data.alreadyRegistered) {
        setStatus("alreadyRegistered");
        return;
      }
      setStatus("error");
      if (data.error === "NOT_IN_CONTACT_LIST") setErrorMsg("无法完成注册。");
      else if (data.error === "INVALID_PHONE") setErrorMsg("请输入有效的电话号码（如 +60xxxxxxxxx）。");
      else if (data.error === "INVALID_DATE") setErrorMsg("请选择有效的生日日期。");
      else if (data.error === "RATE_LIMITED") setErrorMsg("请求过于频繁，请稍后再试。");
      else setErrorMsg("注册失败，请稍后再试。");
    } catch {
      setStatus("error");
      setErrorMsg("网络错误，请稍后再试。");
    }
  }

  if (status === "success") {
    return (
      <main className="mx-auto max-w-md px-4 py-10 text-white">
        <h1 className="text-xl font-extrabold">注册成功</h1>
        <p className="mt-2 text-sm text-white/80">
          {successHint}
          {successHint ? (successHint.endsWith("。") || successHint.endsWith(".") ? " " : "。") : ""}
          然后前往登录页登录。
        </p>
        <Link href="/login" className="mt-4 inline-block text-[color:var(--rb-gold2)] underline">
          去登录
        </Link>
      </main>
    );
  }

  if (status === "alreadyRegistered") {
    return (
      <main className="mx-auto max-w-md px-4 py-10 text-white">
        <h1 className="text-xl font-extrabold">该号码已注册</h1>
        <p className="mt-2 text-sm text-white/80">请直接登录。</p>
        <Link href="/login" className="mt-4 inline-block text-[color:var(--rb-gold2)] underline">
          去登录
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-4 py-10 text-white">
      <h1 className="text-xl font-extrabold">Register</h1>
      <p className="mt-2 text-sm text-white/70">请填写以下资料。We&apos;ll send a 6-digit code to your WhatsApp. Didn&apos;t receive? Check WhatsApp message requests.</p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-white/80">名字 *</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="如：LEE WEI LEONG"
            className="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2.5 text-sm text-white outline-none focus:border-[color:var(--rb-gold2)]"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-white/80">生日日期 *</label>
          <input
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            className="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2.5 text-sm text-white outline-none focus:border-[color:var(--rb-gold2)]"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-white/80">电话号码 *</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+60xxxxxxxxx 或 0138881167"
            className="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2.5 text-sm text-white outline-none focus:border-[color:var(--rb-gold2)]"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-white/80">银行系列 *</label>
          <input
            type="text"
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            placeholder="如：Maybank、CIMB"
            className="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2.5 text-sm text-white outline-none focus:border-[color:var(--rb-gold2)]"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-white/80">银行户口号码 *</label>
          <input
            type="text"
            value={bankAccount}
            onChange={(e) => setBankAccount(e.target.value)}
            placeholder=""
            className="mt-1 w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2.5 text-sm text-white outline-none focus:border-[color:var(--rb-gold2)]"
            required
          />
        </div>
        {errorMsg && <p className="text-sm text-red-400">{errorMsg}</p>}
        <button
          type="submit"
          disabled={status === "submitting"}
          className="w-full rounded-lg bg-[color:var(--rb-gold2)] py-3 text-sm font-bold text-[color:var(--p44-text-dark)] disabled:opacity-60"
        >
          {status === "submitting" ? "提交中…" : "Register"}
        </button>
      </form>
      <Link href="/login" className="mt-4 inline-block text-sm text-white/70 underline">
        已有账号？去登录
      </Link>
    </main>
  );
}
