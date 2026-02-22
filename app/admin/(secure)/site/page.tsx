import { ThemeSettingsClient } from "@/components/admin/ThemeSettingsClient";

export const dynamic = "force-dynamic";

export default function AdminSitePage() {
  return (
    <div>
      <h1 className="text-lg font-semibold text-[var(--compact-text)]">前台设置</h1>
      <p className="mt-0.5 text-[13px] text-[var(--compact-muted)]">
        在此修改整站前台：站点名、Logo、登录/注册/充值/提现链接、跑马灯、区块标题等，保存后前台立即生效
      </p>
      <div className="mt-6">
        <ThemeSettingsClient />
      </div>
    </div>
  );
}
