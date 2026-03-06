import { VividGamesClient } from "@/components/vivid/VividGamesClient";
import { getActiveGamesForUi } from "@/lib/public/public-data";
import { getPublicTheme } from "@/lib/theme/getPublicTheme";

export const dynamic = "force-dynamic";

/** 与首页一致：始终使用新版 Vivid 游戏页，避免从 desktop home 点「Games」进入旧版 */
export default async function PublicGamesPage() {
  let games: Array<{ id: string; name: string; logoUrl: string | null; code?: string | null }> = [];
  let siteName = "KINGDOM888";
  let loginUrl = "/login";
  let registerUrl = "/register-wa";
  try {
    const [{ theme }, g] = await Promise.all([
      getPublicTheme(),
      getActiveGamesForUi(60),
    ]);
    games = g;
    siteName = theme.siteName ?? "KINGDOM888";
    loginUrl = theme.loginUrl ?? "/login";
    registerUrl = theme.registerUrl ?? "/register-wa";
  } catch {
    games = [];
  }

  return <VividGamesClient games={games} siteName={siteName} loginUrl={loginUrl} registerUrl={registerUrl} />;
}
