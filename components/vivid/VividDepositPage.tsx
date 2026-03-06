"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n/context";
import "@/styles/vivid-portal.css";
import { VividTopbar } from "./VividTopbar";
import { VividFooter } from "./VividFooter";

type PublicBankItem = { bankName: string; bankCode: string; accountName: string; accountNumber: string };

export function VividDepositPage({
  siteName = "KINGDOM888",
  loginUrl = "/login",
  registerUrl = "/register-wa",
  depositUrl,
  chatUrl = "/chat",
  whatsappUrl,
}: {
  siteName?: string;
  loginUrl?: string;
  registerUrl?: string;
  depositUrl?: string | null;
  chatUrl?: string;
  whatsappUrl?: string | null;
}) {
  const { t } = useLocale();
  if (depositUrl) {
    return (
      <div className="vp-shell">
        <VividTopbar siteName={siteName} loginUrl={loginUrl} registerUrl={registerUrl} />
        <div className="vp-w" style={{ paddingTop: 60, paddingBottom: 80, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>{"💳"}</div>
          <p style={{ color: "var(--vp-muted)", fontSize: 14, marginBottom: 24 }}>
            Redirecting to deposit page...
          </p>
          <a href={depositUrl} className="vp-btn vp-btn-primary" style={{ display: "inline-flex" }}>
            Click here to Deposit
          </a>
        </div>
        <VividFooter siteName={siteName} />
      </div>
    );
  }

  const [bankAccounts, setBankAccounts] = useState<PublicBankItem[]>([]);
  useEffect(() => {
    fetch("/api/public/bank-accounts")
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((d: { items?: PublicBankItem[] }) => setBankAccounts(Array.isArray(d.items) ? d.items : []))
      .catch(() => setBankAccounts([]));
  }, []);

  const steps = [
    { step: "1", text: "Contact our support via WhatsApp or Live Chat" },
    { step: "2", text: "Provide your account ID and deposit amount" },
    { step: "3", text: "Transfer and send a screenshot to our agent" },
    { step: "4", text: "Credits will be added after confirmation" },
  ];

  return (
    <div className="vp-shell">
      <VividTopbar siteName={siteName} loginUrl={loginUrl} registerUrl={registerUrl} />

      <div className="vp-w vp-main" style={{ paddingTop: 32, paddingBottom: 100 }}>
        <nav className="text-sm" style={{ color: "var(--vp-muted)" }}>
          <Link href="/" style={{ color: "var(--vp-muted)", textDecoration: "none" }}>Home</Link>
          <span className="mx-2">{"›"}</span>
          <span style={{ color: "var(--vp-text)" }}>Deposit</span>
        </nav>

        <h1 className="vp-section-title" style={{ fontSize: 22, marginBottom: 4, marginTop: 8 }}>
          <span className="dot" />
          {"💰"} Deposit
        </h1>
        <p style={{ color: "var(--vp-muted)", fontSize: 14, marginBottom: 28 }}>
          Contact our support team via WhatsApp or Live Chat to make a deposit.
        </p>

        <div className="vp-card" style={{ padding: 24, marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--vp-text)", marginBottom: 16 }}>
            How to Deposit?
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {steps.map((item) => (
              <div key={item.step} style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                  background: "linear-gradient(135deg,#b060ff,#7c6cfc)",
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

        {bankAccounts.length > 0 && (
          <div className="vp-card" style={{ padding: 24, marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--vp-text)", marginBottom: 16 }}>
              {t("public.vivid.deposit.bankListTitle") ?? "Bank accounts for transfer"}
            </h2>
            <p style={{ margin: 0, fontSize: 13, color: "var(--vp-muted)", marginBottom: 16 }}>
              {t("public.vivid.deposit.bankListDesc") ?? "Transfer to one of the following bank account(s), then contact support with your receipt."}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {bankAccounts.map((bank, i) => (
                <div
                  key={i}
                  style={{
                    padding: 14,
                    borderRadius: "var(--vp-r-card)",
                    border: "1px solid var(--vp-border)",
                    background: "var(--vp-card2, rgba(255,255,255,0.03))",
                  }}
                >
                  {(bank.bankName || bank.bankCode) && (
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "var(--vp-text)" }}>
                      {[bank.bankName, bank.bankCode].filter(Boolean).join(" ")}
                    </p>
                  )}
                  <p style={{ margin: "4px 0 0", fontSize: 14, color: "var(--vp-muted)" }}>
                    {t("public.vivid.deposit.accountName") ?? "Account name"}: {bank.accountName || "—"}
                  </p>
                  <p style={{ margin: "2px 0 0", fontSize: 14, color: "var(--vp-muted)", fontVariantNumeric: "tabular-nums" }}>
                    {t("public.vivid.deposit.accountNumber") ?? "Account number"}: {bank.accountNumber || "—"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

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
            {"💬"} Live Chat Support
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
            {"←"} Back to Home
          </Link>
        </div>
      </div>

      <VividFooter siteName={siteName} />
    </div>
  );
}
