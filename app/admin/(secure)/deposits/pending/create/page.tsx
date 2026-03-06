import Link from "next/link";
import { AdminManualDepositClient } from "@/components/admin/AdminManualDepositClient";

export const dynamic = "force-dynamic";

export default function ManualCreateDepositPage() {
  return (
    <div>
      <div className="mb-1">
        <Link href="/admin/deposits/pending" className="text-sky-600 hover:underline font-medium">← 待审核入款</Link>
      </div>
      <h1 className="text-xl font-semibold text-slate-800">手动创建入款</h1>
      <p className="mt-1 text-sm text-slate-500">为指定会员创建入款申请，提交后可在待审核列表中处理。</p>
      <AdminManualDepositClient />
    </div>
  );
}
