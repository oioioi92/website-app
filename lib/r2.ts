import { randomUUID } from "crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

/** 检测 R2 是否已配置（全部变量存在且非空） */
export function isR2Configured(): boolean {
  return !!(
    process.env.R2_ENDPOINT?.trim() &&
    process.env.R2_ACCESS_KEY_ID?.trim() &&
    process.env.R2_SECRET_ACCESS_KEY?.trim() &&
    process.env.R2_BUCKET?.trim() &&
    process.env.R2_PUBLIC_BASE_URL?.trim()
  );
}

export function createR2Client() {
  const region = process.env.R2_REGION?.trim() || "auto";
  return new S3Client({
    region,
    endpoint: required("R2_ENDPOINT"),
    credentials: {
      accessKeyId: required("R2_ACCESS_KEY_ID"),
      secretAccessKey: required("R2_SECRET_ACCESS_KEY")
    }
  });
}

export function buildObjectKey(filename: string) {
  const ext = filename.includes(".") ? filename.split(".").pop() : "bin";
  const date = new Date();
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  return `${y}${m}${d}/${randomUUID()}.${ext}`;
}

export async function createSignedUpload(input: { filename: string; contentType: string; objectKey?: string }) {
  const client = createR2Client();
  const bucket = required("R2_BUCKET");
  // If objectKey is provided, upload will overwrite the same key (Replace mode).
  const key = input.objectKey && input.objectKey.trim().length > 0 ? input.objectKey.trim() : buildObjectKey(input.filename);
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: input.contentType
  });
  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 60 });
  const publicBase = required("R2_PUBLIC_BASE_URL").replace(/\/$/, "");
  const publicUrl = `${publicBase}/${key}`;
  return { uploadUrl, publicUrl, key };
}

export function buildUploadImageKey(module: string, ext: string = "webp") {
  const safeModule = (module || "theme").trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/-+/g, "-").slice(0, 40) || "theme";
  const date = new Date();
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  // uploads/theme/2026/02/<uuid>.webp
  return `uploads/${safeModule}/${y}/${m}/${randomUUID()}.${ext}`;
}

export async function uploadObjectToR2(input: { objectKey: string; contentType: string; body: Buffer }) {
  const client = createR2Client();
  const bucket = required("R2_BUCKET");
  const key = input.objectKey.trim();
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: input.body,
    ContentType: input.contentType,
    CacheControl: "public, max-age=31536000, immutable"
  });
  await client.send(command);
  const publicBase = required("R2_PUBLIC_BASE_URL").replace(/\/$/, "");
  const publicUrl = `${publicBase}/${key}`;
  return { publicUrl, key };
}
