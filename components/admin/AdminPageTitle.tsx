"use client";

import { useLocale } from "@/lib/i18n/context";

type Props = {
  titleKey: string;
  subtitleKey?: string;
  /** Optional fallback when key is missing (e.g. for EN: no Chinese) */
  titleFallback?: string;
  subtitleFallback?: string;
};

export function AdminPageTitle({ titleKey, subtitleKey, titleFallback, subtitleFallback }: Props) {
  const { t } = useLocale();
  const title = t(titleKey) || titleFallback || titleKey;
  const subtitle = subtitleKey ? (t(subtitleKey) || subtitleFallback || "") : "";
  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-800">{title}</h1>
      {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
    </div>
  );
}
