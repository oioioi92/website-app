import type { AdminUser } from "@prisma/client";

function hasRole(user: AdminUser, allowed: string[]): boolean {
  const role = String(user.role ?? "").trim().toLowerCase();
  return allowed.includes(role);
}

export function canManageAdmins(user: AdminUser): boolean {
  return hasRole(user, ["admin"]);
}

export function canEditContent(user: AdminUser): boolean {
  // Backward compatible roles + stricter roles we may introduce later.
  return hasRole(user, ["admin", "editor", "content_admin", "super"]);
}

export function canEditSiteTheme(user: AdminUser): boolean {
  return hasRole(user, ["admin", "editor", "content_admin", "super"]);
}

// Backoffice: deposit/withdrawal approve, burn, manual create, wallet entry
const BACKOFFICE_ROLES = ["admin", "super", "finance", "ops"];

export function canApproveDeposit(user: AdminUser): boolean {
  return hasRole(user, BACKOFFICE_ROLES);
}

export function canApproveWithdrawal(user: AdminUser): boolean {
  return hasRole(user, BACKOFFICE_ROLES);
}

export function canBurnTransaction(user: AdminUser): boolean {
  return hasRole(user, BACKOFFICE_ROLES);
}

export function canManualCreateDeposit(user: AdminUser): boolean {
  return hasRole(user, BACKOFFICE_ROLES);
}

export function canEnterPlayerWallet(user: AdminUser): boolean {
  return hasRole(user, BACKOFFICE_ROLES);
}

export function canAssignWithdrawal(user: AdminUser): boolean {
  return hasRole(user, BACKOFFICE_ROLES);
}
