"use client";

import Link from "next/link";
import { useState } from "react";
import { FallbackImage } from "@/components/FallbackImage";

const NAV_LINKS = [
  { label: "报表", href: "#results" },
  { label: "分析", href: "#analyzer" },
  { label: "活动", href: "#promotion-showcase" },
  { label: "社区", href: "#community" }
];

const PROVIDERS = ["默认", "供应商 A", "供应商 B"];

export function DesktopHeader({
  logoUrl,
  siteName = "Site"
}: {
  logoUrl: string | null;
  siteName?: string;
}) {
  const [providerOpen, setProviderOpen] = useState(false);
  const [activeProvider, setActiveProvider] = useState(PROVIDERS[0]);

  return (
    <header className="sticky top-0 z-40 hidden border-b border-white/10 bg-black/80 backdrop-blur lg:block">
      <div className="mx-auto grid h-16 max-w-[1320px] grid-cols-12 items-center gap-4 px-6">
        <div className="col-span-3">
          <Link href="/" className="flex items-center gap-2">
            {logoUrl ? (
              <FallbackImage
                src={logoUrl}
                alt="Logo"
                className="ui-asset-img ui-desktop-logo rounded-lg object-cover ring-1 ring-[color:var(--front-gold)]/40"
              />
            ) : (
              <div className="ui-desktop-logo rounded-lg bg-gradient-to-br from-[color:var(--front-gold)]/50 to-[color:var(--front-gold)]/40 ring-1 ring-[color:var(--front-gold)]/40" />
            )}
            <span className="text-lg font-black tracking-tight text-white">{siteName}</span>
          </Link>
        </div>

        <nav className="col-span-5 flex items-center justify-center gap-2">
          {NAV_LINKS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-white/85 transition hover:bg-white/10 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="col-span-4 flex items-center justify-end gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setProviderOpen((v) => !v)}
              className="flex min-w-[140px] items-center justify-between rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white/90 hover:bg-white/10"
            >
              <span>{activeProvider}</span>
              <span className="text-xs">▼</span>
            </button>
            {providerOpen ? (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-10 cursor-default"
                  aria-label="关闭供应商菜单"
                  onClick={() => setProviderOpen(false)}
                />
                <div className="absolute right-0 top-full z-20 mt-1 w-40 rounded-xl border border-white/15 bg-zinc-900 py-1 shadow-xl">
                  {PROVIDERS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        setActiveProvider(p);
                        setProviderOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-white/90 hover:bg-white/10"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </>
            ) : null}
          </div>

          {/* Public header: remove Login/Sign up (moved into Action Bar per reference) */}
        </div>
      </div>
    </header>
  );
}

