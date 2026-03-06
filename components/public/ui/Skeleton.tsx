"use client";

/** Skeleton placeholder (DESKTOP-UI-DESIGN-SPEC §1.7) - avoid layout jump */
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-[var(--desk-panel-alt,#1E212A)] ${className}`}
      aria-hidden
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="desk-card space-y-3">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}
