import { DeskCardP44 } from "@/components/public/DeskCardP44";

export function BannerPair() {
  return (
    <div className="grid grid-cols-12 gap-6">
      <DeskCardP44 noPadding className="col-span-6 h-[220px] overflow-hidden p-0">
        <Banner
          title="TRUSTED PLATFORM"
          subtitle="Security • Responsible • Fast Support"
        />
      </DeskCardP44>

      <DeskCardP44 noPadding className="col-span-6 h-[220px] overflow-hidden p-0">
        <Banner
          title="REFERRAL PROGRAM"
          subtitle="Share code • Earn commission • VIP tiers"
        />
      </DeskCardP44>
    </div>
  );
}

function Banner({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex h-full w-full flex-col justify-center p-8">
      <div className="text-2xl font-bold text-[var(--desk-accent)]">{title}</div>
      <div className="mt-2 text-[var(--desk-text-muted)]">{subtitle}</div>
      <div className="mt-6 text-sm text-[var(--desk-text-muted)]">
        (Replace with your banner image later)
      </div>
    </div>
  );
}
