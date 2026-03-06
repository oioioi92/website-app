"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useLocale } from "@/lib/i18n/context";
import { PromotionEditClient } from "@/components/admin/PromotionEditClient";

export default function AdminPromotionEditPage() {
  const { t } = useLocale();
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";
  return (
    <div>
      <nav className="flex items-center gap-2 text-[13px] text-[var(--admin-muted)]">
        <Link href="/admin/promotions" className="hover:text-[var(--admin-primary)]">{t("admin.promotionEdit.breadcrumbPromotions")}</Link>
        <span aria-hidden>/</span>
        <span className="text-[var(--admin-text)]">{t("admin.promotionEdit.breadcrumbEdit")}</span>
      </nav>
      <h1 className="mt-3 text-lg font-bold text-red-600 border-b-2 border-red-600 pb-2">
        {t("admin.promotionEdit.titlePrefix")} <span className="font-mono text-[15px]">{id}</span>
      </h1>
      <p className="mt-1 text-[13px] text-[var(--admin-muted)]">{t("admin.promotionEdit.pageDesc")}</p>
      <PromotionEditClient id={id} />
    </div>
  );
}
