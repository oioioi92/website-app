import "server-only";

import { db } from "@/lib/db";

export type FeatureFlags = {
  useHomeV3: boolean;
  internalTestMode: boolean;
  useLegacyHome: boolean;
};

const DEFAULTS: FeatureFlags = {
  // Keep default on so deploy doesn't look unchanged.
  useHomeV3: true,
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

export async function getFeatureFlags(): Promise<FeatureFlags> {
  // Start from env + defaults (so DB outage doesn't break public pages).
  const base: FeatureFlags = {
    useHomeV3: envBool("USE_HOME_V3", DEFAULTS.useHomeV3),
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
      useHomeV3: asBool(obj.useHomeV3, base.useHomeV3),
      useLegacyHome: asBool(obj.useLegacyHome, base.useLegacyHome),
      internalTestMode: allowInternalOverride ? asBool(obj.internalTestMode, base.internalTestMode) : base.internalTestMode
    };
  } catch {
    return base;
  }
}

