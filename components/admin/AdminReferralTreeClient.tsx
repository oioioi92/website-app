"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/i18n/context";
import type { ReferralTreeNode } from "@/app/api/admin/referrals/tree/route";

const DEPTH_OPTIONS = [3, 5, 10] as const;

function isAgent(node: ReferralTreeNode): boolean {
  return node.childCount > 0;
}

function TreeNode({
  node,
  depth,
  t,
}: {
  node: ReferralTreeNode;
  depth: number;
  t: (key: string) => string;
}) {
  const [open, setOpen] = useState(depth < 2);
  const hasChildren = node.children.length > 0;
  const agent = isAgent(node);

  return (
    <div className="referral-tree-node select-none">
      <div
        className="referral-tree-node__row"
        style={{ paddingLeft: 16 + depth * 24 }}
      >
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="referral-tree-node__toggle"
        >
          {hasChildren ? (
            <span className={`referral-tree-node__arrow ${open ? "open" : ""}`}>
              ▶
            </span>
          ) : (
            <span className="referral-tree-node__dot" aria-hidden />
          )}
        </button>

        <div className="referral-tree-node__icon" aria-hidden>
          {agent ? (
            <span className="referral-tree-node__icon-agent" title={t("admin.referrals.badgeAgent")}>
              ★
            </span>
          ) : (
            <span className="referral-tree-node__icon-player" title={t("admin.referrals.badgePlayer")}>
              ●
            </span>
          )}
        </div>

        <div className="referral-tree-node__content">
          <div className="referral-tree-node__main">
            <span className="referral-tree-node__user-ref">{node.userRef}</span>
            {agent && (
              <span className="referral-tree-node__badge referral-tree-node__badge--agent">
                {t("admin.referrals.badgeAgent")}
              </span>
            )}
            {node.displayName && (
              <span className="referral-tree-node__display-name">{node.displayName}</span>
            )}
            {node.referralCode && (
              <span className="referral-tree-node__code">{node.referralCode}</span>
            )}
          </div>
          <div className="referral-tree-node__stats">
            <span>{t("admin.referrals.deposits")}: {node.depositCount}</span>
            <span>{t("admin.referrals.withdrawals")}: {node.withdrawCount}</span>
            {hasChildren && (
              <span className="referral-tree-node__downline">
                {t("admin.referrals.downlineCount")}: {node.childCount}
              </span>
            )}
          </div>
        </div>

        <div className="referral-tree-node__actions">
          {agent && (
            <Link
              href={"/admin/agents/" + node.id}
              className="admin-compact-btn admin-compact-btn-ghost referral-tree-node__btn"
            >
              {t("admin.referrals.viewAgent")}
            </Link>
          )}
          <Link
            href={"/admin/players/" + node.id}
            className="admin-compact-btn admin-compact-btn-ghost referral-tree-node__btn"
          >
            {t("admin.referrals.viewPlayer")}
          </Link>
        </div>
      </div>

      {hasChildren && open && (
        <div className="referral-tree-node__children">
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} depth={depth + 1} t={t} />
          ))}
        </div>
      )}
    </div>
  );
}

type AdminReferralTreeClientProps = { rootId?: string };

export function AdminReferralTreeClient({ rootId }: AdminReferralTreeClientProps = {}) {
  const { t } = useLocale();
  const [roots, setRoots] = useState<ReferralTreeNode[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [maxDepth, setMaxDepth] = useState<number>(5);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ maxDepth: String(maxDepth) });
      if (rootId) params.set("rootId", rootId);
      const res = await fetch(
        `/api/admin/referrals/tree?${params}`,
        { credentials: "include" }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(
          data.error === "NOT_FOUND"
            ? t("admin.referrals.loadError")
            : data.error === "UNAUTHORIZED"
              ? t("admin.common.loadError")
              : t("admin.referrals.loadError")
        );
        setRoots([]);
        return;
      }
      const data = await res.json();
      setRoots(Array.isArray(data.roots) ? data.roots : []);
    } catch {
      setError(t("admin.referrals.loadError"));
      setRoots([]);
    } finally {
      setLoading(false);
    }
  }, [t, maxDepth, rootId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading && roots === null) {
    return (
      <div className="referral-tree referral-tree--loading">
        <p className="referral-tree__loading-text">{t("admin.referrals.loading")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="referral-tree referral-tree--error">
        <p className="referral-tree__error-text">{error}</p>
        <div className="flex flex-wrap gap-2 mt-3">
          {rootId && (
            <Link href="/admin/referrals" className="admin-compact-btn admin-compact-btn-ghost">
              {t("admin.referrals.backToList")}
            </Link>
          )}
          <button
            type="button"
            onClick={load}
            className="admin-compact-btn admin-compact-btn-primary"
          >
            {t("admin.referrals.refresh")}
          </button>
        </div>
      </div>
    );
  }

  if (!roots || roots.length === 0) {
    return (
      <div className="referral-tree referral-tree--empty">
        <p className="referral-tree__empty-text">{t("admin.referrals.noData")}</p>
        <div className="referral-tree__empty-links">
          {rootId && (
            <Link href="/admin/referrals" className="referral-tree__link">
              {t("admin.referrals.backToList")}
            </Link>
          )}
          <Link href="/admin/players" className="referral-tree__link">
            {t("admin.referrals.openPlayers")}
          </Link>
          <Link href="/admin/agents" className="referral-tree__link">
            {t("admin.referrals.openAgents")}
          </Link>
        </div>
      </div>
    );
  }

  const singleRoot = rootId && roots.length === 1;
  const treeCountLabel = singleRoot ? null : t("admin.referrals.treeCount").replace("{n}", String(roots.length));

  return (
    <div className="referral-tree">
      <div className="referral-tree__header">
        <div className="referral-tree__header-left">
          {rootId && (
            <Link href="/admin/referrals" className="admin-compact-btn admin-compact-btn-ghost">
              ← {t("admin.referrals.backToList")}
            </Link>
          )}
          {treeCountLabel && <span className="referral-tree__header-count">{treeCountLabel}</span>}
          {singleRoot && <span className="referral-tree__header-count">{roots[0].userRef} — {t("admin.referrals.downlineCount")}</span>}
          <span className="referral-tree__header-depth">
            {t("admin.referrals.depth")}: {maxDepth}
          </span>
          <select
            value={maxDepth}
            onChange={(e) => setMaxDepth(Number(e.target.value))}
            className="referral-tree__depth-select"
            aria-label={t("admin.referrals.depth")}
          >
            {DEPTH_OPTIONS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="admin-compact-btn admin-compact-btn-ghost"
        >
          {t("admin.referrals.refresh")}
        </button>
      </div>

      <div className="referral-tree__list">
        {roots.map((node, idx) => (
          <div key={node.id} className="referral-tree__root">
            {!singleRoot && roots.length > 1 && (
              <div className="referral-tree__root-label">
                {idx + 1}. {node.userRef}
              </div>
            )}
            <TreeNode node={node} depth={0} t={t} />
          </div>
        ))}
      </div>
    </div>
  );
}
