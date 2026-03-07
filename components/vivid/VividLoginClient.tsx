"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import "@/styles/vivid-portal.css";
import { VividTopbar } from "./VividTopbar";
import { VividFooter } from "./VividFooter";

export function VividLoginClient({
  siteName = "KINGDOM888",
  logoUrl = null,
  loginUrl = "/login",
  registerUrl = "/register-wa",
}: {
  siteName?: string;
  logoUrl?: string | null;
  loginUrl?: string;
  registerUrl?: string;
}) {
  const router = useRouter();
  const [phone, setPhone] = useState("+60");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    if (!phone.trim() || !password.trim()) {
      setError("请填写手机号码和密码。");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/public/member/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), password }),
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const msg: Record<string, string> = {
          INVALID_CREDENTIALS: "手机号码或密码不正确。",
          ACCOUNT_DISABLED: "账号已被停用，请联系客服。",
          RATE_LIMITED: "登录尝试次数过多，请稍后再试。",
          INVALID_PHONE: "手机号码格式不正确。",
        };
        setError(msg[data?.error] ?? "登录失败，请重试。");
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("网络错误，请检查连接后重试。");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="vp-shell">
      <VividTopbar siteName={siteName} logoUrl={logoUrl} loginUrl={loginUrl} registerUrl={registerUrl} />

      <div className="vp-w" style={{ paddingTop: 60, paddingBottom: 60 }}>
        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          {/* Logo area */}
          <div style={{ textAlign: "center", marginBottom: 32 }}>
            <div className="vp-logo" style={{ fontSize: 28, display: "inline-block" }}>{siteName}</div>
            <p style={{ color: "var(--vp-muted)", fontSize: 14, marginTop: 8 }}>Sign in to your account</p>
          </div>

          <div className="vp-card" style={{ padding: 28 }}>
            <p className="vp-card-title" style={{ marginBottom: 20 }}>Login</p>

            {error && (
              <div style={{
                background: "rgba(239,68,68,0.15)",
                border: "1px solid rgba(239,68,68,0.4)",
                borderRadius: 10,
                padding: "10px 14px",
                marginBottom: 16,
                color: "#fca5a5",
                fontSize: 13,
              }}>
                ⚠ {error}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Field label="+60 Mobile Number">
                <Input value={phone} onChange={setPhone} placeholder="+60 1X-XXXX XXXX" type="tel" />
              </Field>

              <Field label="Password">
                <Input value={password} onChange={setPassword} placeholder="••••••••" type="password" onEnter={handleLogin} />
              </Field>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Link href="#" style={{ fontSize: 13, color: "var(--vp-accent)", textDecoration: "none" }}>
                  Forgot password?
                </Link>
              </div>

              <button
                type="button"
                className="vp-btn vp-btn-primary"
                style={{ width: "100%", marginTop: 4, opacity: loading ? 0.7 : 1 }}
                onClick={handleLogin}
                disabled={loading}
              >
                {loading ? "登录中…" : "Sign In"}
              </button>
            </div>

            <div className="vp-divider" style={{ margin: "24px 0 16px" }} />

            <p style={{ fontSize: 13, color: "var(--vp-muted)", textAlign: "center", margin: 0 }}>
              Don&apos;t have an account?{" "}
              <Link href={registerUrl} style={{ color: "var(--vp-accent)", textDecoration: "none", fontWeight: 600 }}>
                Register via WhatsApp
              </Link>
            </p>
          </div>

          {/* Trust note */}
          <p style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "var(--vp-muted)" }}>
            🔒 Secure login — your data is protected.
          </p>
        </div>
      </div>

      <VividFooter siteName={siteName} />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 13, color: "var(--vp-muted)", fontWeight: 600 }}>{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text", onEnter }: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  onEnter?: () => void;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && onEnter?.()}
      placeholder={placeholder}
      style={{
        height: 46,
        borderRadius: 12,
        border: "1.5px solid var(--vp-border)",
        background: "var(--vp-card2)",
        color: "var(--vp-text)",
        padding: "0 16px",
        fontSize: 14,
        outline: "none",
        width: "100%",
        boxSizing: "border-box",
      }}
      onFocus={(e) => { e.target.style.borderColor = "var(--vp-accent)"; }}
      onBlur={(e) => { e.target.style.borderColor = "var(--vp-border)"; }}
    />
  );
}
