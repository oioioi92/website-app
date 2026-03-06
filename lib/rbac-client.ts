/**
 * Client-side RBAC: 根据角色与权限 key 判断是否可访问。
 * 与 lib/rbac.ts 服务端逻辑对应，供 Settings 导航、ReportCenter 等前端过滤用。
 */

const ROLES = {
  manage_admins: ["admin"],
  edit_content: ["admin", "editor", "content_admin", "super"],
  settings: ["admin", "super", "finance", "ops"],
  approve: ["admin", "super", "finance", "ops"],
  view: ["admin", "super", "editor", "viewer", "finance", "ops", "content_admin"],
} as const;

export type PermissionKey = keyof typeof ROLES;

function hasRole(role: string, allowed: readonly string[]): boolean {
  const r = String(role ?? "").trim().toLowerCase();
  return (allowed as readonly string[]).includes(r);
}

/**
 * @param role 当前用户角色（来自 useAdminUser().role）
 * @param permission 权限 key：settings | manage_admins | edit_content | view | approve
 */
export function can(role: string | null | undefined, permission: string | null | undefined): boolean {
  if (!role || !permission) return false;
  const key = permission.trim().toLowerCase() as PermissionKey;
  const allowed = ROLES[key];
  if (!allowed) return false;
  return hasRole(role, allowed);
}
