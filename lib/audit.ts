import type { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export function diffFields(
  beforeObj: Record<string, unknown>,
  afterObj: Record<string, unknown>
) {
  const changed: Record<string, { before: unknown; after: unknown }> = {};
  const keys = new Set([...Object.keys(beforeObj), ...Object.keys(afterObj)]);
  for (const key of keys) {
    const b = beforeObj[key];
    const a = afterObj[key];
    if (JSON.stringify(b) !== JSON.stringify(a)) {
      changed[key] = { before: b, after: a };
    }
  }
  return changed;
}

export async function writeAuditLog(input: {
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  diffJson: unknown;
  remark?: string;
  req?: NextRequest;
  /** 若传入则优先使用（如 getClientIp），否则从 req 头取 */
  ip?: string | null;
  userAgent?: string | null;
}) {
  const raw = typeof input.diffJson === "object" && input.diffJson !== null ? input.diffJson as Record<string, unknown> : {};
  const withRemark = input.remark != null ? { ...raw, remark: input.remark } : raw;
  const normalized = JSON.parse(JSON.stringify(withRemark)) as Prisma.InputJsonValue;
  const ip = input.ip !== undefined ? input.ip : (input.req?.headers.get("x-forwarded-for") ?? null);
  const userAgent = input.userAgent !== undefined ? input.userAgent : (input.req?.headers.get("user-agent") ?? null);
  await db.auditLog.create({
    data: {
      actorId: input.actorId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      diffJson: normalized,
      ip: ip ?? null,
      userAgent: userAgent ?? null
    }
  });
}
