"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n/context";
import { useAdminApiContext } from "@/lib/admin-api-context";

type RuleJson = {
  limits?: { perDay?: number; perWeek?: number; perLifetime?: number; perHour?: number; perMonth?: number };
  claimReset?: "NONE" | "HOURLY" | "DAILY" | "WEEKLY" | "MONTHLY";
  eligible?: { minDeposit?: number };
  grant?: { mode?: string; percent?: number; fixedAmount?: number; capAmount?: number };
  turnover?: number;
  rollover?: boolean | string;
  rolloverMultiplier?: number;
  groupLabel?: string;
};

type PromotionItem = {
  id: string;
  title: string;
  subtitle: string | null;
  coverUrl: string | null;
  percent: number;
  ctaLabel: string | null;
  ctaUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  ruleJson: RuleJson | null;
  createdAt: string;
};

type Response = { items: PromotionItem[]; total: number; page: number; pageSize: number };

function getGroupLabel(r: RuleJson | null): string {
  const label = r?.groupLabel?.trim();
  return label || "OTHER";
}

function getClaimCondition(r: RuleJson | null, isClaimable: boolean): string {
  if (!isClaimable) return "CUSTOM";
  const minDep = r?.eligible?.minDeposit;
  if (minDep != null && minDep > 0) return "DEPOSIT";
  return "FREE";
}

function getAmount(r: RuleJson | null, percent: number): string {
  const g = r?.grant;
  if (g?.mode === "FIXED" && g?.fixedAmount != null) return String(g.fixedAmount.toFixed(2));
  const p = g?.percent ?? percent;
  return p != null && p !== 0 ? `${Number(p)}%` : "—";
}

function getClaimLimit(r: RuleJson | null): string {
  const l = r?.limits;
  if (!l) return "—";
  if (l.perHour != null && l.perHour > 0) return `${l.perHour} (HOURLY)`;
  if (l.perDay != null && l.perDay > 0) return `${l.perDay} (DAILY)`;
  if (l.perWeek != null && l.perWeek > 0) return `${l.perWeek} (WEEKLY)`;
  if (l.perMonth != null && l.perMonth > 0) return `${l.perMonth} (MONTHLY)`;
  if (l.perLifetime != null && l.perLifetime > 0) return `${l.perLifetime} (LIFETIME)`;
  return "UNLIMITED";
}

