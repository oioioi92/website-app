import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const SESSION_COOKIE = "member_ref";

export async function GET(req: NextRequest) {
  const userRef = req.cookies.get(SESSION_COOKIE)?.value;
  if (!userRef) return NextResponse.json({ error: "UNAUTHORIZED", referrals: [] }, { status: 401 });

  const member = await db.member.findUnique({
    where: { userRef },
    select: { id: true },
  });
  if (!member) return NextResponse.json({ error: "UNAUTHORIZED", referrals: [] }, { status: 401 });

  const referrals = await db.member.findMany({
    where: { referrerId: member.id },
    select: {
      id: true,
      userRef: true,
      displayName: true,
      referralCode: true,
      depositCount: true,
      withdrawCount: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ referrals });
}
