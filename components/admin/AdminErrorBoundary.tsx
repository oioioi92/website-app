"use client";

import React from "react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n/context";

type Props = { children: React.ReactNode };

type State = { hasError: boolean; error: Error | null };

function AdminErrorFallback({ onRetry }: { onRetry: () => void }) {
  const { t } = useLocale();
  return (
    <div className="admin-error-fallback min-h-[280px] flex flex-col items-center justify-center rounded-xl border border-amber-200 bg-amber-50/90 p-8 text-center">
      <p className="text-amber-800 font-medium mb-2">{t("admin.errorBoundary.title")}</p>
      <p className="text-amber-700 text-sm mb-4 max-w-md">{t("admin.errorBoundary.hint")}</p>
      <div className="flex gap-3">
        <button type="button" onClick={onRetry} className="admin-compact-btn admin-compact-btn-ghost">
          {t("admin.errorBoundary.tryAgain")}
        </button>
        <Link href="/admin" className="admin-compact-btn admin-compact-btn-primary">
          {t("admin.errorBoundary.backToDashboard")}
        </Link>
      </div>
    </div>
  );
}

/**
 * Admin 错误边界：捕获子组件树中的渲染/生命周期错误，展示友好 fallback，避免整页白屏。
 * 仅 class 组件可实现 getDerivedStateFromError / componentDidCatch。
 */
export class AdminErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
      console.error("[AdminErrorBoundary]", error, errorInfo.componentStack);
    }
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <AdminErrorFallback onRetry={() => this.setState({ hasError: false, error: null })} />
      );
    }
    return this.props.children;
  }
}
