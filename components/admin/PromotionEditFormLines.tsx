"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { sanitizePromoHtml } from "@/lib/public/sanitizePromoHtml";
import { PromoTableBuilder, parsePromoTableData, emptyPromoTableData, type PromoTableData } from "@/components/admin/PromoTableBuilder";
import { NOT_ALLOWED_TO_OPTIONS } from "@/config/promotion-options";

const ONLY_PAY_GAME_SEP = "|";
type GameProviderRow = { id: string; name: string; code: string };

/** 照片上传行组件：支持粘贴 URL 或直接上传文件 */
function PhotoUploadRow({
  fieldKey, label, hint, badge, value, onChange,
}: {
  fieldKey: string; label: string; hint: string; badge: string;
  value: string; onChange: (url: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadErr, setUploadErr] = useState<string | null>(null);

  async function handleFile(file: File) {
    setUploading(true);
    setUploadErr(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload/image", { method: "POST", credentials: "include", body: fd });
      let json: Record<string, unknown> = {};
      try { json = await res.json(); } catch { /* 服务器返回了非 JSON */ }
      if (!res.ok || !json.ok) {
        setUploadErr(
          res.status === 413              ? "图片太大被服务器拒绝（413）：请压缩到 1MB 以下，或重新部署一次以自动修复 nginx 限制" :
          json.error === "FILE_TOO_LARGE" ? "文件超过 5MB 限制，请压缩后重试" :
          json.error === "INVALID_TYPE"   ? "仅支持 JPG/PNG/WEBP/GIF" :
          json.error === "UNAUTHORIZED"   ? "请重新登录后再试" :
          json.error ? String(json.error) :
          `上传失败（HTTP ${res.status}）`
        );
      } else {
        onChange(json.url as string);
      }
    } catch (err) {
      setUploadErr(`连接失败，请检查开发服务器是否运行（${err instanceof Error ? err.message : "未知错误"}）`);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="promo-edit-row">
      <span className="promo-edit-label">
        {label}
        <span className="inline-flex items-center gap-1 ml-1.5 rounded-md border border-blue-200 bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 leading-none">
          {badge}
        </span>
      </span>
      <div className="promo-edit-input-wrap">
        {/* URL 输入 + 上传按钮并排 */}
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="粘贴图片 URL，或点右边按钮上传"
            className="flex-1 min-w-0"
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
            className="admin-compact-btn admin-compact-btn-ghost shrink-0 whitespace-nowrap"
            style={{ fontSize: 12, padding: "0 10px", height: 32, border: "1px dashed var(--admin-border)" }}
          >
            {uploading ? "上传中…" : "📁 上传图片"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
          />
        </div>
        {uploadErr && <p className="text-[11px] text-red-500 mt-1">{uploadErr}</p>}
        {/* 预览 */}
        {value && (
          <div className="mt-2 rounded-lg overflow-hidden border border-[var(--admin-border)] bg-black/20 relative" style={{ maxHeight: 120 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="preview" className="w-full object-cover" style={{ maxHeight: 120 }} onError={e => (e.currentTarget.style.display = "none")} />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute top-1 right-1 rounded-full bg-black/60 text-white text-[11px] px-1.5 py-0.5 hover:bg-red-600 transition-colors"
              title="移除图片"
            >✕</button>
          </div>
        )}
        {/* 拖放区（空时显示） */}
        {!value && (
          <div
            className="mt-2 rounded-lg border-2 border-dashed border-[var(--admin-border)] flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition-colors"
            style={{ minHeight: 80 }}
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
          >
            <span className="text-2xl">🖼️</span>
            <span className="text-[11px] text-[var(--admin-muted)] mt-1">点击上传 或 拖放图片到这里</span>
            <span className="text-[10px] text-[var(--admin-muted)]">JPG / PNG / WEBP，最大 5MB</span>
          </div>
        )}
        <p className="text-[11px] text-[var(--admin-muted)] mt-1">{hint}</p>
      </div>
    </div>
  );
}

function parseOnlyPayGameAsProviders(raw: string, providers: GameProviderRow[]): string[] {
  const s = raw.trim();
  if (!s) return [];
  if (s.includes(ONLY_PAY_GAME_SEP)) return s.split(ONLY_PAY_GAME_SEP).map((x) => x.trim()).filter(Boolean);
  const match = providers.find((p) => p.name === s || p.code === s);
  return match ? [match.name] : [];
}

const PROMO_HTML_TEMPLATES = {
  twoColTable: `<table>
  <tr><th class="promo-cell-header">项目</th><th class="promo-cell-header">说明</th></tr>
  <tr><td class="promo-cell">奖金</td><td class="promo-cell promo-text-gold">10%</td></tr>
  <tr><td class="promo-cell">最低充值</td><td class="promo-cell">RM10</td></tr>
  <tr><td class="promo-cell">流水</td><td class="promo-cell">x3</td></tr>
</table>
`,
  twoColAndWarning: `<table>
  <tr><th class="promo-cell-header">项目</th><th class="promo-cell-header">说明</th></tr>
  <tr><td class="promo-cell">奖金</td><td class="promo-cell promo-text-gold">10%</td></tr>
  <tr><td class="promo-cell">最低充值</td><td class="promo-cell">RM10</td></tr>
  <tr><td class="promo-cell">流水</td><td class="promo-cell">x3</td></tr>
</table>
<p class="warning">违反条款将没收所有积分。请遵守活动规则。</p>
`,
  fullExample: `<h3 class="promo-text-gold">10% UNLIMITED SLOT BONUS</h3>
<table>
  <tr><th class="promo-cell-header">奖励</th><th class="promo-cell-header">说明</th></tr>
  <tr><td class="promo-cell">奖金</td><td class="promo-cell promo-text-gold">10%</td></tr>
  <tr><td class="promo-cell">最低充值</td><td class="promo-cell">RM10.00</td></tr>
  <tr><td class="promo-cell">总领取次数</td><td class="promo-cell">不限</td></tr>
  <tr><td class="promo-cell">流水倍数</td><td class="promo-cell">x3</td></tr>
  <tr><td class="promo-cell">Rollover</td><td class="promo-cell">不允许</td></tr>
  <tr><td class="promo-cell">仅限游戏</td><td class="promo-cell">SLOT | JILI | ACEWIN</td></tr>
  <tr><td class="promo-cell">不可用于</td><td class="promo-cell">BUY / SAVE FREE GAME</td></tr>
  <tr><td class="promo-cell">禁播游戏</td><td class="promo-cell"><a href="#">查看禁播列表</a></td></tr>
</table>
<p class="warning">违反条款与条件将没收所有积分。</p>
`
};

type RuleJson = {
  limits?: { perDay?: number; perWeek?: number; perLifetime?: number; perHour?: number; perMonth?: number };
  claimReset?: "NONE" | "HOURLY" | "DAILY" | "WEEKLY" | "MONTHLY";
  eligible?: { minDeposit?: number };
  grant?: { mode?: "PERCENT" | "FIXED" | "RANDOM"; percent?: number; fixedAmount?: number; capAmount?: number; randMin?: number; randMax?: number };
  turnover?: number;
  rollover?: boolean | string;
  rolloverMultiplier?: number;
  groupLabel?: string;
  onlyPayGame?: string;
  notAllowedTo?: string;
  bannedGameLink?: string;
  warningText?: string;
  display?: { detailType?: "promo_table" | "set2" | "blocks" | "html" | "terms"; fontFamily?: string; customClass?: string; popupStyle?: "premium" | "light" };
};

type Form = {
  title: string;
  subtitle: string;
  coverUrl: string;
  coverUrlMobilePromo: string;
  coverUrlDesktopHome: string;
  coverUrlMobileHome: string;
  popupCoverUrl: string;
  popupTextBelow: string;
  promoLink: string;
  detailHtml: string;
  detailJson: string;
  percent: number;
  startAt: string;
  endAt: string;
  isClaimable: boolean;
  ruleJson: RuleJson;
  ctaLabel: string;
  ctaUrl: string;
  isActive: boolean;
  sortOrder: number;
};

export function PromotionEditFormLines({
  form,
  patch,
  patchRule,
  patchRuleDisplay,
  save,
  saving,
  isCreate,
  id,
  message,
  error
}: {
  form: Form;
  patch: (p: Partial<Form>) => void;
  patchRule: (p: Partial<RuleJson>) => void;
  patchRuleDisplay: (p: Partial<NonNullable<RuleJson["display"]>>) => void;
  save: () => void;
  saving: boolean;
  isCreate: boolean;
  id?: string;
  message: string | null;
  error: string | null;
}) {
  const [gameProviders, setGameProviders] = useState<GameProviderRow[]>([]);
  useEffect(() => {
    fetch("/api/admin/game-providers", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : []))
      .then((list: GameProviderRow[]) => setGameProviders(Array.isArray(list) ? list : []))
      .catch(() => setGameProviders([]));
  }, []);

  const r = form.ruleJson;
  const limits = r.limits ?? {};
  const grant = r.grant ?? {};
  const display = r.display ?? {};
  const claimConditionValue = !form.isClaimable ? "CUSTOM" : (r.eligible?.minDeposit != null && r.eligible.minDeposit > 0 ? "DEPOSIT" : "FREE");

  const derivedClaimReset: "NONE" | "HOURLY" | "DAILY" | "WEEKLY" | "MONTHLY" =
    limits.perLifetime != null ? "NONE" : limits.perHour != null ? "HOURLY" : limits.perDay != null ? "DAILY" : limits.perWeek != null ? "WEEKLY" : limits.perMonth != null ? "MONTHLY" : "NONE";
  const claimLimitValue = limits.perLifetime ?? limits.perDay ?? limits.perWeek ?? limits.perMonth ?? limits.perHour ?? "";
  function updateClaimLimit(n: number) {
    const period = r.claimReset ?? derivedClaimReset;
    const next: typeof limits = { perDay: undefined, perWeek: undefined, perLifetime: undefined, perHour: undefined, perMonth: undefined };
    if (period === "NONE") next.perLifetime = n;
    else if (period === "HOURLY") next.perHour = n;
    else if (period === "DAILY") next.perDay = n;
    else if (period === "WEEKLY") next.perWeek = n;
    else if (period === "MONTHLY") next.perMonth = n;
    if (n > 0) patchRule({ limits: { ...limits, ...next }, claimReset: period });
    else patchRule({ limits: { ...limits, ...next }, claimReset: undefined });
  }
  function updateClaimReset(period: "NONE" | "HOURLY" | "DAILY" | "WEEKLY" | "MONTHLY" | undefined) {
    const currentLimit = typeof claimLimitValue === "number" ? claimLimitValue : 0;
    const next: typeof limits = { perDay: undefined, perWeek: undefined, perLifetime: undefined, perHour: undefined, perMonth: undefined };
    if (currentLimit > 0) {
      if (period === "NONE") next.perLifetime = currentLimit;
      else if (period === "HOURLY") next.perHour = currentLimit;
      else if (period === "DAILY") next.perDay = currentLimit;
      else if (period === "WEEKLY") next.perWeek = currentLimit;
      else if (period === "MONTHLY") next.perMonth = currentLimit;
    }
    patchRule({ limits: { ...limits, ...next }, claimReset: period ?? undefined });
  }

  const claimConfigJson = JSON.stringify(
    { limits: r.limits, claimReset: r.claimReset, eligible: r.eligible, grant: r.grant, turnover: r.turnover, rollover: r.rollover, rolloverMultiplier: r.rolloverMultiplier, groupLabel: r.groupLabel, onlyPayGame: r.onlyPayGame, notAllowedTo: r.notAllowedTo, display: r.display },
    null,
    2
  );

  return (
    <div className="promo-admin-edit">
      <div className="flex flex-wrap items-center gap-3 pb-4 border-b border-[var(--admin-border)]">
        <button type="button" onClick={save} disabled={saving} className="admin-compact-btn admin-compact-btn-primary">
          {saving ? (isCreate ? "创建中…" : "保存中…") : isCreate ? "创建" : "保存"}
        </button>
        <Link href="/admin/promotions" className="admin-compact-btn admin-compact-btn-ghost text-[13px]">{isCreate ? "取消" : "返回列表"}</Link>
        {message && <span className="promo-admin-toast success">{message}</span>}
        {error && <span className="promo-admin-toast error">{error}</span>}
      </div>

      <div className="promo-edit-form--lines mt-6">

        {/* ══════════════════════════════════════════ */}
        {/* 分区 1：基本信息                           */}
        {/* ══════════════════════════════════════════ */}
        <section className="promo-edit-section-card">
          <div className="promo-edit-section-card__head">
            <div className="promo-edit-section-card__icon promo-edit-section-card__icon--basic">📋</div>
            <div>
              <h3 className="promo-edit-section-card__title">基本信息</h3>
              <p className="promo-edit-section-card__desc">活动名称、奖金、领取条件、流水 / 滚存</p>
            </div>
          </div>
          <div className="promo-edit-section-card__body">

            {/* 活动名称 */}
            <div className="pef-field-full">
              <label className="pef-label">活动名称</label>
              <input type="text" value={form.title} onChange={(e) => patch({ title: e.target.value })} placeholder="e.g. MINI GAMES REWARD" className="pef-input" />
            </div>

            {/* 奖金行 */}
            <div className="pef-grid pef-grid-4 mt-3">
              <div className="pef-field">
                <label className="pef-label">奖金 % <span className="pef-hint-tag">百分比</span></label>
                <input type="number" min={0} step={0.01} value={form.percent ?? ""} onChange={(e) => { const v = Number(e.target.value) || 0; patch({ percent: v }); if (r.grant?.mode !== "FIXED") patchRule({ grant: { ...grant, percent: v } }); }} placeholder="e.g. 10" className="pef-input" />
              </div>
              <div className="pef-field">
                <label className="pef-label">固定金额 RM <span className="pef-hint-tag">Fixed</span></label>
                <input type="number" min={0} step={0.01} value={grant.mode === "FIXED" ? (grant.fixedAmount ?? "") : ""} onChange={(e) => patchRule({ grant: { ...grant, mode: "FIXED", fixedAmount: Number(e.target.value) || undefined } })} placeholder="e.g. 5.00" className="pef-input" />
              </div>
              <div className="pef-field">
                <label className="pef-label">随机最小 RM <span className="pef-hint-tag" style={{background:"#7c3aed",color:"#fff"}}>🎲</span></label>
                <input type="number" min={0} step={0.01} value={grant.mode === "RANDOM" ? (grant.randMin ?? "") : ""} onChange={(e) => patchRule({ grant: { ...grant, mode: "RANDOM", randMin: Number(e.target.value) || 0 } })} placeholder="0.88" className="pef-input" />
              </div>
              <div className="pef-field">
                <label className="pef-label">随机最大 RM <span className="pef-hint-tag" style={{background:"#7c3aed",color:"#fff"}}>🎲</span></label>
                <input type="number" min={0} step={0.01} value={grant.mode === "RANDOM" ? (grant.randMax ?? "") : ""} onChange={(e) => patchRule({ grant: { ...grant, mode: "RANDOM", randMax: Number(e.target.value) || 0 } })} placeholder="8.88" className="pef-input" />
              </div>
            </div>
            {grant.mode === "RANDOM" && <p className="text-[11px] text-purple-500 mt-1">🎲 随机模式：每位会员领取时随机获得 RM {grant.randMin?.toFixed(2) ?? "0.00"} ~ RM {grant.randMax?.toFixed(2) ?? "0.00"}</p>}

            {/* 领取条件行 */}
            <div className="pef-grid pef-grid-4 mt-3">
              <div className="pef-field">
                <label className="pef-label">领取条件</label>
                <select className="pef-input" value={claimConditionValue} onChange={(e) => { const v = e.target.value; if (v === "CUSTOM") patch({ isClaimable: false }); else if (v === "DEPOSIT") { patch({ isClaimable: true }); patchRule({ eligible: { ...r.eligible, minDeposit: r.eligible?.minDeposit ?? 10 } }); } else { patch({ isClaimable: true }); patchRule({ eligible: { ...r.eligible, minDeposit: undefined } }); } }}>
                  <option value="CUSTOM">CUSTOM</option>
                  <option value="FREE">FREE</option>
                  <option value="DEPOSIT">DEPOSIT</option>
                </select>
              </div>
              <div className="pef-field">
                <label className="pef-label">最小充值额 RM</label>
                <input type="number" min={0} value={r.eligible?.minDeposit ?? ""} onChange={(e) => patchRule({ eligible: { ...r.eligible, minDeposit: Number(e.target.value) || undefined } })} placeholder="e.g. 10" className="pef-input" />
              </div>
              <div className="pef-field">
                <label className="pef-label">领取上限（次）</label>
                <input type="number" min={0} value={claimLimitValue} onChange={(e) => updateClaimLimit(Number(e.target.value) || 0)} placeholder="0 = 无限" className="pef-input" />
              </div>
              <div className="pef-field">
                <label className="pef-label">上限重置周期</label>
                <select className="pef-input" value={r.claimReset ?? derivedClaimReset} onChange={(e) => updateClaimReset((e.target.value || undefined) as typeof r.claimReset)}>
                  <option value="NONE">不重置（总次数）</option>
                  <option value="HOURLY">每小时</option>
                  <option value="DAILY">每日</option>
                  <option value="WEEKLY">每周</option>
                  <option value="MONTHLY">每月</option>
                </select>
              </div>
            </div>

            {/* 流水 / 滚存行 */}
            <div className="pef-grid pef-grid-3 mt-3">
              <div className="pef-field">
                <label className="pef-label">Turnover 流水倍数</label>
                <input type="number" min={0} step={0.01} value={r.turnover ?? ""} onChange={(e) => patchRule({ turnover: Number(e.target.value) || undefined })} placeholder="e.g. 3" className="pef-input" />
                <span className="pef-hint">(存款+奖金) × 倍数 = 须达到的投注额</span>
              </div>
              <div className="pef-field">
                <label className="pef-label">Rollover 滚存</label>
                <select className="pef-input" value={r.rollover === true ? "allowed" : r.rollover === false ? "not_allowed" : ""} onChange={(e) => patchRule({ rollover: e.target.value === "allowed" ? true : e.target.value === "not_allowed" ? false : undefined })}>
                  <option value="">— 不设置 —</option>
                  <option value="allowed">允许</option>
                  <option value="not_allowed">不允许</option>
                </select>
              </div>
              {r.rollover === true ? (
                <div className="pef-field">
                  <label className="pef-label">Rollover 倍数</label>
                  <input type="number" min={0} step={0.01} value={r.rolloverMultiplier ?? ""} onChange={(e) => patchRule({ rolloverMultiplier: Number(e.target.value) || undefined })} placeholder="e.g. 20" className="pef-input" />
                  <span className="pef-hint">(存款+奖金) × 倍数 = 须完成投注额</span>
                </div>
              ) : (
                <div className="pef-field">
                  <label className="pef-label">最高赔付 RM <span className="pef-hint-tag">选填</span></label>
                  <input type="number" min={0} value={grant.capAmount ?? ""} onChange={(e) => patchRule({ grant: { ...grant, capAmount: Number(e.target.value) || undefined } })} placeholder="不填 = 无上限" className="pef-input" />
                </div>
              )}
            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════════ */}
        {/* 分区 2：活动页展示                         */}
        {/* ══════════════════════════════════════════ */}
        <section className="promo-edit-section-card">
          <div className="promo-edit-section-card__head">
            <div className="promo-edit-section-card__icon promo-edit-section-card__icon--display">🖼️</div>
            <div>
              <h3 className="promo-edit-section-card__title">活动页展示</h3>
              <p className="promo-edit-section-card__desc">卡片跳转链接、活动页大图与通用缩图</p>
            </div>
          </div>
          <div className="promo-edit-section-card__body">

            {/* 跳转链接 */}
            <div className="pef-field-full">
              <label className="pef-label">🔗 点击跳转链接 <span className="pef-hint-tag">选填</span></label>
              <input type="url" value={form.promoLink ?? ""} onChange={(e) => patch({ promoLink: e.target.value })} placeholder="https://example.com" className="pef-input" />
              <span className="pef-hint">填写后点击卡片打开此链接，留空则打开条款弹窗</span>
            </div>

            {/* 两张照片 */}
            <div className="mt-4 pt-4 border-t border-[var(--admin-border)]">
              {[
                { key: "coverUrl",            label: "① 活动页大图（桌面）",  hint: "推荐 800×320px（5:2），不上传②时所有地方都用这张", badge: "💻 800×320" },
                { key: "coverUrlMobilePromo", label: "② 通用缩图（首页 + 手机活动页）", hint: "推荐 400×300px，不填则用①", badge: "🖼 400×300" },
              ].map(({ key, label, hint, badge }) => (
                <PhotoUploadRow
                  key={key}
                  fieldKey={key}
                  label={label}
                  hint={hint}
                  badge={badge}
                  value={form[key as keyof typeof form] as string}
                  onChange={(v) => patch({ [key]: v } as Partial<typeof form>)}
                />
              ))}
            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════════ */}
        {/* 分区 3：弹窗设置                           */}
        {/* ══════════════════════════════════════════ */}
        <section className="promo-edit-section-card">
          <div className="promo-edit-section-card__head">
            <div className="promo-edit-section-card__icon promo-edit-section-card__icon--popup">🪟</div>
            <div>
              <h3 className="promo-edit-section-card__title">弹窗（条款弹窗）</h3>
              <p className="promo-edit-section-card__desc">顶部照片 → 条款表格 → 下方警告文字 → 按钮</p>
            </div>
          </div>
          <div className="promo-edit-section-card__body">

            {/* 弹窗样式 + 时间 并排 */}
            <div className="pef-grid pef-grid-3">
              <div className="pef-field">
                <label className="pef-label">弹窗样式</label>
                <select className="pef-input" value={display.popupStyle ?? "premium"} onChange={(e) => patchRuleDisplay({ popupStyle: e.target.value as "premium" | "light" })}>
                  <option value="premium">⚡ Premium（深色赌场风格）</option>
                  <option value="light">🔷 Light（白底蓝绿）</option>
                </select>
              </div>
              <div className="pef-field">
                <label className="pef-label">开始时间</label>
                <input type="datetime-local" value={form.startAt} onChange={(e) => patch({ startAt: e.target.value })} className="pef-input" />
              </div>
              <div className="pef-field">
                <label className="pef-label">结束时间</label>
                <input type="datetime-local" value={form.endAt} onChange={(e) => patch({ endAt: e.target.value })} className="pef-input" />
              </div>
            </div>

            {/* 弹窗照片 */}
            <div className="mt-4">
              <PhotoUploadRow
                fieldKey="popupCoverUrl"
                label="弹窗顶部照片"
                hint="显示在弹窗最上方，推荐 600×300px（2:1）｜不填则不显示"
                badge="🪟 600×300"
                value={form.popupCoverUrl}
                onChange={(v) => patch({ popupCoverUrl: v })}
              />
            </div>

            {/* 弹窗下方文字 */}
            <div className="pef-field-full mt-3">
              <label className="pef-label">弹窗信息下方文字 <span className="pef-hint-tag">选填，显示在条款表下方</span></label>
              <textarea rows={2} value={form.popupTextBelow ?? ""} onChange={(e) => patch({ popupTextBelow: e.target.value })} placeholder="例：⚠️ VIOLATION OF TERMS & CONDITIONS WILL FORFEIT ALL POINTS" className="pef-input" style={{ minHeight: 60, resize: "vertical" }} />
            </div>

            {/* 条款表格 */}
            <div className="mt-4 border-t border-[var(--admin-border)] pt-4">
              <div className="flex items-center gap-3 mb-3">
                <label className="pef-label mb-0">条款表格样式</label>
                <select className="pef-input" style={{ maxWidth: 360 }} value={display.detailType ?? "promo_table"} onChange={(e) => patchRuleDisplay({ detailType: e.target.value as "promo_table" | "set2" | "blocks" | "html" | "terms" })}>
                  <option value="promo_table">⚡ Set 1 — PROMOTION RULES（深色，可增行）</option>
                  <option value="set2">🔷 Set 2 — 经典蓝色表格</option>
                  <option value="html">HTML（手写代码）</option>
                  <option value="terms">Terms (auto table)</option>
                  <option value="blocks">Blocks</option>
                </select>
              </div>
              {(display.detailType === "promo_table" || display.detailType === "set2" || !display.detailType) && (() => {
                const isSet2 = display.detailType === "set2";
                const tableData: PromoTableData = parsePromoTableData((() => { try { return JSON.parse(form.detailJson); } catch { return null; } })()) ?? emptyPromoTableData();
                return (
                  <div className="promo-edit-builder-fullrow">
                    <PromoTableBuilder key={isSet2 ? "builder-set2" : "builder-set1"} data={tableData} onChange={(d) => patch({ detailJson: JSON.stringify(d) })} defaultPreviewStyle={isSet2 ? "default" : "premium"} />
                  </div>
                );
              })()}
              {display.detailType === "html" && (
                <div className="mt-2">
                  <div className="flex flex-wrap gap-2 mb-2">
                    <button type="button" onClick={() => patch({ detailHtml: form.detailHtml + PROMO_HTML_TEMPLATES.twoColTable })} className="admin-compact-btn admin-compact-btn-ghost text-[11px] py-1">两栏表</button>
                    <button type="button" onClick={() => patch({ detailHtml: form.detailHtml + PROMO_HTML_TEMPLATES.twoColAndWarning })} className="admin-compact-btn admin-compact-btn-ghost text-[11px] py-1">两栏+警告</button>
                    <button type="button" onClick={() => patch({ detailHtml: PROMO_HTML_TEMPLATES.fullExample })} className="admin-compact-btn admin-compact-btn-ghost text-[11px] py-1">完整示例</button>
                  </div>
                  <textarea rows={14} value={form.detailHtml} onChange={(e) => patch({ detailHtml: e.target.value })} className="pef-input font-mono text-[12px]" style={{ minHeight: 240 }} placeholder="<h3>Title</h3><table>...</table>" />
                </div>
              )}
              {display.detailType === "blocks" && (
                <textarea rows={8} value={form.detailJson} onChange={(e) => patch({ detailJson: e.target.value })} className="pef-input font-mono text-[12px] mt-2" placeholder='{"blocks":[]}' />
              )}
            </div>

          </div>
        </section>

        {/* ══════════════════════════════════════════ */}
        {/* 分区 4：其他设置                           */}
        {/* ══════════════════════════════════════════ */}
        <section className="promo-edit-section-card">
          <div className="promo-edit-section-card__head">
            <div className="promo-edit-section-card__icon promo-edit-section-card__icon--other">⚙️</div>
            <div>
              <h3 className="promo-edit-section-card__title">其他设置</h3>
              <p className="promo-edit-section-card__desc">分类、CTA 按钮、游戏限制、状态</p>
            </div>
          </div>
          <div className="promo-edit-section-card__body">

            {/* 分类 + CTA + 状态 一行 */}
            <div className="pef-grid pef-grid-4">
              <div className="pef-field">
                <label className="pef-label">分类 Category</label>
                <input
                  type="text"
                  value={r.groupLabel ?? ""}
                  onChange={(e) => patchRule({ groupLabel: e.target.value || undefined })}
                  placeholder="直接输入分类名，如：NEW MEMBER BONUS、SLOT BONUS"
                  className="pef-input"
                />
                <span className="pef-hint">无固定列表，直接输入即新增该分类；列表页会按分类分组显示</span>
              </div>
              <div className="pef-field">
                <label className="pef-label">CTA 按钮文案</label>
                <input type="text" value={form.ctaLabel} onChange={(e) => patch({ ctaLabel: e.target.value })} placeholder="Claim / Register / Join" className="pef-input" />
              </div>
              <div className="pef-field">
                <label className="pef-label">CTA 跳转 URL</label>
                <input type="text" value={form.ctaUrl} onChange={(e) => patch({ ctaUrl: e.target.value })} placeholder="/deposit 或 https://..." className="pef-input" />
              </div>
              <div className="pef-field">
                <label className="pef-label">状态</label>
                <div className="flex flex-col gap-2 pt-1">
                  <label className="inline-flex items-center gap-2 text-[13px] cursor-pointer">
                    <input type="checkbox" checked={form.isActive} onChange={(e) => patch({ isActive: e.target.checked })} />
                    <span>Active（上架）</span>
                  </label>
                  <label className="inline-flex items-center gap-2 text-[13px] cursor-pointer">
                    <input type="checkbox" checked={form.isClaimable} onChange={(e) => patch({ isClaimable: e.target.checked })} />
                    <span>Claimable（可领取）</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Not Allowed To */}
            <div className="pef-field-full mt-4">
              <label className="pef-label">Not Allowed To <span className="pef-hint-tag">选填</span></label>
              <input type="text" value={r.notAllowedTo ?? ""} onChange={(e) => patchRule({ notAllowedTo: e.target.value || undefined })} placeholder="留空 = 无限制，例：BUY / SAVE FREE GAME / SAVE WILD" className="pef-input" />
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                <button type="button" onClick={() => patchRule({ notAllowedTo: undefined })} className="pef-chip">无限制</button>
                {NOT_ALLOWED_TO_OPTIONS.filter((o) => o.value && o.value !== "__CUSTOM__").map((o) => (
                  <button key={o.value} type="button" onClick={() => patchRule({ notAllowedTo: o.value })} className="pef-chip">{o.label}</button>
                ))}
              </div>
            </div>

            {/* Only Pay Game */}
            <div className="pef-field-full mt-4">
              <label className="pef-label">Only Pay Game <span className="pef-hint-tag">勾选限定游戏供应商，不勾 = 全部</span></label>
              <div className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-panel2)] p-3 max-h-[200px] overflow-y-auto">
                {gameProviders.length === 0 ? (
                  <span className="text-[12px] text-[var(--admin-muted)]">暂无 Game Provider</span>
                ) : (
                  <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-x-3 gap-y-2">
                    {(() => {
                      const selectedNames = parseOnlyPayGameAsProviders((r.onlyPayGame ?? "").trim(), gameProviders);
                      return gameProviders.map((p) => {
                        const checked = selectedNames.includes(p.name) || selectedNames.includes(p.code);
                        return (
                          <label key={p.id} className="inline-flex items-center gap-2 text-[12px] cursor-pointer py-0.5">
                            <input type="checkbox" checked={checked} onChange={() => { const name = p.name; const next = checked ? selectedNames.filter((n) => n !== name && n !== p.code) : [...selectedNames, name]; patchRule({ onlyPayGame: next.length > 0 ? next.join(ONLY_PAY_GAME_SEP) : undefined }); }} className="rounded border-[var(--admin-border)]" />
                            <span>{p.name}</span>
                          </label>
                        );
                      });
                    })()}
                  </div>
                )}
              </div>
            </div>

          </div>
        </section>
      </div>
    </div>
  );
}
