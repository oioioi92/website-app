"use client";

import { useLocale } from "@/lib/i18n/context";

type StickySaveBarProps = {
  onSave: () => void;
  saving: boolean;
  success?: boolean;
  error?: boolean;
  message?: string;
};

/**
 * 设置页底部固定保存栏：保存按钮 + 成功/失败文案，风格与各设置页统一。
 */
export function StickySaveBar({ onSave, saving, success, error, message }: StickySaveBarProps) {
  const { t } = useLocale();
  return (
    <div
      className="sticky bottom-0 left-0 right-0 z-10 mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-2px_8px_rgba(0,0,0,0.06)] backdrop-blur-sm"
      role="region"
      aria-label="Save bar"
    >
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="admin-compact-btn admin-compact-btn-primary min-h-[40px] px-5 py-2 font-medium"
        >
          {saving ? (t("admin.common.saving") ?? "...") : (t("admin.common.save") ?? t("admin.settingsBank.save") ?? "Save")}
        </button>
        {message && (
          <span
            className={`text-[13px] font-medium ${
              error ? "text-red-600" : success ? "text-emerald-600" : "text-slate-500"
            }`}
          >
            {message}
          </span>
        )}
      </div>
    </div>
  );
}
