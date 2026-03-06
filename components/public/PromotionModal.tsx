"use client";

import React, { useEffect, useMemo } from "react";
import type { PublicPromotion } from "@/components/public/PromotionCard";
import { FallbackImage } from "@/components/FallbackImage";
import { sanitizePromoHtml } from "@/lib/public/sanitizePromoHtml";
import { parsePromoTableData, PromoTablePreview } from "@/components/admin/PromoTableBuilder";
import type { PromoTableData, PromoTableRow } from "@/components/admin/PromoTableBuilder";
import { useLocaleOptional } from "@/lib/i18n/context";

type Block =
  | { id?: string; type: "h1"; text: string }
  | { id?: string; type: "p"; text: string }
  | { id?: string; type: "list"; items: string[] }
  | { id?: string; type: "button"; label: string; url: string }
  | { id?: string; type: "image"; url: string };

function safeHref(raw: string): string {
  const s = (raw ?? "").trim();
  if (!s) return "#";
  if (/^javascript:/i.test(s)) return "#";
  if (/^data:/i.test(s)) return "#";
  if (/^blob:/i.test(s)) return "#";
  if (s.startsWith("//")) return `https:${s}`;
  return s;
}

function parseBlocks(detailJson: unknown): Block[] {
  const obj = detailJson && typeof detailJson === "object" && !Array.isArray(detailJson) ? (detailJson as Record<string, unknown>) : null;
  const blocks = obj && Array.isArray(obj.blocks) ? obj.blocks : [];
  const out: Block[] = [];
  for (const raw of blocks) {
    const b = raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, unknown>) : null;
    const type = typeof b?.type === "string" ? b.type : null;
    const id = typeof b?.id === "string" ? b.id : undefined;
    if (type === "h1" && typeof b?.text === "string") out.push({ id, type, text: b.text });
    else if (type === "p" && typeof b?.text === "string") out.push({ id, type, text: b.text });
    else if (type === "list" && Array.isArray(b?.items)) out.push({ id, type, items: b.items.filter((x) => typeof x === "string") });
    else if (type === "button" && typeof b?.label === "string" && typeof b?.url === "string") out.push({ id, type, label: b.label, url: b.url });
    else if (type === "image" && typeof b?.url === "string") out.push({ id, type, url: b.url });
  }
  return out;
}

type RuleForTerms = {
  limits?: { perDay?: number; perWeek?: number; perLifetime?: number };
  eligible?: { minDeposit?: number };
  turnover?: number;
  rollover?: boolean | string;
  rolloverMultiplier?: number;
  onlyPayGame?: string;
  notAllowedTo?: string;
  bannedGameLink?: string;
  warningText?: string;
  display?: { detailType?: string; fontFamily?: string; customClass?: string };
};

function getDetailType(ruleJson: unknown): "terms" | "html" | "blocks" | "promo_table" | "set2" {
  const r = ruleJson && typeof ruleJson === "object" && !Array.isArray(ruleJson) ? (ruleJson as RuleForTerms) : null;
  const d = r?.display?.detailType;
  return d === "terms" ? "terms" : d === "html" ? "html" : d === "set2" ? "set2" : d === "promo_table" ? "promo_table" : "blocks";
}

function safeLink(href: string): string {
  const s = (href ?? "").trim();
  if (!s) return "#";
  if (/^javascript:/i.test(s)) return "#";
  if (/^data:/i.test(s)) return "#";
  if (s.startsWith("//")) return `https:${s}`;
  return s;
}

