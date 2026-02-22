import jwt from "jsonwebtoken";
import { config } from "./config.js";

export type AdminJwtClaims = {
  sub: string;
  email?: string;
  role?: string;
  jti?: string;
  iat?: number;
  exp?: number;
};

export function verifyAdminJwt(token: string): AdminJwtClaims | null {
  try {
    const decoded = jwt.verify(token, config.adminJwtSecret, { algorithms: ["HS256"] });
    if (!decoded || typeof decoded !== "object") return null;
    const claims = decoded as AdminJwtClaims;
    if (!claims.sub || typeof claims.sub !== "string") return null;
    return claims;
  } catch {
    return null;
  }
}

