import "server-only";

import { db } from "@/lib/db";

export type FeatureFlags = {
  useHomeV3: boolean;
  useP44Portal: boolean;
  useVividPortal: boolean;
  internalTestMode: boolean;
  useLegacyHome: boolean;
};

const DEFAULTS: FeatureFlags = {
  useHomeV3: true,
  useP44Portal: false,
  useVividPortal: false,
  internalTestMode: false,
  useLegacyHome: false
};

function asBool(v: unknown, fallback: boolean) {
  return typeof v === "boolean" ? v : fallback;
}

function envBool(name: string, fallback: boolean) {
  const raw = (process.env[name] ?? "").trim();
  if (raw === "1") return true;
  if (raw === "0") return false;
  return fallback;
}

/** 判断某个 env 变量是否被明确设置（"0" 或 "1"），而非依赖默认值 */
function envExplicitlySet(name: string): boolean {
  const raw = (process.env[name] ?? "").trim();
  return raw === "1" || raw === "0";
}

export async function getFeatureFlags(): Promise<FeatureFlags> {
  // Start from env + defaults (so DB outage doesn't break public pages).
  const base: FeatureFlags = {
    useHomeV3: envBool("USE_HOME_V3", DEFAULTS.useHomeV3),
    useP44Portal: envBool("USE_P44_PORTAL", DEFAULTS.useP44Portal),
    useVividPortal: envBool("USE_VIVID_PORTAL", DEFAULTS.useVividPortal),
    internalTestMode: envBool("INTERNAL_TEST_MODE", DEFAULTS.internalTestMode),
    useLegacyHome: envBool("USE_LEGACY_HOME", DEFAULTS.useLegacyHome)
  };

  // Allow DB-based override for non-sensitive flags.
  // For INTERNAL_TEST_MODE, require explicit env opt-in to prevent accidental enablement in prod.
  const allowInternalOverride = (process.env.ALLOW_INTERNAL_TEST_OVERRIDE ?? "0") === "1";

  try {
    const row = await db.siteSetting.findUnique({ where: { key: "feature_flags" }, select: { valueJson: true } });
    const obj = row?.valueJson && typeof row.valueJson === "object" && !Array.isArray(row.valueJson)
      ? (row.valueJson as Record<string, unknown>)
      : null;

    if (!obj) return base;

    return {
      // Home/P44/Legacy 仍允许 DB 覆盖（除非 env 明确设置）
      useHomeV3:    envExplicitlySet("USE_HOME_V3")    ? base.useHomeV3    : asBool(obj.useHomeV3, base.useHomeV3),
      useP44Portal: envExplicitlySet("USE_P44_PORTAL") ? base.useP44Portal : asBool(obj.useP44Portal, base.useP44Portal),
      useLegacyHome: envExplicitlySet("USE_LEGACY_HOME")
        ? base.useLegacyHome
        : asBool(obj.useLegacyHome, base.useLegacyHome),
      // 关键修复：Vivid 只看 env（或默认值），不再被 DB 改回旧版
      useVividPortal: base.useVividPortal,
      internalTestMode: allowInternalOverride ? asBool(obj.internalTestMode, base.internalTestMode) : base.internalTestMode
    };
  } catch {
    return base;
  }
}

