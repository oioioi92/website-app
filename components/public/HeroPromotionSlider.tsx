"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FallbackImage } from "@/components/FallbackImage";

export function HeroPromotionSlider({
  slides,
  onOpen,
  compact = false
}: {
  slides: Array<{ id: string; imageUrl: string | null; title?: string | null; promotionId?: string; linkUrl?: string | null }>;
  onOpen?: (id: string) => void;
  compact?: boolean;
}) {
  const list = useMemo(() => slides.slice(0, 5), [slides]);
  const [index, setIndex] = useState(0);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [viewportW, setViewportW] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);
  const lastScrollAtRef = useRef(0);
  const scrollRafRef = useRef<number | null>(null);
  const programmaticScrollRef = useRef(false);
  const scrollIdleTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (list.length <= 1) return;
    if (isInteracting) return;
    const t = setInterval(() => {
      setIndex((v) => (v + 1) % list.length);
    }, 3500);
    return () => clearInterval(t);
  }, [list.length, isInteracting]);

  function clamp(n: number, min: number, max: number) {
    return Math.max(min, Math.min(max, n));
  }

  function openSlide(s: (typeof list)[number], eventTs: number) {
    // When user is swiping, don't treat it as a click.
    const sinceScroll = eventTs - lastScrollAtRef.current;
    if (sinceScroll < 220) return;

    if (s.promotionId && onOpen) {
      onOpen(s.promotionId);
      return;
    }
    if (s.linkUrl) window.open(s.linkUrl, "_blank", "noopener,noreferrer");
  }

  // Keep width updated so scrollLeft -> index is accurate
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const update = () => setViewportW(el.getBoundingClientRect().width || 0);
    update();
    const ro = new ResizeObserver(() => update());
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Programmatic scroll when index changes (auto or dot click)
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    if (list.length === 0) return;
    if (!viewportW) return;
    if (isInteracting) return;
    // During smooth programmatic scroll, ignore onScroll -> setIndex feedback.
    programmaticScrollRef.current = true;
    el.scrollTo({ left: index * viewportW, behavior: "smooth" });
    window.clearTimeout(scrollIdleTimerRef.current ?? undefined);
    scrollIdleTimerRef.current = window.setTimeout(() => {
      programmaticScrollRef.current = false;
    }, 220);
  }, [index, viewportW, isInteracting, list.length]);

  useEffect(() => {
    return () => {
      if (scrollRafRef.current) window.cancelAnimationFrame(scrollRafRef.current);
      window.clearTimeout(scrollIdleTimerRef.current ?? undefined);
    };
  }, []);

  if (list.length === 0) return null;

  return (
    <section className="rb-card overflow-hidden rounded-2xl">
      <div
        className="relative w-full"
        data-testid="hero-promo-slider"
      >
        {/* compact 也要更“高一点”，更像参考站的封面比例 */}
        <div className={compact ? "aspect-[16/7]" : "aspect-[16/9]"}>
          <div
            ref={scrollerRef}
            className="ui-hide-scrollbar flex h-full w-full snap-x snap-mandatory overflow-x-auto scroll-smooth"
            // Allow native horizontal swiping; avoid blocking pan-x (pan-y here can make swipe feel sticky in some webviews).
            style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-x" }}
            onTouchStart={() => setIsInteracting(true)}
            onTouchEnd={() => window.setTimeout(() => setIsInteracting(false), 900)}
            onMouseEnter={() => setIsInteracting(true)}
            onMouseLeave={() => window.setTimeout(() => setIsInteracting(false), 900)}
            onScroll={(e) => {
              const el = scrollerRef.current;
              if (!el || !viewportW) return;
              lastScrollAtRef.current = e.timeStamp;

              // When we trigger scrollTo({behavior:"smooth"}), the scroll event fires many times.
              // If we map scrollLeft -> index during that time, it can cause ping-pong and jank.
              if (!isInteracting && programmaticScrollRef.current) {
                window.clearTimeout(scrollIdleTimerRef.current ?? undefined);
                scrollIdleTimerRef.current = window.setTimeout(() => {
                  programmaticScrollRef.current = false;
                }, 120);
                return;
              }

              if (scrollRafRef.current) return;
              scrollRafRef.current = window.requestAnimationFrame(() => {
                scrollRafRef.current = null;
                const next = clamp(Math.round(el.scrollLeft / viewportW), 0, list.length - 1);
                // Only update when changed to avoid extra renders.
                setIndex((prev) => (prev === next ? prev : next));
              });
            }}
          >
            {list.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={(e) => openSlide(s, e.timeStamp)}
                className="group relative block h-full w-full shrink-0 grow-0 basis-full snap-start select-none text-left"
                draggable={false}
              >
                <FallbackImage
                  src={s.imageUrl}
                  alt={s.title ?? "banner"}
                  className="ui-asset-img h-full w-full object-cover"
                  loading={compact ? "eager" : "lazy"}
                />
                {!compact ? (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent p-4">
                    <p className="line-clamp-2 text-base font-semibold text-white">{s.title ?? "Promotion Banner"}</p>
                  </div>
                ) : null}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className={`flex items-center justify-center gap-1.5 ${compact ? "pb-2 pt-1" : "pb-3"}`}>
        {list.map((s, i) => (
          <button
            key={s.id}
            type="button"
            aria-label={`第 ${i + 1} 张幻灯片`}
            onClick={() => {
              setIsInteracting(true);
              const el = scrollerRef.current;
              if (el && viewportW) el.scrollTo({ left: i * viewportW, behavior: "smooth" });
              setIndex(i);
              window.setTimeout(() => setIsInteracting(false), 900);
            }}
            className={`h-2 w-2 rounded-full ${i === index ? "bg-[color:var(--front-gold)]" : "bg-white/30"}`}
          />
        ))}
      </div>
    </section>
  );
}
