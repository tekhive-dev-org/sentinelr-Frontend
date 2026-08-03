import { useCallback } from "react";
import { useRouter } from "next/router";
import AdminRouteGuard from "../../../components/shared/AdminRouteGuard";
import AdminLayout from "../../../components/layout/AdminLayout";
import { ADMIN_PERMISSIONS } from "../../../constants/permissions";
import useNotifications from "../../../hooks/useNotifications";
import NotificationToolbar from "../../../components/notifications/NotificationToolbar";
import NotificationTable from "../../../components/notifications/NotificationTable";
import NotificationMobileCards from "../../../components/notifications/NotificationMobileCards";
import UsersPagination from "../../../components/users/UsersPagination";
import styles from "./notifications.module.css";

export default function NotificationsPage() {
  const router = useRouter();
  const { campaigns, total, totalPages, isLoading, error, page, search, channel, status, sortBy, sortOrder, setPage, setSearch, setFilter, setSort, retry } = useNotifications();
  const handleClick = useCallback((c) => router.push(`/dashboard/notifications/${c.id}`), [router]);

  return (
    <AdminRouteGuard permissions={[ADMIN_PERMISSIONS.NOTIFICATIONS_VIEW]}>
      <AdminLayout>
        <div className={styles.page}>
          <div className={styles.pageHeader}><div><h1 className={styles.title}>Notification Campaigns</h1><p className={styles.subtitle}>In-app, push, and email notifications with audience targeting</p></div></div>
          <NotificationToolbar search={search} onSearchChange={setSearch} filters={{ channel, status }} onFilterChange={setFilter} />
          <div className={styles.tableSection}>
            <NotificationTable campaigns={campaigns} isLoading={isLoading} error={error} onSort={setSort} sortBy={sortBy} sortOrder={sortOrder} onCampaignClick={handleClick} />
            <NotificationMobileCards campaigns={campaigns} isLoading={isLoading} error={error} onCampaignClick={handleClick} />
          </div>
          <UsersPagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </AdminLayout>
    </AdminRouteGuard>
  );
}
