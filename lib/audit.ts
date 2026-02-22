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
}) {
  const raw = typeof input.diffJson === "object" && input.diffJson !== null ? input.diffJson as Record<string, unknown> : {};
  const withRemark = input.remark != null ? { ...raw, remark: input.remark } : raw;
  const normalized = JSON.parse(JSON.stringify(withRemark)) as Prisma.InputJsonValue;
  await db.auditLog.create({
    data: {
      actorId: input.actorId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      diffJson: normalized,
      ip: input.req?.headers.get("x-forwarded-for") ?? null,
      userAgent: input.req?.headers.get("user-agent") ?? null
    }
  });
}
