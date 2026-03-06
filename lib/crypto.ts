import crypto from "crypto";

const IV_LENGTH = 16;
const KEY_LEN = 32;

export function sha256(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export function randomToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("hex");
}

export function hmac(input: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(input).digest("hex");
}

/** Derive a key from SESSION_SECRET for TOTP secret encryption */
function getTotpEncryptionKey(): Buffer {
  const raw = process.env.SESSION_SECRET?.trim() || "dev-totp-encryption-key";
  return crypto.createHash("sha256").update(raw).digest();
}

/** Encrypt TOTP secret for DB storage */
export function encryptTotpSecret(plainSecret: string): string {
  const key = getTotpEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  const enc = Buffer.concat([cipher.update(plainSecret, "utf8"), cipher.final()]);
  return iv.toString("hex") + ":" + enc.toString("hex");
}

/** Decrypt TOTP secret from DB */
export function decryptTotpSecret(encrypted: string): string {
  const key = getTotpEncryptionKey();
  const [ivHex, dataHex] = encrypted.split(":");
  if (!ivHex || !dataHex) throw new Error("Invalid encrypted TOTP secret");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  return Buffer.concat([decipher.update(Buffer.from(dataHex, "hex")), decipher.final()]).toString("utf8");
}
