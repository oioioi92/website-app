"use client";

import { AdminImageToUrlClient } from "@/components/admin/AdminImageToUrlClient";
import { useLocale } from "@/lib/i18n/context";

export default function AdminImageToUrlPage() {
  const { t } = useLocale();
  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">{t("admin.nav.image-to-url")}</h1>
        <p className="mt-1 text-sm text-slate-500">
          上传图片获取链接，用于后台各处。建议图片宽度不超过 1500px。
        </p>
      </div>
      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <AdminImageToUrlClient />
      </section>
    </div>
  );
}