function PremiumRuleIcon({ kind }: { kind: "bonus" | "deposit" | "claim" | "turnover" | "rollover" | "warning" | "link" | "default" }) {
  const stroke = "currentColor";
  if (kind === "bonus") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    );
  }
  if (kind === "deposit") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M3 10h18" />
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M8 15h4" />
      </svg>
    );
  }
  if (kind === "claim") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M20 7l-8.6 8.6L8 12.2" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    );
  }
  if (kind === "turnover") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M4 7h10" />
        <path d="M10 3l4 4-4 4" />
        <path d="M20 17H10" />
        <path d="M14 13l-4 4 4 4" />
      </svg>
    );
  }
  if (kind === "rollover") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M21 12a9 9 0 1 1-2.64-6.36" />
        <path d="M21 3v6h-6" />
      </svg>
    );
  }
  if (kind === "warning") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M10.3 3.9L1.8 18.2A1.4 1.4 0 0 0 3 20.4h18a1.4 1.4 0 0 0 1.2-2.2L13.7 3.9a1.4 1.4 0 0 0-2.4 0z" />
        <path d="M12 9v4" />
        <circle cx="12" cy="16.8" r=".8" fill="currentColor" />
      </svg>
    );
  }
  if (kind === "link") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M10 14a5 5 0 0 1 0-7l2-2a5 5 0 1 1 7 7l-2 2" />
        <path d="M14 10a5 5 0 0 1 0 7l-2 2a5 5 0 1 1-7-7l2-2" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8" />
      <path d="M8 12h8" />
    </svg>
  );
}

function guessRuleKind(label: string): "bonus" | "deposit" | "claim" | "turnover" | "rollover" | "warning" | "link" | "default" {
  const s = (label || "").toUpperCase();
  if (s.includes("GANJARAN") || s.includes("BONUS") || s.includes("REWARD")) return "bonus";
  if (s.includes("DEPOSIT") || s.includes("TOPUP")) return "deposit";
  if (s.includes("CLAIM")) return "claim";
  if (s.includes("TURNOVER")) return "turnover";
  if (s.includes("ROLLOVER")) return "rollover";
  if (s.includes("WARNING") || s.includes("VIOLATION")) return "warning";
  if (s.includes("BANNED") || s.includes("LINK")) return "link";
  return "default";
}

type PremiumRuleItem = {
  key: string;
  label: string;
  value: string;
  kind: "bonus" | "deposit" | "claim" | "turnover" | "rollover" | "warning" | "link" | "default";
  link?: string;
  badge?: string;
  tone?: "success" | "danger" | "gold" | "neutral";
  /** 右侧状态图标：勾=符合 / i=说明 / 叉=不适用 */
  statusIndicator?: "check" | "info" | "x" | null;
};

function renderWarningText(text: string): React.ReactNode {
  const parts = text.split(/(TERMS\s*&\s*CONDITIONS|TERMS\s*AND\s*CONDITIONS)/gi);
  if (parts.length === 1) return text;
  return parts.map((part, i) =>
    /TERMS.*CONDITIONS/i.test(part)
      ? <span key={i} className="promo-premium-warning-highlight">{part}</span>
      : part
  );
}

function PremiumRuleRows({
  title = "PROMOTION RULES",
  items,
  footerText,
  footerImg,
}: {
  title?: string;
  items: PremiumRuleItem[];
  footerText?: string;
  footerImg?: string;
}) {
  return (
    <div className="promo-premium-rules">
      <div className="promo-premium-rules-heading-wrap">
        <span className="promo-premium-rules-divider" />
        <h3 className="promo-premium-rules-heading">{title}</h3>
        <span className="promo-premium-rules-divider" />
      </div>
      <div className="promo-premium-rules-list">
        {items.map((item) => (
          <div key={item.key} className="promo-premium-rule-row">
            <div className="promo-premium-rule-label-wrap">
              <span className={`promo-premium-rule-icon ${item.tone ? `is-${item.tone}` : ""}`}>
                <PremiumRuleIcon kind={item.kind} />
              </span>
              <span className="promo-premium-rule-label">{item.label}</span>
            </div>
            <div className="promo-premium-rule-value-wrap">
              {item.link ? (
                <a href={safeLink(item.link)} target="_blank" rel="noopener noreferrer" className="promo-premium-rule-value promo-premium-rule-link">
                  {item.value}
                </a>
              ) : (
                <span className={`promo-premium-rule-value ${item.tone ? `is-${item.tone}` : ""}`}>{item.value}</span>
              )}
              {item.badge ? <span className="promo-premium-rule-badge">{item.badge}</span> : null}
              {item.statusIndicator === "check" && <span className="promo-premium-rule-status promo-premium-rule-status--check" aria-hidden>✓</span>}
              {item.statusIndicator === "info" && <span className="promo-premium-rule-status promo-premium-rule-status--info" aria-hidden>i</span>}
              {item.statusIndicator === "x" && <span className="promo-premium-rule-status promo-premium-rule-status--x" aria-hidden>✕</span>}
            </div>
          </div>
        ))}
      </div>
      {footerText ? (
        <div
          className="promo-premium-footer-text"
          dangerouslySetInnerHTML={{ __html: sanitizePromoHtml(footerText) }}
        />
      ) : null}
      {footerImg ? (
        <div className="promo-premium-footer-img">
          <img src={footerImg} alt="" style={{ width: "100%", borderRadius: 8, display: "block" }} />
        </div>
      ) : null}
    </div>
  );
}

