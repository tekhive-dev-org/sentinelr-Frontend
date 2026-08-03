import { useCallback, useMemo } from "react";
import { useAdminAuth } from "../context/AuthContext";
import {
  hasAdminClaim,
  hasAllPermissions,
  hasAnyPermission,
  hasPermission,
  isVerifiedAdmin,
} from "../utils/authorization";

export default function useAuthorization({
  permissions = [],
  requireAll = true,
} = {}) {
  const {
    adminUser,
    isLoading,
    isSessionVerified,
    sessionError,
    refreshSession,
  } = useAdminAuth();

  const requiredPermissions = useMemo(
    () => (Array.isArray(permissions) ? permissions : [permissions]).filter(Boolean),
    [permissions],
  );

  const isAuthorized = useMemo(() => {
    if (!isSessionVerified || !adminUser || !hasAdminClaim(adminUser)) return false;
    return requireAll
      ? hasAllPermissions(adminUser, requiredPermissions)
      : hasAnyPermission(adminUser, requiredPermissions);
  }, [isSessionVerified, requireAll, requiredPermissions, adminUser]);

  const can = useCallback(
    (permission) => Boolean(isSessionVerified && adminUser && hasPermission(adminUser, permission)),
    [isSessionVerified, adminUser],
  );

  return {
    adminUser,
    isLoading,
    isAuthenticated: Boolean(adminUser),
    isSessionVerified,
    isAdmin: isVerifiedAdmin(adminUser, isSessionVerified),
    hasAdminClaim: hasAdminClaim(adminUser),
    isAuthorized,
    sessionError,
    retrySessionVerification: refreshSession,
    can,
  };
}
