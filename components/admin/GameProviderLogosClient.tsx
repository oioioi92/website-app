"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocale } from "@/lib/i18n/context";
import { PhotoUploadField } from "@/components/admin/PhotoUploadField";

export type ProviderApi = { providerName: string; apiBaseUrl: string; apiKey: string; secret: string; enabled: boolean };
export type ProviderRow = { id: string; name: string; code: string; logoUrl: string | null; sortOrder: number; isActive: boolean; api: ProviderApi };

const rowClass = "flex flex-wrap items-start gap-4 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg)] p-4";
const inputClass = "w-full rounded border border-[var(--admin-border)] bg-[var(--admin-panel2)] px-2 py-1.5 text-[13px] text-[var(--admin-text)] placeholder-[var(--admin-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--admin-primary)]";

type Props = {
  /** 为 true 时显示：新建游戏、排序、启用开关（适合「游戏管理」单页） */
  fullManagement?: boolean;
  /** 与游戏列表参在一起时，放在列表最前面的第一行（如 API 配置） */
  beforeList?: React.ReactNode;
};

export function GameProviderLogosClient({ fullManagement = false, beforeList }: Props) {
  const { t } = useLocale();
  const tt = (key: string, fallback: string) => {
    const value = t(key);
    return !value || value === key ? fallback : value;
  };
  const [list, setList] = useState<ProviderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);
  const [createName, setCreateName] = useState("");
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const defaultApi = (): ProviderApi => ({ providerName: "", apiBaseUrl: "", apiKey: "", secret: "", enabled: true });

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/settings/game-providers", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: unknown[]) => {
        const out = (Array.isArray(data) ? data : []).map((p: Record<string, unknown>) => ({
          id: String(p.id ?? ""),
          name: String(p.name ?? ""),
          code: String((p as { code?: string }).code ?? p.name ?? ""),
          logoUrl: p.logoUrl != null ? String(p.logoUrl) : null,
          sortOrder: Number(p.sortOrder ?? 0),
          isActive: Boolean(p.isActive !== false),
          api: (p.api && typeof p.api === "object" ? {
            providerName: String((p.api as Record<string, unknown>).providerName ?? ""),
            apiBaseUrl: String((p.api as Record<string, unknown>).apiBaseUrl ?? ""),
            apiKey: String((p.api as Record<string, unknown>).apiKey ?? ""),
            secret: String((p.api as Record<string, unknown>).secret ?? ""),
            enabled: Boolean((p.api as Record<string, unknown>).enabled !== false),
          } : defaultApi()) as ProviderApi,
        }));
        setList(out);
      })
      .catch(() => setList([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResultById, setTestResultById] = useState<Record<string, { ok: boolean; message: string }>>({});

  function updateProvider(id: string, patch: Partial<ProviderRow>) {
    setSavingId(id);
    const body: Record<string, unknown> = {};
    if (patch.logoUrl !== undefined) body.logoUrl = patch.logoUrl;
    if (patch.name !== undefined) body.name = patch.name;
    if (patch.isActive !== undefined) body.isActive = patch.isActive;
    const apiPatch = (patch as { api?: ProviderApi }).api;
    if (apiPatch) {
      body.apiProviderName = apiPatch.providerName;
      body.apiBaseUrl = apiPatch.apiBaseUrl;
      body.apiKey = apiPatch.apiKey;
      body.secret = apiPatch.secret;
      body.apiEnabled = apiPatch.enabled;
    }
    fetch(`/api/admin/settings/game-providers/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((r) => {
        if (!r.ok) throw new Error("Save failed");
        setList((prev) => prev.map((o) => (o.id === id ? { ...o, ...patch } : o)));
      })
      .catch(() => {})
      .finally(() => setSavingId(null));
  }

  function patchApi(id: string, apiPatch: Partial<ProviderApi>) {
    setList((prev) => prev.map((p) => (p.id === id ? { ...p, api: { ...p.api, ...apiPatch } } : p)));
  }

  function testRowApi(id: string, apiBaseUrl: string) {
    setTestingId(id);
    setTestResultById((prev) => ({ ...prev, [id]: { ok: false, message: "…" } }));
    fetch("/api/admin/settings/game-api/test", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiBaseUrl: apiBaseUrl || "" }),
    })
      .then((r) => r.json())
      .then((data) => setTestResultById((prev) => ({ ...prev, [id]: { ok: data.ok ?? false, message: data.message ?? (data.ok ? "OK" : "Failed") } })))
      .catch(() => setTestResultById((prev) => ({ ...prev, [id]: { ok: false, message: "Request failed" } })))
      .finally(() => setTestingId(null));
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
    <div className={fullManagement ? "space-y-4" : "space-y-6"}>
      {fullManagement && beforeList != null && (
        <div className={rowClass}>
          <div className="flex flex-col gap-1 shrink-0">
            <span className="text-xs font-medium text-[var(--admin-muted)]">{t("admin.gamesManagement.pluginApi") ?? "API"}</span>
          </div>
          <div className="min-w-0 flex-1">{beforeList}</div>
        </div>
      )}
      {fullManagement && (
        <div className={rowClass}>
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
        <div className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg)] p-4 text-center">
          <p className="text-sm text-[var(--admin-muted)]">{t("admin.gameProviderLogos.noProviders")}</p>
        </div>
      ) : fullManagement ? (
        <>
          {list.map((p, idx) => (
            <div key={p.id} className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg)] p-4">
              <div className="flex flex-wrap items-start gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-[var(--admin-muted)]">{tt("admin.gamesManagement.sort", "排序")}</span>
                  <div className="flex gap-0.5">
                    <button type="button" disabled={idx === 0 || movingId === p.id} onClick={() => moveOrder(p.id, "up")} className="admin-compact-btn admin-compact-btn-ghost text-xs py-1 px-2 disabled:opacity-40">↑</button>
                    <button type="button" disabled={idx === list.length - 1 || movingId === p.id} onClick={() => moveOrder(p.id, "down")} className="admin-compact-btn admin-compact-btn-ghost text-xs py-1 px-2 disabled:opacity-40">↓</button>
                  </div>
                </div>

                <div className="min-w-[150px] flex-1">
                  <span className="mb-1 block text-xs font-medium text-[var(--admin-muted)]">{tt("admin.gamesManagement.name", "名称")}</span>
                  <span className="font-medium text-[var(--admin-text)]">{p.name}</span>
                  {p.code && p.code !== p.name && <span className="ml-2 rounded bg-[var(--admin-muted)]/20 px-1.5 py-0.5 text-xs">{p.code}</span>}
                  {!p.isActive && <span className="ml-2 rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">{tt("admin.common.inactive", "Inactive")}</span>}
                  {savingId === p.id && <span className="ml-2 text-xs text-[var(--admin-muted)]">{tt("admin.common.saving", "保存中…")}</span>}
                </div>

                <div className="w-full min-w-[220px] max-w-[320px] sm:w-auto">
                  <PhotoUploadField label={tt("admin.gameProviderLogos.logoLabel", "Logo")} hint="" value={p.logoUrl ?? ""} onChange={(url) => updateProvider(p.id, { logoUrl: url || null })} />
                </div>

                <div className="ml-auto flex flex-wrap items-center gap-2">
                  <label className="flex items-center gap-1.5 text-[13px] text-[var(--admin-muted)]">
                    <input type="checkbox" checked={p.api.enabled} onChange={(e) => patchApi(p.id, { enabled: e.target.checked })} className="rounded border-[var(--admin-border)]" />
                    {tt("admin.settingsGameApi.enable", "Enable")}
                  </label>
                  <button type="button" disabled={testingId === p.id || !p.api.apiBaseUrl} onClick={() => testRowApi(p.id, p.api.apiBaseUrl)} className="admin-compact-btn admin-compact-btn-ghost text-[13px]">
                    {testingId === p.id ? "…" : tt("admin.settingsGameApi.testConnection", "Test Connection")}
                  </button>
                  <button type="button" disabled={savingId === p.id} onClick={() => updateProvider(p.id, { api: p.api })} className="admin-compact-btn admin-compact-btn-primary text-[13px]">
                    {savingId === p.id ? tt("admin.common.saving", "保存中…") : tt("admin.common.save", "Save")}
                  </button>
                </div>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div>
                  <label className="mb-0.5 block text-xs text-[var(--admin-muted)]">{tt("admin.settingsGameApi.providerName", "Provider name")}</label>
                  <input type="text" className={inputClass} value={p.api.providerName} onChange={(e) => patchApi(p.id, { providerName: e.target.value })} placeholder="e.g. 918KISS" />
                </div>
                <div>
                  <label className="mb-0.5 block text-xs text-[var(--admin-muted)]">{tt("admin.settingsGameApi.apiBase", "API base URL")}</label>
                  <input type="url" className={inputClass} value={p.api.apiBaseUrl} onChange={(e) => patchApi(p.id, { apiBaseUrl: e.target.value })} placeholder="https://api.example.com" />
                </div>
                <div>
                  <label className="mb-0.5 block text-xs text-[var(--admin-muted)]">API Key</label>
                  <input type="text" className={inputClass} value={p.api.apiKey} onChange={(e) => patchApi(p.id, { apiKey: e.target.value })} placeholder="" />
                </div>
                <div>
                  <label className="mb-0.5 block text-xs text-[var(--admin-muted)]">Secret</label>
                  <input type="password" className={inputClass} value={p.api.secret} onChange={(e) => patchApi(p.id, { secret: e.target.value })} placeholder="••••••••" />
                </div>
              </div>

              {testResultById[p.id] && testingId !== p.id && (
                <div className={`mt-2 text-[13px] ${testResultById[p.id].ok ? "text-emerald-600" : "text-red-600"}`}>
                  {testResultById[p.id].message}
                </div>
              )}
            </div>
          ))}
        </>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => (
            <div key={p.id} className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-panel2)] p-4">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className="font-semibold text-[var(--admin-text)]">{p.name}</span>
                {p.code && p.code !== p.name && <span className="rounded bg-[var(--admin-muted)]/20 px-1.5 py-0.5 text-xs text-[var(--admin-muted)]">{p.code}</span>}
                {!p.isActive && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">{t("admin.common.inactive")}</span>}
                {savingId === p.id && <span className="text-xs text-[var(--admin-muted)]">{t("admin.common.saving")}</span>}
              </div>
              <PhotoUploadField label={t("admin.gameProviderLogos.logoLabel")} hint="" value={p.logoUrl ?? ""} onChange={(url) => updateProvider(p.id, { logoUrl: url || null })} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
