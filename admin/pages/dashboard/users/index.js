import { useCallback, useState } from "react";
import { useRouter } from "next/router";
import AdminRouteGuard from "../../../components/shared/AdminRouteGuard";
import AdminLayout from "../../../components/layout/AdminLayout";
import { ADMIN_PERMISSIONS } from "../../../constants/permissions";
import useUsers from "../../../hooks/useUsers";
import UsersToolbar from "../../../components/users/UsersToolbar";
import UsersTable from "../../../components/users/UsersTable";
import UsersMobileCards from "../../../components/users/UsersMobileCards";
import UsersPagination from "../../../components/users/UsersPagination";
import { ConfirmActionModal } from "../../../components/users";
import { adminUsersService } from "../../../services/adminUsersService";
import styles from "./users.module.css";

export default function UsersPage() {
  const router = useRouter();
  const {
    users,
    totalUsers,
    totalPages,
    isLoading,
    error,
    page,
    search,
    filters,
    sortBy,
    sortOrder,
    selectedIds,
    setPage,
    setSearch,
    setFilter,
    setSort,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    retry,
  } = useUsers();

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmLabel: "",
    isDanger: false,
    requireReason: false,
    onConfirm: null,
  });
  const [actionLoading, setActionLoading] = useState(null);

  const openConfirm = ({ title, message, confirmLabel, isDanger, requireReason, onConfirm }) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      confirmLabel,
      isDanger: !!isDanger,
      requireReason: !!requireReason,
      onConfirm,
    });
  };

  const closeConfirm = () => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
  };

  const performAction = useCallback(async (actionName, actionFn) => {
    setActionLoading(actionName);
    try {
      await actionFn();
      retry();
    } catch (err) {
      alert(err.message || `Action ${actionName} failed`);
    } finally {
      setActionLoading(null);
      closeConfirm();
    }
  }, [retry]);

  const handleUserClick = useCallback(
    (user) => {
      if (user.action) {
        if (user.action === "block") {
          openConfirm({
            title: "Block user",
            message: `Block ${user.name || "this user"}? They will lose access to all Sentinelr services.`,
            confirmLabel: "Block user",
            isDanger: true,
            requireReason: true,
            onConfirm: ({ reason }) => performAction("blockUser", () => adminUsersService.blockUser(user.id, reason)),
          });
        } else if (user.action === "unblock") {
          openConfirm({
            title: "Unblock user",
            message: `Restore access for ${user.name || "this user"}?`,
            confirmLabel: "Unblock user",
            requireReason: true,
            onConfirm: ({ reason }) => performAction("unblockUser", () => adminUsersService.unblockUser(user.id, reason)),
          });
        } else if (user.action === "verify") {
          openConfirm({
            title: "Verify account",
            message: `Mark ${user.name || "this account"} as verified?`,
            confirmLabel: "Verify account",
            onConfirm: () => performAction("verifyUser", () => adminUsersService.verifyUser(user.id)),
          });
        }
      } else {
        router.push(`/dashboard/users/${user.id}`);
      }
    },
    [router, performAction],
  );

  const handleExport = useCallback(() => {
    router.push({
      pathname: "/dashboard/users",
      query: { ...router.query, export: "selected" },
    });
  }, [router]);

  const selectedCount = selectedIds.size;

  return (
    <AdminRouteGuard permissions={[ADMIN_PERMISSIONS.USERS_VIEW]}>
      <AdminLayout>
        <div className={styles.page}>
          <div className={styles.pageHeader}>
            <div>
              <h1 className={styles.title}>Users &amp; Families</h1>
              <p className={styles.subtitle}>
                Manage accounts, verify users, and monitor platform activity
              </p>
            </div>
          </div>

          <UsersToolbar
            search={search}
            onSearchChange={setSearch}
            filters={filters}
            onFilterChange={setFilter}
            selectedCount={selectedCount}
            onExport={handleExport}
            totalUsers={totalUsers}
          />

          <div className={styles.tableSection}>
            <UsersTable
              users={users}
              isLoading={isLoading}
              error={error}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect}
              onToggleSelectAll={toggleSelectAll}
              onSort={setSort}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onUserClick={handleUserClick}
            />

            <UsersMobileCards
              users={users}
              isLoading={isLoading}
              error={error}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect}
              onUserClick={handleUserClick}
            />
          </div>

          <UsersPagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
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
