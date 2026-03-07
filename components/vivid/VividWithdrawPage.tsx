"use client";

import Link from "next/link";
import "@/styles/vivid-portal.css";
import { VividTopbar } from "./VividTopbar";
import { VividFooter } from "./VividFooter";

export function VividWithdrawPage({
  siteName = "KINGDOM888",
  logoUrl = null,
  loginUrl = "/login",
  registerUrl = "/register-wa",
  withdrawUrl,
  chatUrl = "/chat",
  whatsappUrl,
}: {
  siteName?: string;
  logoUrl?: string | null;
  loginUrl?: string;
  registerUrl?: string;
  withdrawUrl?: string | null;
  chatUrl?: string;
  whatsappUrl?: string | null;
}) {
  if (withdrawUrl) {
    return (
      <div className="vp-shell">
        <VividTopbar siteName={siteName} logoUrl={logoUrl} loginUrl={loginUrl} registerUrl={registerUrl} />
        <div className="vp-w" style={{ paddingTop: 60, paddingBottom: 80, textAlign: "center" }}>
          <div style={{ marginBottom: 16 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#b060ff" strokeWidth={1.5} style={{ width: 64, height: 64, margin: "0 auto" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 10l4-4M3 10l4 4M21 14H3M21 14l-4-4M21 14l-4 4" />
            </svg>
          </div>
          <p style={{ color: "var(--vp-muted)", fontSize: 14, marginBottom: 24 }}>
            Redirecting to withdraw page...
          </p>
          <a href={withdrawUrl} className="vp-btn vp-btn-primary" style={{ display: "inline-flex" }}>
            Click here to Withdraw
          </a>
        </div>
        <VividFooter siteName={siteName} />
      </div>
    );
  }

  const steps = [
    { step: "1", text: "Contact our support via WhatsApp or Live Chat" },
    { step: "2", text: "Provide your account ID and withdrawal amount" },
    { step: "3", text: "Provide your bank account details (Bank name, account no., name)" },
    { step: "4", text: "Amount will be transferred to your bank account after processing" },
  ];

  return (
    <div className="vp-shell">
      <VividTopbar siteName={siteName} logoUrl={logoUrl} loginUrl={loginUrl} registerUrl={registerUrl} />

      <div className="vp-w vp-main" style={{ paddingTop: 32, paddingBottom: 100 }}>
        <nav className="text-sm" style={{ color: "var(--vp-muted)" }}>
          <Link href="/" style={{ color: "var(--vp-muted)", textDecoration: "none" }}>Home</Link>
          <span className="mx-2">/</span>
          <span style={{ color: "var(--vp-text)" }}>Withdraw</span>
        </nav>

        <h1 className="vp-section-title" style={{ fontSize: 22, marginBottom: 4, marginTop: 8 }}>
          <span className="dot" />
          Withdraw
        </h1>
        <p style={{ color: "var(--vp-muted)", fontSize: 14, marginBottom: 28 }}>
          Contact our support team to process your withdrawal request.
        </p>

        <div className="vp-card" style={{ padding: 24, marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--vp-text)", marginBottom: 16 }}>
            How to Withdraw?
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {steps.map((item) => (
              <div key={item.step} style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                  background: "linear-gradient(135deg,#f59e0b,#d97706)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 800, fontSize: 14, color: "#fff",
                }}>
                  {item.step}
                </div>
                <p style={{ margin: 0, fontSize: 14, color: "var(--vp-muted)", lineHeight: 1.6, paddingTop: 5 }}>
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="vp-card" style={{
          padding: 16, marginBottom: 16,
          background: "rgba(245,158,11,0.08)", borderColor: "rgba(245,158,11,0.25)",
        }}>
          <p style={{ margin: 0, fontSize: 13, color: "rgba(252,211,77,0.9)", lineHeight: 1.6 }}>
            (!) Please ensure your balance is sufficient and you have met the required turnover before withdrawing. Processing time is typically 1-3 business days.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                padding: "14px 20px", borderRadius: "var(--vp-r-btn)",
                background: "rgba(37,211,102,0.15)", border: "1px solid rgba(37,211,102,0.4)",
                color: "#4ade80", fontWeight: 700, textDecoration: "none", fontSize: 15,
              }}
            >
              <span style={{
                display: "inline-flex", width: 28, height: 28, borderRadius: "50%",
                background: "#25D366", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 900, color: "#063A1B",
              }}>WA</span>
              WhatsApp Support
            </a>
          )}
          <Link
            href={chatUrl}
            className="vp-btn vp-btn-primary"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px 20px", fontSize: 15 }}
          >
            Live Chat Support
          </Link>
          <Link
            href="/"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "12px 20px", borderRadius: "var(--vp-r-btn)",
              border: "1px solid var(--vp-border)", color: "var(--vp-muted)",
              textDecoration: "none", fontSize: 14,
            }}
          >
            Back to Home
          </Link>
        </div>
      </div>

      <VividFooter siteName={siteName} />
    </div>
  );
}