import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const MAX_DEPTH = 10;
const DEFAULT_DEPTH = 5;

export type ReferralTreeNode = {
  id: string;
  userRef: string;
  displayName: string | null;
  referralCode: string | null;
  depositCount: number;
  withdrawCount: number;
  childCount: number;
  children: ReferralTreeNode[];
};

async function buildNode(memberId: string, depth: number, maxDepth: number): Promise<ReferralTreeNode | null> {
  if (depth > maxDepth) return null;
  const member = await db.member.findUnique({
    where: { id: memberId },
    include: {
      referrals: {
        select: {
          id: true,
          userRef: true,
          displayName: true,
          referralCode: true,
          depositCount: true,
          withdrawCount: true,
        },
      },
    },
  });
  if (!member) return null;

  const children: ReferralTreeNode[] = [];
  for (const ref of member.referrals) {
    const child = await buildNode(ref.id, depth + 1, maxDepth);
    if (child) children.push(child);
    else
      children.push({
        id: ref.id,
        userRef: ref.userRef,
        displayName: ref.displayName,
        referralCode: ref.referralCode,
        depositCount: ref.depositCount,
        withdrawCount: ref.withdrawCount,
        childCount: 0,
        children: [],
      });
  }

  return {
    id: member.id,
    userRef: member.userRef,
    displayName: member.displayName,
    referralCode: member.referralCode,
    depositCount: member.depositCount,
    withdrawCount: member.withdrawCount,
    childCount: children.length,
    children,
  };
}

export async function GET(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const sp = req.nextUrl.searchParams;
  const rootId = sp.get("rootId")?.trim() || null;
  const maxDepth = Math.min(MAX_DEPTH, Math.max(1, parseInt(sp.get("maxDepth") ?? String(DEFAULT_DEPTH), 10) || DEFAULT_DEPTH));

  if (rootId) {
    const node = await buildNode(rootId, 0, maxDepth);
    if (!node) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    return NextResponse.json({ roots: [node] });
  }

  const roots = await db.member.findMany({
    where: { referrals: { some: {} } },
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });

  const tree: ReferralTreeNode[] = [];
  for (const r of roots) {
    const node = await buildNode(r.id, 0, maxDepth);
    if (node) tree.push(node);
  }

  return NextResponse.json({ roots: tree });
}
