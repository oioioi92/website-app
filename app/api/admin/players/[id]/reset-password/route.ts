import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getAdminUserFromRequest } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

function randomTempPassword(): string {
  const n = Math.floor(Math.random() * 1_000_000);
  return String(n).padStart(6, "0");
}

/** 重置会员临时密码，返回话术供后台复制后通过 WhatsApp 发给用户 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAdminUserFromRequest(_req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const { id: memberId } = await params;
  const member = await db.member.findUnique({
    where: { id: memberId },
    select: { id: true, userRef: true }
  });
  if (!member)
    return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  const tempPassword = randomTempPassword();
  const passwordHash = await bcrypt.hash(tempPassword, 10);

  await db.member.update({
    where: { id: memberId },
    data: { passwordHash, mustChangePassword: true }
  });

  const messageText = `您的登录 ID：${member.userRef}\n临时密码：${tempPassword}\n请登录后尽快修改密码。`;

  return NextResponse.json({
    ok: true,
    userRef: member.userRef,
    tempPassword,
    messageText
  });
}