export function PromotionsPageClient() {
  const { t } = useLocale();
  const { setForbidden } = useAdminApiContext();
  const [data, setData] = useState<Response | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeOnly, setActiveOnly] = useState(false);
  const [viewMode, setViewMode] = useState<"reference" | "simple">("reference");
  const [movingId, setMovingId] = useState<string | null>(null);

  async function moveOrder(id: string, direction: "up" | "down") {
    setMovingId(id);
    try {
      const res = await fetch(`/api/admin/promotions/${id}/reorder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direction }),
        credentials: "include",
      });
      if (res.status === 403) setForbidden(true);
      if (!res.ok) throw new Error("reorder failed");
      load();
    } catch {
      setError(t("admin.promotionsList.reorderFailed") ?? "Reorder request failed");
    } finally {
      setMovingId(null);
    }
  }

  function load() {
    setLoading(true);
    setError(null);
    const sp = new URLSearchParams();
    if (activeOnly) sp.set("active", "1");
    fetch(`/api/admin/promotions?${sp}`, { credentials: "include" })
      .then((r) => {
        if (r.status === 403) setForbidden(true);
        if (!r.ok) throw new Error("Load failed");
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, [activeOnly]);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const activeCount = items.filter((p) => p.isActive).length;

  // 按分组归类（参考站风格）
  const groups = (() => {
    const map = new Map<string, PromotionItem[]>();
    for (const p of items) {
      const key = getGroupLabel(p.ruleJson ?? null);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(p);
    }
    const order = ["SPIN WIN BOX BONUS", "VIP & REBATE SYSTEM", "FREE CREDIT BONUS", "NEW MEMBER BONUS", "OTHER"];
    return order.filter((k) => map.has(k)).concat([...map.keys()].filter((k) => !order.includes(k)));
  })();

  const getItemsInGroup = (groupKey: string) => {
    return items.filter((p) => getGroupLabel(p.ruleJson ?? null) === groupKey);
  };

  return (
    <div className="promo-admin-list promo-admin-list--reference" data-promo-admin-version="reference-v1">
      {/* 工具栏：电话版圆角容器、触控友好 */}
      <div className="promo-admin-list-toolbar rounded-xl border border-[var(--admin-border)] bg-[var(--admin-panel)] px-3 py-3 md:rounded-none md:border-0 md:bg-transparent md:px-0 md:py-0 md:pb-4">
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <Link
            href="/admin/promotions/new"
            className="admin-compact-btn admin-compact-btn-primary min-h-[40px] flex-1 min-w-[140px] text-[13px] md:flex-none"
          >
            {t("admin.promotionsList.newPromo")}
          </Link>
          <label className="flex shrink-0 items-center gap-2 text-[13px] text-[var(--admin-text)] cursor-pointer">
            <input
              type="checkbox"
              checked={activeOnly}
              onChange={(e) => setActiveOnly(e.target.checked)}
              className="h-4 w-4 rounded border-[var(--admin-border)] text-[var(--admin-primary)] focus:ring-[var(--admin-primary)]"
            />
            <span>{t("admin.promotionsList.activeOnly")}</span>
          </label>
          <select
            value={viewMode}
            onChange={(e) => setViewMode(e.target.value as "reference" | "simple")}
            className="admin-compact-input min-h-[40px] w-full rounded-lg border border-[var(--admin-border)] bg-[var(--admin-panel2)] px-3 py-2 text-[13px] text-[var(--admin-text)] md:w-auto md:py-1.5 md:text-[12px]"
          >
            <option value="reference">{t("admin.promotionsList.viewReference")}</option>
            <option value="simple">{t("admin.promotionsList.viewSimple")}</option>
          </select>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="admin-compact-btn admin-compact-btn-ghost min-h-[40px] shrink-0 text-[13px]"
          >
            {loading ? (t("admin.promotionsList.loading") ?? "Loading…") : (t("admin.promotionsList.refresh") ?? "Refresh")}
          </button>
          {data && (
            <span className="w-full shrink-0 text-[12px] text-[var(--admin-muted)] md:w-auto">
              {t("admin.promotionsList.totalCount").replace("{total}", String(total)).replace("{activeCount}", String(activeCount))}
            </span>
          )}
        </div>
      </div>

      {viewMode === "simple" ? (
        <div className="admin-card overflow-hidden">
          <div className="border-b border-[var(--admin-border)] px-4 py-3 flex items-center justify-between bg-[var(--admin-panel2)] md:px-5">
            <span className="text-[13px] font-semibold text-[var(--admin-text)]">{t("admin.promotionsList.listTitle")}</span>
            {data && <span className="text-[12px] text-[var(--admin-muted)] tabular-nums">{total} {t("admin.promotionsList.itemsUnit")}</span>}
          </div>
          {loading ? (
            <div className="py-16 text-center text-[13px] text-[var(--admin-muted)]">{t("admin.promotionsList.loading") ?? "Loading…"}</div>
          ) : error ? (
            <div className="py-16 text-center text-[13px] text-[var(--admin-danger)]">{error}</div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center text-[13px] text-[var(--admin-muted)]">{t("admin.promotionsList.noPromotions") ?? "No promotions yet"}</div>
          ) : (
            <>
              {/* 电话版：Simple 卡片列表 */}
              <div className="space-y-3 p-3 md:hidden">
                {items.map((p) => {
                  const rowIndex = items.findIndex((i) => i.id === p.id);
                  return (
                    <div
                      key={p.id}
                      className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-panel)] p-3 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <Link href={`/admin/promotions/${p.id}/edit`} className="min-w-0 flex-1 font-medium text-[var(--admin-text)] hover:underline">
                          <span className="line-clamp-2">{p.title}</span>
                        </Link>
                        <span className={`promo-admin-badge shrink-0 ${p.isActive ? "promo-admin-badge--on" : "promo-admin-badge--off"}`}>
                          {p.isActive ? t("admin.promotionsList.statusOn") : t("admin.promotionsList.statusOff")}
                        </span>
                      </div>
                      {(p.subtitle || p.ctaLabel) && (
                        <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[12px] text-[var(--admin-muted)]">
                          {p.subtitle && <span className="truncate">{p.subtitle}</span>}
                          {p.ctaLabel && <span>CTA: {p.ctaLabel}</span>}
                        </div>
                      )}
                      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--admin-border)] pt-2">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            title={t("admin.promotionsList.moveUp")}
                            disabled={rowIndex <= 0 || movingId === p.id}
                            onClick={() => moveOrder(p.id, "up")}
                            className="promo-order-btn min-h-[36px] min-w-[36px]"
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            title={t("admin.promotionsList.moveDown")}
                            disabled={rowIndex >= items.length - 1 || movingId === p.id}
                            onClick={() => moveOrder(p.id, "down")}
                            className="promo-order-btn min-h-[36px] min-w-[36px]"
                          >
                            ↓
                          </button>
                        </div>
                        <div className="promo-admin-actions">
                          <Link href={`/admin/promotions/${p.id}/edit`}>{t("admin.promotionsList.edit")}</Link>
                          <span className="text-[var(--admin-border)]">|</span>
                          <Link href={`/promotion#${encodeURIComponent(p.id)}`} target="_blank" rel="noreferrer">{t("admin.promotionsList.front")}</Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* 桌面版：Simple 表格 */}
              <div className="hidden overflow-x-auto md:block">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th className="w-[28%]">{t("admin.promotionsList.colTitle")}</th>
                      <th className="w-[18%]">{t("admin.promotionsList.colSubtitle")}</th>
                      <th className="w-[10%]">CTA</th>
                      <th className="w-[10%]">{t("admin.promotionsList.colStatus")}</th>
                      <th className="w-[10%] text-right">{t("admin.promotionsList.colSort")}</th>
                      <th className="w-[14%]">{t("admin.promotionsList.colCreatedAt")}</th>
                      <th className="w-[12%] text-right">{t("admin.promotionsList.colAction")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((p) => (
                      <tr key={p.id} className="hover:bg-[var(--admin-panel2)]/50">
                        <td className="font-medium text-[var(--admin-text)] max-w-[200px] truncate">{p.title}</td>
                        <td className="text-[var(--admin-muted)] max-w-[140px] truncate">{p.subtitle ?? "—"}</td>
                        <td className="text-[13px]">{p.ctaLabel ?? "—"}</td>
                        <td>
                          <span className={`promo-admin-badge ${p.isActive ? "promo-admin-badge--on" : "promo-admin-badge--off"}`}>
                            {p.isActive ? t("admin.promotionsList.statusOn") : t("admin.promotionsList.statusOff")}
                          </span>
                        </td>
                        <td className="text-right">
                          <div className="flex items-center justify-end gap-0.5">
                            <button
                              type="button"
                              title={t("admin.promotionsList.moveUp")}
                              disabled={items.findIndex((i) => i.id === p.id) === 0 || movingId === p.id}
                              onClick={() => moveOrder(p.id, "up")}
                              className="promo-order-btn"
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              title={t("admin.promotionsList.moveDown")}
                              disabled={items.findIndex((i) => i.id === p.id) === items.length - 1 || movingId === p.id}
                              onClick={() => moveOrder(p.id, "down")}
                              className="promo-order-btn"
                            >
                              ↓
                            </button>
                          </div>
                        </td>
                        <td className="text-[12px] text-[var(--admin-muted)] tabular-nums">
                          {p.createdAt ? new Date(p.createdAt).toLocaleString("zh-CN", { dateStyle: "short", timeStyle: "short" }) : "—"}
                        </td>
                        <td className="text-right">
                          <div className="promo-admin-actions justify-end">
                            <Link href={`/admin/promotions/${p.id}/edit`}>{t("admin.promotionsList.edit")}</Link>
                            <span className="text-[var(--admin-border)]">|</span>
                            <Link href={`/promotion#${encodeURIComponent(p.id)}`} target="_blank" rel="noreferrer">{t("admin.promotionsList.front")}</Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="admin-card overflow-hidden promo-admin-table-reference">
          <div className="border-b border-[var(--admin-border)] px-4 py-3 flex items-center justify-between bg-[var(--admin-panel2)] md:px-5">
            <span className="text-[13px] font-semibold text-[var(--admin-text)]">{t("admin.promotionsList.listTitle")} (Reference)</span>
            {data && <span className="text-[12px] text-[var(--admin-muted)] tabular-nums">{total} {t("admin.promotionsList.itemsUnit")}</span>}
          </div>
          {loading ? (
            <div className="py-16 text-center text-[13px] text-[var(--admin-muted)]">{t("admin.promotionsList.loading") ?? "Loading…"}</div>
          ) : error ? (
            <div className="py-16 text-center text-[13px] text-[var(--admin-danger)]">{error}</div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center text-[13px] text-[var(--admin-muted)]">{t("admin.promotionsList.noPromotions") ?? "No promotions yet"}</div>
          ) : (
            <>
              {/* 电话版：Reference 按分组卡片列表，避免表格列被截断 */}
              <div className="md:hidden">
                {groups.map((groupKey) => {
                  const groupItems = getItemsInGroup(groupKey);
                  if (groupItems.length === 0) return null;
                  const displayName = groupKey === "OTHER" ? t("admin.promotionsList.other") : groupKey;
                  return (
                    <div key={groupKey} className="promo-admin-category-block border-b border-[var(--admin-border)]">
                      <div className="promo-admin-category-header">{displayName}</div>
                      <div className="space-y-3 p-3">
                        {groupItems.map((p) => {
                          const r = p.ruleJson ?? {};
                          const grant = r.grant ?? {};
                          const cap = grant.capAmount;
                          const turnover = r.turnover;
                          const rollover = r.rollover;
                          const rolloverMul = r.rolloverMultiplier;
                          const rolloverDisplay = rollover === true ? (rolloverMul != null && rolloverMul > 0 ? `✓ x${rolloverMul}` : "✓") : rollover === false ? "✗" : "—";
                          const rowIndex = items.findIndex((i) => i.id === p.id);
                          return (
                            <div
                              key={p.id}
                              className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-panel)] p-3 shadow-sm"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                  <span className="font-mono text-[11px] text-[var(--admin-muted)]">{p.id.slice(-6)}</span>
                                  <Link href={`/admin/promotions/${p.id}/edit`} className="mt-0.5 block font-medium text-[var(--admin-text)] hover:underline">
                                    <span className="line-clamp-2">{p.title}</span>
                                  </Link>
                                </div>
                                <span className={`promo-admin-badge promo-admin-badge--ref shrink-0 ${p.isActive ? "promo-admin-badge--on" : "promo-admin-badge--off"}`}>
                                  {p.isActive ? "ACTIVE" : "INACTIVE"}
                                </span>
                              </div>
                              <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1 text-[12px]">
                                <dt className="text-[var(--admin-muted)]">Claim</dt>
                                <dd>{getClaimCondition(r, true)}</dd>
                                <dt className="text-[var(--admin-muted)]">Amount</dt>
                                <dd className="tabular-nums">{getAmount(r, p.percent)}</dd>
                                <dt className="text-[var(--admin-muted)]">Max Payout</dt>
                                <dd className="tabular-nums">{cap != null ? cap : "—"}</dd>
                                <dt className="text-[var(--admin-muted)]">Rollover</dt>
                                <dd>{rolloverDisplay}</dd>
                                <dt className="text-[var(--admin-muted)]">Turnover</dt>
                                <dd className="tabular-nums">{turnover != null ? turnover : "—"}</dd>
                                <dt className="text-[var(--admin-muted)]">Limit</dt>
                                <dd>{getClaimLimit(r)}</dd>
                              </dl>
                              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[var(--admin-border)] pt-2">
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    title={t("admin.promotionsList.moveUp")}
                                    disabled={rowIndex <= 0 || movingId === p.id}
                                    onClick={() => moveOrder(p.id, "up")}
                                    className="promo-order-btn min-h-[36px] min-w-[36px]"
                                  >
                                    ↑
                                  </button>
                                  <button
                                    type="button"
                                    title={t("admin.promotionsList.moveDown")}
                                    disabled={rowIndex >= items.length - 1 || movingId === p.id}
                                    onClick={() => moveOrder(p.id, "down")}
                                    className="promo-order-btn min-h-[36px] min-w-[36px]"
                                  >
                                    ↓
                                  </button>
                                </div>
                                <Link href={`/admin/promotions/${p.id}/edit`} className="text-[13px] font-medium text-[var(--admin-primary)] underline">
                                  EDIT
                                </Link>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* 桌面版：Reference 表格 */}
              <div className="hidden overflow-x-auto md:block">
                {groups.map((groupKey) => {
                  const groupItems = getItemsInGroup(groupKey);
                  if (groupItems.length === 0) return null;
                  const displayName = groupKey === "OTHER" ? t("admin.promotionsList.other") : groupKey;
                  return (
                    <div key={groupKey} className="promo-admin-category-block">
                      <div className="promo-admin-category-header">{displayName}</div>
                      <table className="admin-table promo-admin-table promo-admin-table--reference">
                        <thead>
                          <tr>
                            <th className="promo-admin-th-id">ID</th>
                            <th className="text-center w-20">{t("admin.promotionsList.colSort")}</th>
                            <th>Name</th>
                            <th>Action</th>
                            <th>Claim Condition</th>
                            <th>Amount</th>
                            <th>Max Payout</th>
                            <th>Rollover</th>
                            <th>Turnover</th>
                            <th>Max Withdraw</th>
                            <th>Min Topup Amount</th>
                            <th>Max Topup Amount</th>
                            <th>Min Times of Topup</th>
                            <th>Claim Limit</th>
                            <th>Claim Config</th>
                          </tr>
                        </thead>
                        <tbody>
                          {groupItems.map((p) => {
                            const r = p.ruleJson ?? {};
                            const grant = r.grant ?? {};
                            const cap = grant.capAmount;
                            const turnover = r.turnover;
                            const rollover = r.rollover;
                            const rolloverMul = r.rolloverMultiplier;
                            const rolloverDisplay = rollover === true ? (rolloverMul != null && rolloverMul > 0 ? `✓ x${rolloverMul}` : "✓") : rollover === false ? "✗" : "—";
                            const minDep = r.eligible?.minDeposit;
                            const claimConfigStr = p.ruleJson ? JSON.stringify(p.ruleJson) : "{}";
                            const rowIndex = items.findIndex((i) => i.id === p.id);
                            return (
                              <tr key={p.id} className="hover:bg-[var(--admin-panel2)]/50">
                                <td className="promo-admin-td-id tabular-nums text-[12px] font-mono">{p.id.slice(-6)}</td>
                                <td className="text-center">
                                  <div className="flex items-center justify-center gap-0.5">
                                    <button
                                      type="button"
                                      title={t("admin.promotionsList.moveUp")}
                                      disabled={rowIndex <= 0 || movingId === p.id}
                                      onClick={() => moveOrder(p.id, "up")}
                                      className="promo-order-btn"
                                    >
                                      ↑
                                    </button>
                                    <button
                                      type="button"
                                      title={t("admin.promotionsList.moveDown")}
                                      disabled={rowIndex >= items.length - 1 || movingId === p.id}
                                      onClick={() => moveOrder(p.id, "down")}
                                      className="promo-order-btn"
                                    >
                                      ↓
                                    </button>
                                  </div>
                                </td>
                                <td className="font-medium text-[var(--admin-text)] max-w-[180px] truncate">{p.title}</td>
                                <td>
                                  <div className="flex flex-wrap gap-1 items-center">
                                    <Link href={`/admin/promotions/${p.id}/edit`} className="text-[12px] text-blue-600 underline">EDIT</Link>
                                    <span className={`promo-admin-badge promo-admin-badge--ref ${p.isActive ? "promo-admin-badge--on" : "promo-admin-badge--off"}`}>
                                      {p.isActive ? "ACTIVE" : "INACTIVE"}
                                    </span>
                                  </div>
                                </td>
                                <td className="text-[12px]">{getClaimCondition(r, true)}</td>
                                <td className="tabular-nums text-[12px]">{getAmount(r, p.percent)}</td>
                                <td className="tabular-nums text-[12px]">{cap != null ? cap : "—"}</td>
                                <td className="tabular-nums text-[12px]">{rolloverDisplay}</td>
                                <td className="tabular-nums text-[12px]">{turnover != null ? turnover : "—"}</td>
                                <td className="text-[12px]">—</td>
                                <td className="tabular-nums text-[12px]">{minDep != null ? minDep : "—"}</td>
                                <td className="text-[12px]">—</td>
                                <td className="text-[12px]">—</td>
                                <td className="text-[12px]">{getClaimLimit(r)}</td>
                                <td className="promo-admin-claim-config text-[11px] font-mono text-[var(--admin-muted)] max-w-[200px] truncate" title={claimConfigStr}>
                                  {claimConfigStr.length > 40 ? claimConfigStr.slice(0, 40) + "…" : claimConfigStr || "{}"}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
