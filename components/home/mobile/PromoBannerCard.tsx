"use client";

import { FallbackImage } from "@/components/FallbackImage";
import Link from "next/link";

export function PromoBannerCard({
  imageUrl,
  title,
  linkUrl,
  fallbackUrl = "/bonus",
  onClick
}: {
  imageUrl: string | null;
  title: string | null;
  linkUrl: string | null;
  fallbackUrl?: string;
  onClick?: () => void;
}) {
  const href = linkUrl || fallbackUrl;
  const content = (
    <div className="aspect-[16/7] w-full bg-[#1A1A1A]">
      <FallbackImage
        src={imageUrl}
        alt={title || "Promotion"}
        className="h-full w-full object-cover"
        loading="eager"
      />
    </div>
  );

  return (
    <div className="px-4 py-4">
      {onClick ? (
        <button
          type="button"
          onClick={onClick}
          className="block w-full overflow-hidden rounded-xl border border-[#3E3625] text-left"
        >
          {content}
        </button>
      ) : (
        <Link href={href} className="block overflow-hidden rounded-xl border border-[#3E3625]">
          {content}
        </Link>
      )}
    </div>
  );
}
