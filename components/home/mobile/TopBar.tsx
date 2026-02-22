"use client";

import Link from "next/link";
import { FallbackImage } from "@/components/FallbackImage";

export function TopBar({ logoUrl }: { logoUrl: string | null }) {
  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-[#3E3625] bg-[#080808]/95 px-4 backdrop-blur">
      <Link href="/" className="flex items-center gap-2">
        {logoUrl ? (
          <FallbackImage src={logoUrl} alt="Logo" className="h-8 w-auto object-contain" />
        ) : (
          <span className="text-xl font-black tracking-tighter text-[#C9A24F]">LOGO</span>
        )}
      </Link>
      {/* Public header: remove Login/Sign up (moved into Action Bar per reference) */}
    </header>
  );
}
