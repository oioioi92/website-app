"use client";

import { createContext, useCallback, useContext, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n/context";

type AdminApiContextValue = {
  forbidden: boolean;
  setForbidden: (v: boolean) => void;
  clearForbidden: () => void;
};

const AdminApiContext = createContext<AdminApiContextValue | null>(null);

export function AdminApiProvider({ children }: { children: React.ReactNode }) {
  const [forbidden, setForbidden] = useState(false);
  const clearForbidden = useCallback(() => setForbidden(false), []);
  return (
    <AdminApiContext.Provider value={{ forbidden, setForbidden, clearForbidden }}>
      {children}
    </AdminApiContext.Provider>
  );
}

export function useAdminApiContext(): AdminApiContextValue {
  const ctx = useContext(AdminApiContext);
  if (!ctx) return { forbidden: false, setForbidden: () => {}, clearForbidden: () => {} };
  return ctx;
}

/** 在 AdminShell 中渲染：403 时显示顶部横幅 */
export function AdminForbiddenBanner() {
  const { forbidden, clearForbidden } = useAdminApiContext();
  const { t } = useLocale();
  if (!forbidden) return null;
  return (
    <div
      className="sticky top-0 z-50 flex items-center justify-between gap-4 bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow"
      role="alert"
    >
      <span>{t("admin.forbiddenBanner.message")}</span>
      <Link
        href="/admin"
        onClick={clearForbidden}
        className="rounded bg-white/20 px-3 py-1 hover:bg-white/30"
      >
        {t("admin.forbiddenBanner.backToHome")}
      </Link>
    </div>
  );
}

/**
 * 封装 fetch：若响应为 403 则设置全局 forbidden，便于显示统一无权限横幅。
 * 返回的 response 仍由调用方处理。
 */
export async function adminFetch(
  url: string | URL,
  init?: RequestInit,
  setForbidden?: (v: boolean) => void
): Promise<Response> {
  const res = await fetch(url, { credentials: "include", ...init });
  if (res.status === 403 && setForbidden) setForbidden(true);
  return res;
}
