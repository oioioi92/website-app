"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocale } from "@/lib/i18n/context";

export function TwoFactorSettingsClient() {
  const { t } = useLocale();
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [setupMode, setSetupMode] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [setupCode, setSetupCode] = useState("");
  const [setupLoading, setSetupLoading] = useState(false);
  const [setupError, setSetupError] = useState("");
  const [disablePassword, setDisablePassword] = useState("");
  const [disableLoading, setDisableLoading] = useState(false);
  const [disableError, setDisableError] = useState("");

  const fetchStatus = useCallback(() => {
    setLoading(true);
    fetch("/api/admin/settings/2fa/status", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d: { enabled?: boolean }) => setEnabled(d.enabled ?? false))
      .catch(() => setEnabled(false))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  async function startSetup() {
    setSetupError("");
    setSetupCode("");
    setQrCodeDataUrl(null);
    setSetupMode(true);
    try {
      const res = await fetch("/api/admin/settings/2fa/setup", { credentials: "include" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSetupError(data.error === "ALREADY_ENABLED" ? "" : "Setup failed");
        if (data.error === "ALREADY_ENABLED") {
          setEnabled(true);
          setSetupMode(false);
        }
        return;
      }
      setQrCodeDataUrl(data.qrCodeDataUrl ?? null);
    } catch {
      setSetupError("Request failed");
    }
  }

  async function confirmSetup(e: React.FormEvent) {
    e.preventDefault();
    if (!/^\d{6}$/.test(setupCode)) {
      setSetupError(t("admin.security.twoFaInvalidCode"));
      return;
    }
    setSetupError("");
    setSetupLoading(true);
    try {
      const res = await fetch("/api/admin/settings/2fa/setup", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: setupCode }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setSetupError(data.error === "SETUP_EXPIRED" ? t("admin.security.twoFaSetupExpired") : t("admin.security.twoFaInvalidCode"));
        return;
      }
      setEnabled(true);
      setSetupMode(false);
      setQrCodeDataUrl(null);
      setSetupCode("");
    } finally {
      setSetupLoading(false);
    }
  }

  async function disable2Fa(e: React.FormEvent) {
    e.preventDefault();
    if (!disablePassword.trim()) return;
    setDisableError("");
    setDisableLoading(true);
    try {
      const res = await fetch("/api/admin/settings/2fa/disable", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: disablePassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setDisableError(data.error === "INVALID_PASSWORD" ? "Invalid password" : "Failed");
        return;
      }
      setEnabled(false);
      setDisablePassword("");
    } finally {
      setDisableLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-panel2)] p-5">
        <p className="text-sm text-[var(--admin-muted)]">{t("admin.common.loading")}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-panel2)] p-5">
      <h2 className="mb-2 text-sm font-semibold text-[var(--admin-text)]">
        {t("admin.security.twoFaTitle")}
      </h2>
      <p className="mb-4 text-sm text-[var(--admin-muted)]">
        {t("admin.security.twoFaDesc")}
      </p>

      {setupMode ? (
        <div className="space-y-4">
          {qrCodeDataUrl ? (
            <>
              <p className="text-sm text-[var(--admin-text)]">{t("admin.security.twoFaScanQR")}</p>
              <div className="flex justify-center">
                <img src={qrCodeDataUrl} alt="QR Code" className="rounded-lg border border-[var(--admin-border)]" />
              </div>
              <form onSubmit={confirmSetup} className="space-y-3">
                <label className="block text-sm font-medium text-[var(--admin-text)]">
                  {t("admin.security.twoFaEnterCode")}
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={setupCode}
                  onChange={(e) => setSetupCode(e.target.value.replace(/\D/g, ""))}
                  className="w-full max-w-[12rem] rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg)] px-3 py-2 text-center text-lg tracking-widest text-[var(--admin-text)]"
                />
                {setupError && <p className="text-sm text-red-600">{setupError}</p>}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setSetupMode(false); setQrCodeDataUrl(null); setSetupCode(""); setSetupError(""); }}
                    className="rounded-lg border border-[var(--admin-border)] px-4 py-2 text-sm font-medium text-[var(--admin-text)]"
                  >
                    {t("admin.login.back")}
                  </button>
                  <button
                    type="submit"
                    disabled={setupLoading || setupCode.length !== 6}
                    className="rounded-lg bg-[var(--admin-primary)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                  >
                    {setupLoading ? t("admin.security.twoFaEnabling") : t("admin.security.twoFaConfirm")}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <p className="text-sm text-[var(--admin-muted)]">{t("admin.common.loading")}</p>
          )}
        </div>
      ) : enabled ? (
        <div className="space-y-4">
          <p className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
            {t("admin.security.twoFaEnabled")}
          </p>
          <form onSubmit={disable2Fa} className="space-y-3">
            <label className="block text-sm font-medium text-[var(--admin-text)]">
              {t("admin.security.twoFaDisablePassword")}
            </label>
            <input
              type="password"
              value={disablePassword}
              onChange={(e) => setDisablePassword(e.target.value)}
              className="w-full max-w-xs rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg)] px-3 py-2 text-[var(--admin-text)]"
            />
            {disableError && <p className="text-sm text-red-600">{disableError}</p>}
            <button
              type="submit"
              disabled={disableLoading || !disablePassword.trim()}
              className="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300"
            >
              {disableLoading ? t("admin.security.twoFaDisabling") : t("admin.security.twoFaDisableConfirm")}
            </button>
          </form>
        </div>
      ) : (
        <button
          type="button"
          onClick={startSetup}
          className="rounded-lg bg-[var(--admin-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          {t("admin.security.twoFaEnable")}
        </button>
      )}
    </div>
  );
}
