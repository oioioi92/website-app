import { randomToken } from "@/lib/crypto";

export function generateTxId(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `D${date}${randomToken(8)}`;
}

export function generateWdId(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `W${date}${randomToken(8)}`;
}
