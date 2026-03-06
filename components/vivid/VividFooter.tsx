"use client";

import Link from "next/link";
import { useLocale } from "@/lib/i18n/context";

export function VividFooter({ siteName = "KINGDOM888" }: { siteName?: string }) {
  const { t } = useLocale();
  return (
    <footer className="vp-footer">
      <div className="vp-w">
        <div className="flex flex-wrap items-center justify-center gap-4 text-sm mb-3">
          <Link href="/promotion">{t("public.vivid.footer.promotions")}</Link>
          <span>·</span>
          <Link href="/history">{t("public.vivid.footer.history")}</Link>
          <span>·</span>
          <Link href="/games">{t("public.vivid.footer.games")}</Link>
          <span>·</span>
          <Link href="/live-chat">{t("public.vivid.footer.support")}</Link>
          <span>·</span>
          <Link href="/register-wa">{t("public.vivid.footer.register")}</Link>
        </div>
        <p className="text-xs m-0" style={{ color: "var(--vp-muted)" }}>
          {t("public.vivid.footer.responsible")} {siteName} © {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  );
}
