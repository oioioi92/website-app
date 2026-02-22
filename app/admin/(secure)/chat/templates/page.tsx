import Link from "next/link";
import { AdminTemplateListClient } from "@/components/admin/AdminTemplateListClient";

export const dynamic = "force-dynamic";

export default function AdminChatTemplatesPage() {
  return (
    <div>
      <div className="mb-2">
        <Link href="/admin/chat" className="font-medium text-sky-600 hover:underline">← Live Chat</Link>
      </div>
      <h1 className="text-xl font-semibold text-slate-800">快捷回复模板</h1>
      <p className="mt-1 text-sm text-slate-500">新增、编辑或删除模板，在 Live Chat 底部可选用。</p>
      <AdminTemplateListClient />
    </div>
  );
}
