import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";
import { totpGenerateSecret, totpUri, totpVerify } from "@/lib/totp";
import { encryptTotpSecret, decryptTotpSecret } from "@/lib/crypto";
import QRCode from "qrcode";

export const dynamic = "force-dynamic";

const PENDING_KEY = "totp_pending";
const PENDING_TTL_MS = 10 * 60 * 1000;

type PendingEntry = { secretEnc: string; expiresAt: string };
type PendingJson = Record<string, PendingEntry>;

async function getPending(): Promise<PendingJson> {
  const row = await db.siteSetting.findUnique({
    where: { key: PENDING_KEY },
    select: { valueJson: true },
  });
  const raw = row?.valueJson;
  if (raw != null && typeof raw === "object" && !Array.isArray(raw)) return raw as PendingJson;
  return {};
}

async function setPending(data: PendingJson) {
  await db.siteSetting.upsert({
    where: { key: PENDING_KEY },
    create: { key: PENDING_KEY, valueJson: data as object },
    update: { valueJson: data as object },
  });
}

export async function GET(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (user.totpEnabled) {
    return NextResponse.json({ error: "ALREADY_ENABLED" }, { status: 400 });
  }

  const secret = totpGenerateSecret();
  const uri = totpUri(secret, user.email);
  const qrCodeDataUrl = await QRCode.toDataURL(uri, { margin: 2, width: 200 });

  const pending = await getPending();
  const expiresAt = new Date(Date.now() + PENDING_TTL_MS).toISOString();
  pending[user.id] = { secretEnc: encryptTotpSecret(secret), expiresAt };
  await setPending(pending);

  return NextResponse.json({ qrCodeDataUrl, secretBase32: secret });
}

export async function POST(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (user.totpEnabled) {
    return NextResponse.json({ error: "ALREADY_ENABLED" }, { status: 400 });
  }

  const body = (await req.json().catch(() => null)) as { code?: string } | null;
  const code = typeof body?.code === "string" ? body.code.trim().replace(/\s/g, "") : "";
  if (!/^\d{6}$/.test(code)) {
    return NextResponse.json({ error: "CODE_REQUIRED" }, { status: 400 });
  }

  const pending = await getPending();
  const entry = pending[user.id];
  if (!entry) {
    return NextResponse.json({ error: "SETUP_EXPIRED" }, { status: 400 });
  }
  if (new Date(entry.expiresAt).getTime() < Date.now()) {
    delete pending[user.id];
    await setPending(pending);
    return NextResponse.json({ error: "SETUP_EXPIRED" }, { status: 400 });
  }

  let secret: string;
  try {
    secret = decryptTotpSecret(entry.secretEnc);
  } catch {
    delete pending[user.id];
    await setPending(pending);
    return NextResponse.json({ error: "INVALID_STATE" }, { status: 500 });
  }

  const valid = await totpVerify(secret, code);
  if (!valid) {
    return NextResponse.json({ error: "INVALID_CODE" }, { status: 401 });
  }

  delete pending[user.id];
  await setPending(pending);

  await db.adminUser.update({
    where: { id: user.id },
    data: {
      totpEnabled: true,
      totpSecretEnc: encryptTotpSecret(secret),
      totpVerifiedAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true });
}
