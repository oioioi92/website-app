"use client";

import React, { useState, useId, useRef, useEffect } from "react";
import { sanitizePromoHtml } from "@/lib/public/sanitizePromoHtml";
import { useLocale } from "@/lib/i18n/context";

// ============================================================
// Types
// ============================================================
export type PromoTableRow = {
  id: string;
  label: string;
  value: string;
  type: "text" | "multiline" | "link";
  link?: string;
  icon?: string;          // emoji prefix on left label  e.g. "✅"
  highlight?: boolean;    // highlight this row in gold/special color
  highlightColor?: string;// custom highlight color override
  badge?: string;         // small badge on right cell  e.g. "HOT" "NEW" "LIMITED"
  // Set 1 专属
  set1Status?: "check" | "info" | "x" | "none" | null;   // 右侧状态圆圈（null = 自动判断）
  set1IconKind?: "bonus" | "deposit" | "claim" | "turnover" | "rollover" | "default"; // 左侧图标类型
  set1ValueColor?: "gold" | "success" | "danger" | "normal"; // 数值颜色
};

export type PromoTableData = {
  type: "promo_table";
  theme: string;
  customLeft?: string;
  customRight?: string;
  titleIcon?: string;       // emoji before title  e.g. "🎁"
  title?: string;
  titleSubtitle?: string;   // optional subtitle under title
  showSubtitle?: boolean;
  titleSize?: "small" | "normal" | "large";  // title font size
  showTitle: boolean;
  tableSize: "compact" | "normal" | "spacious";
  leftWidth: number;        // left cell % width  30-55
  tableBorderRadius?: "none" | "small" | "medium" | "round";  // cell corner radius
  valueAlign?: "left" | "center" | "right";  // right column text alignment
  showRowSeparator?: boolean;  // thin line between rows
  rows: PromoTableRow[];
  warning?: string;
  showWarning: boolean;
  footer?: string;
  showFooter: boolean;
  footerImg?: string;
};

// ============================================================
// Themes
// ============================================================
export const PROMO_THEMES: { id: string; name: string; emoji: string; left: string; right: string }[] = [
  { id: "blue",   name: "Classic Blue",  emoji: "🔵", left: "rgba(45,48,144,1)",  right: "rgba(243,243,247,1)" },
  { id: "gold",   name: "Dark Gold",     emoji: "🥇", left: "#7c5c15",            right: "#fff8e7"             },
  { id: "green",  name: "Fresh Green",   emoji: "🟢", left: "#065f46",            right: "#ecfdf5"             },
  { id: "red",    name: "Hot Red",       emoji: "🔴", left: "#b91c1c",            right: "#fff1f2"             },
  { id: "dark",   name: "Dark Elite",    emoji: "⚫", left: "#1a1a2e",            right: "#f0f0f5"             },
  { id: "purple", name: "Royal Purple",  emoji: "🟣", left: "#4c1d95",            right: "#f5f3ff"             },
  { id: "custom", name: "Custom",        emoji: "🎨", left: "#2d3090",            right: "#f3f3f7"             },
];

// Quick icon picker
const QUICK_ICONS = ["✅", "❌", "⭐", "🎯", "💰", "🔥", "⚠️", "🎁", "💎", "🏆", "🎰", "👑", "📋", "⚡", "🚫"];

// Quick badge options
const QUICK_BADGES = ["HOT", "NEW", "LIMITED", "FREE", "VIP", "BONUS", "✓"];

// ============================================================
// Quick-add row presets
// ============================================================
const QUICK_ROWS: Array<{ label: string; value: string; type: PromoTableRow["type"]; link?: string }> = [
  { label: "GANJARAN",           value: "10%",            type: "text" },
  { label: "MIN DEPOSIT",        value: "RM10.00",        type: "text" },
  { label: "TOTAL CLAIM",        value: "UNLIMITED",      type: "text" },
  { label: "TURNOVER",           value: "X3",             type: "text" },
  { label: "ROLLOVER",           value: "❌",             type: "text" },
  { label: "MAX WITHDRAW",       value: "RM500.00",       type: "text" },
  { label: "CLAIM LIMIT",        value: "1 (DAILY)",      type: "text" },
  { label: "MIN TIMES OF TOPUP", value: "1",              type: "text" },
  { label: "ONLY PAY GAME",      value: "【ONLY SLOT】\\nJILI｜ACEWIN｜RICH88｜BNG\\n\\n【FAST GAME】\\n【FISH GAME】\\n【CORRECT SCORE】", type: "multiline" },
  { label: "NOT ALLOWED TO",     value: "BUY / SAVE FREE GAME / SAVE WILD / SAVE ANGPAO", type: "text" },
  { label: "BANNED GAME",        value: "CHECK BANNED GAME HERE", type: "link", link: "https://yoursite.com/banned-games.jpg" },
];

let _cnt = 0;
function newId() { return `r${++_cnt}_${Date.now()}`; }

// ============================================================
// Full Template Presets（一键套用完整风格）
// ============================================================
function makeRows(list: Array<[string, string]>): PromoTableRow[] {
  return list.map(([label, value]) => ({ id: newId(), label, value, type: "text" as const }));
}
const FULL_TEMPLATES: Array<{
  id: string;
  name: string;
  emoji: string;
  leftColor: string;
  theme: PromoTableData["theme"];
  customLeft?: string;
  customRight?: string;
  rows: Array<[string, string]>;
  warning: string;
}> = [
  {
    id: "tpl_blue",
    name: "Classic Blue",
    emoji: "🔵",
    leftColor: "#1e3a8a",
    theme: "blue",
    rows: [
      ["GANJARAN",    "10%"],
      ["MIN DEPOSIT", "RM10.00"],
      ["TOTAL CLAIM", "UNLIMITED"],
      ["TURNOVER",    "X3"],
      ["ROLLOVER",    "❌"],
    ],
    warning: "VIOLATION OF TERMS & CONDITIONS WILL FORFEIT ALL POINTS",
  },
  {
    id: "tpl_gold",
    name: "Dark Gold",
    emoji: "🥇",
    leftColor: "#92400e",
    theme: "gold",
    rows: [
      ["GANJARAN",    "50%"],
      ["MIN DEPOSIT", "RM50.00"],
      ["TOTAL CLAIM", "1 Time Only"],
      ["TURNOVER",    "X5"],
      ["ROLLOVER",    "❌"],
    ],
    warning: "VIOLATION OF TERMS & CONDITIONS WILL FORFEIT ALL POINTS",
  },
  {
    id: "tpl_red",
    name: "Hot Red",
    emoji: "🔴",
    leftColor: "#991b1b",
    theme: "red",
    rows: [
      ["GANJARAN",    "100%"],
      ["MIN DEPOSIT", "RM20.00"],
      ["TOTAL CLAIM", "1 Time Only"],
      ["TURNOVER",    "X8"],
      ["ROLLOVER",    "❌"],
    ],
    warning: "VIOLATION OF TERMS & CONDITIONS WILL FORFEIT ALL POINTS",
  },
  {
    id: "tpl_green",
    name: "Fresh Green",
    emoji: "🟢",
    leftColor: "#065f46",
    theme: "green",
    rows: [
      ["GANJARAN",    "5% DAILY"],
      ["MIN DEPOSIT", "RM10.00"],
      ["TOTAL CLAIM", "UNLIMITED"],
      ["TURNOVER",    "X1"],
      ["ROLLOVER",    "✅"],
    ],
    warning: "VIOLATION OF TERMS & CONDITIONS WILL FORFEIT ALL POINTS",
  },
  {
    id: "tpl_purple",
    name: "Royal Purple",
    emoji: "🟣",
    leftColor: "#4c1d95",
    theme: "purple",
    rows: [
      ["GANJARAN",    "VIP BONUS"],
      ["MIN DEPOSIT", "RM100.00"],
      ["TOTAL CLAIM", "1 Time Only"],
      ["TURNOVER",    "X3"],
      ["ROLLOVER",    "❌"],
    ],
    warning: "VIOLATION OF TERMS & CONDITIONS WILL FORFEIT ALL POINTS",
  },
  {
    id: "tpl_dark",
    name: "Dark Elite",
    emoji: "⚫",
    leftColor: "#1a1a2e",
    theme: "dark",
    rows: [
      ["GANJARAN",    "30%"],
      ["MIN DEPOSIT", "RM30.00"],
      ["TOTAL CLAIM", "DAILY"],
      ["TURNOVER",    "X3"],
      ["MAX WITHDRAW", "RM500.00"],
      ["ROLLOVER",    "❌"],
    ],
    warning: "VIOLATION OF TERMS & CONDITIONS WILL FORFEIT ALL POINTS",
  },
];

