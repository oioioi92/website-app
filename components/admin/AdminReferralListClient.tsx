"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n/context";
import type { ReferralListRow } from "@/app/api/admin/referrals/list/route";

const PAGE_SIZE = 20;

type SortOption = "referralCount-desc" | "referralCount-asc" | "userRef-asc" | "userRef-desc" | "depositCount-desc" | "withdrawCount-desc";

export function AdminReferralListClient() {
  const { t } = useLocale();
  const [items, setItems] = useState<ReferralListRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("referralCount-desc");
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    const [sortBy, order] = sort.split("-") as [string, string];
    const sp = new URLSearchParams();
    sp.set("page", String(page));
    sp.set("pageSize", String(PAGE_SIZE));
    sp.set("sortBy", sortBy);
    sp.set("order", order || "desc");
    if (search.trim()) sp.set("search", search.trim());
    fetch(`/api/admin/referrals/list?${sp}`, { credentials: "include" })
      .then((r) => {
        if (!r.ok) throw new Error("fetch failed");
        return r.json();
      })
      .then((d: { items: ReferralListRow[]; total: number }) => {
        setItems(d.items ?? []);
        setTotal(d.total ?? 0);
      })
      .catch(() => {
        setItems([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, [page, sort]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="mt-6">
      <div className="referral-list-toolbar">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (setPage(1), load())}
          placeholder={t("admin.referrals.searchPlaceholder")}
          className="referral-list-search"
        />
        <button
          type="button"
          onClick={() => {
            setPage(1);
            load();
          }}
          className="admin-compact-btn admin-compact-btn-primary"
        >
          {t("admin.players.searchBtn")}
        </button>
        <label className="inline-flex items-center gap-2 text-[var(--admin-muted)] text-[12px]">
          <span>{t("admin.referrals.sortBy")}</span>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as SortOption);
              setPage(1);
            }}
            className="referral-list-sort-select"
          >
            <option value="referralCount-desc">{t("admin.referrals.sortDownlineDesc")}</option>
            <option value="referralCount-asc">{t("admin.referrals.sortDownlineAsc")}</option>
            <option value="userRef-asc">User ID A→Z</option>
            <option value="userRef-desc">User ID Z→A</option>
            <option value="depositCount-desc">{t("admin.referrals.deposits")} ↓</option>
            <option value="withdrawCount-desc">{t("admin.referrals.withdrawals")} ↓</option>
          </select>
        </label>
      </div>

      <div className="referral-list-table-wrap">
        {loading ? (
          <div className="referral-list-empty">{t("admin.common.loading")}</div>
        ) : items.length === 0 ? (
          <div className="referral-list-empty">{t("admin.referrals.noData")}</div>
        ) : (
          <>
            <div className="referral-list-scroll">
              <table className="referral-list-table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Name</th>
                    <th>Referral Code</th>
                    <th>{t("admin.referrals.deposits")}</th>
                    <th>{t("admin.referrals.withdrawals")}</th>
                    <th>{t("admin.referrals.downlineCount")}</th>
                    <th>{t("admin.common.action")}</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((r, idx) => (
                    <tr key={r.id} className={idx % 2 === 0 ? "referral-list-row-even" : "referral-list-row-odd"}>
                      <td className="referral-list-cell referral-list-cell--mono">{r.userRef}</td>
                      <td className="referral-list-cell">{r.displayName ?? "—"}</td>
                      <td className="referral-list-cell referral-list-cell--mono">{r.referralCode ?? "—"}</td>
                      <td className="referral-list-cell referral-list-cell--num">{r.depositCount}</td>
                      <td className="referral-list-cell referral-list-cell--num">{r.withdrawCount}</td>
                      <td className="referral-list-cell referral-list-cell--num">{r.referralCount}</td>
                      <td className="referral-list-cell referral-list-cell--actions">
                        <Link
                          href={`/admin/referrals/${r.id}`}
                          className="admin-compact-btn admin-compact-btn-primary referral-list-btn"
                        >
                          {t("admin.referrals.viewDownline")}
                        </Link>
                        <Link
                          href={`/admin/players/${r.id}`}
                          className="admin-compact-btn admin-compact-btn-ghost referral-list-btn"
                        >
                          {t("admin.referrals.viewPlayer")}
                        </Link>
                        {r.referralCount > 0 && (
                          <Link
                            href={`/admin/agents/${r.id}`}
                            className="admin-compact-btn admin-compact-btn-ghost referral-list-btn"
                          >
                            {t("admin.referrals.viewAgent")}
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {total > PAGE_SIZE && (
              <div className="referral-list-pagination">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="admin-compact-btn admin-compact-btn-ghost"
                >
                  {t("admin.agents.prevPage")}
                </button>
                <span className="referral-list-page-num">{page} / {totalPages}</span>
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="admin-compact-btn admin-compact-btn-ghost"
                >
                  {t("admin.agents.nextPage")}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
