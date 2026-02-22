import Link from "next/link";
import { FallbackImage } from "@/components/FallbackImage";

export function MobileTopBar({
  logoUrl,
  partnershipBadgeUrl,
  siteName
}: {
  logoUrl: string | null;
  partnershipBadgeUrl: string | null;
  siteName: string;
}) {
  return (
    <div className="safe-inset-top sticky top-0 z-30 border-b border-[color:var(--p44-grey-light)]/30 bg-[color:var(--p44-header-bg)]/95 backdrop-blur lg:hidden">
      <div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between px-4">
        <button type="button" className="flex h-9 w-9 items-center justify-center rounded-lg text-[color:var(--p44-text-dark)]" aria-label="菜单">
          <span className="text-lg leading-none">☰</span>
        </button>
        <Link href="/" className="flex min-w-0 items-center gap-2">
          {logoUrl ? (
            <FallbackImage src={logoUrl} alt="Logo" className="h-8 w-auto object-contain" />
          ) : (
            <span className="text-base font-black tracking-tight text-[color:var(--p44-green)]">PERODUA</span>
          )}
          <span className="truncate text-base font-black tracking-tight text-[color:var(--p44-text-dark)]">{siteName || "BRAND"}</span>
          <span className="text-base font-black text-[color:var(--p44-red)]">44</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded bg-[color:var(--p44-red)] text-xs font-bold text-white">4</span>
          <span className="flex h-8 w-8 items-center justify-center rounded bg-[color:var(--p44-grey-panel)] text-xs font-bold text-white">4</span>
          <Link
            href="/partnership"
            aria-label="合作方"
            className="inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-[color:var(--p44-grey-light)] bg-[color:var(--p44-grey-panel)]"
          >
            {partnershipBadgeUrl ? (
              <FallbackImage src={partnershipBadgeUrl} alt="Partnership" className="h-full w-full object-cover" />
            ) : (
              <span className="text-[12px] font-bold text-white">👤</span>
            )}
          </Link>
        </div>
      </div>
    </div>
  );
}
