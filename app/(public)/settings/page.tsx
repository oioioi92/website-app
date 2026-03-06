import { VividSettingsClient } from "@/components/vivid/VividSettingsClient";
import { getPublicTheme } from "@/lib/theme/getPublicTheme";

export const dynamic = "force-dynamic";

export default async function PublicSettingsPage() {
  let theme: Awaited<ReturnType<typeof getPublicTheme>>["theme"];
  try {
    const { theme: t } = await getPublicTheme();
    theme = t;
  } catch {
    theme = { siteName: "KINGDOM888", loginUrl: "/login", registerUrl: "/register-wa", uiText: {} } as Awaited<ReturnType<typeof getPublicTheme>>["theme"];
  }
  return (
    <VividSettingsClient
      siteName={theme.siteName ?? "KINGDOM888"}
      loginUrl={theme.loginUrl ?? "/login"}
      registerUrl={theme.registerUrl ?? "/register-wa"}
    />
  );
}
