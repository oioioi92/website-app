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

/** 仅查看：报表、流水、玩家等（不包含编辑、审批、管理管理员） */
export function canViewOnly(user: AdminUser): boolean {
  return hasRole(user, ["viewer"]);
}

/** 设置类接口：银行、支付网关、推荐、域名、入款规则等，admin/super/finance/ops 可访问 */
export function canAccessSettings(user: AdminUser): boolean {
  return hasRole(user, BACKOFFICE_ROLES);
}

/** Security 敏感接口：IP 白名单、登录历史、活动日志等，仅 admin 可访问 */
export function canAccessSecuritySettings(user: AdminUser): boolean {
  return hasRole(user, ["admin"]);
}
