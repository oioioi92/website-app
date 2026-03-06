"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PromotionEditFormLines } from "@/components/admin/PromotionEditFormLines";

const inputClass =
  "admin-compact-input w-full rounded-lg border border-[var(--admin-border)] bg-[var(--admin-panel2)] px-2.5 py-1.5 text-[var(--admin-text)] placeholder-[var(--admin-muted2)] focus:border-[var(--admin-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--admin-primary)]";
const labelClass = "block text-[12px] font-medium text-[var(--admin-muted)] mb-1";

/** 鍚庡彴鎻掑叆鐢細瀹屾暣鏉℃寮圭獥 HTML 妯℃澘锛堜袱鏍忚〃銆佽鍛婃绛夛級锛岄【瀹㈠彲鏀瑰瓧鍗冲彲鐢?*/
const PROMO_HTML_TEMPLATES = {
  twoColTable: `<table>
  <tr><th class="promo-cell-header">椤圭洰</th><th class="promo-cell-header">璇存槑</th></tr>
  <tr><td class="promo-cell">濂栭噾</td><td class="promo-cell promo-text-gold">10%</td></tr>
  <tr><td class="promo-cell">鏈€浣庡厖鍊?/td><td class="promo-cell">RM10</td></tr>
  <tr><td class="promo-cell">娴佹按</td><td class="promo-cell">x3</td></tr>
</table>
`,
  twoColAndWarning: `<table>
  <tr><th class="promo-cell-header">椤圭洰</th><th class="promo-cell-header">璇存槑</th></tr>
  <tr><td class="promo-cell">濂栭噾</td><td class="promo-cell promo-text-gold">10%</td></tr>
  <tr><td class="promo-cell">鏈€浣庡厖鍊?/td><td class="promo-cell">RM10</td></tr>
  <tr><td class="promo-cell">娴佹按</td><td class="promo-cell">x3</td></tr>
</table>
<p class="warning">杩濆弽鏉℃灏嗘病鏀舵墍鏈夌Н鍒嗐€傝閬靛畧娲诲姩瑙勫垯銆?/p>
`,
  fullExample: `<h3 class="promo-text-gold">10% UNLIMITED SLOT BONUS</h3>
<table>
  <tr><th class="promo-cell-header">濂栧姳</th><th class="promo-cell-header">璇存槑</th></tr>
  <tr><td class="promo-cell">濂栭噾</td><td class="promo-cell promo-text-gold">10%</td></tr>
  <tr><td class="promo-cell">鏈€浣庡厖鍊?/td><td class="promo-cell">RM10.00</td></tr>
  <tr><td class="promo-cell">鎬婚鍙栨鏁?/td><td class="promo-cell">涓嶉檺</td></tr>
  <tr><td class="promo-cell">娴佹按鍊嶆暟</td><td class="promo-cell">x3</td></tr>
  <tr><td class="promo-cell">Rollover</td><td class="promo-cell">涓嶅厑璁?/td></tr>
  <tr><td class="promo-cell">浠呴檺娓告垙</td><td class="promo-cell">SLOT | JILI | ACEWIN</td></tr>
  <tr><td class="promo-cell">涓嶅彲鐢ㄤ簬</td><td class="promo-cell">BUY / SAVE FREE GAME</td></tr>
  <tr><td class="promo-cell">绂佹挱娓告垙</td><td class="promo-cell"><a href="#">鏌ョ湅绂佹挱鍒楄〃</a></td></tr>
</table>
<p class="warning">杩濆弽鏉℃涓庢潯浠跺皢娌℃敹鎵€鏈夌Н鍒嗐€?/p>
`
};

