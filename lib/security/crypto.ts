import "server-only";

import crypto from "node:crypto";

function keyBytes(): Buffer {
  const raw = (process.env.TOTP_ENC_KEY ?? "").trim();
  if (!raw) throw new Error("TOTP_ENC_KEY is required (base64 32 bytes)");
  const buf = Buffer.from(raw, "base64");
  if (buf.byteLength !== 32) throw new Error("TOTP_ENC_KEY must be base64 of 32 bytes");
  return buf;
}

// AES-256-GCM: base64(iv).base64(tag).base64(ciphertext)
export function encryptString(plain: string): string {
  const iv = crypto.randomBytes(12);
  const key = keyBytes();
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ct = Buffer.concat([cipher.update(Buffer.from(plain, "utf8")), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}.${tag.toString("base64")}.${ct.toString("base64")}`;
}

export function decryptString(enc: string): string {
  const [ivB64, tagB64, ctB64] = enc.split(".");
  if (!ivB64 || !tagB64 || !ctB64) throw new Error("INVALID_ENCRYPTED_VALUE");
  const iv = Buffer.from(ivB64, "base64");
  const tag = Buffer.from(tagB64, "base64");
  const ct = Buffer.from(ctB64, "base64");
  const key = keyBytes();
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const pt = Buffer.concat([decipher.update(ct), decipher.final()]);
  return pt.toString("utf8");
}

