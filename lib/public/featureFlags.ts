import "server-only";

import { db } from "@/lib/db";

export type FeatureFlags = {
  internalTestMode: boolean;
};

const DEFAULTS: FeatureFlags = {
  internalTestMode: false,
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
  const base: FeatureFlags = {
    internalTestMode: envBool("INTERNAL_TEST_MODE", DEFAULTS.internalTestMode),
  };

  const allowInternalOverride = (process.env.ALLOW_INTERNAL_TEST_OVERRIDE ?? "0") === "1";

  try {
    const row = await db.siteSetting.findUnique({ where: { key: "feature_flags" }, select: { valueJson: true } });
    const obj = row?.valueJson && typeof row.valueJson === "object" && !Array.isArray(row.valueJson)
      ? (row.valueJson as Record<string, unknown>)
      : null;

    if (!obj) return base;

    return {
      internalTestMode: allowInternalOverride ? asBool(obj.internalTestMode, base.internalTestMode) : base.internalTestMode,
    };
  } catch {
    return base;
  }
}

