import Link from "next/link";
import { GameApiSettingsClient } from "@/components/admin/GameApiSettingsClient";

export const dynamic = "force-dynamic";

export default function AdminSettingsGameApiPage() {
  return (
    <div>
      <div className="flex items-center gap-2 text-[13px] text-[var(--compact-muted)]">
        <Link href="/admin/settings" className="hover:text-[var(--compact-primary)]">Settings</Link>
        <span>/</span>
        <span>Game API</span>
      </div>
      <h1 className="mt-2 text-lg font-semibold text-[var(--compact-text)]">Game API</h1>
      <p className="mt-0.5 text-[13px] text-[var(--compact-muted)]">插件游戏供应商 API 配置</p>
      <div className="mt-6">
        <GameApiSettingsClient />
      </div>
    </div>
  );
}
