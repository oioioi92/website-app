import { db } from "@/lib/db";
import { VividHomeClient } from "@/components/vivid/VividHomeClient";
import { VividMobileHome } from "@/components/vivid/VividMobileHome";
import { parseThemeJson } from "@/lib/public/theme";
import { getActiveGamesForUi, getActivePromotionsForUi } from "@/lib/public/public-data";
import { getProviderLogoFallback } from "@/lib/public/namedAssets";
import { getPublicTheme } from "@/lib/theme/getPublicTheme";
import { getFeatureFlags } from "@/lib/public/featureFlags";

export const dynamic = "force-dynamic";

const MOCK_PROMO_COVERS = ["/assets/providers/promotion.png", "/assets/providers/918kiss.png", "/assets/providers/mega888.png"] as const;

export default async function PublicHomePage() {
  const flags = await getFeatureFlags();
  const internalTestMode = flags.internalTestMode;
  const now = new Date();
  try {
    const [{ theme }, promotionsUi, gamesUi] = await Promise.all([
      getPublicTheme(),
      getActivePromotionsForUi(12, now),
      getActiveGamesForUi(120)
    ]);

    return (
      <>
        <div className="hidden lg:block">
          <VividHomeClient
            siteName={theme.siteName ?? "KINGDOM888"}
            promotions={promotionsUi}
            games={gamesUi}
            loginUrl={theme.loginUrl ?? "/login"}
            registerUrl={theme.registerUrl ?? "/register-wa"}
            depositUrl={theme.depositUrl ?? "/deposit"}
            internalTestMode={internalTestMode}
          />
        </div>
        <div className="lg:hidden">
          <VividMobileHome theme={theme} promotions={promotionsUi} games={gamesUi} internalTestMode={internalTestMode} />
        </div>
      </>
    );
  } catch {
    const mockTheme = parseThemeJson(null);
    const mockPromotions = [
      {
        id: "mock-1",
        title: "Welcome Bonus 50%",
        subtitle: null,
        coverUrl: MOCK_PROMO_COVERS[0],
        detailJson: { blocks: [{ type: "p", text: "Mock detail content." }] },
        ruleJson: {},
        percentText: "50%",
        statusLabel: "ACTIVE" as const,
        limitTag: "Mock Rule",
        grantTag: "Mock Grant",
        groupLabel: "GENERAL"
      },
      {
        id: "mock-2",
        title: "New Member Gift",
        subtitle: null,
        coverUrl: MOCK_PROMO_COVERS[1],
        detailJson: { blocks: [{ type: "p", text: "Mock detail content." }] },
        ruleJson: {},
        percentText: "30%",
        statusLabel: "ACTIVE" as const,
        limitTag: "Mock Rule",
        grantTag: "Mock Grant",
        groupLabel: "GENERAL"
      },
      {
        id: "mock-3",
        title: "Weekly Cashback",
        subtitle: null,
        coverUrl: MOCK_PROMO_COVERS[2],
        detailJson: { blocks: [{ type: "p", text: "Mock detail content." }] },
        ruleJson: {},
        percentText: "20%",
        statusLabel: "SCHEDULED" as const,
        limitTag: "Mock Rule",
        grantTag: "Mock Grant",
        groupLabel: "GENERAL"
      }
    ];
    const mockGames = Array.from({ length: 18 }).map((_, idx) => ({
      id: `mock-game-${idx + 1}`,
      name: `Provider ${idx + 1}`,
      logoUrl: getProviderLogoFallback(idx),
      code: `P${idx + 1}`
    }));

    if (!flags.useLegacyHome) {
      return (
        <>
          <div className="hidden lg:block">
            <VividHomeClient
              siteName={mockTheme.siteName ?? "Site"}
              promotions={mockPromotions}
              games={mockGames}
              loginUrl={mockTheme.loginUrl ?? "/login"}
              registerUrl={mockTheme.registerUrl ?? "/register-wa"}
              depositUrl={mockTheme.depositUrl ?? "/deposit"}
              internalTestMode={internalTestMode}
            />
          </div>
          <div className="lg:hidden">
            <VividMobileHome theme={mockTheme} promotions={mockPromotions} games={mockGames} internalTestMode={internalTestMode} />
          </div>
        </>
      );
    }

    return (
      <div className="mx-auto max-w-lg px-4 py-12 text-center">
        <p className="text-lg font-semibold text-white">数据库未连接</p>
        <p className="mt-2 text-sm text-white/70">
          请在项目根目录的 <code className="rounded bg-white/10 px-1">.env</code> 中配置{" "}
          <code className="rounded bg-white/10 px-1">DATABASE_URL</code>，格式示例：
        </p>
        <pre className="mt-3 overflow-x-auto rounded-lg border border-white/20 bg-black/30 p-3 text-left text-xs text-[color:var(--rb-gold2)]">
          DATABASE_URL=&quot;postgresql://用户:密码@localhost:5432/数据库名&quot;
        </pre>
        <p className="mt-3 text-xs text-white/50">配置后重启 dev 服务器（npm run dev）</p>
      </div>
    );
  }
}
