import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import AdminRouteGuard from "../../../components/shared/AdminRouteGuard";
import AdminLayout from "../../../components/layout/AdminLayout";
import { ADMIN_PERMISSIONS } from "../../../constants/permissions";
import { useAdminAuth } from "../../../context/AuthContext";
import { adminUsersService } from "../../../services/adminUsersService";
import {
  UserDetailProfile,
  UserDetailStatus,
  UserDetailFamily,
  UserDetailDevices,
  UserDetailSubscription,
  UserDetailActivity,
  UserDetailSOS,
  UserDetailGeofences,
  UserDetailParental,
  UserDetailSecurity,
  UserDetailNotes,
  UserActions,
  ConfirmActionModal,
} from "../../../components/users";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import styles from "./detail.module.css";

export default function UserDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const { adminUser } = useAdminAuth();
  const currentAdminId = adminUser?.id || null;

  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmLabel: "",
    isDanger: false,
    requireReason: false,
    onConfirm: null,
  });

  const fetchUser = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await adminUsersService.getUserDetail(id);
      setUser(data?.user || data);
    } catch (err) {
      setError(err.message || "Failed to load user details");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const performAction = async (actionName, actionFn) => {
    setActionLoading(actionName);
    try {
      await actionFn();
      await fetchUser();
    } catch (err) {
      setError(err.message || `Action ${actionName} failed`);
    } finally {
      setActionLoading(null);
    }
  };

  const openConfirm = ({ title, message, confirmLabel, isDanger, requireReason, onConfirm }) => {
    setConfirmModal({ isOpen: true, title, message, confirmLabel, isDanger: !!isDanger, requireReason: !!requireReason, onConfirm });
  };

  const closeConfirm = () => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handleAction = (actionName, args = {}) => {
    if (actionName === "blockUser") {
      openConfirm({
        title: "Block user",
        message: `Block ${user?.userName || user?.name || "this user"}? They will lose access to all Sentinelr services.`,
        confirmLabel: "Block user",
        isDanger: true,
        requireReason: true,
        onConfirm: ({ reason }) => performAction("blockUser", () => adminUsersService.blockUser(id, reason)),
      });
    } else if (actionName === "unblockUser") {
      openConfirm({
        title: "Unblock user",
        message: `Restore access for ${user?.userName || user?.name || "this user"}?`,
        confirmLabel: "Unblock user",
        requireReason: true,
        onConfirm: ({ reason }) => performAction("unblockUser", () => adminUsersService.unblockUser(id, reason)),
      });
    } else if (actionName === "verifyUser") {
      openConfirm({
        title: "Verify account",
        message: `Mark ${user?.userName || user?.name || "this account"} as verified?`,
        confirmLabel: "Verify account",
        onConfirm: () => performAction("verifyUser", () => adminUsersService.verifyUser(id)),
      });
    } else if (actionName === "rejectUser") {
      openConfirm({
        title: "Reject verification",
        message: `Reject the verification status for ${user?.userName || user?.name || "this user"}?`,
        confirmLabel: "Reject verification",
        isDanger: true,
        requireReason: true,
        onConfirm: ({ reason }) => performAction("rejectUser", () => adminUsersService.rejectUser(id, reason)),
      });
    } else if (actionName === "suspendUser") {
      openConfirm({
        title: "Suspend account",
        message: `Suspend ${user?.userName || user?.name || "this account"} for a specified period?`,
        confirmLabel: "Suspend account",
        isDanger: true,
        requireReason: true,
        onConfirm: ({ reason }) => performAction("suspendUser", () => adminUsersService.suspendUser(id, { reason, durationDays: args.durationDays || 30 })),
      });
    } else if (actionName === "restoreUser") {
      openConfirm({
        title: "Restore account",
        message: `Restore ${user?.userName || user?.name || "this account"} to active status?`,
        confirmLabel: "Restore account",
        onConfirm: () => performAction("restoreUser", () => adminUsersService.restoreUser(id)),
      });
    } else if (actionName === "forceLogout") {
      openConfirm({
        title: "Force logout",
        message: `End all active sessions for ${user?.userName || user?.name || "this user"}? They will need to sign in again.`,
        confirmLabel: "Force logout",
        isDanger: true,
        onConfirm: () => performAction("forceLogout", () => adminUsersService.forceLogout(id)),
      });
    } else if (actionName === "initiatePasswordReset") {
      openConfirm({
        title: "Initiate password reset",
        message: `Send a password reset link to ${user?.email || "this user"}?`,
        confirmLabel: "Send reset link",
        onConfirm: () => performAction("initiatePasswordReset", () => adminUsersService.initiatePasswordReset(id)),
      });
    } else if (actionName === "addNote") {
      openConfirm({
        title: "Add internal note",
        message: "This note is only visible to administrators.",
        confirmLabel: "Add note",
        requireReason: true,
        onConfirm: ({ reason }) => performAction("addNote", () => adminUsersService.addAdminNote(id, reason)),
      });
    } else if (actionName === "changeAccountType") {
      openConfirm({
        title: "Change account type",
        message: `Change the account classification for ${user?.userName || user?.name || "this user"}?`,
        confirmLabel: "Change type",
        requireReason: true,
        onConfirm: ({ reason }) => performAction("changeAccountType", () => adminUsersService.changeAccountType(id, args.newType)),
      });
    } else if (actionName === "initiateDeletion") {
      openConfirm({
        title: "Initiate account deletion",
        message: `Begin the safe deletion workflow for ${user?.userName || user?.name || "this account"}? This action cannot be easily reversed.`,
        confirmLabel: "Initiate deletion",
        isDanger: true,
        requireReason: true,
        onConfirm: ({ reason }) => performAction("initiateDeletion", () => adminUsersService.initiateAccountDeletion(id, reason)),
      });
    }
  };

  if (isLoading) {
    return (
      <AdminRouteGuard permissions={[ADMIN_PERMISSIONS.USERS_VIEW]}>
        <AdminLayout>
          <div className={styles.loadingPage}>
            <div className={styles.loadingSpinner} aria-label="Loading user details" />
          </div>
        </AdminLayout>
      </AdminRouteGuard>
    );
  }

  if (error && !user) {
    return (
      <AdminRouteGuard permissions={[ADMIN_PERMISSIONS.USERS_VIEW]}>
        <AdminLayout>
          <div className={styles.errorCard}>
            <ErrorOutlineIcon className={styles.errorIcon} />
            <h2 className={styles.errorTitle}>Failed to load user</h2>
            <p className={styles.errorMessage}>{error}</p>
            <button type="button" className={styles.retryButton} onClick={fetchUser}>
              Retry
            </button>
          </div>
        </AdminLayout>
      </AdminRouteGuard>
    );
  }

  return (
    <AdminRouteGuard permissions={[ADMIN_PERMISSIONS.USERS_VIEW]}>
      <AdminLayout>
        <div className={styles.page}>
          <button
            type="button"
            className={styles.backLink}
            onClick={() => router.push("/dashboard/users")}
          >
            <ArrowBackOutlinedIcon className={styles.backIcon} />
            Back to users
          </button>

          <div className={styles.profileHeader}>
            <UserDetailProfile user={user} isLoading={false} />
            <UserDetailStatus user={user} isLoading={false} />
          </div>

          <UserActions
            user={user}
            currentAdminId={currentAdminId}
            onAction={handleAction}
            isActionLoading={actionLoading}
          />

          <div className={styles.grid}>
            <UserDetailFamily families={user?.families || null} isLoading={false} />
            <UserDetailDevices devices={user?.devices || null} isLoading={false} />
            <UserDetailSubscription subscription={user?.subscription || null} isLoading={false} />
            <UserDetailActivity activities={user?.recentActivity || null} isLoading={false} />
            <UserDetailSOS incidents={user?.sosIncidents || null} isLoading={false} />
            <UserDetailGeofences geofences={user?.geofences || null} isLoading={false} />
            <UserDetailParental controls={user?.parentalControls || null} isLoading={false} />
            <UserDetailSecurity events={user?.securityEvents || null} isLoading={false} />
          </div>

          <UserDetailNotes
            notes={user?.adminNotes || null}
            isLoading={false}
            onAddNote={(note) => performAction("addNote", () => adminUsersService.addAdminNote(id, note))}
            isAddingNote={actionLoading === "addNote"}
          />

          <ConfirmActionModal
            isOpen={confirmModal.isOpen}
            title={confirmModal.title}
            message={confirmModal.message}
            confirmLabel={confirmModal.confirmLabel}
            isDanger={confirmModal.isDanger}
            requireReason={confirmModal.requireReason}
            onConfirm={confirmModal.onConfirm}
            onCancel={closeConfirm}
            isLoading={!!actionLoading}
          />
        </div>
      </AdminLayout>
    </AdminRouteGuard>
  );
}
