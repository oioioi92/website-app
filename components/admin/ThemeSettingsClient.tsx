"use client";

import { useEffect, useState } from "react";
import type { ThemeConfig } from "@/lib/public/theme";

const inputClass =
  "admin-compact-input w-full rounded-lg border border-[var(--compact-card-border)] bg-[var(--compact-card-bg)] px-3 text-[var(--compact-text)] placeholder-[var(--compact-muted)] focus:border-[var(--compact-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--compact-primary)]";
const labelClass = "mb-1 block text-xs font-medium text-[var(--compact-muted)]";

export function ThemeSettingsClient() {
  const [theme, setTheme] = useState<ThemeConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/admin/theme")
      .then((r) => {
        if (!r.ok) throw new Error("获取失败");
        return r.json();
      })
      .then((d: { theme: ThemeConfig }) => setTheme(d.theme))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function patch(partial: Partial<ThemeConfig>) {
    if (!theme) return;
    setTheme({ ...theme, ...partial });
  }

  function patchSectionTitles(partial: Partial<ThemeConfig["sectionTitles"]>) {
    if (!theme) return;
    setTheme({ ...theme, sectionTitles: { ...theme.sectionTitles, ...partial } });
  }

  function patchRoutes(partial: Partial<ThemeConfig["routes"]>) {
    if (!theme) return;
    setTheme({ ...theme, routes: { ...theme.routes, ...partial } });
  }

  function patchAgeGate(partial: Partial<ThemeConfig["ageGate"]>) {
    if (!theme) return;
    setTheme({ ...theme, ageGate: { ...theme.ageGate, ...partial } });
  }

  function patchDownloadBar(partial: Partial<ThemeConfig["downloadBar"]>) {
    if (!theme) return;
    setTheme({ ...theme, downloadBar: { ...theme.downloadBar, ...partial } });
  }

  function patchActionBarLimits(partial: Partial<ThemeConfig["actionBarLimits"]>) {
    if (!theme) return;
    setTheme({ ...theme, actionBarLimits: { ...theme.actionBarLimits, ...partial } });
  }

  function save() {
    if (!theme) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    fetch("/api/admin/theme", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(theme)
    })
      .then((r) => {
        if (!r.ok) throw new Error("保存失败");
        setSaved(true);
      })
      .catch((e) => setError(e.message))
      .finally(() => setSaving(false));
  }

  if (loading) return <div className="py-8 text-center text-[var(--compact-muted)]">加载中…</div>;
  if (error) return <div className="py-8 text-center text-[var(--compact-danger)]">{error}</div>;
  if (!theme) return null;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={save} disabled={saving} className="admin-compact-btn admin-compact-btn-primary">
          {saving ? "保存中…" : "保存前台配置"}
        </button>
        {saved && <span className="text-[13px] text-[var(--compact-success)]">已保存，前台将使用新配置</span>}
        <a href="/" target="_blank" rel="noreferrer" className="admin-compact-btn admin-compact-btn-ghost text-[13px]">
          在新标签页打开前台 →
        </a>
      </div>

      <div className="admin-card p-6 space-y-6">
        <h2 className="text-sm font-semibold text-[var(--compact-text)] border-b border-[var(--compact-card-border)] pb-2">站点与入口</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>站点名称</label>
            <input type="text" value={theme.siteName ?? ""} onChange={(e) => patch({ siteName: e.target.value })} className={inputClass} placeholder="Site" />
          </div>
          <div>
            <label className={labelClass}>Logo URL</label>
            <input type="text" value={theme.logoUrl ?? ""} onChange={(e) => patch({ logoUrl: e.target.value || null })} className={inputClass} placeholder="https://..." />
          </div>
          <div>
            <label className={labelClass}>登录链接 (loginUrl)</label>
            <input type="text" value={theme.loginUrl ?? ""} onChange={(e) => patch({ loginUrl: e.target.value || null })} className={inputClass} placeholder="/login 或外链" />
          </div>
          <div>
            <label className={labelClass}>注册链接 (registerUrl)</label>
            <input type="text" value={theme.registerUrl ?? ""} onChange={(e) => patch({ registerUrl: e.target.value || null })} className={inputClass} placeholder="/register 或外链" />
          </div>
          <div>
            <label className={labelClass}>充值链接 (depositUrl)</label>
            <input type="text" value={theme.depositUrl ?? ""} onChange={(e) => patch({ depositUrl: e.target.value || null })} className={inputClass} placeholder="/deposit 或外链" />
          </div>
          <div>
            <label className={labelClass}>提现链接 (withdrawUrl)</label>
            <input type="text" value={theme.withdrawUrl ?? ""} onChange={(e) => patch({ withdrawUrl: e.target.value || null })} className={inputClass} placeholder="/withdraw 或外链" />
          </div>
          <div>
            <label className={labelClass}>客服/聊天默认链接 (chatDefaultUrl)</label>
            <input type="text" value={theme.chatDefaultUrl ?? ""} onChange={(e) => patch({ chatDefaultUrl: e.target.value || null })} className={inputClass} placeholder="/chat 或外链" />
          </div>
        </div>
      </div>

      <div className="admin-card p-6 space-y-6">
        <h2 className="text-sm font-semibold text-[var(--compact-text)] border-b border-[var(--compact-card-border)] pb-2">跑马灯与标题</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelClass}>跑马灯文案 (announcementMarqueeText)</label>
            <input type="text" value={theme.announcementMarqueeText ?? ""} onChange={(e) => patch({ announcementMarqueeText: e.target.value || null })} className={inputClass} placeholder="Welcome — Latest promotions" />
          </div>
          <div>
            <label className={labelClass}>快捷操作区标题</label>
            <input type="text" value={theme.sectionTitles?.quickActions ?? ""} onChange={(e) => patchSectionTitles({ quickActions: e.target.value })} className={inputClass} placeholder="QUICK ACTIONS" />
          </div>
          <div>
            <label className={labelClass}>流水区标题</label>
            <input type="text" value={theme.sectionTitles?.liveTransaction ?? ""} onChange={(e) => patchSectionTitles({ liveTransaction: e.target.value })} className={inputClass} placeholder="LIVE TRANSACTION" />
          </div>
          <div>
            <label className={labelClass}>游戏区标题</label>
            <input type="text" value={theme.sectionTitles?.gameZone ?? ""} onChange={(e) => patchSectionTitles({ gameZone: e.target.value })} className={inputClass} placeholder="GAME ZONE" />
          </div>
          <div>
            <label className={labelClass}>社交区标题</label>
            <input type="text" value={theme.sectionTitles?.social ?? ""} onChange={(e) => patchSectionTitles({ social: e.target.value })} className={inputClass} placeholder="SOCIAL" />
          </div>
          <div>
            <label className={labelClass}>优惠活动路由 (routes.promotion)</label>
            <input type="text" value={theme.routes?.promotion ?? ""} onChange={(e) => patchRoutes({ promotion: e.target.value })} className={inputClass} placeholder="/promotion" />
          </div>
          <div>
            <label className={labelClass}>红利/优惠详情路由 (routes.bonus)</label>
            <input type="text" value={theme.routes?.bonus ?? ""} onChange={(e) => patchRoutes({ bonus: e.target.value })} className={inputClass} placeholder="/bonus" />
          </div>
        </div>
      </div>

      <div className="admin-card p-6 space-y-6">
        <h2 className="text-sm font-semibold text-[var(--compact-text)] border-b border-[var(--compact-card-border)] pb-2">年龄确认 (Age Gate)</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-2">
            <input type="checkbox" id="ageGateEnabled" checked={theme.ageGate?.enabled ?? false} onChange={(e) => patchAgeGate({ enabled: e.target.checked })} className="rounded border-[var(--compact-card-border)]" />
            <label htmlFor="ageGateEnabled" className="text-[13px] text-[var(--compact-text)]">启用年龄确认弹窗</label>
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>弹窗标题</label>
            <input type="text" value={theme.ageGate?.title ?? ""} onChange={(e) => patchAgeGate({ title: e.target.value })} className={inputClass} placeholder="Age Confirmation" />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>弹窗内容</label>
            <textarea value={theme.ageGate?.content ?? ""} onChange={(e) => patchAgeGate({ content: e.target.value })} className={`${inputClass} min-h-[80px]`} placeholder="This website is for users aged 18 and above." />
          </div>
        </div>
      </div>

      <div className="admin-card p-6 space-y-6">
        <h2 className="text-sm font-semibold text-[var(--compact-text)] border-b border-[var(--compact-card-border)] pb-2">下载条 (Download Bar)</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-center gap-2">
            <input type="checkbox" id="downloadBarEnabled" checked={theme.downloadBar?.enabled ?? false} onChange={(e) => patchDownloadBar({ enabled: e.target.checked })} className="rounded border-[var(--compact-card-border)]" />
            <label htmlFor="downloadBarEnabled" className="text-[13px] text-[var(--compact-text)]">启用下载条</label>
          </div>
          <div>
            <label className={labelClass}>标题</label>
            <input type="text" value={theme.downloadBar?.title ?? ""} onChange={(e) => patchDownloadBar({ title: e.target.value || null })} className={inputClass} placeholder="Download App" />
          </div>
          <div>
            <label className={labelClass}>副标题</label>
            <input type="text" value={theme.downloadBar?.subtitle ?? ""} onChange={(e) => patchDownloadBar({ subtitle: e.target.value || null })} className={inputClass} placeholder="Get the app" />
          </div>
          <div>
            <label className={labelClass}>按钮文案 (ctaText)</label>
            <input type="text" value={theme.downloadBar?.ctaText ?? ""} onChange={(e) => patchDownloadBar({ ctaText: e.target.value || null })} className={inputClass} placeholder="Download" />
          </div>
          <div>
            <label className={labelClass}>按钮链接 (ctaUrl)</label>
            <input type="text" value={theme.downloadBar?.ctaUrl ?? ""} onChange={(e) => patchDownloadBar({ ctaUrl: e.target.value || null })} className={inputClass} placeholder="https://..." />
          </div>
          <div>
            <label className={labelClass}>图片 URL (imageUrl)</label>
            <input type="text" value={theme.downloadBar?.imageUrl ?? ""} onChange={(e) => patchDownloadBar({ imageUrl: e.target.value || null })} className={inputClass} placeholder="https://..." />
          </div>
        </div>
      </div>

      <div className="admin-card p-6 space-y-6">
        <h2 className="text-sm font-semibold text-[var(--compact-text)] border-b border-[var(--compact-card-border)] pb-2">Action Bar 颜色与限额文案</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>充值按钮颜色 (CSS 值)</label>
            <input type="text" value={theme.actionBarDepositColor ?? ""} onChange={(e) => patch({ actionBarDepositColor: e.target.value || null })} className={inputClass} placeholder="#22c55e" />
          </div>
          <div>
            <label className={labelClass}>提现按钮颜色 (CSS 值)</label>
            <input type="text" value={theme.actionBarWithdrawColor ?? ""} onChange={(e) => patch({ actionBarWithdrawColor: e.target.value || null })} className={inputClass} placeholder="#eab308" />
          </div>
          <div>
            <label className={labelClass}>最低充值 (文案)</label>
            <input type="text" value={theme.actionBarLimits?.minDeposit ?? ""} onChange={(e) => patchActionBarLimits({ minDeposit: e.target.value || null })} className={inputClass} placeholder="Min 10" />
          </div>
          <div>
            <label className={labelClass}>最高充值 (文案)</label>
            <input type="text" value={theme.actionBarLimits?.maxDeposit ?? ""} onChange={(e) => patchActionBarLimits({ maxDeposit: e.target.value || null })} className={inputClass} placeholder="Max 50,000" />
          </div>
          <div>
            <label className={labelClass}>最低提现 (文案)</label>
            <input type="text" value={theme.actionBarLimits?.minWithdraw ?? ""} onChange={(e) => patchActionBarLimits({ minWithdraw: e.target.value || null })} className={inputClass} placeholder="Min 50" />
          </div>
          <div>
            <label className={labelClass}>最高提现 (文案)</label>
            <input type="text" value={theme.actionBarLimits?.maxWithdraw ?? ""} onChange={(e) => patchActionBarLimits({ maxWithdraw: e.target.value || null })} className={inputClass} placeholder="Max 100,000" />
          </div>
        </div>
      </div>

      <div className="admin-card p-6 space-y-6">
        <h2 className="text-sm font-semibold text-[var(--compact-text)] border-b border-[var(--compact-card-border)] pb-2">图片与 Banner</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>合作方徽章 (partnershipBadgeUrl)</label>
            <input type="text" value={theme.partnershipBadgeUrl ?? ""} onChange={(e) => patch({ partnershipBadgeUrl: e.target.value || null })} className={inputClass} placeholder="https://..." />
          </div>
          <div>
            <label className={labelClass}>主区中间插图 (centerSlotImageUrl)</label>
            <input type="text" value={theme.centerSlotImageUrl ?? ""} onChange={(e) => patch({ centerSlotImageUrl: e.target.value || null })} className={inputClass} placeholder="https://..." />
          </div>
          <div>
            <label className={labelClass}>次级 Banner 图 (secondaryBannerUrl)</label>
            <input type="text" value={theme.secondaryBannerUrl ?? ""} onChange={(e) => patch({ secondaryBannerUrl: e.target.value || null })} className={inputClass} placeholder="https://..." />
          </div>
          <div>
            <label className={labelClass}>流水区背景图 (liveTxBgImageUrl)</label>
            <input type="text" value={theme.liveTxBgImageUrl ?? ""} onChange={(e) => patch({ liveTxBgImageUrl: e.target.value || null })} className={inputClass} placeholder="https://..." />
          </div>
        </div>
      </div>

      <div className="admin-card p-6 space-y-6">
        <h2 className="text-sm font-semibold text-[var(--compact-text)] border-b border-[var(--compact-card-border)] pb-2">展示样式</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>优惠列表样式 (promotionPattern)</label>
            <select value={theme.promotionPattern ?? "classic"} onChange={(e) => patch({ promotionPattern: e.target.value as ThemeConfig["promotionPattern"] })} className={inputClass}>
              <option value="classic">classic</option>
              <option value="image_tiles">image_tiles</option>
              <option value="image_strips">image_strips</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>社交按钮样式 (socialStyle)</label>
            <select value={theme.socialStyle ?? "COIN"} onChange={(e) => patch({ socialStyle: e.target.value as ThemeConfig["socialStyle"] })} className={inputClass}>
              <option value="COIN">COIN</option>
              <option value="CUBE">CUBE</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>优惠字体预设 (promotionFontPreset)</label>
            <select value={theme.promotionFontPreset ?? "default"} onChange={(e) => patch({ promotionFontPreset: e.target.value as ThemeConfig["promotionFontPreset"] })} className={inputClass}>
              <option value="default">default</option>
              <option value="compact">compact</option>
              <option value="bold">bold</option>
            </select>
          </div>
        </div>
      </div>

      <div className="admin-card p-6">
        <p className="text-[13px] text-[var(--compact-muted)]">
          以上配置保存后整站立即生效。Banner 列表、信任徽章、底部导航、快捷操作等可在后续版本扩展表单或通过数据接口配置。
        </p>
      </div>
    </div>
  );
}