// ============================================================
// Defaults / parse
// ============================================================
export function emptyPromoTableData(): PromoTableData {
  return {
    type: "promo_table",
    theme: "blue",
    titleIcon: "🎁",
    showTitle: true,
    title: "10% UNLIMITED SLOT SPECIAL BONUS",
    titleSubtitle: "",
    showSubtitle: false,
    titleSize: "normal",
    tableSize: "normal",
    leftWidth: 42,
    tableBorderRadius: "medium",
    valueAlign: "center",
    showRowSeparator: false,
    rows: [
      { id: newId(), label: "GANJARAN",    value: "10%",       type: "text" },
      { id: newId(), label: "MIN DEPOSIT", value: "RM10.00",   type: "text" },
      { id: newId(), label: "TOTAL CLAIM", value: "UNLIMITED", type: "text" },
      { id: newId(), label: "TURNOVER",    value: "X3",        type: "text" },
      { id: newId(), label: "ROLLOVER",    value: "❌",        type: "text" },
    ],
    showWarning: true,
    warning: "VIOLATION OF TERMS & CONDITIONS WILL FORFEIT ALL POINTS",
    showFooter: true,
    footer: "",
    footerImg: "",
  };
}

export function parsePromoTableData(raw: unknown): PromoTableData | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  if (o.type !== "promo_table") return null;
  const rows: PromoTableRow[] = Array.isArray(o.rows)
    ? o.rows.map((r: unknown) => {
        const row = r as Record<string, unknown>;
        return {
          id: String(row.id ?? newId()),
          label: String(row.label ?? ""),
          value: String(row.value ?? ""),
          type: (row.type === "multiline" || row.type === "link") ? row.type : "text",
          link: row.link ? String(row.link) : undefined,
          icon: row.icon ? String(row.icon) : undefined,
          highlight: row.highlight === true,
          highlightColor: row.highlightColor ? String(row.highlightColor) : undefined,
          badge: row.badge ? String(row.badge) : undefined,
        };
      })
    : [];
  return {
    type: "promo_table",
    theme: String(o.theme ?? "blue"),
    customLeft: o.customLeft ? String(o.customLeft) : undefined,
    customRight: o.customRight ? String(o.customRight) : undefined,
    titleIcon: o.titleIcon ? String(o.titleIcon) : undefined,
    title: o.title ? String(o.title) : undefined,
    titleSubtitle: o.titleSubtitle ? String(o.titleSubtitle) : undefined,
    showSubtitle: o.showSubtitle === true,
    titleSize: (o.titleSize === "small" || o.titleSize === "large") ? o.titleSize : "normal",
    showTitle: o.showTitle !== false,
    tableSize: (o.tableSize === "compact" || o.tableSize === "spacious") ? o.tableSize : "normal",
    leftWidth: typeof o.leftWidth === "number" ? Math.min(55, Math.max(30, o.leftWidth)) : 42,
    tableBorderRadius: (o.tableBorderRadius === "none" || o.tableBorderRadius === "small" || o.tableBorderRadius === "medium" || o.tableBorderRadius === "round") ? o.tableBorderRadius : "medium",
    valueAlign: (o.valueAlign === "left" || o.valueAlign === "right") ? o.valueAlign : "center",
    showRowSeparator: o.showRowSeparator === true,
    rows,
    warning: o.warning ? String(o.warning) : undefined,
    showWarning: o.showWarning !== false,
    footer: o.footer ? String(o.footer) : undefined,
    showFooter: o.showFooter !== false,
    footerImg: o.footerImg ? String(o.footerImg) : undefined,
  };
}

function getThemeColors(data: PromoTableData) {
  if (data.theme === "custom") {
    return { left: data.customLeft ?? "#2d3090", right: data.customRight ?? "#f3f3f7" };
  }
  const t = PROMO_THEMES.find((t) => t.id === data.theme);
  return { left: t?.left ?? "#2d3090", right: t?.right ?? "#f3f3f7" };
}

const SIZE_PAD: Record<PromoTableData["tableSize"], string> = {
  compact: "7px 10px",
  normal:  "11px 14px",
  spacious:"16px 18px",
};

const BORDER_RADIUS: Record<NonNullable<PromoTableData["tableBorderRadius"]>, string> = {
  none: "0",
  small: "4px",
  medium: "10px",
  round: "999px",
};

const TITLE_FONT_SIZE: Record<NonNullable<PromoTableData["titleSize"]>, string> = {
  small: "14px",
  normal: "16px",
  large: "18px",
};

