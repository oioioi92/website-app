"use client";

import Link from "next/link";
import { useState } from "react";
import "@/styles/vivid-portal.css";
import { VividTopbar } from "./VividTopbar";
import { VividFooter } from "./VividFooter";
import { useLocale } from "@/lib/i18n/context";
import type { Locale } from "@/lib/i18n/types";

const LANGS: Array<{ locale: Locale; labelKey: string }> = [
  { locale: "en", labelKey: "public.vivid.lang.en" },
  { locale: "zh", labelKey: "public.vivid.lang.zh" },
  { locale: "ms", labelKey: "public.vivid.lang.my" },
];

export function VividSettingsClient({
  siteName = "KINGDOM888",
  loginUrl = "/login",
  registerUrl = "/register-wa",
}: {
  siteName?: string;
  loginUrl?: string;
  registerUrl?: string;
}) {
  const { t, locale, setLocale } = useLocale();
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [profileMsg, setProfileMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [savingPw, setSavingPw] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  async function handlePasswordSave() {
    if (!currentPw || !newPw || !confirmPw) {
      setPwMsg({ ok: false, text: "请填写所有密码字段。" });
      return;
    }
    if (newPw !== confirmPw) {
      setPwMsg({ ok: false, text: "新密码与确认密码不一致。" });
      return;
    }
    if (newPw.length < 6) {
      setPwMsg({ ok: false, text: "新密码至少需要 6 位。" });
      return;
    }
    setSavingPw(true);
    setPwMsg(null);
    try {
      const res = await fetch("/api/public/me/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
        credentials: "include",
      });
      if (res.ok) {
        setPwMsg({ ok: true, text: "密码修改成功！" });
        setCurrentPw(""); setNewPw(""); setConfirmPw("");
      } else {
        const d = await res.json().catch(() => ({}));
        const msg: Record<string, string> = { WRONG_PASSWORD: "当前密码不正确。", UNAUTHORIZED: "请先登录。" };
        setPwMsg({ ok: false, text: msg[d?.error] ?? "修改失败，请重试。" });
      }
    } catch {
      setPwMsg({ ok: false, text: "网络错误，请重试。" });
    } finally {
      setSavingPw(false);
    }
  }

  function handleProfileSave() {
    setProfileMsg({ ok: true, text: "（前台个人资料修改功能正在建设中）" });
  }

  const cardStyle = {
    padding: 18,
    borderRadius: "var(--vp-r-card)",
    border: "1px solid var(--vp-border)",
    background: "var(--vp-card)",
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "var(--vp-r-btn)",
    border: "1px solid var(--vp-border)",
    background: "var(--vp-bg2)",
    color: "var(--vp-text)",
    fontSize: 14,
  };

  return (
    <div className="vp-shell">
      <VividTopbar siteName={siteName} loginUrl={loginUrl} registerUrl={registerUrl} />

      <div className="vp-w vp-main" style={{ paddingTop: 24, paddingBottom: 100 }}>
        <nav className="text-sm" style={{ color: "var(--vp-muted)" }}>
          <Link href="/" style={{ color: "var(--vp-muted)", textDecoration: "none" }}>Home</Link>
          <span className="mx-2">›</span>
          <span style={{ color: "var(--vp-text)" }}>{t("public.vivid.settings.title")}</span>
        </nav>

        <h1 className="vp-section-title" style={{ fontSize: 22, marginBottom: 20, marginTop: 8 }}>
          <span className="dot" />
          ⚙️ {t("public.vivid.settings.title")}
        </h1>

        {/* 修改登入密码 */}
        <section style={{ ...cardStyle, marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, marginBottom: 12, color: "var(--vp-text)" }}>
            {t("public.vivid.settings.changePassword")}
          </h2>
          <div className="space-y-3">
            {pwMsg && (
              <div style={{
                background: pwMsg.ok ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                border: `1px solid ${pwMsg.ok ? "rgba(34,197,94,0.4)" : "rgba(239,68,68,0.4)"}`,
                borderRadius: 10, padding: "10px 14px",
                color: pwMsg.ok ? "#4ade80" : "#fca5a5", fontSize: 13,
              }}>
                {pwMsg.ok ? "✅" : "⚠"} {pwMsg.text}
              </div>
            )}
            <input type="password" placeholder={t("public.vivid.settings.currentPassword")} value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} style={inputStyle} />
            <input type="password" placeholder={t("public.vivid.settings.newPassword")} value={newPw} onChange={(e) => setNewPw(e.target.value)} style={inputStyle} />
            <input type="password" placeholder={t("public.vivid.settings.confirmPassword")} value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} style={inputStyle} />
            <button
              type="button"
              className="vp-btn"
              style={{ padding: "10px 20px", borderRadius: "var(--vp-r-btn)", background: "var(--vp-accent)", color: "#fff", fontWeight: 600, opacity: savingPw ? 0.7 : 1 }}
              onClick={handlePasswordSave}
              disabled={savingPw}
            >
              {savingPw ? "保存中…" : t("public.vivid.settings.save")}
            </button>
          </div>
        </section>

        {/* 语言 */}
        <section style={{ ...cardStyle, marginBottom: 16 }}>
          <h2 style={{ fontSize: 16, marginBottom: 12, color: "var(--vp-text)" }}>
            {t("public.vivid.settings.language")}
          </h2>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {LANGS.map(({ locale: l, labelKey }) => (
              <button
                key={l}
                type="button"
                onClick={() => setLocale(l)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "var(--vp-r-btn)",
                  border: "1px solid var(--vp-border)",
                  background: locale === l ? "var(--vp-accent)" : "transparent",
                  color: locale === l ? "#fff" : "var(--vp-muted)",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                {t(labelKey)}
              </button>
            ))}
          </div>
        </section>

        {/* 个人资料 */}
        <section style={cardStyle}>
          <h2 style={{ fontSize: 16, marginBottom: 12, color: "var(--vp-text)" }}>
            {t("public.vivid.settings.personalDetails")}
          </h2>
          <div className="space-y-3">
            {profileMsg && (
              <div style={{
                background: profileMsg.ok ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                border: `1px solid ${profileMsg.ok ? "rgba(34,197,94,0.4)" : "rgba(239,68,68,0.4)"}`,
                borderRadius: 10, padding: "10px 14px",
                color: profileMsg.ok ? "#4ade80" : "#fca5a5", fontSize: 13,
              }}>
                {profileMsg.ok ? "ℹ️" : "⚠"} {profileMsg.text}
              </div>
            )}
            <input type="text" placeholder={t("public.vivid.settings.name")} value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
            <input type="email" placeholder={t("public.vivid.settings.email")} value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
            <input type="tel" placeholder={t("public.vivid.settings.phone")} value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} />
            <button
              type="button"
              className="vp-btn"
              style={{ padding: "10px 20px", borderRadius: "var(--vp-r-btn)", background: "var(--vp-accent)", color: "#fff", fontWeight: 600, opacity: savingProfile ? 0.7 : 1 }}
              onClick={handleProfileSave}
              disabled={savingProfile}
            >
              {savingProfile ? "保存中…" : t("public.vivid.settings.save")}
            </button>
          </div>
        </section>
      </div>

      <VividFooter siteName={siteName} />
    </div>
  );
}
