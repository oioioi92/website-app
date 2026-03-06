"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import "@/styles/vivid-portal.css";
import { VividTopbar } from "./VividTopbar";
import { VividFooter } from "./VividFooter";

type Step = 1 | 2 | 3;

export function VividRegisterClient({
  siteName = "KINGDOM888",
  loginUrl = "/login",
  registerUrl = "/register-wa",
}: {
  siteName?: string;
  loginUrl?: string;
  registerUrl?: string;
}) {
  const [step, setStep] = useState<Step>(1);
  const [phone, setPhone] = useState("+60");
  const [code, setCode] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [fullname, setFullname] = useState("");
  const [password, setPassword] = useState("");
  const [referral, setReferral] = useState("");
  const [confirm, setConfirm] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const stepLabels = ["WhatsApp Verify", "Profile", "Confirm"];

  return (
    <div className="vp-shell">
      <VividTopbar siteName={siteName} loginUrl={loginUrl} registerUrl={registerUrl} />

      <div className="vp-w" style={{ paddingTop: 40, paddingBottom: 60 }}>
        <div style={{ maxWidth: 560, margin: "0 auto" }}>
          {/* Stepper Header */}
          <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
            {stepLabels.map((label, i) => {
              const n = (i + 1) as Step;
              const active = step === n;
              const done = step > n;
              return (
                <div key={label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, fontWeight: 700,
                    background: done ? "var(--vp-green)" : active
                      ? "linear-gradient(135deg,var(--vp-accent),var(--vp-accent2))"
                      : "var(--vp-card2)",
                    border: active ? "2px solid var(--vp-accent)" : "2px solid transparent",
                    color: "#fff",
                  }}>
                    {done ? "✓" : n}
                  </div>
                  <span style={{ fontSize: 11, color: active ? "var(--vp-accent)" : "var(--vp-muted)" }}>{label}</span>
                </div>
              );
            })}
          </div>

          <div className="vp-card" style={{ padding: 28 }}>
            <p className="vp-card-title" style={{ marginBottom: 20 }}>
              {step === 1 && "Step 1 — Verify WhatsApp"}
              {step === 2 && "Step 2 — Your Profile"}
              {step === 3 && "Step 3 — Confirm & Create"}
            </p>

            {step === 1 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <Field label="WhatsApp Number (+60)">
                  <Input value={phone} onChange={setPhone} placeholder="+60 1X-XXXX XXXX" />
                </Field>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    type="button"
                    className="vp-btn vp-btn-primary"
                    style={{ flex: 1 }}
                    disabled={cooldown > 0}
                    onClick={() => { setCooldown(60); alert("WhatsApp code sent (placeholder)."); }}
                  >
                    {cooldown > 0 ? `Resend in ${cooldown}s` : "Send WhatsApp Code"}
                  </button>
                  {cooldown > 0 && (
                    <button type="button" className="vp-btn vp-btn-outline" onClick={() => setCooldown(0)}>
                      Reset
                    </button>
                  )}
                </div>
                <Field label="6-digit Code">
                  <Input
                    value={code}
                    onChange={(v) => setCode(v.replace(/\D/g, "").slice(0, 6))}
                    placeholder="• • • • • •"
                  />
                </Field>
                <p style={{ fontSize: 12, color: "var(--vp-muted)", margin: 0 }}>
                  Didn&apos;t receive? Check your WhatsApp message requests.
                </p>
                <button
                  type="button"
                  className="vp-btn vp-btn-primary"
                  onClick={() => {
                    if (code.length !== 6) { alert("Please enter 6-digit code."); return; }
                    setStep(2);
                  }}
                >
                  Verify Code →
                </button>
              </div>
            )}

            {step === 2 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <Field label="Full Name">
                  <Input value={fullname} onChange={setFullname} placeholder="As per bank account" />
                </Field>
                <Field label="Password">
                  <Input value={password} onChange={setPassword} placeholder="Min. 8 characters" type="password" />
                </Field>
                <Field label="Referral Code (optional)">
                  <Input value={referral} onChange={setReferral} placeholder="Leave blank if none" />
                </Field>
                <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                  <button type="button" className="vp-btn vp-btn-outline" style={{ flex: 1 }} onClick={() => setStep(1)}>← Back</button>
                  <button type="button" className="vp-btn vp-btn-primary" style={{ flex: 1 }} onClick={() => {
                    if (!fullname || !password) { alert("Please fill in all required fields."); return; }
                    setStep(3);
                  }}>Next →</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ background: "var(--vp-card2)", borderRadius: 12, padding: "14px 16px", fontSize: 14, color: "var(--vp-muted)" }}>
                  ⚠️ Please ensure your <strong style={{ color: "var(--vp-text)" }}>name matches your bank account</strong> to avoid withdrawal issues.
                </div>
                <label style={{ display: "flex", gap: 12, alignItems: "center", cursor: "pointer", fontSize: 14 }}>
                  <input type="checkbox" checked={confirm} onChange={(e) => setConfirm(e.target.checked)} style={{ width: 18, height: 18, accentColor: "var(--vp-accent)" }} />
                  <span style={{ color: "var(--vp-text)" }}>I confirm my name matches my bank account.</span>
                </label>
                <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                  <button type="button" className="vp-btn vp-btn-outline" style={{ flex: 1 }} onClick={() => setStep(2)}>← Back</button>
                  <button
                    type="button"
                    className="vp-btn vp-btn-primary"
                    style={{ flex: 2 }}
                    onClick={() => {
                      if (!confirm) { alert("Please confirm your name."); return; }
                      alert("Account created! (placeholder — connect /api/auth/register)");
                    }}
                  >
                    🚀 Create Account
                  </button>
                </div>
              </div>
            )}

            <div className="vp-divider" style={{ margin: "24px 0 16px" }} />
            <p style={{ fontSize: 13, color: "var(--vp-muted)", textAlign: "center", margin: 0 }}>
              Already have an account?{" "}
              <Link href={loginUrl} style={{ color: "var(--vp-accent)", textDecoration: "none" }}>Login here</Link>
            </p>
          </div>
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

function Input({ value, onChange, placeholder, type = "text" }: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
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
