"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n/context";

type User = { id: string; email: string; role: string };

export function AdminProfileClient() {
  const { t } = useLocale();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/me", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setUser(d.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-[13px] text-[var(--compact-muted)]">{t("admin.common.loading")}</div>;
  if (!user) return <div className="text-[13px] text-[var(--compact-danger)]">未获取到登录信息</div>;

  return (
    <div className="admin-card p-6 space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--compact-muted)]">邮箱</label>
          <p className="text-[13px] font-medium text-[var(--compact-text)]">{user.email}</p>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--compact-muted)]">角色</label>
          <p className="text-[13px] font-medium text-[var(--compact-text)]">{user.role}</p>
        </div>
      </div>
      <div className="border-t border-[var(--compact-card-border)] pt-4">
        <Link
          href="/admin/settings/password"
          className="admin-compact-btn admin-compact-btn-ghost text-[13px]"
        >
          修改密码
        </Link>
      </div>
    </div>
  );
}
