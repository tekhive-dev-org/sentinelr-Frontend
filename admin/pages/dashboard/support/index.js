import { useCallback } from "react";
import { useRouter } from "next/router";
import AdminRouteGuard from "../../../components/shared/AdminRouteGuard";
import AdminLayout from "../../../components/layout/AdminLayout";
import { ADMIN_PERMISSIONS } from "../../../constants/permissions";
import useSupport from "../../../hooks/useSupport";
import SupportStats from "../../../components/support/SupportStats";
import SupportToolbar from "../../../components/support/SupportToolbar";
import SupportTable from "../../../components/support/SupportTable";
import SupportMobileCards from "../../../components/support/SupportMobileCards";
import FeedbackList from "../../../components/support/FeedbackList";
import UsersPagination from "../../../components/users/UsersPagination";
import styles from "../geofencing/geofencing.module.css";

export default function SupportPage() {
  const router = useRouter();
  const { tickets, total, totalPages, isLoading, error, page, search, status, category, priority, stats, feedback, setPage, setSearch, setFilter, retry } = useSupport();
  const handleClick = useCallback((t) => router.push(`/dashboard/support/${t.id}`), [router]);

  return (
    <AdminRouteGuard permissions={[ADMIN_PERMISSIONS.SUPPORT_VIEW]}>
      <AdminLayout>
        <div className={styles.page}>
          <div className={styles.pageHeader}><div><h1 className={styles.title}>Support &amp; Feedback</h1><p className={styles.subtitle}>User tickets and community feedback</p></div></div>
          <SupportStats stats={stats} isLoading={isLoading} />
          <SupportToolbar search={search} onSearchChange={setSearch} filters={{ status, category, priority }} onFilterChange={setFilter} />
          <div className={styles.tableSection}>
            <SupportTable tickets={tickets} isLoading={isLoading} error={error} onTicketClick={handleClick} />
            <SupportMobileCards tickets={tickets} isLoading={isLoading} error={error} onTicketClick={handleClick} />
          </div>
          <UsersPagination page={page} totalPages={totalPages} onPageChange={setPage} />
          <FeedbackList items={feedback} isLoading={isLoading} />
        </div>
      </AdminLayout>
    </AdminRouteGuard>
  );
}
