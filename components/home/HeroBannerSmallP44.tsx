"use client";

import type { ReactNode } from "react";

type Slide = { id: string; imageUrl: string | null; title?: string; linkUrl?: string | null };

/** 左上小 Banner 区：固定高度，可轮播或静态展示一张 */
export function HeroBannerSmallP44({
  slides = [],
  onOpenPromo,
  badge,
}: {
  slides?: Slide[];
  onOpenPromo?: (id: string) => void;
  badge?: ReactNode;
}) {
  const first = slides[0];
  const height = "200px";

  return (
    <div className="desk-card relative h-[220px] overflow-hidden p-0 md:h-[260px]">
      {first ? (
        first.imageUrl ? (
          <button
            type="button"
            className="h-full w-full text-left"
            onClick={() => onOpenPromo?.(first.id)}
          >
            <img
              src={first.imageUrl}
              alt={first.title ?? "Banner"}
              className="h-full w-full object-cover"
            />
          </button>
        ) : (
          <div
            className="flex h-full w-full flex-col items-center justify-center bg-[var(--desk-panel-alt)] p-4"
            style={{ minHeight: height }}
          >
            <span className="text-4xl text-[var(--desk-text-muted)]">🖼️</span>
            <span className="mt-2 text-sm text-[var(--desk-text-muted)]">Banner</span>
          </div>
        )
      ) : (
        <div
          className="flex h-full w-full flex-col items-center justify-center bg-[var(--desk-panel-alt)] p-4"
          style={{ minHeight: height }}
        >
          <span className="text-4xl text-[var(--desk-text-muted)]">🖼️</span>
          <span className="mt-2 text-sm text-[var(--desk-text-muted)]">Banner (1024×300)</span>
        </div>
      )}
      {badge ? <div className="absolute right-3 top-3 z-10">{badge}</div> : null}
    </div>
  );
}
