import { RegisterFormClient } from "@/components/public/RegisterFormClient";
import { VividRegisterClient } from "@/components/vivid/VividRegisterClient";
import { getPublicTheme } from "@/lib/theme/getPublicTheme";

export const dynamic = "force-dynamic";

export default async function RegisterWaPage() {
  let siteName = "KINGDOM888";
  let loginUrl = "/login";
  try {
    const { theme } = await getPublicTheme();
    siteName = theme.siteName ?? "KINGDOM888";
    loginUrl = theme.loginUrl ?? "/login";
  } catch { /* ignore */ }

  return (
    <>
      <div className="hidden lg:block">
        <VividRegisterClient siteName={siteName} loginUrl={loginUrl} registerUrl="/register-wa" />
      </div>
      <div className="lg:hidden">
        <RegisterFormClient />
      </div>
    </>
  );
}
