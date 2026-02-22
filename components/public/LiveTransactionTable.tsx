"use client";

import { useEffect, useState, type CSSProperties } from "react";

const VISIBLE_ROWS_V3 = 6;
const V3_FETCH_LIMIT = 20;

type TxItem = {
  id: string;
  userRefMasked: string;
  amountDisplay: string;
  happenedAt: string;
  provider?: string;
  kind: "deposit" | "withdraw";
};

type Payload = {
  items: TxItem[];
  demo: boolean;
};

export function LiveTransactionTable({
  internalTestMode,
  variant = "default",
  depositColor = null,
  withdrawColor = null,
  title,
  loadingText,
  depositLabel,
  withdrawLabel,
  liveLabel,
  demoLabel,
  internalTestLabel
}: {
  internalTestMode: boolean;
  variant?: "default" | "v3";
  /** V3：与 Theme 一致，Deposit 蓝 / Withdraw 金 */
  depositColor?: string | null;
  withdrawColor?: string | null;
  /** P0: 标题可后台配置 */
  title?: string;
  /** P0: 文案可后台配置（不传则用内置默认） */
  loadingText?: string;
  depositLabel?: string;
  withdrawLabel?: string;
  liveLabel?: string;
  demoLabel?: string;
  internalTestLabel?: string;
}) {
  const titleText = title && title.trim().length > 0 ? title.trim() : "LIVE TRANSACTION";
  const loadingTextResolved = loadingText && loadingText.trim().length > 0 ? loadingText.trim() : "加载中...";
  const depositLabelResolved = depositLabel && depositLabel.trim().length > 0 ? depositLabel.trim() : "DEPOSIT";
  const withdrawLabelResolved = withdrawLabel && withdrawLabel.trim().length > 0 ? withdrawLabel.trim() : "WITHDRAW";
  const liveLabelResolved = liveLabel && liveLabel.trim().length > 0 ? liveLabel.trim() : "LIVE";
  const demoLabelResolved = demoLabel && demoLabel.trim().length > 0 ? demoLabel.trim() : "DEMO";
  const internalTestLabelResolved =
    internalTestLabel && internalTestLabel.trim().length > 0 ? internalTestLabel.trim() : "Internal test mode";
  const [data, setData] = useState<Payload>({ items: [], demo: false });
  const [ready, setReady] = useState(false);

  const limit = variant === "v3" ? V3_FETCH_LIMIT : 8;

  useEffect(() => {
    let ignore = false;
    const url = variant === "v3" ? "/api/public/live-transactions?limit=20" : "/api/public/live-transactions";
    fetch(url, { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        if (!ignore) {
          const payload = json as Partial<Payload> & { deposit?: TxItem[]; withdraw?: TxItem[] };
          const items = Array.isArray(payload.items)
            ? payload.items
            : [
                ...(Array.isArray(payload.deposit) ? payload.deposit : []),
                ...(Array.isArray(payload.withdraw) ? payload.withdraw : [])
              ]
                .sort((a, b) => +new Date(b.happenedAt) - +new Date(a.happenedAt))
                .slice(0, limit);
          setData({ items, demo: payload.demo === true });
        }
      })
      .finally(() => {
        if (!ignore) setReady(true);
      });
    return () => {
      ignore = true;
    };
  }, [limit, variant]);

  const isV3 = variant === "v3";
  const items = data.items;

  if (isV3) {
    return (
      <section data-testid="live-transaction-section" id="home-livetx" className="livetx-wrapper">
        {!ready ? (
          <div
            className="flex items-center justify-center rounded-xl border border-white/15 bg-black/30 px-4 py-12 text-xs text-white/60"
            data-testid="live-tx-v3-scroll"
          >
            {loadingTextResolved}
          </div>
        ) : (
          (() => {
            // User request: make the header band "sky blue"
            const SKY_BLUE = "#38BDF8";
            const REAL_GOLD = "#F5C518";
            const depositBg = depositColor ?? SKY_BLUE;
            const withdrawBg = withdrawColor ?? REAL_GOLD;
            const deposits = items.filter((t) => t.kind === "deposit").slice(0, VISIBLE_ROWS_V3);
            const withdraws = items.filter((t) => t.kind === "withdraw").slice(0, VISIBLE_ROWS_V3);
            const rows = Array.from({ length: VISIBLE_ROWS_V3 }).map((_, i) => ({
              d: deposits[i] ?? null,
              w: withdraws[i] ?? null
            }));

            return (
              <div
                className="ui-livetx-table-wrap"
                style={
                  {
                    // Header band: force sky blue on both sides
                      ["--ui-livetx-deposit-bg" as string]: depositBg,
                      ["--ui-livetx-withdraw-bg" as string]: withdrawBg,
                    // User request: remove table background (transparent) + white grid lines on black background.
                    ["--ui-livetx-table-bg" as string]: "transparent",
                    ["--ui-livetx-cell-bg" as string]: "transparent",
                    ["--ui-livetx-head-bg" as string]: "rgba(0,0,0,0.25)",
                    ["--ui-livetx-table-border" as string]: "rgba(255,255,255,0.28)",
                    ["--ui-livetx-cell-text" as string]: "rgba(255,255,255,0.88)",
                    // Header text colors on sky blue
                    ["--ui-livetx-head-text" as string]: "#07263A",
                    ["--ui-livetx-withdraw-text" as string]: "#07263A"
                  } as CSSProperties
                }
              >
                <table className="ui-livetx-table" data-testid="live-tx-v3-table">
                  <thead>
                    <tr>
                      <th colSpan={5} className="ui-livetx-th-title">
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-extrabold">{titleText}</span>
                          <span className="inline-flex items-center gap-2">
                            {data.demo ? (
                              <span className="rounded bg-[color:var(--front-accent)]/20 px-2 py-0.5 text-[10px] font-bold text-[color:var(--front-accent-light)]">
                                {demoLabelResolved}
                              </span>
                            ) : null}
                            <span className="livetx-live-badge-blink inline-flex items-center gap-1 rounded bg-red-600 px-2 py-0.5 text-[10px] font-extrabold text-white">
                              {liveLabelResolved}
                              <span className="relative ml-1 inline-flex h-2 w-2 items-center justify-center">
                                <span className="absolute inline-flex h-full w-full rounded-full bg-white/70 opacity-75 animate-ping" />
                                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                              </span>
                            </span>
                          </span>
                        </div>
                      </th>
                    </tr>
                    <tr data-testid="live-tx-sticky-header">
                      <th colSpan={2} className="ui-livetx-th-deposit ui-livetx-blink-a">
                        {depositLabelResolved}
                      </th>
                      <th colSpan={3} className="ui-livetx-th-withdraw ui-livetx-blink-b">
                        {withdrawLabelResolved}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(({ d, w }, idx) => (
                      <tr key={idx}>
                        <td className="ui-livetx-td">{d?.userRefMasked ?? "—"}</td>
                        <td className="ui-livetx-td ui-livetx-amt tabular-nums">{d?.amountDisplay ?? "—"}</td>
                        <td className="ui-livetx-td">{w?.userRefMasked ?? "—"}</td>
                        <td className="ui-livetx-td ui-livetx-amt tabular-nums">{w?.amountDisplay ?? "—"}</td>
                        <td className="ui-livetx-td">{w?.provider ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })()
        )}
        {internalTestMode ? (
          <div className="border-t border-white/10 px-3 py-1 text-center text-xs text-[color:var(--front-accent-light)]/80">
            {internalTestLabelResolved}
          </div>
        ) : null}
      </section>
    );
  }

  const cells: (TxItem | null)[] = [];
  for (let i = 0; i < 8; i++) cells.push(data.items[i] ?? null);

  return (
    <section data-testid="live-transaction-section" id="home-livetx" className="rb-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <p className="text-sm font-semibold text-[color:var(--front-gold-light)]">{titleText}</p>
        <div className="flex items-center gap-2">
          {data.demo ? <span className="rb-badge bg-[color:var(--front-accent)]/20 text-[color:var(--front-accent-light)]">{demoLabelResolved}</span> : null}
          <span className="inline-flex items-center gap-1 text-[11px] text-red-300">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
            {liveLabelResolved}
          </span>
        </div>
      </div>
      {!ready ? (
        <div className="px-3 py-5 text-center text-xs text-white/60">{loadingTextResolved}</div>
      ) : (
        <div className="p-3">
          <div className="grid grid-cols-1 grid-rows-8 gap-0 divide-x-0 divide-y divide-white/10 border border-white/15 rounded-lg overflow-hidden sm:grid-cols-2 sm:grid-rows-4 sm:divide-x sm:divide-y-0 lg:grid-cols-4 lg:grid-rows-2 [&>div]:border-none">
            {cells.map((tx, i) =>
              tx ? (
                <div
                  key={tx.id}
                  className="flex flex-col gap-1 bg-black/25 p-3 min-h-[72px]"
                >
                  <span
                    className={`inline-flex w-fit text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                      tx.kind === "deposit" ? "bg-[color:var(--front-success)]/25 text-[color:var(--front-success-light)]" : "bg-[color:var(--front-gold)]/25 text-[color:var(--rb-gold2)]"
                    }`}
                  >
                    {tx.kind === "deposit" ? depositLabelResolved : withdrawLabelResolved}
                  </span>
                  <span className="font-mono text-xs text-white/90 truncate" title={tx.userRefMasked}>
                    {tx.userRefMasked}
                  </span>
                  {tx.kind === "deposit" ? (
                    <span className="text-sm font-semibold text-[color:var(--front-success-light)]">{tx.amountDisplay}</span>
                  ) : (
                    <>
                      {tx.provider ? (
                        <span className="text-[11px] text-white/70 truncate">{tx.provider}</span>
                      ) : null}
                      <span className="text-sm font-semibold text-[color:var(--rb-gold2)]">{tx.amountDisplay}</span>
                    </>
                  )}
                </div>
              ) : (
                <div key={`empty-${i}`} className="flex flex-col justify-center bg-black/15 p-3 min-h-[72px]">
                  <span className="text-[10px] text-white/40">—</span>
                  <span className="text-xs text-white/40">—</span>
                  <span className="text-sm text-white/40">—</span>
                </div>
              )
            )}
          </div>
        </div>
      )}
      {internalTestMode ? (
        <div className="border-t border-white/10 px-3 py-1 text-center text-xs text-[color:var(--front-accent-light)]/80">
          {internalTestLabelResolved}
        </div>
      ) : null}
    </section>
  );
}
