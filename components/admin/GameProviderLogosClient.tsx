"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocale } from "@/lib/i18n/context";
import { PhotoUploadField } from "@/components/admin/PhotoUploadField";
import { ADMIN_GAME_CATEGORY_OPTIONS } from "@/lib/public/uiGameCategories";

export type ProviderRow = {
  id: string;
  name: string;
  code: string | null;
  logoUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  category: string | null;
  apiBaseUrl: string | null;
  apiKey: string | null;
  secret: string | null;
};

const rowClass = "flex flex-wrap items-start gap-4 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg)] p-4";

type Props = {
  /** 为 true 时显示：新建游戏、排序、启用开关（适合「游戏管理」单页） */
  fullManagement?: boolean;
  /** 与游戏列表参在一起时，放在列表最前面的第一行（如 API 配置） */
  beforeList?: React.ReactNode;
};

export function GameProviderLogosClient({ fullManagement = false }: Props) {
  const { t } = useLocale();
  const [list, setList] = useState<ProviderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);
  const [createName, setCreateName] = useState("");
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<Record<string, { ok: boolean; message: string } | null>>({});

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/settings/game-providers", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: ProviderRow[]) =>
        setList(
          Array.isArray(data)
            ? data.map((r) => ({
                ...r,
                code: r.code ?? null,
                category: r.category ?? null,
                apiBaseUrl: r.apiBaseUrl ?? null,
                apiKey: r.apiKey ?? null,
                secret: r.secret ?? null,
              }))
            : []
        )
      )
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function updateProvider(id: string, patch: Partial<ProviderRow>) {
    setSavingId(id);
    fetch(`/api/admin/settings/game-providers/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    })
      .then((r) => {
        if (!r.ok) throw new Error("Save failed");
        setList((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
      })
      .catch(() => {})
      .finally(() => setSavingId(null));
  }

  function moveOrder(id: string, direction: "up" | "down") {
    setMovingId(id);
    fetch(`/api/admin/settings/game-providers/${id}/reorder`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ direction }),
    })
      .then((r) => { if (!r.ok) throw new Error("Reorder failed"); load(); })
      .catch(() => {})
      .finally(() => setMovingId(null));
  }

  function testConnection(id: string, apiBaseUrl: string | null) {
    const url = (apiBaseUrl ?? "").trim();
    if (!url) {
      setTestResult((prev) => ({ ...prev, [id]: { ok: false, message: "请先填写 API Base URL" } }));
      return;
    }
    setTestResult((prev) => ({ ...prev, [id]: null }));
    fetch("/api/admin/settings/game-api/test", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiBaseUrl: url }),
    })
      .then((r) => r.json())
      .then((data) => setTestResult((prev) => ({ ...prev, [id]: { ok: data.ok ?? false, message: data.message ?? (data.ok ? "OK" : "Failed") } })))
      .catch(() => setTestResult((prev) => ({ ...prev, [id]: { ok: false, message: "Request failed" } })));
  }

  function createProvider() {
    const name = createName.trim();
    if (!name) return;
    setCreateSubmitting(true);
    setCreateError(null);
    fetch("/api/admin/settings/game-providers", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })
      .then((r) => {
        if (r.status === 409) {
          setCreateError(t("admin.gamesManagement.nameExists") ?? "名称已存在");
          return;
        }
        if (!r.ok) throw new Error("Create failed");
        setCreateName("");
        load();
      })
      .catch(() => setCreateError(t("admin.common.saveError") ?? "保存失败"))
      .finally(() => setCreateSubmitting(false));
  }

  if (loading && list.length === 0) {
    return <p className="text-sm text-[var(--admin-muted)]">{t("admin.common.loading")}</p>;
  }

  return (
    <div className="space-y-6">
      {fullManagement && (
        <div className="flex flex-wrap items-end gap-3 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg)] p-4">
          <div className="min-w-[200px]">
            <label className="mb-1 block text-xs font-medium text-[var(--admin-muted)]">{t("admin.gamesManagement.newGameName") ?? "新游戏名称"}</label>
            <input
              type="text"
              value={createName}
              onChange={(e) => { setCreateName(e.target.value); setCreateError(null); }}
              onKeyDown={(e) => e.key === "Enter" && createProvider()}
              className="admin-compact-input w-full rounded-lg border border-[var(--admin-border)] bg-[var(--admin-panel2)] px-3 py-2 text-[var(--admin-text)]"
              placeholder="e.g. MEGA888"
            />
          </div>
          <button type="button" onClick={createProvider} disabled={createSubmitting || !createName.trim()} className="admin-compact-btn admin-compact-btn-primary">
            {createSubmitting ? (t("admin.common.saving") ?? "保存中…") : (t("admin.gamesManagement.createGame") ?? "新建游戏")}
          </button>
          {createError && <span className="text-sm text-red-600">{createError}</span>}
        </div>
      )}

      {!fullManagement && <p className="text-sm text-[var(--admin-muted)]">{t("admin.gameProviderLogos.hint")}</p>}

      {list.length === 0 ? (
        <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-panel2)] p-6 text-center">
          <p className="text-sm text-[var(--admin-muted)]">{t("admin.gameProviderLogos.noProviders")}</p>
        </div>
      ) : fullManagement ? (
        <div className="space-y-4">
          {list.map((p, idx) => (
            <div key={p.id} className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg)] p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-start">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-[var(--admin-muted)]">{t("admin.gamesManagement.sort") ?? "排序"}</span>
                  <div className="flex gap-0.5">
                    <button type="button" disabled={idx === 0 || movingId === p.id} onClick={() => moveOrder(p.id, "up")} className="admin-compact-btn admin-compact-btn-ghost text-xs py-1 px-2 disabled:opacity-40">↑</button>
                    <button type="button" disabled={idx === list.length - 1 || movingId === p.id} onClick={() => moveOrder(p.id, "down")} className="admin-compact-btn admin-compact-btn-ghost text-xs py-1 px-2 disabled:opacity-40">↓</button>
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <span className="mb-1 block text-xs font-medium text-[var(--admin-muted)]">{t("admin.gamesManagement.name") ?? "名称"}</span>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-[var(--admin-text)]">{p.name}</span>
                    {p.code && p.code !== p.name && <span className="rounded bg-[var(--admin-muted)]/20 px-1.5 py-0.5 text-xs">{p.code}</span>}
                    {!p.isActive && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">{t("admin.common.inactive")}</span>}
                    {savingId === p.id && <span className="text-xs text-[var(--admin-muted)]">{t("admin.common.saving")}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--admin-muted)]">{t("admin.gamesManagement.enabled") ?? "启用"}</span>
                  <button type="button" onClick={() => updateProvider(p.id, { isActive: !p.isActive })} className={`shrink-0 rounded px-2 py-1 text-xs font-medium ${p.isActive ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400"}`}>
                    {p.isActive ? (t("admin.gamesManagement.on") ?? "开") : (t("admin.gamesManagement.off") ?? "关")}
                  </button>
                </div>
                <div className="min-w-[140px]">
                  <label className="mb-1 block text-xs font-medium text-[var(--admin-muted)]">{t("admin.gameProviderLogos.categoryLabel") ?? "分类"}</label>
                  <select
                    value={p.category ?? ""}
                    onChange={(e) => updateProvider(p.id, { category: e.target.value || null })}
                    className="w-full rounded-lg border border-[var(--admin-border)] bg-[var(--admin-panel2)] px-2.5 py-1.5 text-[13px] text-[var(--admin-text)]"
                  >
                    <option value="">{t("admin.gameProviderLogos.categoryAuto") ?? "自动推断"}</option>
                    {ADMIN_GAME_CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="w-full min-w-0 max-w-[280px]">
                  <PhotoUploadField label={t("admin.gameProviderLogos.logoLabel")} hint="" value={p.logoUrl ?? ""} onChange={(url) => updateProvider(p.id, { logoUrl: url || null })} uploadModule="providers" />
                </div>
              </div>
              <div className="mt-4 grid gap-3 border-t border-[var(--admin-border)] pt-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-[var(--admin-muted)]">{t("admin.gameProviderLogos.apiBaseLabel") ?? "API Base URL"}</label>
                  <input
                    type="text"
                    value={p.apiBaseUrl ?? ""}
                    onChange={(e) => setList((prev) => prev.map((r) => (r.id === p.id ? { ...r, apiBaseUrl: e.target.value || null } : r)))}
                    onBlur={(e) => {
                      const v = e.target.value.trim();
                      if (v !== (p.apiBaseUrl ?? "")) updateProvider(p.id, { apiBaseUrl: v || null });
                    }}
                    placeholder="https://api.example.com"
                    className="w-full rounded-lg border border-[var(--admin-border)] bg-[var(--admin-panel2)] px-2.5 py-1.5 text-[13px] text-[var(--admin-text)] placeholder-[var(--admin-muted)]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[var(--admin-muted)]">{t("admin.gameProviderLogos.apiKeyLabel") ?? "API Key"}</label>
                  <input
                    type="text"
                    value={p.apiKey ?? ""}
                    onChange={(e) => setList((prev) => prev.map((r) => (r.id === p.id ? { ...r, apiKey: e.target.value || null } : r)))}
                    onBlur={(e) => {
                      const v = e.target.value.trim();
                      if (v !== (p.apiKey ?? "")) updateProvider(p.id, { apiKey: v || null });
                    }}
                    placeholder="API key"
                    className="w-full rounded-lg border border-[var(--admin-border)] bg-[var(--admin-panel2)] px-2.5 py-1.5 text-[13px] text-[var(--admin-text)] placeholder-[var(--admin-muted)]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-[var(--admin-muted)]">{t("admin.gameProviderLogos.secretLabel") ?? "Secret"}</label>
                  <input
                    type="password"
                    value={p.secret ?? ""}
                    onChange={(e) => setList((prev) => prev.map((r) => (r.id === p.id ? { ...r, secret: e.target.value || null } : r)))}
                    onBlur={(e) => {
                      const v = e.target.value.trim();
                      if (v !== (p.secret ?? "")) updateProvider(p.id, { secret: v || null });
                    }}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-[var(--admin-border)] bg-[var(--admin-panel2)] px-2.5 py-1.5 text-[13px] text-[var(--admin-text)] placeholder-[var(--admin-muted)]"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <button
                    type="button"
                    onClick={() => testConnection(p.id, p.apiBaseUrl)}
                    className="admin-compact-btn admin-compact-btn-ghost text-[13px]"
                  >
                    {t("admin.settingsGameApi.testConnection") ?? "测试连接"}
                  </button>
                  {testResult[p.id] && (
                    <span className={`text-[13px] ${testResult[p.id]?.ok ? "text-green-600" : "text-red-600"}`}>
                      {testResult[p.id]?.message}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => (
            <div key={p.id} className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-panel2)] p-4">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="font-semibold text-[var(--admin-text)]">{p.name}</span>
                {p.code && p.code !== p.name && <span className="rounded bg-[var(--admin-muted)]/20 px-1.5 py-0.5 text-xs text-[var(--admin-muted)]">{p.code}</span>}
                {p.category && <span className="rounded bg-sky-100 px-1.5 py-0.5 text-xs text-sky-800 dark:bg-sky-900/40 dark:text-sky-300">{p.category}</span>}
                {!p.isActive && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">{t("admin.common.inactive")}</span>}
                {savingId === p.id && <span className="text-xs text-[var(--admin-muted)]">{t("admin.common.saving")}</span>}
              </div>
              <div className="mb-2">
                <label className="mb-0.5 block text-xs font-medium text-[var(--admin-muted)]">{t("admin.gameProviderLogos.categoryLabel") ?? "分类"}</label>
                <select value={p.category ?? ""} onChange={(e) => updateProvider(p.id, { category: e.target.value || null })} className="w-full rounded border border-[var(--admin-border)] bg-[var(--admin-bg)] px-2 py-1 text-xs text-[var(--admin-text)]">
                  <option value="">{t("admin.gameProviderLogos.categoryAuto") ?? "自动"}</option>
                  {ADMIN_GAME_CATEGORY_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                </select>
              </div>
              <PhotoUploadField label={t("admin.gameProviderLogos.logoLabel")} hint="" value={p.logoUrl ?? ""} onChange={(url) => updateProvider(p.id, { logoUrl: url || null })} uploadModule="providers" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
