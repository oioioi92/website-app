"use client";

import { useLocale } from "@/lib/i18n/context";

type Social = { id: string; label: string; url: string; iconUrl: string | null };

const FALLBACK_SOCIAL = [
  { label: "Telegram", url: "#" },
  { label: "WhatsApp", url: "#" },
  { label: "Facebook", url: "#" }
];

/** Compliance links (DESKTOP-UI-DESIGN-SPEC §2.2): Responsible Gaming • Security • Privacy + 18+ */
const COMPLIANCE_LINKS = [
  { key: "public.footer.responsible", label: "Responsible Gaming", href: "/responsible-gaming" },
  { key: "public.footer.security", label: "Security", href: "/security" },
  { key: "public.footer.privacy", label: "Privacy", href: "/privacy" },
];

export function DesktopFooter({
  social,
  legalLinks
}: {
  social: Social[];
  legalLinks?: Array<{ label: string; href: string }>;
}) {
  const { t } = useLocale();
  const links = social.length > 0 ? social.map((s) => ({ label: s.label, url: s.url })) : FALLBACK_SOCIAL;
  const defaultFoot = [
    { key: "public.footer.terms", href: "#" },
    { key: "public.footer.privacy", href: "#" },
    { key: "public.footer.contact", href: "/chat" },
  ];
  const foot = legalLinks && legalLinks.length > 0
    ? legalLinks
    : defaultFoot;

  return (
    <footer className="hidden lg:block" data-desktop-footer>
      <div className="desk-container text-center">
        <p className="footer-intro">{t("public.footer.intro")}</p>
        <div className="footer-links">
          {COMPLIANCE_LINKS.map((item) => (
            <a key={item.key} href={item.href} className="hover:text-[var(--desk-text)]">
              {item.label}
            </a>
          ))}
          {links.map((item) => (
            <a
              key={item.label}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--desk-text)]"
            >
              {item.label}
            </a>
          ))}
        </div>
        <p className="mt-[var(--desk-l)] mb-0 text-[13px] font-medium text-[var(--desk-text-muted)]">
          18+ Only. Play responsibly.
        </p>
        <div className="footer-links mt-[var(--desk-m)] text-[13px]">
          {foot.map((item) => (
            <a key={"label" in item ? item.label : item.key} href={item.href} className="hover:text-[var(--desk-text)]">
              {"label" in item ? item.label : t(item.key)}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

