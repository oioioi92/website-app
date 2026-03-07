import { VividPromoClient } from "@/components/vivid/VividPromoClient";
import { getActivePromotionsForUi } from "@/lib/public/public-data";
import { getPublicTheme } from "@/lib/theme/getPublicTheme";

export const dynamic = "force-dynamic";

export default async function PublicBonusPage() {
  const now = new Date();
  let promotions: Awaited<ReturnType<typeof getActivePromotionsForUi>> = [];
  let theme: Awaited<ReturnType<typeof getPublicTheme>>["theme"];
  try {
    const [t, p] = await Promise.all([
      getPublicTheme(),
      getActivePromotionsForUi(50, now),
    ]);
    theme = t.theme;
    promotions = p;
  } catch {
    try {
      const t = await getPublicTheme();
      theme = t.theme;
    } catch {
      theme = { siteName: "KINGDOM888", loginUrl: "/login", registerUrl: "/register-wa", routes: { promotion: "/promotion", bonus: "/bonus" }, uiText: {} } as Awaited<ReturnType<typeof getPublicTheme>>["theme"];
    }
  }
  return (
    <VividPromoClient
      promotions={promotions}
      siteName={theme.siteName ?? "KINGDOM888"}
      logoUrl={theme.logoUrl ?? null}
      defaultTab="Bonus"
      loginUrl={theme.loginUrl ?? "/login"}
      registerUrl={theme.registerUrl ?? "/register-wa"}
      cardConfig={theme.vividPromoCardConfig}
      routeBonus={theme.routes?.bonus ?? "/bonus"}
      uiText={theme.uiText ?? {}}
    />
  );
}
