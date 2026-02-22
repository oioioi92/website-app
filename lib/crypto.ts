import crypto from "crypto";

export function sha256(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export function randomToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("hex");
}

export function hmac(input: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(input).digest("hex");
}
