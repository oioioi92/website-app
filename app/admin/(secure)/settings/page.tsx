"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdminUser } from "@/lib/admin-user-context";
import { can } from "@/lib/rbac-client";
import { SETTINGS_NAV } from "@/config/settings-nav";

export default function AdminSettingsPage() {
  const router = useRouter();
  const user = useAdminUser();
  const filteredNav = user
    ? SETTINGS_NAV.map((group) => ({
        ...group,
        children: (group.children ?? []).filter(
          (item) => can(user.role, item.permission ?? "settings")
        ),
      })).filter((group) => group.children.length > 0)
    : SETTINGS_NAV;

  const firstHref = filteredNav[0]?.children?.[0]?.href;

  useEffect(() => {
    if (firstHref) router.replace(firstHref);
  }, [firstHref, router]);

  if (!firstHref) return null;
  return (
    <div className="py-8 text-center text-[var(--compact-muted)] text-sm">
      Redirecting…
    </div>
  );
}
