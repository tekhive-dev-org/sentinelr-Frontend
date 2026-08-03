import {
  ADMIN_PERMISSIONS,
  ADMIN_ROLE_PERMISSIONS,
  ADMIN_ROLES,
} from "../constants/permissions";

const ADMIN_ROLE_VALUES = new Set(Object.values(ADMIN_ROLES));
const ADMIN_PERMISSION_VALUES = new Set(Object.values(ADMIN_PERMISSIONS));

export function normalizeRole(role) {
  if (typeof role !== "string") return "";
  return role.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

function normalizePermission(permission) {
  if (typeof permission === "string") return permission.trim().toLowerCase();
  if (!permission || typeof permission !== "object") return "";
  return String(permission.name || permission.key || permission.code || "")
    .trim()
    .toLowerCase();
}

export function getUserRoles(user) {
  const roleSource = user?.roles || user?.adminProfile?.roles;
  const source = Array.isArray(roleSource)
    ? roleSource
    : [user?.role || user?.adminProfile?.role];
  return [...new Set(source.map((role) => normalizeRole(role?.name || role)).filter(Boolean))];
}

export function getExplicitPermissions(user) {
  const source =
    user?.permissions ||
    user?.adminProfile?.permissions ||
    user?.authorities ||
    user?.permission ||
    [];
  const permissions = Array.isArray(source) ? source : [source];
  return [...new Set(permissions.map(normalizePermission).filter(Boolean))];
}

export function getEffectivePermissions(user) {
  const permissions = new Set(getExplicitPermissions(user));
  getUserRoles(user).forEach((role) => {
    (ADMIN_ROLE_PERMISSIONS[role] || []).forEach((permission) => permissions.add(permission));
  });
  return [...permissions];
}

export function hasAdminClaim(user) {
  const hasAdminRole = getUserRoles(user).some((role) => ADMIN_ROLE_VALUES.has(role));
  const hasAdminPermission = getExplicitPermissions(user).some(
    (permission) => permission === "*" || ADMIN_PERMISSION_VALUES.has(permission),
  );
  return hasAdminRole || hasAdminPermission;
}

export function hasPermission(user, requiredPermission) {
  if (!requiredPermission) return true;
  const permissions = getEffectivePermissions(user);
  return permissions.includes("*") || permissions.includes(normalizePermission(requiredPermission));
}

export function hasAnyPermission(user, requiredPermissions = []) {
  if (!requiredPermissions.length) return true;
  return requiredPermissions.some((permission) => hasPermission(user, permission));
}

export function hasAllPermissions(user, requiredPermissions = []) {
  return requiredPermissions.every((permission) => hasPermission(user, permission));
}

export function isVerifiedAdmin(user, isSessionVerified) {
  return Boolean(isSessionVerified && user && hasAdminClaim(user));
}
