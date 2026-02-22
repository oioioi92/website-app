import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { buildUploadImageKey, uploadObjectToR2 } from "@/lib/r2";
import { rateLimitRedisOrMemory } from "@/lib/rateLimit/redisRateLimit";
import { getClientIp } from "@/lib/net/clientIp";

export const runtime = "nodejs";

const MAX_BYTES_IN = 2 * 1024 * 1024;
const MAX_DIM = 4096;
const MAX_PIXELS = MAX_DIM * MAX_DIM;
const OUT_HARD_LIMIT = 900 * 1024;

function isAllowedMime(mime: string) {
  return mime === "image/png" || mime === "image/jpeg" || mime === "image/webp";
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const bucket = await rateLimitRedisOrMemory({ key: `rl:public-chat-upload:${ip}`, limit: 20, windowSec: 60 });
  if (!bucket.ok) return NextResponse.json({ error: "RATE_LIMITED" }, { status: 429 });

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "FILE_REQUIRED" }, { status: 400 });
  if (!Number.isFinite(file.size) || file.size <= 0) return NextResponse.json({ error: "INVALID_SIZE" }, { status: 400 });
  if (file.size > MAX_BYTES_IN) return NextResponse.json({ error: "IMAGE_TOO_LARGE" }, { status: 413 });
  if (!isAllowedMime(file.type)) return NextResponse.json({ error: "IMAGE_UNSUPPORTED" }, { status: 415 });

  const input = Buffer.from(await file.arrayBuffer());
  let meta: sharp.Metadata;
  try {
    meta = await sharp(input, { failOnError: true, limitInputPixels: MAX_PIXELS }).metadata();
  } catch {
    return NextResponse.json({ error: "IMAGE_DECODE_FAIL" }, { status: 400 });
  }

  const w = meta.width ?? 0;
  const h = meta.height ?? 0;
  if (!w || !h) return NextResponse.json({ error: "IMAGE_DECODE_FAIL" }, { status: 400 });
  if (w > MAX_DIM || h > MAX_DIM) return NextResponse.json({ error: "IMAGE_TOO_LARGE_DIM" }, { status: 413 });

  const out = await sharp(input, { failOnError: true, limitInputPixels: MAX_PIXELS })
    .rotate()
    .webp({ quality: 80 })
    .toBuffer();
  if (out.byteLength > OUT_HARD_LIMIT) return NextResponse.json({ error: "IMAGE_TOO_LARGE" }, { status: 413 });

  const objectKey = buildUploadImageKey("chat-msg", "webp");
  const uploaded = await uploadObjectToR2({ objectKey, contentType: "image/webp", body: out });
  return NextResponse.json({ ok: true, publicUrl: uploaded.publicUrl });
}

