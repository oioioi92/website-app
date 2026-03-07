import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { getPublicTheme } from "@/lib/theme/getPublicTheme";
import { safeRedirectUrl } from "@/lib/utils/safeRedirect";
import { VividSettingsClient } from "@/components/vivid/VividSettingsClient";

export const dynamic = "force-dynamic";

const SESSION_COOKIE = "member_ref";

export default async function PublicSettingsPage() {
  let theme: Awaited<ReturnType<typeof getPublicTheme>>["theme"];
  try {
    const { theme: t } = await getPublicTheme();
    theme = t;
  } catch {
    theme = { siteName: "KINGDOM888", loginUrl: "/login", registerUrl: "/register-wa", uiText: {} } as Awaited<ReturnType<typeof getPublicTheme>>["theme"];
  }

  const cookieStore = await cookies();
  const userRef = cookieStore.get(SESSION_COOKIE)?.value;
  if (!userRef) {
    const base = safeRedirectUrl(theme.loginUrl) ?? "/login";
    redirect(base.startsWith("/") ? `${base}${base.includes("?") ? "&" : "?"}returnUrl=${encodeURIComponent("/settings")}` : base);
  }
  const member = await db.member.findUnique({
    where: { userRef },
    select: { id: true, isActive: true },
  });
  if (!member || !member.isActive) {
    const base = safeRedirectUrl(theme.loginUrl) ?? "/login";
    redirect(base.startsWith("/") ? `${base}${base.includes("?") ? "&" : "?"}returnUrl=${encodeURIComponent("/settings")}` : base);
  }

  return (
    <VividSettingsClient
      siteName={theme.siteName ?? "KINGDOM888"}
      logoUrl={theme.logoUrl ?? null}
      loginUrl={theme.loginUrl ?? "/login"}
      registerUrl={theme.registerUrl ?? "/register-wa"}
    />
  );
}
