import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getAdminUserFromRequest } from "@/lib/auth";
import { canManageAdmins } from "@/lib/rbac";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export type AdminUserRow = {
  id: string;
  email: string;
  role: string;
  createdAt: string;
};

export async function GET(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!canManageAdmins(user)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  const list = await db.adminUser.findMany({
    select: { id: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  const rows: AdminUserRow[] = list.map((u) => ({
    id: u.id,
    email: u.email,
    role: u.role,
    createdAt: u.createdAt.toISOString(),
  }));
  return NextResponse.json({ items: rows });
}

export async function POST(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  if (!canManageAdmins(user)) return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });

  let body: { email?: string; password?: string; role?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const role = typeof body.role === "string" ? body.role.trim() || "admin" : "admin";

  if (!email || !password) {
    return NextResponse.json({ error: "EMAIL_AND_PASSWORD_REQUIRED" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "PASSWORD_TOO_SHORT" }, { status: 400 });
  }

  const existing = await db.adminUser.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "EMAIL_ALREADY_EXISTS" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const created = await db.adminUser.create({
    data: { email, passwordHash, role },
    select: { id: true, email: true, role: true, createdAt: true },
  });
  return NextResponse.json({
    ok: true,
    user: {
      id: created.id,
      email: created.email,
      role: created.role,
      createdAt: created.createdAt.toISOString(),
    },
  });
}
