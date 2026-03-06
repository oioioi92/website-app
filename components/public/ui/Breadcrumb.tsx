"use client";

import Link from "next/link";

export type BreadcrumbItem = { label: string; href?: string };

/** Desktop black/gold breadcrumb (DESKTOP-UI-DESIGN-SPEC §3.1) */
export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="flex flex-wrap items-center gap-1.5 text-sm text-[var(--desk-text-muted)]" aria-label="Breadcrumb">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span className="opacity-60">/</span>}
          {item.href ? (
            <Link href={item.href} className="hover:text-[var(--desk-text-primary)] transition">
              {item.label}
            </Link>
          ) : (
            <span className="text-[var(--desk-text-primary)]">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