function toDatetimeLocal(iso: string | null | undefined): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const h = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${y}-${m}-${day}T${h}:${min}`;
  } catch {
    return "";
  }
}

function fromDatetimeLocal(s: string): string | null {
  const t = (s ?? "").trim();
  if (!t) return null;
  const d = new Date(t);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

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
  /** 璇︽儏绫诲瀷涓?HTML 鏃剁敤杩欎釜锛岀洿鎺ュ啓 HTML 涓嶇敤 JSON */
  detailHtml: string;
  /** 璇︽儏绫诲瀷涓?Blocks 鏃剁敤杩欎釜锛圝SON 瀛楃涓诧級*/
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

const defaultRule: RuleJson = {
  limits: {},
  eligible: {},
  grant: { mode: "PERCENT" },
  display: { detailType: "blocks" }
};

function parseRuleJson(raw: unknown): RuleJson {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return { ...defaultRule };
  const o = raw as Record<string, unknown>;
  const limits = o.limits && typeof o.limits === "object" && !Array.isArray(o.limits) ? (o.limits as Record<string, unknown>) : {};
  const eligible = o.eligible && typeof o.eligible === "object" && !Array.isArray(o.eligible) ? (o.eligible as Record<string, unknown>) : {};
  const grant = o.grant && typeof o.grant === "object" && !Array.isArray(o.grant) ? (o.grant as Record<string, unknown>) : {};
  const display = o.display && typeof o.display === "object" && !Array.isArray(o.display) ? (o.display as Record<string, unknown>) : {};
  const claimResetVal = o.claimReset;
  const claimReset = claimResetVal === "HOURLY" || claimResetVal === "DAILY" || claimResetVal === "WEEKLY" || claimResetVal === "MONTHLY" || claimResetVal === "NONE" ? claimResetVal : undefined;
  return {
    limits: {
      perDay: Number(limits.perDay) || undefined,
      perWeek: Number(limits.perWeek) || undefined,
      perLifetime: Number(limits.perLifetime) || undefined,
      perHour: Number(limits.perHour) || undefined,
      perMonth: Number(limits.perMonth) || undefined
    },
    claimReset,
    eligible: { minDeposit: Number(eligible.minDeposit) || undefined },
    grant: {
      mode: grant.mode === "FIXED" ? "FIXED" : grant.mode === "RANDOM" ? "RANDOM" : "PERCENT",
      percent: (() => { const n = Number(grant.percent); return Number.isFinite(n) && n >= 0 ? n : undefined; })(),
      fixedAmount: Number(grant.fixedAmount) || undefined,
      capAmount: Number(grant.capAmount) || undefined,
      randMin: grant.randMin != null ? Number(grant.randMin) : undefined,
      randMax: grant.randMax != null ? Number(grant.randMax) : undefined,
    },
    turnover: Number(o.turnover) || undefined,
    rollover: o.rollover === true || o.rollover === "allowed" ? true : o.rollover === false || o.rollover === "not_allowed" ? false : undefined,
    rolloverMultiplier: Number(o.rolloverMultiplier) || undefined,
    groupLabel: typeof o.groupLabel === "string" ? o.groupLabel : undefined,
    onlyPayGame: typeof o.onlyPayGame === "string" ? o.onlyPayGame : undefined,
    notAllowedTo: typeof o.notAllowedTo === "string" ? o.notAllowedTo : undefined,
    bannedGameLink: typeof o.bannedGameLink === "string" ? o.bannedGameLink : undefined,
    warningText: typeof o.warningText === "string" ? o.warningText : undefined,
    display: {
      detailType: display.detailType === "html" ? "html" : display.detailType === "terms" ? "terms" : display.detailType === "promo_table" ? "promo_table" : display.detailType === "set2" ? "set2" : "blocks",
      fontFamily: typeof display.fontFamily === "string" ? display.fontFamily : undefined,
      customClass: typeof display.customClass === "string" ? display.customClass : undefined,
      popupStyle: display.popupStyle === "light" ? "light" : "premium"
    }
  };
}

const emptyForm: Form = {
  title: "",
  subtitle: "",
  coverUrl: "",
  coverUrlMobilePromo: "",
  coverUrlDesktopHome: "",
  coverUrlMobileHome: "",
  popupCoverUrl: "",
  popupTextBelow: "",
  promoLink: "",
  detailHtml: "",
  detailJson: "{}",
  percent: 0,
  startAt: "",
  endAt: "",
  isClaimable: true,
  ruleJson: { ...defaultRule },
  ctaLabel: "",
  ctaUrl: "",
  isActive: true,
  sortOrder: 0
};

export function PromotionEditClient({ id }: { id?: string }) {
  const router = useRouter();
  const isCreate = id == null;
  const [loading, setLoading] = useState(!isCreate);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState<Form>({ ...emptyForm });

  useEffect(() => {
    if (isCreate) return;
    fetch(`/api/admin/promotions/${id}`, { credentials: "include" })
      .then((r) => {
        if (r.status === 404) throw new Error("Not found");
        if (!r.ok) throw new Error("Load failed");
        return r.json();
      })
      .then((data) => {
        const raw = data.detailJson;
        const hasHtml = raw && typeof raw === "object" && "html" in raw && typeof (raw as { html?: string }).html === "string";
        const hasBlocks = raw && typeof raw === "object" && "blocks" in raw;
        const parsedRule = parseRuleJson(data.ruleJson);
        const fallbackPercent = Number(data.percent) || 0;
        const percentFromRule = parsedRule.grant?.mode !== "FIXED" && parsedRule.grant?.percent != null && Number.isFinite(Number(parsedRule.grant.percent))
          ? Number(parsedRule.grant.percent)
          : fallbackPercent;
        if (parsedRule.grant && parsedRule.grant.mode !== "FIXED" && parsedRule.grant.percent == null && fallbackPercent !== 0) {
          parsedRule.grant = { ...parsedRule.grant, percent: fallbackPercent };
        }
        setForm({
          title: data.title ?? "",
          subtitle: data.subtitle ?? "",
          coverUrl: data.coverUrl ?? "",
          coverUrlMobilePromo: data.coverUrlMobilePromo ?? "",
          coverUrlDesktopHome: data.coverUrlDesktopHome ?? "",
          coverUrlMobileHome: data.coverUrlMobileHome ?? "",
          popupCoverUrl: (data.detailJson && typeof data.detailJson === "object" && !Array.isArray(data.detailJson) && typeof (data.detailJson as Record<string,unknown>).popupCoverUrl === "string") ? String((data.detailJson as Record<string,unknown>).popupCoverUrl) : "",
          popupTextBelow: (data.detailJson && typeof data.detailJson === "object" && !Array.isArray(data.detailJson) && typeof (data.detailJson as Record<string,unknown>).popupTextBelow === "string") ? String((data.detailJson as Record<string,unknown>).popupTextBelow) : "",
          promoLink: data.promoLink ?? "",
          detailHtml: hasHtml ? (raw as { html: string }).html : "",
          detailJson: hasHtml ? "{}" : typeof data.detailJson === "string" ? data.detailJson : JSON.stringify(data.detailJson ?? {}, null, 2),
          percent: percentFromRule,
          startAt: toDatetimeLocal(data.startAt),
          endAt: toDatetimeLocal(data.endAt),
          isClaimable: data.isClaimable !== false,
          ruleJson: parsedRule,
          ctaLabel: data.ctaLabel ?? "",
          ctaUrl: data.ctaUrl ?? "",
          isActive: data.isActive ?? true,
          sortOrder: data.sortOrder ?? 0
        });
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id, isCreate]);

  function patch(partial: Partial<Form>) {
    setForm((prev) => ({ ...prev, ...partial }));
    setError(null);
    setMessage(null);
  }

  function patchRule(partial: Partial<RuleJson>) {
    setForm((prev) => ({ ...prev, ruleJson: { ...prev.ruleJson, ...partial } }));
    setError(null);
    setMessage(null);
  }

  function patchRuleDisplay(partial: Partial<RuleJson["display"]>) {
    setForm((prev) => ({
      ...prev,
      ruleJson: { ...prev.ruleJson, display: { ...prev.ruleJson.display, ...partial } }
    }));
    setError(null);
    setMessage(null);
  }

  function buildPayload() {
    const detailType = form.ruleJson.display?.detailType ?? "blocks";
    let detailJson: unknown;
    if (detailType === "html") {
      detailJson = form.detailHtml.trim() ? { html: form.detailHtml.trim() } : {};
    } else if (detailType === "terms") {
      detailJson = {};
    } else {
      try {
        detailJson = form.detailJson.trim() ? JSON.parse(form.detailJson) : {};
      } catch {
        setError("Detail JSON format error (check JSON)");
        return null;
      }
    }
    // 弹窗：顶部照片 + 信息下方文字 注入到 detailJson
    const popupUrl = (form.popupCoverUrl ?? "").trim();
    const popupText = (form.popupTextBelow ?? "").trim();
    const dj = { ...(detailJson as Record<string, unknown>) };
    if (popupUrl) dj.popupCoverUrl = popupUrl; else delete dj.popupCoverUrl;
    if (popupText) dj.popupTextBelow = popupText; else delete dj.popupTextBelow;
    detailJson = dj;
    const r = form.ruleJson;
    const grant = r.grant;
    const grantPayload =
      grant && (grant.percent != null || grant.fixedAmount != null || grant.randMin != null || grant.mode)
        ? {
            ...grant,
            mode: grant.mode === "FIXED" ? "FIXED" : grant.mode === "RANDOM" ? "RANDOM" : "PERCENT",
            percent: grant.mode === "FIXED" || grant.mode === "RANDOM" ? grant.percent : (grant.percent ?? form.percent),
            fixedAmount: grant.fixedAmount,
            capAmount: grant.capAmount,
            randMin: grant.randMin,
            randMax: grant.randMax,
          }
        : undefined;
    const rulePayload: Record<string, unknown> = {
      limits: r.limits && Object.keys(r.limits).length ? r.limits : undefined,
      claimReset: r.claimReset || undefined,
      eligible: r.eligible?.minDeposit != null ? { minDeposit: r.eligible.minDeposit } : undefined,
      grant: grantPayload,
      turnover: r.turnover != null && r.turnover > 0 ? r.turnover : undefined,
      rollover: r.rollover === true ? true : r.rollover === false ? false : undefined,
      rolloverMultiplier: r.rollover === true && r.rolloverMultiplier != null && r.rolloverMultiplier > 0 ? r.rolloverMultiplier : undefined,
      groupLabel: r.groupLabel || undefined,
      onlyPayGame: (r.onlyPayGame ?? "").trim() || undefined,
      notAllowedTo: r.notAllowedTo || undefined,
      bannedGameLink: r.bannedGameLink || undefined,
      warningText: r.warningText || undefined,
      display: r.display && (r.display.detailType || r.display.fontFamily || r.display.customClass) ? r.display : undefined
    };
    const ruleJson = Object.fromEntries(Object.entries(rulePayload).filter(([, v]) => v !== undefined));
    return {
      title: form.title,
      subtitle: form.subtitle || null,
      coverUrl: form.coverUrl || null,
      coverUrlMobilePromo: form.coverUrlMobilePromo || null,
      coverUrlDesktopHome: form.coverUrlDesktopHome || null,
      coverUrlMobileHome: form.coverUrlMobileHome || null,
      promoLink: form.promoLink?.trim() || null,
      detailJson,
      percent: form.percent,
      startAt: fromDatetimeLocal(form.startAt),
      endAt: fromDatetimeLocal(form.endAt),
      isClaimable: form.isClaimable,
      ruleJson: Object.keys(ruleJson).length ? ruleJson : null,
      ctaLabel: form.ctaLabel || null,
      ctaUrl: form.ctaUrl || null,
      isActive: form.isActive,
      sortOrder: form.sortOrder
    };
  }

  function save() {
    setSaving(true);
    setError(null);
    setMessage(null);
    const payload = buildPayload();
    if (payload == null) {
      setSaving(false);
      return;
    }
    if (isCreate) {
      if (!payload.title.trim()) {
        setError("Title required");
        setSaving(false);
        return;
      }
      fetch("/api/admin/promotions", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(async (r) => {
          if (!r.ok) {
            const msg = await r.json().then((d: { error?: string }) => d.error).catch(() => "");
            if (r.status === 401) throw new Error("Unauthorized or session expired, please login");
            if (r.status === 400 && msg) throw new Error(msg === "TITLE_REQUIRED" ? "Title required" : String(msg));
            throw new Error("Create failed");
          }
          return r.json();
        })
        .then((data: { id: string }) => {
          router.replace(`/admin/promotions/${data.id}/edit`);
        })
        .catch((e) => setError(e.message))
        .finally(() => setSaving(false));
      return;
    }
    fetch(`/api/admin/promotions/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(async (r) => {
        if (!r.ok) {
          const data = await r.json().catch(() => ({}));
          const msg = (data as { error?: string; message?: string }).message ?? (data as { error?: string }).error ?? "";
          if (r.status === 401) throw new Error("Unauthorized or session expired, please login");
          if (r.status === 400 && msg) throw new Error(String(msg));
          throw new Error(msg || "Save failed");
        }
        return r.json();
      })
      .then(() => setMessage("Saved"))
      .catch((e) => setError(e.message))
      .finally(() => setSaving(false));
  }

  if (loading) {
    return (
      <div className="py-12 text-center text-[13px] text-[var(--admin-muted)]">Loading...</div>
    );
  }
  if (error && !form.title) {
    return (
      <div className="py-12 text-center text-[13px] text-[var(--admin-danger)]">{error}</div>
    );
  }

  return (
    <PromotionEditFormLines
      form={form}
      patch={patch}
      patchRule={patchRule}
      patchRuleDisplay={patchRuleDisplay}
      save={save}
      saving={saving}
      isCreate={isCreate}
      id={id}
      message={message}
      error={error}
    />
  );
}
