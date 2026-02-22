import { NextRequest, NextResponse } from "next/server";
import { canEditContent } from "@/lib/rbac";
import { getAdminSessionFromRequest } from "@/lib/auth";
import { verifyCsrfToken } from "@/lib/csrf";

function parseForcedTotpRoles() {
  const raw = (process.env.TOTP_ENFORCE_FOR_ROLES ?? "super,content_admin").trim();
  if (!raw) return new Set<string>();
  return new Set(
    raw
      .split(/[,\s]+/g)
      .map((s) => s.trim())
      .filter(Boolean)
  );
}

export async function requireAdminUser(
  req: NextRequest,
  opts?: { allowWithoutTotp?: boolean; allowWithoutTotpSetup?: boolean }
) {
  const s = await getAdminSessionFromRequest(req);
  const user = s?.user ?? null;
  if (!user || !s) {
    return { error: NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 }) };
  }

  const forcedRoles = parseForcedTotpRoles();
  const totpSetupRequired = forcedRoles.has(user.role) && !user.totpEnabled;
  if (totpSetupRequired && !opts?.allowWithoutTotpSetup) {
    return { error: NextResponse.json({ error: "TOTP_SETUP_REQUIRED" }, { status: 401 }) };
  }

  const totpRequired = user.totpEnabled && !s.session.totpOk;
  if (totpRequired && !opts?.allowWithoutTotp) {
    return { error: NextResponse.json({ error: "TOTP_REQUIRED" }, { status: 401 }) };
  }

  return { user };
}

export async function requireContentEditor(req: NextRequest) {
  const result = await requireAdminUser(req);
  if ("error" in result) return result;
  if (!canEditContent(result.user)) {
    return { error: NextResponse.json({ error: "FORBIDDEN" }, { status: 403 }) };
  }
  return result;
}

export function ensureCsrfForWrite(req: NextRequest) {
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) return null;
  if (!verifyCsrfToken(req)) {
    return NextResponse.json({ error: "CSRF_INVALID" }, { status: 403 });
  }
  return null;
}
