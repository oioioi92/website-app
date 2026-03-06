import { RegisterDesktopWrapper } from "@/components/public/RegisterDesktopWrapper";
import { RegisterFormClient } from "@/components/public/RegisterFormClient";
import { VividRegisterClient } from "@/components/vivid/VividRegisterClient";
import { getFeatureFlags } from "@/lib/public/featureFlags";
import { getPublicTheme } from "@/lib/theme/getPublicTheme";

export const dynamic = "force-dynamic";

export default async function RegisterWaPage() {
  let useVivid = false;
  let siteName = "KINGDOM888";
  let loginUrl = "/login";
  try {
    const [flags, { theme }] = await Promise.all([getFeatureFlags(), getPublicTheme()]);
    useVivid = flags.useVividPortal;
    siteName = theme.siteName ?? "KINGDOM888";
    loginUrl = theme.loginUrl ?? "/login";
  } catch { /* ignore */ }

  return (
    <>
      <div className="hidden lg:block">
        {useVivid ? (
          <VividRegisterClient siteName={siteName} loginUrl={loginUrl} registerUrl="/register-wa" />
        ) : (
          <RegisterDesktopWrapper />
        )}
      </div>
      <div className="lg:hidden">
        <RegisterFormClient />
      </div>
    </>
  );
}
