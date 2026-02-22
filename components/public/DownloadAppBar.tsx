"use client";

import { useEffect, useMemo, useState } from "react";
import { FallbackImage } from "@/components/FallbackImage";
import { GoldButton } from "@/components/public/ui/GoldButton";
import type { ThemeConfig } from "@/lib/public/theme";

const KEY = "download_bar_hide_until";

export function DownloadAppBar({ theme }: { theme: ThemeConfig }) {
  const config = theme.downloadBar;
  const t = theme.uiText ?? {};
  const [hidden, setHidden] = useState(false);
  const ready = useMemo(
    () =>
      config.enabled &&
      Boolean(config.imageUrl) &&
      Boolean(config.title) &&
      Boolean(config.ctaText) &&
      Boolean(config.ctaUrl),
    [config]
  );

  useEffect(() => {
    const raw = localStorage.getItem(KEY);
    const until = raw ? Number(raw) : 0;
    if (until > Date.now()) setHidden(true);
  }, []);

  if (!ready || hidden) return null;

  return (
    <div className="fixed inset-x-2 z-40 rounded-xl border border-[color:var(--front-gold)]/40 bg-black/90 p-2 shadow-[0_0_20px_var(--goldGlow)] lg:hidden" style={{ bottom: "calc(82px + env(safe-area-inset-bottom, 0px))" }}>
      <div className="flex items-center gap-2">
        <div className="h-11 w-11 overflow-hidden rounded-lg border border-[color:var(--front-gold)]/40">
          <FallbackImage src={config.imageUrl} alt={config.title ?? "download"} className="h-full w-full object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-bold text-[color:var(--front-gold-light)]">{config.title}</p>
          <p className="truncate text-[11px] text-white/75">
            {config.subtitle ?? (t.downloadbarsubtitle ?? "Fast access on your phone")}
          </p>
        </div>
        <a href={config.ctaUrl ?? "#"} target="_blank" rel="noreferrer">
          <GoldButton className="px-2 py-1.5 text-xs">{config.ctaText}</GoldButton>
        </a>
        <button
          type="button"
          onClick={() => {
            localStorage.setItem(KEY, String(Date.now() + 24 * 60 * 60 * 1000));
            setHidden(true);
          }}
          className="rounded border border-white/20 px-1.5 py-1 text-[11px] text-white/70"
        >
          X
        </button>
      </div>
    </div>
  );
}