function TermsTableView({
  rule,
  percentText,
  limitTag,
  light
}: {
  rule: RuleForTerms;
  percentText: string;
  limitTag: string;
  light?: boolean;
}) {
  const totalClaim = limitTag && limitTag !== "-" ? limitTag : "UNLIMITED";
  const turnover = rule.turnover != null && rule.turnover > 0 ? `X${rule.turnover}` : "—";
  const rolloverAllowed = rule.rollover === true || rule.rollover === "allowed";
  const rolloverMul = rule.rolloverMultiplier != null && rule.rolloverMultiplier > 0 ? rule.rolloverMultiplier : null;
  const rolloverText = rolloverAllowed ? (rolloverMul != null ? `✓ x${rolloverMul}` : "✓") : "✗";
  const minDeposit = rule.eligible?.minDeposit != null ? String(rule.eligible.minDeposit) : "—";
  const thClass = light
    ? "px-3 py-2.5 text-left text-xs font-bold uppercase tracking-wide text-white bg-[#1e3a5f] border border-slate-200"
    : "border border-white/20 bg-white/10 px-3 py-2 text-left font-semibold text-[color:var(--front-gold-light)]";
  const tdClass = light
    ? "px-3 py-2.5 text-sm font-medium text-slate-800 bg-slate-50/80 border border-slate-200"
    : "border border-white/20 px-3 py-2";
  return (
    <div className={`promo-terms-table text-sm ${light ? "text-slate-700" : "text-white/90"}`}>
      <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm">
        <table className="w-full border-collapse">
          <tbody>
            <tr>
              <th className={thClass}>GANJARAN</th>
              <td className={tdClass}>{percentText}</td>
            </tr>
            <tr>
              <th className={thClass}>MIN DEPOSIT</th>
              <td className={tdClass}>{minDeposit}</td>
            </tr>
            <tr>
              <th className={thClass}>TOTAL CLAIM</th>
              <td className={tdClass}>{totalClaim}</td>
            </tr>
            <tr>
              <th className={thClass}>TURNOVER</th>
              <td className={tdClass}>{turnover}</td>
            </tr>
            <tr>
              <th className={thClass}>ROLLOVER</th>
              <td className={tdClass}>{rolloverText}</td>
            </tr>
          {rule.onlyPayGame && (
            <tr>
              <th className={thClass}>ONLY PAY GAME</th>
              <td className={tdClass + " whitespace-pre-wrap"}>{rule.onlyPayGame}</td>
            </tr>
          )}
          {rule.notAllowedTo && (
            <tr>
              <th className={thClass}>NOT ALLOWED TO</th>
              <td className={tdClass}>{rule.notAllowedTo}</td>
            </tr>
          )}
          {rule.bannedGameLink && (
            <tr>
              <th className={thClass}>BANNED GAME</th>
              <td className={tdClass}>
                <a href={safeLink(rule.bannedGameLink)} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline font-medium">
                  CHECK BANNED GAME HERE
                </a>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
      {rule.warningText && (
        <div className={`mt-3 flex items-center gap-2.5 rounded-xl px-4 py-3 font-semibold text-sm ${light ? "bg-rose-50 border border-rose-200/80 text-rose-800 shadow-sm" : "bg-red-500/20 text-red-200"}`}>
          <span className="flex-shrink-0 text-base opacity-90" aria-hidden>⚠</span>
          <span className="leading-snug">{rule.warningText}</span>
        </div>
      )}
    </div>
  );
}

function buildPremiumItemsFromTerms(rule: RuleForTerms, percentText: string, limitTag: string): PremiumRuleItem[] {
  const totalClaim = limitTag && limitTag !== "-" ? limitTag : "UNLIMITED";
  const turnover = rule.turnover != null && rule.turnover > 0 ? `X${rule.turnover}` : "—";
  const rolloverAllowed = rule.rollover === true || rule.rollover === "allowed";
  const rolloverMul = rule.rolloverMultiplier != null && rule.rolloverMultiplier > 0 ? rule.rolloverMultiplier : null;
  const rolloverText = rolloverAllowed ? (rolloverMul != null ? `✓ Allowed ×${rolloverMul}` : "✓ Allowed") : "× Not Allowed";
  const minDeposit = rule.eligible?.minDeposit != null ? `RM${Number(rule.eligible.minDeposit).toFixed(2)}` : "—";
  const items: PremiumRuleItem[] = [
    { key: "bonus", label: "GANJARAN", value: percentText || "—", kind: "bonus", tone: "gold", badge: "BONUS" },
    { key: "deposit", label: "MIN DEPOSIT", value: minDeposit, kind: "deposit", tone: "neutral", statusIndicator: "check" },
    { key: "claim", label: "TOTAL CLAIM", value: totalClaim, kind: "claim", tone: "success", statusIndicator: "check" },
    { key: "turnover", label: "TURNOVER", value: turnover, kind: "turnover", tone: "neutral", statusIndicator: "info" },
    { key: "rollover", label: "ROLLOVER", value: rolloverText, kind: "rollover", tone: rolloverAllowed ? "success" : "danger", statusIndicator: null },
  ];
  if (rule.onlyPayGame) {
    items.push({ key: "only-pay-game", label: "ONLY PAY GAME", value: rule.onlyPayGame.replace(/\n/g, " "), kind: "default", tone: "neutral" });
  }
  if (rule.notAllowedTo) {
    items.push({ key: "not-allowed", label: "NOT ALLOWED TO", value: rule.notAllowedTo, kind: "warning", tone: "danger" });
  }
  if (rule.bannedGameLink) {
    items.push({ key: "banned", label: "BANNED GAME", value: "CHECK BANNED GAME HERE", kind: "link", link: rule.bannedGameLink, tone: "gold" });
  }
  return items;
}

function buildPremiumItemsFromPromoTable(data: PromoTableData): PremiumRuleItem[] {
  const rows = Array.isArray(data.rows) ? data.rows : [];
  return rows.map((row: PromoTableRow, idx) => {
    // 后台手动设置优先；否则自动检测
    const autoKind = guessRuleKind(row.label);
    const kind = (row.set1IconKind as PremiumRuleItem["kind"]) ?? autoKind;

    const autoTone: PremiumRuleItem["tone"] =
      row.highlight ? "gold"
        : /(?:NOT ALLOWED|❌|FORBID|BANNED)/i.test(row.label + row.value) ? "danger"
          : /(?:ALLOWED|✓|UNLIMITED|ACTIVE|1 Time)/i.test(row.value) ? "success"
            : "neutral";
    const toneFromColor: PremiumRuleItem["tone"] =
      row.set1ValueColor === "gold" ? "gold"
        : row.set1ValueColor === "success" ? "success"
          : row.set1ValueColor === "danger" ? "danger"
            : row.set1ValueColor === "normal" ? "neutral"
              : undefined;
    const tone: PremiumRuleItem["tone"] = toneFromColor ?? autoTone;

    const isDanger = autoTone === "danger";
    const isSuccess = autoTone === "success";
    const isRollover = autoKind === "rollover" || /ROLLOVER/i.test(row.label);

    // 状态圆圈：手动设置优先
    let statusIndicator: PremiumRuleItem["statusIndicator"] = null;
    if (row.set1Status !== undefined && row.set1Status !== null) {
      statusIndicator = row.set1Status === "none" ? null : row.set1Status;
    } else {
      if (isRollover) statusIndicator = null;
      else if (isSuccess || (kind === "deposit" || kind === "claim") && !isDanger) statusIndicator = "check";
      else if (kind === "turnover") statusIndicator = "info";
    }

    // 对 rollover 行的 × 前缀
    let displayValue = row.value || "—";
    if (isRollover && isDanger && !row.set1Status && !/^[×✕✗x]/i.test(displayValue.trim())) {
      displayValue = `× ${displayValue}`;
    }

    return {
      key: row.id || `${idx}`,
      label: row.label || "—",
      value: displayValue,
      kind,
      link: row.type === "link" ? row.link : undefined,
      badge: row.badge,
      tone,
      statusIndicator,
    };
  });
}

export function PromotionModal({
  promo,
  onClose,
  routeBonus,
  uiText
}: {
  promo: PublicPromotion | null;
  onClose: () => void;
  routeBonus: string;
  uiText?: Record<string, string>;
}) {
  const open = !!promo;
  const textOverrides = uiText ?? {};
  const localeCtx = useLocaleOptional();
  const locale = localeCtx?.locale ?? "zh";
  const t = localeCtx?.t;

  const hasCjk = (s: string) => /[\u3400-\u9fff]/.test(s);
  const pickLocaleText = (override: string | undefined, fallbackKey: string, fallbackText: string) => {
    const localized = t ? t(fallbackKey) : fallbackText;
    const fallback = localized && localized !== fallbackKey ? localized : fallbackText;
    const candidate = (override ?? "").trim();
    if (!candidate) return fallback;
    // 英文/马来文模式下，若后台文案仍是中文，则回退到当前语言文案
    if ((locale === "en" || locale === "ms") && hasCjk(candidate)) return fallback;
    return candidate;
  };

  const { blocks, contentHtml, detailType, ruleForTerms, containerFont, containerClass, promoTableData, popupCoverUrl, popupTextBelow, popupStyle } = useMemo(() => {
    if (!promo) return { blocks: [] as Block[], contentHtml: "", detailType: "blocks" as const, ruleForTerms: null as RuleForTerms | null, containerFont: "", containerClass: "", promoTableData: null, popupCoverUrl: null, popupTextBelow: "", popupStyle: "premium" as const };
    const obj = promo.detailJson && typeof promo.detailJson === "object" && !Array.isArray(promo.detailJson) ? (promo.detailJson as Record<string, unknown>) : null;
    const htmlRaw = obj && typeof obj.html === "string" ? obj.html : "";
    const type = getDetailType(promo.ruleJson);
    const rule = promo.ruleJson && typeof promo.ruleJson === "object" && !Array.isArray(promo.ruleJson) ? (promo.ruleJson as RuleForTerms) : null;
    const display = rule?.display && typeof rule.display === "object" ? rule.display : null;
    const tableData = parsePromoTableData(promo.detailJson);
    const popupCoverUrl = obj && typeof obj.popupCoverUrl === "string" && obj.popupCoverUrl.trim() ? obj.popupCoverUrl.trim() : null;
    const popupTextBelow = obj && typeof obj.popupTextBelow === "string" ? obj.popupTextBelow : "";
    const perPromoStyle = display && typeof (display as Record<string, unknown>).popupStyle === "string" ? (display as Record<string, unknown>).popupStyle : null;
    const globalVariant = typeof textOverrides?.promomodalvariant === "string" ? textOverrides.promomodalvariant.trim().toLowerCase() : "";
    const popupStyle = perPromoStyle === "light" ? "light" : globalVariant === "light" ? "light" : "premium";
    return {
      blocks: parseBlocks(promo.detailJson),
      contentHtml: htmlRaw ? sanitizePromoHtml(htmlRaw) : "",
      detailType: tableData && type === "set2" ? "set2" : tableData ? "promo_table" : type,
      ruleForTerms: type === "terms" ? rule : null,
      containerFont: typeof display?.fontFamily === "string" ? display.fontFamily : "",
      containerClass: typeof display?.customClass === "string" ? display.customClass : "",
      promoTableData: tableData,
      popupCoverUrl,
      popupTextBelow,
      popupStyle,
    };
  }, [promo, textOverrides]);

  const isPremium = popupStyle !== "light";

  const viewAllText = pickLocaleText(textOverrides.promomodalviewalltext, "public.vivid.promo.viewAll", "View All");
  const claimText = pickLocaleText(textOverrides.promomodalclaimtext, "public.vivid.promo.claim", "Claim");
  const closeText = textOverrides.promomodalclosetext ?? "关闭";
  const emptyText = textOverrides.promomodaldetailsemptytext ?? "暂无活动内容";

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open || !promo) return null;

  const bonusBase = routeBonus && routeBonus.trim().length > 0 ? routeBonus.trim() : "/bonus";
  const goBonus = `${bonusBase}#${encodeURIComponent(promo.id)}`;
  const claimHref = (promo.ctaUrl ?? "").trim() ? safeLink(promo.ctaUrl as string) : goBonus;
  const claimButtonText = (promo.ctaLabel ?? "").trim() || claimText;
  const headerTitle = ((detailType === "promo_table" || detailType === "set2") && promoTableData?.title) ? promoTableData.title : promo.title;
  const headerIcon = ((detailType === "promo_table" || detailType === "set2") && promoTableData?.titleIcon) ? promoTableData.titleIcon : "🎁";
  const premiumRuleItems =
    (detailType === "promo_table" || detailType === "set2") && promoTableData
      ? buildPremiumItemsFromPromoTable(promoTableData)
      : detailType === "terms" && ruleForTerms
        ? buildPremiumItemsFromTerms(ruleForTerms, promo.percentText, promo.limitTag)
        : [];

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close"
        onClick={onClose}
      />
      {/* key 确保切换不同活动时内容完全刷新；样式由后台「弹窗样式」决定 */}
      <div
        key={promo.id}
        className={`promo-modal promo-modal-unified relative w-full max-w-[480px] max-h-[90dvh] flex flex-col overflow-hidden rounded-2xl ${isPremium ? "promo-modal-premium bg-[#0f172a] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.06)]" : "bg-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.35)]"}`}
        style={isPremium ? { fontFamily: "var(--font-promo-body), var(--font-promo-cjk), Inter, system-ui, sans-serif" } : undefined}
      >
        {isPremium ? (
          <div className="promo-modal-premium-hero">
            <button
              type="button"
              onClick={onClose}
              aria-label={closeText}
              className="promo-modal-premium-close"
            >
              {closeText}
            </button>
            <div className="promo-modal-premium-title-wrap">
              <p className="promo-modal-premium-kicker">VIP PROMOTION</p>
              <h2
                className="promo-modal-premium-title"
                style={{ fontFamily: "var(--font-promo-heading), var(--font-promo-cjk), sans-serif" }}
              >
                {headerTitle || "PROMOTION DETAILS"}
              </h2>
              <div className="promo-modal-premium-meta">
                <span className="promo-modal-premium-meta-chip is-gold">{promo.percentText || "BONUS"}</span>
                <span className="promo-modal-premium-meta-chip is-blue">{promo.statusLabel}</span>
                {promo.limitTag ? <span className="promo-modal-premium-meta-chip is-purple">{promo.limitTag}</span> : null}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-shrink-0 flex items-center justify-between gap-3 px-4 py-3.5 bg-gradient-to-r from-[#1e3a5f] to-[#2d4a6f] text-white">
            <h2 className="text-base font-extrabold leading-tight tracking-tight truncate flex items-center gap-2 min-w-0">
              {headerIcon && <span className="flex-shrink-0 opacity-95">{headerIcon}</span>}
              <span>{headerTitle || "优惠详情"}</span>
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label={closeText}
              className="flex-shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold bg-white/15 text-white/95 hover:bg-white/25 transition-colors"
            >
              {closeText}
            </button>
          </div>
        )}

        <div
          role="region"
          aria-label="优惠详情"
          data-promo-container
          className={`promo-detail-container promo-modal-content flex-1 min-h-0 overflow-auto ${isPremium ? "bg-[#0f172a]" : ""} ${containerClass}`.trim()}
          style={containerFont ? { fontFamily: containerFont } : undefined}
        >
          {popupCoverUrl && (
            <div className="flex-shrink-0 px-0 pb-0">
              <div className={`overflow-hidden rounded-none ${isPremium ? "border-b border-white/10" : "border-b border-slate-200"}`}>
                <FallbackImage src={popupCoverUrl} alt={promo?.title ?? ""} className="h-auto w-full object-cover" />
              </div>
            </div>
          )}

          {detailType === "set2" && promoTableData ? (
            /* Set 2：经典蓝色表格，不论弹窗样式，始终用 PromoTablePreview */
            <div className="promo-modal-table-wrap">
              <PromoTablePreview data={promoTableData} />
            </div>
          ) : detailType === "promo_table" && promoTableData ? (
            isPremium ? (
              <div className="promo-modal-premium-rules-wrap promo-modal-rules-outer px-4 py-4">
                <div className="promo-modal-premium-rules-panel">
                  <PremiumRuleRows
                    title="PROMOTION RULES"
                    items={premiumRuleItems}
                    footerText={promoTableData.showFooter ? promoTableData.footer : undefined}
                    footerImg={promoTableData.footerImg}
                  />
                </div>
              </div>
            ) : (
              <div className="promo-modal-table-wrap">
                <PromoTablePreview data={promoTableData} hideTitle />
              </div>
            )
          ) : detailType === "terms" && ruleForTerms ? (
            isPremium ? (
              <div className="promo-modal-rules-outer px-4 py-4 promo-modal-terms">
                <div className="promo-modal-premium-rules-panel">
                  <PremiumRuleRows
                    title="PROMOTION RULES"
                    items={premiumRuleItems}
                  />
                </div>
              </div>
            ) : (
              <div className="px-4 py-3 promo-modal-terms">
                <TermsTableView rule={ruleForTerms} percentText={promo.percentText} limitTag={promo.limitTag} light />
              </div>
            )
          ) : contentHtml ? (
            <div className={isPremium ? "promo-modal-rules-outer px-4 py-4" : "px-4 py-3"}>
              {isPremium ? (
                <div className="promo-modal-premium-rules-panel promo-modal-rules-inner p-4">
                  <div className="promo-premium-rules-heading-wrap mb-3">
                    <span className="promo-premium-rules-divider" />
                    <h3 className="promo-premium-rules-heading">PROMOTION RULES</h3>
                    <span className="promo-premium-rules-divider" />
                  </div>
                  <div className="promo-detail-html promo-detail-html-premium text-sm text-slate-300 [&_a]:text-amber-400 [&_a]:underline" dangerouslySetInnerHTML={{ __html: contentHtml }} />
                </div>
              ) : (
                <div className="promo-detail-html text-sm text-slate-700 [&_table]:w-full [&_td]:py-1.5 [&_th]:py-1.5 [&_a]:text-blue-600 [&_a]:underline" dangerouslySetInnerHTML={{ __html: contentHtml }} />
              )}
            </div>
          ) : blocks.length === 0 ? (
            <p className={`px-4 py-3 text-sm ${isPremium ? "text-slate-400" : "text-slate-500"}`}>{emptyText}</p>
          ) : (
            <div className={isPremium ? "promo-modal-rules-outer px-4 py-4" : "px-4 py-3"}>
              {isPremium ? (
                <div className="promo-modal-premium-rules-panel promo-modal-rules-inner rounded-xl overflow-hidden border border-white/10 bg-gradient-to-b from-[#1e293b] to-[#0f172a] p-4 space-y-3">
                  {blocks.map((b, idx) => {
                    const key = b.id ?? `${b.type}-${idx}`;
                    if (b.type === "h1") return <h3 key={key} className="text-base font-extrabold text-amber-400/95">{b.text}</h3>;
                    if (b.type === "p") return <p key={key} className="text-sm leading-6 text-slate-300">{b.text}</p>;
                    if (b.type === "list") {
                      const items = Array.isArray(b.items) ? b.items.filter(Boolean) : [];
                      return (
                        <ul key={key} className="promo-modal-rules-list list-disc text-sm text-slate-300">
                          {items.map((x, i) => (
                            <li key={`${key}-i-${i}`}>{x}</li>
                          ))}
                        </ul>
                      );
                    }
                    if (b.type === "image") {
                      const href = safeHref(b.url);
                      return (
                        <div key={key} className="overflow-hidden rounded-lg border border-white/10 bg-black/20">
                          <FallbackImage src={href} alt="" className="ui-asset-img h-auto w-full object-cover" />
                        </div>
                      );
                    }
                    if (b.type === "button") return null;
                    return null;
                  })}
                </div>
              ) : (
                <div className="space-y-3">
                  {blocks.map((b, idx) => {
                    const key = b.id ?? `${b.type}-${idx}`;
                    if (b.type === "h1") return <h3 key={key} className="text-base font-extrabold text-slate-800">{b.text}</h3>;
                    if (b.type === "p") return <p key={key} className="text-sm leading-6 text-slate-600">{b.text}</p>;
                    if (b.type === "list") {
                      const items = Array.isArray(b.items) ? b.items.filter(Boolean) : [];
                      return (
                        <ul key={key} className="promo-modal-rules-list list-disc text-sm text-slate-600">
                          {items.map((x, i) => (
                            <li key={`${key}-i-${i}`}>{x}</li>
                          ))}
                        </ul>
                      );
                    }
                    if (b.type === "image") {
                      const href = safeHref(b.url);
                      return (
                        <div key={key} className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                          <FallbackImage src={href} alt="" className="ui-asset-img h-auto w-full object-cover" />
                        </div>
                      );
                    }
                    if (b.type === "button") return null;
                    return null;
                  })}
                </div>
              )}
            </div>
          )}
          {popupTextBelow.trim() && !(isPremium && (detailType === "promo_table" || detailType === "terms")) && (
            <div className="flex-shrink-0 px-4 py-3">
              {isPremium ? (
                <div className="promo-modal-premium-warning rounded-xl border border-amber-500/40 bg-gradient-to-br from-amber-950/50 to-red-950/40 px-3 py-2.5 text-sm text-amber-200/95 whitespace-pre-line shadow-[0_0_20px_rgba(251,191,36,0.15)]">
                  {popupTextBelow.trim()}
                </div>
              ) : (
                <div className="rounded-xl border border-amber-200 bg-amber-50/90 px-3 py-2.5 text-sm text-slate-800 whitespace-pre-line">
                  {popupTextBelow.trim()}
                </div>
              )}
            </div>
          )}

          <div className={`flex-shrink-0 flex flex-row flex-wrap items-center justify-end gap-3 px-4 py-4 mt-2 ${isPremium ? "border-t border-white/10" : "border-t border-slate-200 bg-slate-50/70"}`}>
            <a
              href={bonusBase}
              className={isPremium ? "promo-modal-premium-btn-secondary inline-flex items-center justify-center px-6 py-3 text-sm font-bold no-underline transition-all" : "inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-bold no-underline transition-colors bg-[#334155] text-white hover:bg-[#475569]"}
              onClick={onClose}
            >
              {viewAllText}
            </a>
            <a
              href={claimHref}
              className={isPremium ? "promo-modal-premium-btn-primary inline-flex items-center justify-center px-6 py-3 text-sm font-bold no-underline transition-all" : "inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-3 text-sm font-bold text-white shadow-lg hover:from-amber-600 hover:to-amber-700 transition-all"}
              onClick={onClose}
            >
              {claimButtonText}{isPremium ? " >" : ""}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

