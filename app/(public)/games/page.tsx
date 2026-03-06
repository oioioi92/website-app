import Link from "next/link";
import { GamesPageClient } from "@/components/public/GamesPageClient";
import { VividGamesClient } from "@/components/vivid/VividGamesClient";
import { getActiveGamesForUi } from "@/lib/public/public-data";
import { getFeatureFlags } from "@/lib/public/featureFlags";
import { getPublicTheme } from "@/lib/theme/getPublicTheme";

export const dynamic = "force-dynamic";

export default async function PublicGamesPage() {
  let games: Array<{ id: string; name: string; logoUrl: string | null; code?: string | null }> = [];
  let siteName = "KINGDOM888";
  let loginUrl = "/login";
  let registerUrl = "/register-wa";
  let useVivid = false;
  try {
    const [flags, { theme }, g] = await Promise.all([
      getFeatureFlags(),
      getPublicTheme(),
      getActiveGamesForUi(60),
    ]);
    games = g;
    siteName = theme.siteName ?? "KINGDOM888";
    loginUrl = theme.loginUrl ?? "/login";
    registerUrl = theme.registerUrl ?? "/register-wa";
    useVivid = flags.useVividPortal;
  } catch {
    games = [];
  }

  if (useVivid) {
    return <VividGamesClient games={games} siteName={siteName} loginUrl={loginUrl} registerUrl={registerUrl} />;
  }

  return (
    <>
      <div className="hidden lg:block">
        <GamesPageClient games={games} />
      </div>
      <div className="lg:hidden mx-auto max-w-lg px-4 py-8">
        <div className="desk-card p-6 text-center">
          <h1 className="text-xl font-bold text-[var(--desk-text-primary)]">Games</h1>
          <p className="mt-2 text-sm text-[var(--desk-text-muted)]">Please use desktop for full games catalog.</p>
          <Link href="/" className="mt-4 inline-block desk-btn-primary rounded-lg px-4 py-2">← Back</Link>
        </div>
      </div>
    </>
  );
}
