import { useState, useEffect, useCallback } from "react";
import { adminUsersService } from "../services/adminUsersService";

export default function useUserDetail() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchUser = useCallback(async (userId) => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await adminUsersService.getUserDetail(userId);
      setUser(response.user ?? response);
    } catch (err) {
      setError(err.message || "Failed to fetch user details");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Generic action runner that manages loading state and refetches on success
  const performAction = useCallback(
    async (actionName, actionFn) => {
      setActionLoading(actionName);
      setError(null);

      try {
        await actionFn();
        // Refetch the user to get the latest state after the action
        if (user?.id) {
          await fetchUser(user.id);
        }
      } catch (err) {
        setError(err.message || `Failed to ${actionName}`);
        throw err;
      } finally {
        setActionLoading(null);
      }
    },
    [fetchUser, user?.id],
  );

  // --- Concrete actions ---

  const blockUser = useCallback(
    (id, reason) => {
      return performAction("blockUser", () =>
        adminUsersService.blockUser(id, reason),
      );
    },
    [performAction],
  );

  const unblockUser = useCallback(
    (id, reason) => {
      return performAction("unblockUser", () =>
        adminUsersService.unblockUser(id, reason),
      );
    },
    [performAction],
  );

  const verifyUser = useCallback(
    (id) => {
      return performAction("verifyUser", () =>
        adminUsersService.verifyUser(id),
      );
    },
    [performAction],
  );

  const rejectUser = useCallback(
    (id, reason) => {
      return performAction("rejectUser", () =>
        adminUsersService.rejectUser(id, reason),
      );
    },
    [performAction],
  );

  const suspendUser = useCallback(
    (id, { reason, durationDays }) => {
      return performAction("suspendUser", () =>
        adminUsersService.suspendUser(id, { reason, durationDays }),
      );
    },
    [performAction],
  );

  const restoreUser = useCallback(
    (id) => {
      return performAction("restoreUser", () =>
        adminUsersService.restoreUser(id),
      );
    },
    [performAction],
  );

  const forceLogout = useCallback(
    (id) => {
      return performAction("forceLogout", () =>
        adminUsersService.forceLogout(id),
      );
    },
    [performAction],
  );

  const initiatePasswordReset = useCallback(
    (id) => {
      return performAction("initiatePasswordReset", () =>
        adminUsersService.initiatePasswordReset(id),
      );
    },
    [performAction],
  );

  const addNote = useCallback(
    (id, note) => {
      return performAction("addNote", () =>
        adminUsersService.addAdminNote(id, note),
      );
    },
    [performAction],
  );

  const changeAccountType = useCallback(
    (id, type) => {
      return performAction("changeAccountType", () =>
        adminUsersService.changeAccountType(id, type),
      );
    },
    [performAction],
  );

  const removeFromFamily = useCallback(
    (id, familyId) => {
      return performAction("removeFromFamily", () =>
        adminUsersService.removeFromFamily(id, familyId),
      );
    },
    [performAction],
  );

  const exportData = useCallback(
    (id) => {
      return performAction("exportData", () =>
        adminUsersService.exportUserData(id),
      );
    },
    [performAction],
  );

  const initiateDeletion = useCallback(
    (id, reason) => {
      return performAction("initiateDeletion", () =>
        adminUsersService.initiateAccountDeletion(id, reason),
      );
    },
    [performAction],
  );

  return {
    user,
    isLoading,
    error,
    actionLoading,
    fetchUser,
    blockUser,
    unblockUser,
    verifyUser,
    rejectUser,
    suspendUser,
    restoreUser,
    forceLogout,
    initiatePasswordReset,
    addNote,
    changeAccountType,
    removeFromFamily,
    exportData,
    initiateDeletion,
  };
}
