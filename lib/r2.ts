import { randomUUID } from "crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

export function createR2Client() {
  return new S3Client({
    region: "auto",
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
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/c61c53b9-4e86-47a3-ab7a-2e00967a7a09',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({runId:'sec-audit-pre',hypothesisId:'H3',location:'lib/r2.ts:37',message:'createSignedUpload issued',data:{hasObjectKey:!!input.objectKey,keyPrefix:String(key).split("/")[0]||"",mime:input.contentType},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
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
  // #region agent log
  fetch('http://127.0.0.1:7244/ingest/c61c53b9-4e86-47a3-ab7a-2e00967a7a09',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({runId:'sec-audit-pre',hypothesisId:'H3',location:'lib/r2.ts:63',message:'uploadObjectToR2 sending',data:{keyPrefix:String(key).split("/")[0]||"",bytes:input.body?.byteLength??0,mime:input.contentType},timestamp:Date.now()})}).catch(()=>{});
  // #endregion
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
