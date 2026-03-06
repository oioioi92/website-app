"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n/context";

type ReferralRow = {
  id: string;
  userRef: string;
  displayName: string | null;
  referralCode: string | null;
  depositCount: number;
  withdrawCount: number;
  createdAt: string;
};

export default function MeReferralPage() {
  const { t } = useLocale();
  const [referrals, setReferrals] = useState<ReferralRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/public/member/referrals", { credentials: "include" })
      .then((r) => {
        if (r.status === 401) {
          setError("UNAUTHORIZED");
          return [];
        }
        return r.json();
      })
      .then((data: { referrals?: ReferralRow[] }) => {
        setReferrals(Array.isArray(data.referrals) ? data.referrals : []);
      })
      .catch(() => setError("FETCH_ERROR"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8 text-white">
        <h1 className="text-lg font-semibold">{t("public.vivid.referral.checkDownlines")}</h1>
        <p className="mt-2 text-sm text-[var(--vp-muted)]">…</p>
      </main>
    );
  }

  if (error === "UNAUTHORIZED") {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8 text-white">
        <h1 className="text-lg font-semibold">{t("public.vivid.referral.checkDownlines")}</h1>
        <p className="mt-2 text-sm text-[var(--vp-muted)]">{t("public.vivid.referral.loginFirst")}</p>
        <Link href="/login" className="mt-4 inline-block vp-btn vp-btn-primary" style={{ padding: "8px 16px" }}>
          {t("public.actions.login")}
        </Link>
        <Link href="/" className="ml-3 inline-block vp-btn vp-btn-outline" style={{ padding: "8px 16px" }}>
          {t("public.nav.home")}
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 text-white">
      <div className="vp-card" style={{ padding: "16px 20px" }}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-semibold" style={{ color: "var(--vp-text)" }}>
            {t("public.vivid.referral.checkDownlines")}
          </h1>
          <Link href="/" className="text-sm font-medium" style={{ color: "var(--vp-muted)" }}>
            ← {t("public.nav.home")}
          </Link>
        </div>
        {referrals && referrals.length === 0 ? (
          <p className="text-sm" style={{ color: "var(--vp-muted)" }}>
            {t("public.vivid.referral.noDownlines")}
          </p>
        ) : referrals && referrals.length > 0 ? (
          <ul className="space-y-2">
            {referrals.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2 border-b border-white/10 last:border-0"
                style={{ fontSize: 13 }}
              >
                <span className="font-mono font-medium">{r.userRef}</span>
                {r.displayName && <span style={{ color: "var(--vp-muted)" }}>{r.displayName}</span>}
                <span style={{ color: "var(--vp-muted)" }}>
                  {t("public.vivid.referral.deposits")} {r.depositCount} · {t("public.vivid.referral.withdrawals")} {r.withdrawCount}
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </main>
  );
}
