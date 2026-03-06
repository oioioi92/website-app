import { VividHistoryClient } from "@/components/vivid/VividHistoryClient";
import { getPublicTheme } from "@/lib/theme/getPublicTheme";
import { getFeatureFlags } from "@/lib/public/featureFlags";

export const dynamic = "force-dynamic";

export default async function PublicHistoryPage() {
  try {
    const [flags, { theme }] = await Promise.all([
      getFeatureFlags(),
      getPublicTheme(),
    ]);
    if (flags.useVividPortal) {
      return (
        <VividHistoryClient
          siteName={theme.siteName ?? "KINGDOM888"}
          loginUrl={theme.loginUrl ?? "/login"}
          registerUrl={theme.registerUrl ?? "/register-wa"}
        />
      );
    }
  } catch {
    // fallback below
  }
  return (
    <main className="min-h-screen bg-[color:var(--p44-grey-bg)] px-4 py-5">
      <section className="mx-auto max-w-[1200px] rounded-xl border border-[color:var(--p44-grey-light)]/30 bg-[color:var(--p44-grey-panel)]/60 p-6">
        <h1 className="text-lg font-bold text-white">HISTORY</h1>
        <p className="mt-2 text-sm text-white/75">History page placeholder. You can connect real transaction history here.</p>
      </section>
    </main>
  );
}
