"use client";

import { AdminImageToUrlClient } from "@/components/admin/AdminImageToUrlClient";
import { useLocale } from "@/lib/i18n/context";

export default function AdminToolsPage() {
  const { t } = useLocale();
  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-800">Tools</h1>
        <p className="mt-1 text-sm text-slate-500">
          {t("admin.navTooltip.tools")}
        </p>
      </div>
      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-slate-500">Image To URL</h2>
        <p className="mb-4 text-xs text-slate-500">JPG / PNG / WEBP / GIF，单张最大 5MB。上传后获得可填到后台的图片链接。</p>
        <AdminImageToUrlClient />
      </section>
    </div>
  );
}
