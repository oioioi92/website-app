const SEP = " \u00A0 \u2022 \u00A0 ";

export function AnnouncementMarquee({
  text,
  messages
}: {
  text?: string | null;
  /** V3: 多条公告，有则优先于 text，循环滚动 */
  messages?: string[];
}) {
  const displayText =
    messages && messages.length > 0 ? messages.join(SEP) : (text ?? null);
  if (!displayText) return null;
  return (
    <div
      className="overflow-hidden border-b border-[color:var(--p44-green-dark)] bg-[color:var(--p44-bar-green)] lg:border-t"
      data-testid="announcement-marquee"
    >
      <div className="marquee-scroll whitespace-nowrap px-4 py-2 text-[12px] font-semibold tracking-wide text-white">
        {displayText} {SEP} {displayText}
      </div>
    </div>
  );
}