// ============================================================
// HTML Generator
// ============================================================
export function generatePromoHtml(data: PromoTableData): string {
  const { left, right } = getThemeColors(data);
  const pad = SIZE_PAD[data.tableSize];
  const lw = data.leftWidth;
  const br = BORDER_RADIUS[data.tableBorderRadius ?? "medium"];
  const valueAlign = data.valueAlign ?? "center";
  const titleSize = data.titleSize ?? "normal";
  const titleFontSize = TITLE_FONT_SIZE[titleSize];
  const sep = data.showRowSeparator ? "border-bottom:1px solid rgba(0,0,0,.06);" : "";

  const rows = data.rows
    .map((row) => {
      const labelTxt = row.icon ? `${row.icon} ${row.label}` : row.label;
      let cellValue = "";
      if (row.type === "link") {
        cellValue = `<a href="${row.link ?? "#"}" style="text-decoration:underline;color:#000;" target="_blank">${row.value}</a>`;
      } else if (row.type === "multiline") {
        cellValue = row.value.replace(/\\n/g, "<br>").replace(/\n/g, "<br>");
      } else {
        cellValue = row.value;
      }
      if (row.badge) {
        cellValue = `${cellValue} <span style="display:inline-block;background:#ef4444;color:#fff;font-size:9px;font-weight:700;padding:1px 6px;border-radius:99px;letter-spacing:.04em;vertical-align:middle;margin-left:4px;">${row.badge}</span>`;
      }

      const leftBg = row.highlight
        ? (row.highlightColor ?? "#f59e0b")
        : left;
      const leftRadius = `${br} 0 0 ${br}`;
      const rightRadius = `0 ${br} ${br} 0`;
      const leftStyle = `background:${leftBg};color:#fff;width:${lw}%;text-align:center;border-radius:${leftRadius};padding:${pad};font-weight:700;font-size:13px;position:relative;overflow:hidden;${sep}`;
      const rightStyle = `background:${right};color:#111;text-align:${valueAlign};border-radius:${rightRadius};padding:${pad};font-weight:600;font-size:13px;box-shadow:0 2px 8px rgba(0,0,0,.10);${sep}`;

      return `    <tr>\n      <td style="${leftStyle}">${labelTxt}</td>\n      <td style="${rightStyle}">${cellValue}</td>\n    </tr>`;
    })
    .join("\n");

  const titleText = [data.titleIcon, data.title].filter(Boolean).join(" ");
  const titleHtml = data.showTitle && titleText
    ? `<div style="background:${left};color:#fff;font-weight:700;font-size:${titleFontSize};text-align:center;letter-spacing:.5px;padding:14px 16px;border-radius:${br} ${br} 0 0;margin:-12px -12px 8px -12px;">${titleText}</div>\n`
    : "";
  const subtitleHtml = data.showSubtitle && data.titleSubtitle
    ? `<div style="background:rgba(0,0,0,.04);color:#374151;font-size:12px;text-align:center;padding:8px 16px;margin:-4px -12px 8px -12px;border-radius:0 0 6px 6px;">${data.titleSubtitle}</div>\n`
    : "";
  const warnHtml = data.showWarning && data.warning ? `\n<div style="background:linear-gradient(135deg,#fef2f2,#fee2e2);padding:10px 14px;text-align:center;border-left:4px solid #ef4444;margin-top:6px;border-radius:6px;color:#dc2626;font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:.5px;">⚠️ ${data.warning}</div>` : "";
  const footerHtml = data.showFooter && data.footer ? `\n<div style="background:linear-gradient(135deg,#ecfdf5,#d1fae5);padding:10px 14px;color:#065f46;font-weight:600;font-size:13px;text-align:center;margin-top:6px;border-radius:6px;">${data.footer}</div>` : "";
  const imgHtml = data.footerImg ? `\n<img src="${data.footerImg}" style="width:100%;margin-top:8px;border-radius:8px;" alt="">` : "";

  return `${titleHtml}${subtitleHtml}<table style="width:100%;border-collapse:separate;border-spacing:0 3px;background:white;padding:0 4px;">
  <tbody>
${rows}
  </tbody>
</table>${warnHtml}${footerHtml}${imgHtml}`;
}

// ============================================================
// Toggle
// ============================================================
function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!value)} className={`ptb-toggle ${value ? "ptb-toggle--on" : "ptb-toggle--off"}`}>
      <span className="ptb-toggle-knob" />
    </button>
  );
}

// ============================================================
// 页脚富文本编辑器（颜色、字号、粗体、字体、符号）
// ============================================================
const FOOTER_COLORS = [
  { id: "gold", name: "金", class: "ft-gold", color: "#ffd66d" },
  { id: "orange", name: "橙", class: "ft-orange", color: "#f97316" },
  { id: "red", name: "红", class: "ft-red", color: "#ef4444" },
  { id: "blue", name: "蓝", class: "ft-blue", color: "#93c5fd" },
  { id: "green", name: "绿", class: "ft-green", color: "#6ee7b7" },
  { id: "white", name: "白", class: "ft-white", color: "#f8fafc" },
];
const FOOTER_SIZES = [
  { id: "sm", name: "小", class: "ft-size-sm" },
  { id: "md", name: "中", class: "ft-size-md" },
  { id: "lg", name: "大", class: "ft-size-lg" },
];
const FOOTER_FONTS = [
  { id: "default", name: "默认", class: "ft-font-default" },
  { id: "elegant", name: "优雅", class: "ft-font-elegant" },
  { id: "serif", name: "衬线", class: "ft-font-serif" },
];
const FOOTER_SYMBOLS = [".", "•", "·", "—", "→", "©"];
function FooterRichTextEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const editRef = useRef<HTMLDivElement>(null);
  const isInternal = useRef(false);

  useEffect(() => {
    const el = editRef.current;
    if (!el) return;
    if (isInternal.current) { isInternal.current = false; return; }
    const next = (value ?? "").trim();
    if (el.innerHTML !== next) el.innerHTML = next || "";
  }, [value]);

  const emit = () => {
    const el = editRef.current;
    let html = el?.innerHTML ?? "";
    if (el && !el.innerText?.trim()) html = "";
    isInternal.current = true;
    onChange(html);
  };

  const wrapSelection = (className: string) => {
    const sel = window.getSelection();
    const el = editRef.current;
    if (!sel || !el || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (!el.contains(range.commonAncestorContainer)) return;
    const txt = range.toString();
    if (!txt) return;
    const span = document.createElement("span");
    span.className = className;
    span.textContent = txt;
    range.deleteContents();
    range.insertNode(span);
    sel.removeAllRanges();
    const r = document.createRange();
    r.setStartAfter(span);
    r.collapse(true);
    sel.addRange(r);
    emit();
  };

  const toggleBold = () => {
    document.execCommand("bold", false);
    emit();
  };

  const insertSymbol = (sym: string) => {
    const el = editRef.current;
    if (!el) return;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (!el.contains(range.commonAncestorContainer)) return;
    const textNode = document.createTextNode(sym);
    range.deleteContents();
    range.insertNode(textNode);
    range.setStartAfter(textNode);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
    emit();
  };

  return (
    <div className="ptb-footer-editor">
      <div className="ptb-footer-toolbar">
        <span className="ptb-footer-toolbar-label">颜色</span>
        {FOOTER_COLORS.map((c) => (
          <button key={c.id} type="button" className="ptb-footer-tool-btn" title={c.name}
            style={{ background: c.color }}
            onClick={() => wrapSelection(c.class)} />
        ))}
        <span className="ptb-footer-toolbar-sep" />
        <span className="ptb-footer-toolbar-label">字号</span>
        {FOOTER_SIZES.map((s) => (
          <button key={s.id} type="button" className="ptb-footer-tool-btn ptb-footer-tool-btn--text" onClick={() => wrapSelection(s.class)}>{s.name}</button>
        ))}
        <span className="ptb-footer-toolbar-sep" />
        <button type="button" className="ptb-footer-tool-btn ptb-footer-tool-btn--text" onClick={toggleBold} title="粗体"><b>B</b></button>
        <span className="ptb-footer-toolbar-sep" />
        <span className="ptb-footer-toolbar-label">字体</span>
        {FOOTER_FONTS.map((f) => (
          <button key={f.id} type="button" className={`ptb-footer-tool-btn ptb-footer-tool-btn--text ptb-footer-tool-btn--font ${f.class}`} title={f.name} onClick={() => wrapSelection(f.class)}>{f.name}</button>
        ))}
        <span className="ptb-footer-toolbar-sep" />
        <span className="ptb-footer-toolbar-label">符号</span>
        {FOOTER_SYMBOLS.map((sym) => (
          <button key={sym} type="button" className="ptb-footer-tool-btn ptb-footer-tool-btn--text ptb-footer-tool-btn--sym" title={`插入 ${sym}`} onClick={() => insertSymbol(sym)}>{sym}</button>
        ))}
      </div>
      <div
        ref={editRef}
        className="ptb-footer-editable"
        contentEditable
        suppressContentEditableWarning
        onInput={emit}
        data-placeholder="BEARBRICK888 ALL RIGHTS RESERVED"
      />
    </div>
  );
}

