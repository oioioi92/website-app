"use client";

type Social = { id: string; label: string; url: string; iconUrl: string | null };

const FALLBACK_SOCIAL = [
  { label: "Telegram", url: "#" },
  { label: "WhatsApp", url: "#" },
  { label: "Facebook", url: "#" }
];

export function DesktopFooter({
  social,
  legalLinks
}: {
  social: Social[];
  legalLinks?: Array<{ label: string; href: string }>;
}) {
  const links = social.length > 0 ? social.map((s) => ({ label: s.label, url: s.url })) : FALLBACK_SOCIAL;
  const foot = legalLinks && legalLinks.length > 0
    ? legalLinks
    : [
        { label: "Terms", href: "#" },
        { label: "Privacy", href: "#" },
        { label: "Contact", href: "/chat" }
      ];

  return (
    <footer className="hidden border-t border-white/10 py-6 lg:block">
      <div className="mx-auto max-w-[1320px] space-y-4 px-6">
        <div className="flex flex-wrap items-center justify-center gap-4">
          {links.map((item) => (
            <a
              key={item.label}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-white/15 px-3 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-white/60">
          {foot.map((item) => (
            <a key={item.label} href={item.href} className="rounded px-2 py-1 hover:text-white">
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

