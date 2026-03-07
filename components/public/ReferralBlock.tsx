"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n/context";

type Member = { id: string; userRef: string; displayName?: string | null; referralCode?: string | null };

export function ReferralBlock({
  registerPath = "/register-wa",
  loginPath = "/login",
  blockBg = null,
  blockBorder = null,
}: {
  registerPath?: string;
  loginPath?: string;
  blockBg?: string | null;
  blockBorder?: string | null;
}) {
  const { t } = useLocale();
  const [member, setMember] = useState<Member | null | undefined>(undefined);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/public/member/session", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { member: null }))
      .then((json: { member?: Member | null }) => setMember(json.member ?? null))
      .catch(() => setMember(null));
  }, []);

  const referralCode = member?.referralCode?.trim();
  const effectiveLoginHref = (loginPath && loginPath !== "#") ? loginPath : "/login";
  const referralUrl =
    typeof window !== "undefined" && referralCode
      ? `${window.location.origin}${registerPath.startsWith("/") ? registerPath : `/${registerPath}`}?ref=${encodeURIComponent(referralCode)}`
      : "";

  const handleCopy = () => {
    if (!referralUrl) return;
    navigator.clipboard.writeText(referralUrl).then(
      () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
      () => {}
    );
  };

  const handleShare = () => {
    if (!referralUrl) return;
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator
        .share({
          title: "Referral",
          text: referralUrl,
          url: referralUrl,
        })
        .catch(() => handleCopy());
    } else {
      handleCopy();
    }
  };

  return (
    <div
      className="vp-referral-block"
      style={{
        padding: "14px 16px",
        background: blockBg ?? "rgba(120, 80, 255, 0.08)",
        border: blockBorder ? `1px solid ${blockBorder}` : "1px solid rgba(120,80,255,0.2)",
        borderRadius: 16,
      }}
    >
      <p className="vp-referral-title" style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700, color: "var(--vp-text)" }}>
        {t("public.vivid.referral.title")}
      </p>
      {member === undefined ? (
        <p style={{ margin: 0, fontSize: 12, color: "var(--vp-muted)" }}>…</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {referralCode ? (
            <>
              <button
                type="button"
                onClick={handleShare}
                className="vp-btn vp-btn-primary"
                style={{ height: 44, fontSize: 13, padding: "0 14px" }}
              >
                {t("public.vivid.referral.shareLink")}
              </button>
              <button
                type="button"
                onClick={handleCopy}
                className="vp-btn vp-btn-outline"
                style={{ height: 44, fontSize: 13, padding: "0 14px" }}
              >
                {copied ? "✓ " + (t("public.vivid.referral.copied") ?? "Copied") : t("public.vivid.referral.copyLink")}
              </button>
              <Link
                href="/me/referral"
                className="vp-btn vp-btn-outline"
                style={{ gridColumn: "1 / -1", display: "inline-flex", alignItems: "center", justifyContent: "center", height: 44, fontSize: 13, padding: "0 14px", marginTop: 2 }}
              >
                {t("public.vivid.referral.checkDownlines")}
              </Link>
            </>
          ) : (
            <>
              <Link
                href={effectiveLoginHref}
                className="vp-btn vp-btn-primary"
                style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", height: 44, fontSize: 13, padding: "0 14px" }}
              >
                {t("public.vivid.referral.shareLink")}
              </Link>
              <Link
                href={effectiveLoginHref}
                className="vp-btn vp-btn-outline"
                style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", height: 44, fontSize: 13, padding: "0 14px" }}
              >
                {t("public.vivid.referral.copyLink")}
              </Link>
              <Link
                href={effectiveLoginHref}
                className="vp-btn vp-btn-outline"
                style={{ gridColumn: "1 / -1", display: "inline-flex", alignItems: "center", justifyContent: "center", height: 44, fontSize: 13, padding: "0 14px", marginTop: 2 }}
              >
                {t("public.vivid.referral.checkDownlines")}
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