// ============================================================
// Main Builder
// ============================================================
export function PromoTableBuilder({ data, onChange, defaultPreviewStyle }: { data: PromoTableData; onChange: (d: PromoTableData) => void; defaultPreviewStyle?: "default" | "premium" }) {
  const [activeRowId, setActiveRowId] = useState<string | null>(null);
  const [showQuick, setShowQuick] = useState(false);
  const [copied, setCopied] = useState(false);
  const [previewSize, setPreviewSize] = useState<"small" | "medium" | "large">("medium");
  const [previewStyle, setPreviewStyle] = useState<"default" | "premium">(defaultPreviewStyle ?? "premium");
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState("");
  const uid = useId();

  const update = (partial: Partial<PromoTableData>) => onChange({ ...data, ...partial });
  const addRow = (template?: Omit<PromoTableRow, "id">) => {
    const row: PromoTableRow = template ? { ...template, id: newId() } : { id: newId(), label: "NEW", value: "Value", type: "text" };
    onChange({ ...data, rows: [...data.rows, row] });
    setActiveRowId(row.id);
  };
  const updateRow = (id: string, p: Partial<PromoTableRow>) =>
    onChange({ ...data, rows: data.rows.map((r) => (r.id === id ? { ...r, ...p } : r)) });
  const removeRow = (id: string) => {
    onChange({ ...data, rows: data.rows.filter((r) => r.id !== id) });
    if (activeRowId === id) setActiveRowId(null);
  };
  const moveRow = (id: string, dir: -1 | 1) => {
    const rows = [...data.rows];
    const idx = rows.findIndex((r) => r.id === id);
    const next = idx + dir;
    if (next < 0 || next >= rows.length) return;
    [rows[idx], rows[next]] = [rows[next], rows[idx]];
    onChange({ ...data, rows });
  };
  const duplicateRow = (id: string) => {
    const idx = data.rows.findIndex((r) => r.id === id);
    if (idx < 0) return;
    const template = { ...data.rows[idx], id: newId() };
    const rows = [...data.rows];
    rows.splice(idx + 1, 0, template);
    onChange({ ...data, rows });
    setActiveRowId(template.id);
  };
  const copyHtml = () => {
    navigator.clipboard.writeText(generatePromoHtml(data)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  const exportJson = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  const applyImport = () => {
    try {
      const parsed = JSON.parse(importText) as unknown;
      const next = parsePromoTableData(parsed);
      if (next) {
        onChange(next);
        setShowImport(false);
        setImportText("");
      }
    } catch (_) {
      // keep modal open on error
    }
  };

  const { left, right } = getThemeColors(data);

  return (
    <div className="ptb-root">
      {/* ── Header ── */}
      <div className="ptb-header">
        <div className="ptb-header-left">
          <span className="ptb-header-icon">{defaultPreviewStyle === "default" ? "🔷" : "⚡"}</span>
          <span className="ptb-header-title">Visual Popup Builder</span>
          <span className="ptb-header-tag" style={{ background: defaultPreviewStyle === "default" ? "#2563eb" : "#7c3aed" }}>
            {defaultPreviewStyle === "default" ? "Set 2 — 经典蓝色" : "Set 1 — 深色 PREMIUM"}
          </span>
          <span className="ptb-header-tag">升级版</span>
        </div>
        <div className="ptb-header-actions">
          <div className="ptb-seg ptb-seg--sm">
            {(["small", "medium", "large"] as const).map((s) => (
              <button key={s} type="button" onClick={() => setPreviewSize(s)} className={`ptb-seg-btn ${previewSize === s ? "active" : ""}`}>{s === "small" ? "S" : s === "medium" ? "M" : "L"}</button>
            ))}
          </div>
          <button type="button" onClick={exportJson} className="ptb-copy-btn ptb-copy-btn--ghost" title="Export JSON">{copied ? "✓" : "📤 JSON"}</button>
          <button type="button" onClick={() => setShowImport(true)} className="ptb-copy-btn ptb-copy-btn--ghost" title="Import JSON">📥</button>
          <button type="button" onClick={copyHtml} className="ptb-copy-btn">
            {copied ? "✓ Copied!" : "📋 Copy HTML"}
          </button>
        </div>
      </div>

      {showImport && (
        <div className="ptb-import-overlay" onClick={() => setShowImport(false)}>
          <div className="ptb-import-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ptb-card-title">📥 Import JSON</div>
            <p className="ptb-import-hint">Paste previously exported JSON below, then Apply.</p>
            <textarea className="ptb-input ptb-textarea ptb-import-textarea" value={importText} onChange={(e) => setImportText(e.target.value)} placeholder='{"type":"promo_table",...}' rows={10} />
            <div className="ptb-import-footer">
              <button type="button" onClick={() => setShowImport(false)} className="ptb-btn ptb-btn--ghost">Cancel</button>
              <button type="button" onClick={applyImport} className="ptb-btn ptb-btn--add">Apply</button>
            </div>
          </div>
        </div>
      )}

      <div className="ptb-split">
        {/* ====== Left: 统一弹窗内容设置（一个区域完成所有配置） ====== */}
        <div className="ptb-controls">
          <div className="ptb-unified">
            <div className="ptb-unified-title">📋 弹窗内容设置</div>
            <p className="ptb-unified-desc">在此处一次性完成弹窗所有内容的配置</p>

            {/* 1. 快速模板 */}
            <div className="ptb-section">
              <div className="ptb-section-head">🎨 快速模板</div>
              <div className="ptb-tpl-list ptb-tpl-list--inline">
                {FULL_TEMPLATES.map((tpl) => (
                  <button key={tpl.id} type="button" className="ptb-tpl-chip"
                    style={{ borderColor: tpl.leftColor, color: tpl.leftColor }}
                    onClick={() => {
                      const newRows = makeRows(tpl.rows);
                      onChange({ ...data, theme: tpl.theme, customLeft: tpl.customLeft, customRight: tpl.customRight, rows: newRows, showWarning: true, warning: tpl.warning, showTitle: data.showTitle });
                    }}
                  >
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: tpl.leftColor, flexShrink: 0 }} />
                    {tpl.emoji} {tpl.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Set 2 外观（仅 Set 2 显示） */}
            {defaultPreviewStyle !== "premium" && (
              <div className="ptb-section ptb-section--set2">
                <div className="ptb-section-head">🔷 外观</div>
                <div className="ptb-section-grid">
                  <div className="ptb-section-item">
                    <span className="ptb-section-label">主题</span>
                    <div className="ptb-themes-inline">
                      {PROMO_THEMES.map((t) => (
                        <button key={t.id} type="button" onClick={() => update({ theme: t.id })}
                          className={`ptb-theme-dot ${data.theme === t.id ? "active" : ""}`}
                          style={{ background: t.left }} title={t.name} />
                      ))}
                    </div>
                    {data.theme === "custom" && (
                      <div className="ptb-field-row" style={{ marginTop: 6, gap: 8 }}>
                        <label className="ptb-field-inline"><span style={{ fontSize: 10 }}>左</span><input type="color" value={data.customLeft ?? "#2d3090"} onChange={(e) => update({ customLeft: e.target.value })} className="ptb-color-input" style={{ width: 28, height: 24 }} /></label>
                        <label className="ptb-field-inline"><span style={{ fontSize: 10 }}>右</span><input type="color" value={data.customRight ?? "#f3f3f7"} onChange={(e) => update({ customRight: e.target.value })} className="ptb-color-input" style={{ width: 28, height: 24 }} /></label>
                      </div>
                    )}
                  </div>
                  <div className="ptb-section-item">
                    <span className="ptb-section-label">行间距</span>
                    <div className="ptb-seg ptb-seg--xs">
                      {(["compact", "normal", "spacious"] as const).map((s) => (
                        <button key={s} type="button" onClick={() => update({ tableSize: s })} className={`ptb-seg-btn ${data.tableSize === s ? "active" : ""}`}>{s === "compact" ? "紧" : s === "normal" ? "中" : "松"}</button>
                      ))}
                    </div>
                  </div>
                  <div className="ptb-section-item">
                    <span className="ptb-section-label">对齐</span>
                    <div className="ptb-seg ptb-seg--xs">
                      {(["left", "center", "right"] as const).map((s) => (
                        <button key={s} type="button" onClick={() => update({ valueAlign: s })} className={`ptb-seg-btn ${(data.valueAlign ?? "center") === s ? "active" : ""}`}>{s === "left" ? "左" : s === "center" ? "中" : "右"}</button>
                      ))}
                    </div>
                  </div>
                  <div className="ptb-section-item" style={{ gridColumn: "1 / -1" }}>
                    <div className="ptb-field-row" style={{ gap: 12 }}>
                      <label className="ptb-field-inline"><span className="ptb-section-label">圆角</span>
                        <div className="ptb-seg ptb-seg--xs">
                          {(["none", "small", "medium", "round"] as const).map((s) => (
                            <button key={s} type="button" onClick={() => update({ tableBorderRadius: s })} className={`ptb-seg-btn ${(data.tableBorderRadius ?? "medium") === s ? "active" : ""}`}>{s === "none" ? "无" : s === "small" ? "小" : s === "medium" ? "中" : "圆"}</button>
                          ))}
                        </div>
                      </label>
                      <label className="ptb-field-inline"><span className="ptb-section-label">行间线</span>
                        <button type="button" onClick={() => update({ showRowSeparator: !data.showRowSeparator })} className={`ptb-seg-btn ${data.showRowSeparator ? "active" : ""}`} style={{ padding: "4px 10px" }}>{data.showRowSeparator ? "✓" : "关"}</button>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. 标题 */}
            <div className="ptb-section">
              <div className="ptb-section-head ptb-section-head--row">
                <span>📌 标题</span>
                <Toggle value={data.showTitle} onChange={(v) => update({ showTitle: v })} />
              </div>
              {data.showTitle && (
                <div className="ptb-section-fields">
                  <div className="ptb-field-row">
                    <input className="ptb-input ptb-input--icon" value={data.titleIcon ?? ""} onChange={(e) => update({ titleIcon: e.target.value })} placeholder="🎁" title="Icon" />
                    <input className="ptb-input ptb-input--flex" value={data.title ?? ""} onChange={(e) => update({ title: e.target.value })} placeholder="10% UNLIMITED SLOT SPECIAL BONUS" />
                  </div>
                  <div className="ptb-field-row">
                    <div className="ptb-seg ptb-seg--xs">
                      {(["small", "normal", "large"] as const).map((s) => (
                        <button key={s} type="button" onClick={() => update({ titleSize: s })} className={`ptb-seg-btn ${(data.titleSize ?? "normal") === s ? "active" : ""}`}>{s === "small" ? "小" : s === "normal" ? "中" : "大"}</button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 4. 条款行 */}
            <div className="ptb-section">
              <div className="ptb-section-head ptb-section-head--row">
                <span>📊 条款行 <span className="ptb-badge">{data.rows.length}</span></span>
                <div className="flex gap-1.5">
                  <button type="button" onClick={() => setShowQuick(!showQuick)} className="ptb-btn ptb-btn--ghost">⚡ Quick</button>
                  <button type="button" onClick={() => addRow()} className="ptb-btn ptb-btn--add">+ 添加</button>
                </div>
              </div>

              {showQuick && (
              <div className="ptb-quick-panel">
                <div className="ptb-quick-title">Click to add common rows:</div>
                <div className="ptb-quick-grid">
                  {QUICK_ROWS.map((r, i) => (
                    <button key={i} type="button" className="ptb-quick-chip" onClick={() => { addRow(r); setShowQuick(false); }}>+ {r.label}</button>
                  ))}
                </div>
              </div>
            )}

            <div className="ptb-row-list">
              {data.rows.length === 0 && <div className="ptb-empty">No rows yet. Click + Add Row or ⚡ Quick.</div>}
              {data.rows.map((row, idx) => {
                const isOpen = activeRowId === row.id;
                const rowLeftBg = row.highlight ? (row.highlightColor ?? "#f59e0b") : left;
                return (
                  <div key={row.id} className={`ptb-row ${isOpen ? "ptb-row--open" : ""}`}>
                    <div className="ptb-row-head" onClick={() => setActiveRowId(isOpen ? null : row.id)}>
                      <span className="ptb-row-idx">{idx + 1}</span>
                      <span className="ptb-row-left-chip" style={{ background: rowLeftBg }}>
                        {row.icon ? `${row.icon} ` : ""}{row.label || "—"}
                      </span>
                      <span className="ptb-row-arrow">→</span>
                      <span className="ptb-row-right-chip" style={{ background: right }}>
                        {(row.value || "—").replace(/\\n/g, " ").slice(0, 18)}{row.value.length > 18 ? "…" : ""}
                        {row.badge && <span className="ptb-mini-badge">{row.badge}</span>}
                      </span>
                      <div className="ptb-row-controls" onClick={(e) => e.stopPropagation()}>
                        <button type="button" onClick={() => duplicateRow(row.id)} className="ptb-icon-btn" title="Duplicate">⎘</button>
                        <button type="button" disabled={idx === 0} onClick={() => moveRow(row.id, -1)} className="ptb-icon-btn" title="Up">↑</button>
                        <button type="button" disabled={idx === data.rows.length - 1} onClick={() => moveRow(row.id, 1)} className="ptb-icon-btn" title="Down">↓</button>
                        <button type="button" onClick={() => removeRow(row.id)} className="ptb-icon-btn ptb-icon-btn--del" title="Delete">✕</button>
                      </div>
                    </div>

                    {isOpen && (
                      <div className="ptb-row-body" onClick={(e) => e.stopPropagation()}>
                        {/* Label + Type */}
                        <div className="ptb-field-row">
                          <div className="ptb-field">
                            <label>Left label</label>
                            <input id={`${uid}-lbl-${row.id}`} className="ptb-input" value={row.label} onChange={(e) => updateRow(row.id, { label: e.target.value })} placeholder="e.g. GANJARAN" />
                          </div>
                          <div className="ptb-field ptb-field--sm">
                            <label>Value type</label>
                            <select className="ptb-input" value={row.type} onChange={(e) => updateRow(row.id, { type: e.target.value as PromoTableRow["type"] })}>
                              <option value="text">Text</option>
                              <option value="multiline">Multi-line</option>
                              <option value="link">Link</option>
                            </select>
                          </div>
                        </div>

                        {/* Value */}
                        {row.type === "link" ? (
                          <div className="ptb-field-row">
                            <div className="ptb-field"><label>Link text</label><input className="ptb-input" value={row.value} onChange={(e) => updateRow(row.id, { value: e.target.value })} placeholder="CHECK BANNED GAME HERE" /></div>
                            <div className="ptb-field"><label>Link URL</label><input className="ptb-input" value={row.link ?? ""} onChange={(e) => updateRow(row.id, { link: e.target.value })} placeholder="https://..." /></div>
                          </div>
                        ) : (
                          <div className="ptb-field">
                            <label>{row.type === "multiline" ? "Value (\\n = new line)" : "Right value"}</label>
                            <textarea className="ptb-input ptb-textarea" rows={row.type === "multiline" ? 4 : 2} value={row.value} onChange={(e) => updateRow(row.id, { value: e.target.value })} placeholder={row.type === "multiline" ? "Line 1\\nLine 2" : "e.g. 10%"} />
                          </div>
                        )}

                        {/* ── Set 2 专属设置 ── */}
                        {defaultPreviewStyle !== "premium" && (
                          <div className="ptb-field" style={{ background: "linear-gradient(135deg,#0f2a4a,#1e3a5f)", borderRadius: 10, padding: "12px 14px", border: "1px solid rgba(96,165,250,0.3)" }}>
                            <div style={{ fontSize: 12, fontWeight: 800, color: "#93c5fd", marginBottom: 10, letterSpacing: "0.05em" }}>🔷 Set 2 专属设置</div>
                            {/* Badge */}
                            <div style={{ marginBottom: 10 }}>
                              <div style={{ fontSize: 11, color: "#bfdbfe", fontWeight: 700, marginBottom: 6 }}>右侧小标签（Badge）</div>
                              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
                                {[...QUICK_BADGES, ""].map((b) => (
                                  <button key={b || "_none"} type="button"
                                    onClick={() => updateRow(row.id, { badge: b || undefined })}
                                    style={{ padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, border: `2px solid ${(row.badge ?? "") === b ? "#60a5fa" : "transparent"}`, background: b ? "linear-gradient(145deg,#ffd87f,#ff9f29)" : "rgba(255,255,255,0.08)", color: b ? "#2b1700" : "#94a3b8", cursor: "pointer" }}
                                  >{b || "无"}</button>
                                ))}
                              </div>
                              <input className="ptb-input" value={row.badge ?? ""} onChange={(e) => updateRow(row.id, { badge: e.target.value || undefined })} placeholder="自定义 badge..." style={{ fontSize: 12 }} />
                            </div>
                            {/* 行高亮 */}
                            <div style={{ marginBottom: 10 }}>
                              <div style={{ fontSize: 11, color: "#bfdbfe", fontWeight: 700, marginBottom: 6 }}>行高亮</div>
                              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                <button type="button"
                                  onClick={() => updateRow(row.id, { highlight: false })}
                                  style={{ padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, border: `2px solid ${!row.highlight ? "#60a5fa" : "transparent"}`, background: "rgba(255,255,255,0.08)", color: "#94a3b8", cursor: "pointer" }}
                                >无</button>
                                {["#f59e0b","#ef4444","#10b981","#6366f1","#ec4899"].map(c => (
                                  <button key={c} type="button"
                                    onClick={() => updateRow(row.id, { highlight: true, highlightColor: c })}
                                    style={{ padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, border: `2px solid ${row.highlight && row.highlightColor === c ? "#60a5fa" : "transparent"}`, background: c, color: "#fff", cursor: "pointer" }}
                                  >●</button>
                                ))}
                              </div>
                            </div>
                            {/* 左侧前缀 emoji */}
                            <div>
                              <div style={{ fontSize: 11, color: "#bfdbfe", fontWeight: 700, marginBottom: 6 }}>左侧前缀 Emoji</div>
                              <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 5 }}>
                                {["", ...QUICK_ICONS].map((ic) => (
                                  <button key={ic || "_none"} type="button"
                                    onClick={() => updateRow(row.id, { icon: ic || undefined })}
                                    style={{ padding: "3px 8px", borderRadius: 8, fontSize: 14, border: `2px solid ${(row.icon ?? "") === ic ? "#60a5fa" : "transparent"}`, background: "rgba(255,255,255,0.08)", cursor: "pointer" }}
                                  >{ic || "无"}</button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

{/* Set 1 的 emoji/badge 已移入下方紫色「Set 1 专属设置」卡片 */}

                        {/* ── Set 1 专属设置 ── */}
                        {defaultPreviewStyle === "premium" && (
                          <div className="ptb-field" style={{ background: "linear-gradient(135deg,#1e1b4b,#312e81)", borderRadius: 10, padding: "12px 14px", border: "1px solid rgba(167,139,250,0.3)" }}>
                            <div style={{ fontSize: 12, fontWeight: 800, color: "#c4b5fd", marginBottom: 10, letterSpacing: "0.05em" }}>⚡ Set 1 专属设置</div>
                            {/* 状态圆圈 */}
                            <div style={{ marginBottom: 10 }}>
                              <div style={{ fontSize: 11, color: "#a5b4fc", fontWeight: 700, marginBottom: 6 }}>右侧状态圆圈</div>
                              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                {([
                                  { v: null,    label: "自动",   bg: "#475569", color: "#cbd5e1" },
                                  { v: "check", label: "✓ 绿",  bg: "rgba(34,197,94,0.85)", color: "#fff" },
                                  { v: "info",  label: "ⓘ 蓝",  bg: "rgba(59,130,246,0.85)", color: "#fff" },
                                  { v: "x",     label: "✕ 红",  bg: "rgba(239,68,68,0.85)", color: "#fff" },
                                  { v: "none",  label: "无",    bg: "#1e293b", color: "#94a3b8" },
                                ] as const).map(opt => (
                                  <button key={String(opt.v)} type="button"
                                    onClick={() => updateRow(row.id, { set1Status: opt.v })}
                                    style={{ padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, border: `2px solid ${(row.set1Status ?? null) === opt.v ? "#a78bfa" : "transparent"}`, background: opt.bg, color: opt.color, cursor: "pointer" }}
                                  >{opt.label}</button>
                                ))}
                              </div>
                            </div>
                            {/* 左侧图标类型 */}
                            <div style={{ marginBottom: 10 }}>
                              <div style={{ fontSize: 11, color: "#a5b4fc", fontWeight: 700, marginBottom: 6 }}>左侧图标类型</div>
                              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                {([
                                  { v: null,       label: "自动" },
                                  { v: "bonus",    label: "⚡ 奖励" },
                                  { v: "deposit",  label: "🎁 存款" },
                                  { v: "claim",    label: "⏱ 领取" },
                                  { v: "turnover", label: "🔄 流水" },
                                  { v: "rollover", label: "🔁 滚存" },
                                  { v: "default",  label: "📋 默认" },
                                ] as const).map(opt => (
                                  <button key={String(opt.v)} type="button"
                                    onClick={() => updateRow(row.id, { set1IconKind: opt.v ?? undefined })}
                                    style={{ padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, border: `2px solid ${(row.set1IconKind ?? null) === opt.v ? "#a78bfa" : "rgba(167,139,250,0.25)"}`, background: "rgba(255,255,255,0.06)", color: "#e2e8f0", cursor: "pointer" }}
                                  >{opt.label}</button>
                                ))}
                              </div>
                            </div>
                            {/* 数值颜色 */}
                            <div style={{ marginBottom: 10 }}>
                              <div style={{ fontSize: 11, color: "#a5b4fc", fontWeight: 700, marginBottom: 6 }}>数值颜色</div>
                              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                {([
                                  { v: null,      label: "自动",   color: "#94a3b8" },
                                  { v: "gold",    label: "金色",   color: "#ffd66d" },
                                  { v: "success", label: "绿色",   color: "#9df7c0" },
                                  { v: "danger",  label: "红色",   color: "#ffb1b0" },
                                  { v: "normal",  label: "白色",   color: "#f8fafc" },
                                ] as const).map(opt => (
                                  <button key={String(opt.v)} type="button"
                                    onClick={() => updateRow(row.id, { set1ValueColor: opt.v ?? undefined })}
                                    style={{ padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, border: `2px solid ${(row.set1ValueColor ?? null) === opt.v ? "#a78bfa" : "transparent"}`, background: "rgba(255,255,255,0.06)", color: opt.color, cursor: "pointer" }}
                                  >{opt.label}</button>
                                ))}
                              </div>
                            </div>
                            {/* Badge */}
                            <div style={{ marginBottom: 10 }}>
                              <div style={{ fontSize: 11, color: "#a5b4fc", fontWeight: 700, marginBottom: 6 }}>右侧 Badge 标签</div>
                              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 5 }}>
                                {["", ...QUICK_BADGES].map((b) => (
                                  <button key={b || "_none"} type="button"
                                    onClick={() => updateRow(row.id, { badge: b || undefined })}
                                    style={{ padding: "4px 9px", borderRadius: 999, fontSize: 11, fontWeight: 700, border: `2px solid ${(row.badge ?? "") === b ? "#a78bfa" : "transparent"}`, background: b ? "linear-gradient(145deg,#a855f7,#7c3aed)" : "rgba(255,255,255,0.08)", color: b ? "#fff" : "#94a3b8", cursor: "pointer" }}
                                  >{b || "无"}</button>
                                ))}
                              </div>
                            </div>
                            {/* 前缀 Emoji */}
                            <div>
                              <div style={{ fontSize: 11, color: "#a5b4fc", fontWeight: 700, marginBottom: 6 }}>前缀 Emoji（替换默认图标）</div>
                              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                                {["", ...QUICK_ICONS].map((ic) => (
                                  <button key={ic || "_none"} type="button"
                                    onClick={() => updateRow(row.id, { icon: ic || undefined })}
                                    style={{ padding: "3px 7px", borderRadius: 8, fontSize: 14, border: `2px solid ${(row.icon ?? "") === ic ? "#a78bfa" : "transparent"}`, background: "rgba(255,255,255,0.08)", cursor: "pointer" }}
                                  >{ic || "无"}</button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Highlight row — Set 2 only */}
                        {defaultPreviewStyle !== "premium" && <div className="ptb-field">
                          <div className="ptb-highlight-row">
                            <label className="ptb-card-header" style={{ cursor: "pointer" }} onClick={() => updateRow(row.id, { highlight: !row.highlight })}>
                              <span style={{ fontSize: "12px", color: "#334155", fontWeight: 600 }}>✨ Highlight row（高亮此行）</span>
                              <Toggle value={!!row.highlight} onChange={(v) => updateRow(row.id, { highlight: v })} />
                            </label>
                            {row.highlight && (
                              <div className="ptb-color-row" style={{ marginTop: 6 }}>
                                <label>
                                  <span>Highlight color</span>
                                  <input type="color" value={row.highlightColor ?? "#f59e0b"} onChange={(e) => updateRow(row.id, { highlightColor: e.target.value })} className="ptb-color-input" />
                                </label>
                                <div className="flex gap-1 flex-wrap">
                                  {["#f59e0b", "#ef4444", "#10b981", "#6366f1", "#ec4899"].map((c) => (
                                    <button key={c} type="button" onClick={() => updateRow(row.id, { highlightColor: c })} style={{ width: 22, height: 22, background: c, border: row.highlightColor === c ? "2px solid #1e293b" : "1.5px solid rgba(0,0,0,.15)", borderRadius: 4, cursor: "pointer" }} />
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            </div>

            {/* 5. 页脚文字 + 图片 */}
            <div className="ptb-section">
              <div className="ptb-section-head ptb-section-head--row">
                <span>©️ 页脚文字</span>
                <Toggle value={data.showFooter} onChange={(v) => update({ showFooter: v })} />
              </div>
              {data.showFooter && (
                <FooterRichTextEditor value={data.footer ?? ""} onChange={(html) => update({ footer: html })} />
              )}
              <div className="ptb-section-item ptb-section-item--mt">
                <span className="ptb-section-label">🖼️ 页脚图片 URL</span>
                <input className="ptb-input" value={data.footerImg ?? ""} onChange={(e) => update({ footerImg: e.target.value })} placeholder="https://yoursite.com/footer-image.png" />
              </div>
            </div>

          </div>
        </div>

        {/* ====== Right: Live Preview ====== */}
        <div className="ptb-preview">
          <div className="ptb-preview-label">
            <span>👁 Live Preview — {defaultPreviewStyle === "default" ? "Set 2 经典样式" : "Set 1 深色样式"}</span>
            <span className="ptb-preview-hint">S/M/L = size</span>
          </div>
          <div className={`ptb-preview-phone ptb-preview-phone--${previewSize}`}>
            {defaultPreviewStyle === "default"
              ? <PromoTablePreview data={data} />
              : <PremiumSet1Preview data={data} />
            }
          </div>
        </div>

      </div>
    </div>
  );
}

// ============================================================
// Set 1 Premium Preview（模拟前台深色 PROMOTION RULES 样式）
// ============================================================
function guessKindForPreview(label: string): "bonus" | "deposit" | "claim" | "turnover" | "rollover" | "default" {
  const s = (label || "").toUpperCase();
  if (s.includes("GANJARAN") || s.includes("BONUS") || s.includes("REWARD")) return "bonus";
  if (s.includes("DEPOSIT") || s.includes("TOPUP")) return "deposit";
  if (s.includes("CLAIM")) return "claim";
  if (s.includes("TURNOVER")) return "turnover";
  if (s.includes("ROLLOVER")) return "rollover";
  return "default";
}
function PremiumSet1Preview({ data }: { data: PromoTableData }) {
  const { t } = useLocale();
  const rowStyle: React.CSSProperties = {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    gap: 8, padding: "8px 10px", marginBottom: 6,
    borderRadius: 12, border: "1px solid rgba(96,165,250,0.2)",
    background: "linear-gradient(140deg,rgba(25,40,80,0.9),rgba(15,24,52,0.94))",
    boxShadow: "0 4px 12px rgba(0,0,0,0.24)",
  };
  const iconMap: Record<string, string> = {
    bonus: "⚡", deposit: "🎁", claim: "⏱", turnover: "🔄", rollover: "🔁", default: "📋",
  };
  return (
    <div style={{ background: "#0f172a", borderRadius: 18, padding: 14, minWidth: 220 }}>
      {/* Title */}
      {data.showTitle && data.title && (
        <div style={{ textAlign: "center", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
            <span style={{ flex: 1, height: 1, background: "linear-gradient(90deg,transparent,rgba(255,204,82,0.8),transparent)" }} />
            <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.2em", color: "#ffd978", textTransform: "uppercase" }}>
              PROMOTION RULES
            </span>
            <span style={{ flex: 1, height: 1, background: "linear-gradient(90deg,transparent,rgba(255,204,82,0.8),transparent)" }} />
          </div>
        </div>
      )}
      {/* Rows */}
      <div>
        {data.rows.map((row) => {
          const autoKind = guessKindForPreview(row.label);
          const kind = row.set1IconKind ?? autoKind;
          const isDanger = /(?:NOT ALLOWED|❌|FORBID|BANNED)/i.test(row.label + row.value);
          const isSuccess = /(?:ALLOWED|✓|UNLIMITED|1 Time|ACTIVE)/i.test(row.value);
          const isRollover = kind === "rollover";
          // 图标颜色
          const iconColor = isDanger ? "#ffb8b7" : isSuccess ? "#84f7b2" : "#ffe8a8";
          const iconBg = isDanger ? "rgba(255,77,79,0.18)" : isSuccess ? "rgba(34,197,94,0.18)" : "rgba(255,184,56,0.15)";
          const iconBorder = isDanger ? "rgba(255,77,79,0.4)" : isSuccess ? "rgba(34,197,94,0.4)" : "rgba(255,204,82,0.35)";
          // 数值颜色（手动优先）
          const valueColorMap: Record<string, string> = { gold: "#ffd66d", success: "#9df7c0", danger: "#ffb1b0", normal: "#f8fafc" };
          const valueColor = row.set1ValueColor ? (valueColorMap[row.set1ValueColor] ?? "#f8fafc") : (row.highlight ? "#ffd66d" : isDanger ? "#ffb1b0" : isSuccess ? "#9df7c0" : "#f8fafc");
          // 状态圆圈（手动优先）
          const circleStyle = (bg: string, txt: string, italic?: boolean): React.CSSProperties => ({
            width: 18, height: 18, borderRadius: "50%", background: bg, color: "#fff",
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            fontSize: 10, fontWeight: 800, flexShrink: 0, fontStyle: italic ? "italic" : "normal",
          });
          let statusEl: React.ReactNode = null;
          const manualStatus = row.set1Status;
          if (manualStatus === "check") statusEl = <span style={circleStyle("rgba(34,197,94,0.9)", "#fff")}>✓</span>;
          else if (manualStatus === "info") statusEl = <span style={circleStyle("rgba(59,130,246,0.9)", "#fff", true)}>i</span>;
          else if (manualStatus === "x") statusEl = <span style={circleStyle("rgba(239,68,68,0.9)", "#fff")}>✕</span>;
          else if (manualStatus === "none") statusEl = null;
          else {
            // 自动判断
            if (!isRollover && isSuccess) statusEl = <span style={circleStyle("rgba(34,197,94,0.9)", "#fff")}>✓</span>;
            else if (kind === "turnover") statusEl = <span style={circleStyle("rgba(59,130,246,0.9)", "#fff", true)}>i</span>;
          }
          return (
            <div key={row.id} style={rowStyle}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 22, height: 22, borderRadius: 8, display: "inline-flex", alignItems: "center", justifyContent: "center", color: iconColor, border: `1px solid ${iconBorder}`, background: iconBg, flexShrink: 0, fontSize: 12 }}>
                  {row.icon || iconMap[kind] || "📋"}
                </span>
                <span style={{ color: "#f8fafc", fontSize: 11, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" }}>{row.label}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {row.type === "link" && row.link ? (
                  <a
                    href={row.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex", alignItems: "center", padding: "4px 12px",
                      borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: "0.05em",
                      color: "#fff", textDecoration: "none",
                      background: "linear-gradient(135deg,rgba(96,165,250,0.9),rgba(59,130,246,0.9))",
                      border: "1px solid rgba(96,165,250,0.6)",
                      boxShadow: "0 2px 8px rgba(59,130,246,0.3)",
                    }}
                  >
                    {row.value || "CHECK HERE"}
                  </a>
                ) : (
                  <>
                    <span style={{ color: valueColor, fontSize: 13, fontWeight: 800, textAlign: "right" }}>
                      {isRollover && isDanger && !row.set1Status ? `× ${row.value.replace(/^[×✕✗x]\s*/i, "")}` : row.value}
                    </span>
                    {row.badge && <span style={{ borderRadius: 999, padding: "2px 7px", fontSize: 9, fontWeight: 800, background: "linear-gradient(145deg,#a855f7,#7c3aed)", color: "#fff" }}>{row.badge}</span>}
                    {statusEl}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {/* Footer 文字（与上方 rule 行一体风格，字体与标签一致） */}
      {data.showFooter && data.footer && (
        <div
          className="ptb-preview-footer-richtext"
          style={{
            marginTop: 8, padding: "6px 12px", textAlign: "left",
            fontFamily: "var(--font-promo-body), var(--font-promo-cjk), Inter, system-ui, sans-serif",
            fontSize: 12, fontWeight: 700, letterSpacing: "0.07em",
            color: "#f8fafc", lineHeight: 1.4,
            borderRadius: 12, border: "1px solid rgba(96,165,250,0.2)",
            background: "linear-gradient(140deg,rgba(25,40,80,0.85),rgba(15,24,52,0.9))",
            boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
          }}
          dangerouslySetInnerHTML={{ __html: sanitizePromoHtml(data.footer) }}
        />
      )}
      {/* Footer 图片 */}
      {data.footerImg && (
        <div style={{ marginTop: 8 }}>
          <img src={data.footerImg} alt="footer" style={{ width: "100%", borderRadius: 8, display: "block" }} />
        </div>
      )}
      {/* Buttons */}
      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <div style={{ flex: 1, padding: "9px 0", borderRadius: 999, border: "1px solid rgba(96,165,250,0.5)", background: "rgba(15,35,65,0.95)", color: "#dff4ff", fontSize: 11, fontWeight: 700, textAlign: "center" }}>
          {t("public.vivid.promo.viewAll")}
        </div>
        <div style={{ flex: 1, padding: "9px 0", borderRadius: 999, background: "linear-gradient(135deg,#f59e0b,#f97316)", color: "#fff", fontSize: 11, fontWeight: 700, textAlign: "center" }}>
          {t("public.vivid.promo.claim")} ›
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Preview
// ============================================================
export function PromoTablePreview({ data, hideTitle }: { data: PromoTableData; hideTitle?: boolean }) {
  const { left, right } = getThemeColors(data);
  const pad = SIZE_PAD[data.tableSize];
  const lw = data.leftWidth;
  const br = BORDER_RADIUS[data.tableBorderRadius ?? "medium"];
  const valueAlign = data.valueAlign ?? "center";
  const titleSize = data.titleSize ?? "normal";
  const titleFontSize = TITLE_FONT_SIZE[titleSize];
  const sep = data.showRowSeparator ? { borderBottom: "1px solid rgba(0,0,0,.06)" } : {};

  return (
    <div className="ptb-popup">
      {!hideTitle && data.showTitle && (data.title || data.titleIcon) && (
        <>
          <div className="ptb-popup-title" style={{ background: left, fontSize: titleFontSize }}>
            {data.titleIcon && <span style={{ marginRight: 6 }}>{data.titleIcon}</span>}
            {data.title}
          </div>
          {data.showSubtitle && data.titleSubtitle && (
            <div className="ptb-popup-subtitle">{data.titleSubtitle}</div>
          )}
        </>
      )}
      <div className="ptb-popup-body">
        <table className="ptb-popup-table">
          <tbody>
            {data.rows.map((row) => {
              const rowLeftBg = row.highlight ? (row.highlightColor ?? "#f59e0b") : left;
              return (
                <tr key={row.id}>
                  <td className="ptb-popup-left" style={{ background: rowLeftBg, width: `${lw}%`, padding: pad, borderRadius: `${br} 0 0 ${br}`, ...sep }}>
                    {row.icon && <span style={{ marginRight: 4 }}>{row.icon}</span>}
                    {row.label || "—"}
                  </td>
                  <td className="ptb-popup-right" style={{ background: right, padding: pad, textAlign: valueAlign, borderRadius: `0 ${br} ${br} 0`, ...sep }}>
                    {row.type === "link" ? (
                      <span style={{ textDecoration: "underline", color: "#0070f3" }}>{row.value}</span>
                    ) : row.type === "multiline" ? (
                      <>
                        {row.value.split(/\\n|\n/).map((line, i, arr) => (
                          <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
                        ))}
                      </>
                    ) : (
                      row.value || "—"
                    )}
                    {row.badge && (
                      <span className="ptb-popup-badge">{row.badge}</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {data.showWarning && data.warning && (
          <div className="ptb-popup-warning">⚠️ {data.warning}</div>
        )}
        {data.showFooter && data.footer && (
          <div className="ptb-popup-footer">{data.footer}</div>
        )}
        {data.footerImg && (
          <div style={{ padding: "8px 4px 0" }}>
            <img src={data.footerImg} alt="footer" style={{ width: "100%", borderRadius: "8px", display: "block" }} />
          </div>
        )}
      </div>
    </div>
  );
}
