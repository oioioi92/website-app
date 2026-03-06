import { generateSecret, verify, generateURI } from "otplib";

const ISSUER = "Admin";

export function totpGenerateSecret(): string {
  return generateSecret();
}

export async function totpVerify(secret: string, token: string): Promise<boolean> {
  const t = (token || "").replace(/\s/g, "");
  if (!/^\d{6}$/.test(t)) return false;
  const result = await verify({ secret, token: t });
  return (result as { valid?: boolean }).valid === true;
}

export function totpUri(secret: string, label: string): string {
  return generateURI({
    issuer: ISSUER,
    label: label.replace(/^https?:\/\//i, "").split("/")[0] || "Admin",
    secret,
  });
}
