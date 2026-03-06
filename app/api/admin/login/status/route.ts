import { NextRequest, NextResponse } from "next/server";
import { getAdminSessionFromRequest } from "@/lib/auth";

/** Returns login status: when cookie has a session that is pending TOTP, returns requiresTotp + email so login page can show 2FA step. */
export async function GET(req: NextRequest) {
  const s = await getAdminSessionFromRequest(req);
  if (!s) {
    return NextResponse.json({ requiresTotp: false });
  }
  if (s.session.totpOk || !s.user.totpEnabled) {
    return NextResponse.json({ requiresTotp: false, loggedIn: true });
  }
  return NextResponse.json({ requiresTotp: true, email: s.user.email });
}
