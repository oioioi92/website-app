import Link from "next/link";

export default function PublicSettingsPage() {
  return (
    <main className="min-h-screen bg-[color:var(--p44-grey-bg)] px-4 py-5">
      <section className="mx-auto max-w-[1200px] rounded-xl border border-[color:var(--p44-grey-light)]/30 bg-[color:var(--p44-grey-panel)]/60 p-6">
        <h1 className="text-lg font-bold text-white">SETTINGS</h1>
        <p className="mt-2 text-sm text-white/75">Settings placeholder. Add language, currency and profile switches here.</p>
        <Link className="mt-3 inline-block text-sm text-[color:var(--p44-green)] underline" href="/me">
          Go to My Claims
        </Link>
      </section>
    </main>
  );
}
