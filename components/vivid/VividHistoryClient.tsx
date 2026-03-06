"use client";

import Link from "next/link";
import { useState } from "react";
import "@/styles/vivid-portal.css";
import { VividTopbar } from "./VividTopbar";
import { VividFooter } from "./VividFooter";
import { useLocale } from "@/lib/i18n/context";

type Tab = "transaction" | "accounts";

export function VividHistoryClient({
  siteName = "KINGDOM888",
  loginUrl = "/login",
  registerUrl = "/register-wa",
}: {
  siteName?: string;
  loginUrl?: string;
  registerUrl?: string;
}) {
  const { t } = useLocale();
  const [tab, setTab] = useState<Tab>("transaction");

  return (
    <div className="vp-shell">
      <VividTopbar siteName={siteName} loginUrl={loginUrl} registerUrl={registerUrl} />

      <div className="vp-w vp-main" style={{ paddingTop: 12, paddingBottom: 100 }}>
        <nav className="text-sm" style={{ color: "var(--vp-muted)" }}>
          <Link href="/" style={{ color: "var(--vp-muted)", textDecoration: "none" }}>Home</Link>
          <span className="mx-2">›</span>
          <span style={{ color: "var(--vp-text)" }}>{t("public.vivid.history.title")}</span>
        </nav>

        <h1 className="vp-section-title" style={{ fontSize: 22, marginBottom: 10, marginTop: 4 }}>
          <span className="dot" />
          📜 {t("public.vivid.history.title")}
        </h1>

        {/* 余额（华语：余额 / EN: Balance） */}
        <div
          className="vp-card"
          style={{
            marginBottom: 12,
            padding: "12px 18px",
            borderRadius: "var(--vp-r-card)",
            border: "1px solid var(--vp-border)",
            background: "var(--vp-card)",
          }}
        >
          <span style={{ color: "var(--vp-muted)", marginRight: 8 }}>{t("public.vivid.history.balance")}:</span>
          <span style={{ fontWeight: 600, color: "var(--vp-accent)" }}>--</span>
        </div>

        {/* Tab 切换：进出款记录 | 游戏账号密码 */}
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 12,
            borderBottom: "1px solid var(--vp-border)",
            paddingBottom: 10,
          }}
        >
          <button
            type="button"
            onClick={() => setTab("transaction")}
            style={{
              padding: "8px 16px",
              borderRadius: "var(--vp-r-btn)",
              border: "1px solid var(--vp-border)",
              background: tab === "transaction" ? "var(--vp-accent)" : "transparent",
              color: tab === "transaction" ? "#fff" : "var(--vp-muted)",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            {t("public.vivid.history.transactionHistory")}
          </button>
          <button
            type="button"
            onClick={() => setTab("accounts")}
            style={{
              padding: "8px 16px",
              borderRadius: "var(--vp-r-btn)",
              border: "1px solid var(--vp-border)",
              background: tab === "accounts" ? "var(--vp-accent)" : "transparent",
              color: tab === "accounts" ? "#fff" : "var(--vp-muted)",
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            {t("public.vivid.history.gameAccounts")}
          </button>
        </div>

        {tab === "transaction" && (
          <section
              className="vp-card"
              style={{
                padding: 18,
                borderRadius: "var(--vp-r-card)",
                border: "1px solid var(--vp-border)",
                background: "var(--vp-card)",
              }}
            >
              <h2 style={{ fontSize: 16, marginBottom: 12, color: "var(--vp-text)" }}>
                {t("public.vivid.history.transactionHistory")}
              </h2>
              <div
                style={{
                  color: "var(--vp-muted)",
                  fontSize: 14,
                  padding: "24px 0",
                  textAlign: "center",
                }}
              >
                {t("public.vivid.history.noTransactions")}
              </div>
            </section>
        )}

        {tab === "accounts" && (
          <section
            className="vp-card"
            style={{
              padding: 18,
              borderRadius: "var(--vp-r-card)",
              border: "1px solid var(--vp-border)",
              background: "var(--vp-card)",
            }}
          >
            <h2 style={{ fontSize: 16, marginBottom: 12, color: "var(--vp-text)" }}>
              {t("public.vivid.history.gameAccounts")}
            </h2>
            <div
              style={{
                color: "var(--vp-muted)",
                fontSize: 14,
                padding: "24px 0",
                textAlign: "center",
              }}
            >
              {t("public.vivid.history.noAccounts")}
            </div>
          </section>
        )}
      </div>

      <VividFooter siteName={siteName} />
    </div>
  );
}
