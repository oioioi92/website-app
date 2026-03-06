"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

type LinkItem = { label: string; href: string };

export function ContactDropdown({ links = [] }: { links?: LinkItem[] }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const defaultLinks: LinkItem[] =
    links.length > 0
      ? links
      : [
          { label: "Telegram Support", href: "#" },
          { label: "WhatsApp Support", href: "#" },
          { label: "Live Chat", href: "/live-chat" },
        ];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        className="text-[var(--desk-text)] hover:text-[var(--desk-accent)]"
        onClick={() => setOpen((v) => !v)}
      >
        Contact Us ▾
      </button>

      {open && (
        <div
          className="absolute left-0 top-10 w-[260px] rounded-[18px] border-2 border-[var(--desk-border)] bg-[var(--desk-header-bg)] p-3 shadow-xl"
          style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)" }}
        >
          {defaultLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex h-10 items-center rounded-[14px] px-3 hover:bg-[var(--desk-panel-hover)]"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
