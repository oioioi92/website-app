import { chatDb } from "./db.js";

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | { [key: string]: JsonValue } | JsonValue[];

function toSafeJson(input: unknown): JsonValue | undefined {
  if (input === undefined) return undefined;
  try {
    // Drop functions/BigInt/etc; ensures Prisma Json input stays serializable.
    const v = JSON.parse(JSON.stringify(input)) as JsonValue;
    // Avoid passing explicit null to Prisma JSON input (type-level restriction).
    return v === null ? undefined : v;
  } catch {
    // Never block runtime on audit; store JSON null on serialization failure.
    return undefined;
  }
}

export async function auditEvent(input: {
  actorType: "visitor" | "admin" | "system";
  actorId?: string | null;
  action: string;
  ip?: string | null;
  sessionId?: string | null;
  conversationId?: string | null;
  detailJson?: unknown;
}) {
  try {
    await chatDb.event.create({
      data: {
        actorType: input.actorType,
        actorId: input.actorId ?? null,
        action: input.action,
        ip: input.ip ?? null,
        sessionId: input.sessionId ?? null,
        conversationId: input.conversationId ?? null,
        detailJson: toSafeJson(input.detailJson) ?? undefined
      }
    });
  } catch {
    // Never block runtime on audit failure.
  }
}

