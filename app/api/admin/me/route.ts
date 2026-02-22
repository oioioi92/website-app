import { NextRequest, NextResponse } from "next/server";
import { getAdminUserFromRequest } from "@/lib/auth";
import {
  canApproveDeposit,
  canApproveWithdrawal,
  canBurnTransaction,
  canManualCreateDeposit,
  canEnterPlayerWallet,
  canAssignWithdrawal
} from "@/lib/rbac";

export async function GET(req: NextRequest) {
  const user = await getAdminUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ user: null, permissions: null }, { status: 200 });
  }

  const permissions = {
    canApproveDeposit: canApproveDeposit(user),
    canApproveWithdrawal: canApproveWithdrawal(user),
    canBurnTransaction: canBurnTransaction(user),
    canManualCreateDeposit: canManualCreateDeposit(user),
    canEnterPlayerWallet: canEnterPlayerWallet(user),
    canAssignWithdrawal: canAssignWithdrawal(user)
  };

  return NextResponse.json({
    user: { id: user.id, email: user.email, role: user.role },
    permissions
  });
}
