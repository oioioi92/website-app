import { redirect } from "next/navigation";
import { getPublicTheme } from "@/lib/theme/getPublicTheme";
import { safeRedirectUrl } from "@/lib/utils/safeRedirect";
import { LoginSplitClient } from "@/components/public/LoginSplitClient";
import { LoginCard } from "@/components/auth/LoginCard";
import { DesktopTopbarP44 } from "@/components/shell/DesktopTopbarP44";
import { VividLoginClient } from "@/components/vivid/VividLoginClient";
import { getFeatureFlags } from "@/lib/public/featureFlags";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  let siteName = "KINGDOM888";
  let registerUrl = "/register-wa";
  let useVivid = false;
  try {
    const [{ theme }, flags] = await Promise.all([getPublicTheme(), getFeatureFlags()]);
    const url = safeRedirectUrl(theme.loginUrl);
    if (url) redirect(url);
    siteName = theme.siteName ?? "KINGDOM888";
    registerUrl = theme.registerUrl ?? "/register-wa";
    useVivid = flags.useVividPortal;
  } catch {
    // fall through
  }

  return (
    <>
      <div className="hidden lg:block">
        {useVivid ? (
          <VividLoginClient siteName={siteName} loginUrl="/login" registerUrl={registerUrl} />
        ) : (
          <div className="min-h-screen" style={{ background: "var(--desk-bg, #0E1014)" }}>
            <DesktopTopbarP44 />
            <main className="mx-auto max-w-[1280px] px-6 py-6">
              <LoginCard />
            </main>
          </div>
        )}
      </div>
      <div className="lg:hidden">
        <LoginSplitClient />
      </div>
    </>
  );
}

