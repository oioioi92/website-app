/**
 * 促销详情 HTML 安全过滤：只允许展示用标签与安全属性，防止 XSS。
 * 用于 detailJson.html 的渲染。
 */
const ALLOWED_TAGS = new Set([
  "div", "p", "h1", "h2", "h3", "h4", "span", "section", "article",
  "table", "thead", "tbody", "tfoot", "tr", "td", "th",
  "ul", "ol", "li",
  "a", "strong", "b", "em", "i", "u", "br", "hr",
  "img",
  "style", // 允许内联样式块，便于促销详情自定义表格/动画等
  "var",   // 允许 var，避免包裹表格的 var 被 strip 导致结构错乱、格子不齐
]);

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(["href", "class", "target", "rel"]),
  img: new Set(["src", "alt", "class", "width", "height"]),
  span: new Set(["class"]), // 页脚富文本：ft-gold, ft-size-lg 等
  "*": new Set(["class"]),
};

function getAttrsForTag(tag: string): Set<string> {
  const lower = tag.toLowerCase();
  return ALLOWED_ATTRS[lower] ?? ALLOWED_ATTRS["*"] ?? new Set();
}

function sanitizeAttr(tag: string, attr: string, value: string): string {
  const allowed = getAttrsForTag(tag);
  if (!allowed.has(attr.toLowerCase())) return "";
  const v = (value ?? "").trim();
  if (attr === "href" || attr === "src") {
    if (/^\s*javascript:/i.test(v)) return "#";
    if (/^\s*data:/i.test(v)) return "#";
    if (/^\s*vbscript:/i.test(v)) return "#";
  }
  return v;
}

/** 移除 CSS 中的危险用法（expression、behavior、javascript: 等），防止 XSS */
function sanitizeStyleContent(css: string): string {
  return css
    .replace(/expression\s*\(/gi, "/* expression removed */ (")
    .replace(/behavior\s*:/gi, "/* behavior removed */:")
    .replace(/-moz-binding\s*:/gi, "/* binding removed */:")
    .replace(/url\s*\(\s*["']?\s*javascript\s*:/gi, "url(about:blank)")
    .replace(/url\s*\(\s*["']?\s*data\s*:\s*text\/html/gi, "url(about:blank)");
}

/**
 * 简单 HTML  sanitizer：只保留允许的标签与属性。
 * 允许 <style> 标签，其内容会经 sanitizeStyleContent 过滤后保留，以便促销详情显示自定义 CSS。
 */
export function sanitizePromoHtml(html: string): string {
  if (typeof html !== "string") return "";
  let out = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<iframe\b[^>]*>[\s\S]*?<\/iframe>/gi, "")
    .replace(/<form\b[^>]*>[\s\S]*?<\/form>/gi, "")
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/on\w+\s*=\s*[^\s>]+/gi, "");

  // 先处理 <style>...</style>：保留标签，过滤内部危险 CSS
  out = out.replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi, (_, inner) => {
    return "<style>" + sanitizeStyleContent(inner) + "</style>";
  });

  const tagRegex = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
  out = out.replace(tagRegex, (match) => {
    const isClose = match.startsWith("</");
    const nameMatch = match.match(/<\/?([a-z][a-z0-9]*)/i);
    const tag = nameMatch ? nameMatch[1].toLowerCase() : "";
    if (!ALLOWED_TAGS.has(tag)) return "";
    if (isClose) return `</${tag}>`;
    const attrRegex = /\s+([a-z][a-z0-9-]*)\s*=\s*["']([^"']*)["']/gi;
    const attrs: string[] = [];
    let attrMatch;
    while ((attrMatch = attrRegex.exec(match)) !== null) {
      const val = sanitizeAttr(tag, attrMatch[1], attrMatch[2]);
      if (val) attrs.push(`${attrMatch[1].toLowerCase()}="${ val.replace(/"/g, "&quot;") }"`);
    }
    return attrs.length ? `<${tag} ${attrs.join(" ")}>` : `<${tag}>`;
  });
  return out;
}
