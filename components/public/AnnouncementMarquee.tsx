const SEP = " \u00A0 \u2022 \u00A0 ";

export function AnnouncementMarquee({
  text,
  messages,
  variant = "default",
  containerStyle,
  textColor,
  marqueeBg,
  marqueeBorder,
}: {
  text?: string | null;
  /** V3: 多条公告，有则优先于 text，循环滚动 */
  messages?: string[];
  /** vivid 时使用 Vivid 主题色（或 containerStyle/textColor 覆盖） */
  variant?: "default" | "vivid";
  containerStyle?: React.CSSProperties;
  /** 跑马灯文字色（vivid 时优先用 theme） */
  textColor?: string | null;
  /** 跑马灯背景（vivid 时优先用 theme） */
  marqueeBg?: string | null;
  /** 跑马灯边框色（vivid 时优先用 theme） */
  marqueeBorder?: string | null;
}) {
  const displayText =
    messages && messages.length > 0 ? messages.join(SEP) : (text ?? null);
  if (!displayText) return null;
  const isVivid = variant === "vivid";
  const bg = containerStyle?.background ?? marqueeBg ?? (isVivid ? "var(--vp-marquee-bg, var(--vp-card))" : undefined);
  const border = containerStyle?.borderBottom ?? (marqueeBorder ? `1px solid ${marqueeBorder}` : undefined) ?? (isVivid ? "1px solid var(--vp-marquee-border, var(--vp-border))" : undefined);
  const color = textColor ?? (isVivid ? "var(--vp-marquee-text, var(--vp-text))" : undefined);
  return (
    <div
      className="overflow-hidden lg:border-t"
      style={
        isVivid
          ? { background: bg, borderBottom: border }
          : { borderBottom: "1px solid var(--p44-green-dark)", background: "var(--p44-bar-green)" }
      }
      data-testid="announcement-marquee"
    >
      <div
        className="marquee-scroll inline-block whitespace-nowrap px-4 py-2 text-[12px] font-semibold tracking-wide will-change-transform"
        style={{
          minWidth: "max-content",
          color: color ?? "#fff",
        }}
      >
        {displayText} {SEP} {displayText}
      </div>
    </div>
  );
}
