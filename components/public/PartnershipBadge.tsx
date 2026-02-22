"use client";

import { FallbackImage } from "@/components/FallbackImage";

export function PartnershipBadge({ imageUrl }: { imageUrl: string | null }) {
  return (
    <div
      className="partnership-badge-float flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-[color:var(--front-gold)]/40 bg-black/40 shadow-lg animate-[float-y_4s_ease-in-out_infinite] md:h-24 md:w-24"
      title="合作方"
    >
      {imageUrl ? (
        <FallbackImage src={imageUrl} alt="Partnership" className="h-full w-full object-cover" />
      ) : (
        <span className="text-2xl text-[color:var(--front-gold)]/60" aria-hidden>★</span>
      )}
    </div>
  );
}
