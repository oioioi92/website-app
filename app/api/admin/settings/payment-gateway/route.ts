import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const KEY = "settings_payment_gateway";

type PaymentGatewayPayload = {
  gatewayName?: string;
  apiBaseUrl?: string;
  merchantId?: string;
  apiKey?: string;
  feeRate?: string;
  enabled?: boolean;
};

/** GET: 读取支付网关配置 */
export async function GET(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const row = await db.siteSetting.findUnique({ where: { key: KEY }, select: { valueJson: true } });
  const value = (row?.valueJson as PaymentGatewayPayload | null) ?? {};
  return NextResponse.json(
    {
      gatewayName: value.gatewayName ?? "",
      apiBaseUrl: value.apiBaseUrl ?? "",
      merchantId: value.merchantId ?? "",
      apiKey: value.apiKey ?? "",
      feeRate: value.feeRate ?? "",
      enabled: value.enabled ?? true
    },
    { headers: { "Cache-Control": "no-store, max-age=0" } }
  );
}

/** PUT: 保存支付网关配置 */
export async function PUT(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  let body: PaymentGatewayPayload;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const valueJson = {
    gatewayName: String(body.gatewayName ?? ""),
    apiBaseUrl: String(body.apiBaseUrl ?? ""),
    merchantId: String(body.merchantId ?? ""),
    apiKey: String(body.apiKey ?? ""),
    feeRate: String(body.feeRate ?? ""),
    enabled: Boolean(body.enabled)
  };

  await db.siteSetting.upsert({
    where: { key: KEY },
    create: { key: KEY, valueJson: valueJson as object },
    update: { valueJson: valueJson as object }
  });
  return NextResponse.json({ ok: true });
}
