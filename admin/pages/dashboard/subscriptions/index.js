import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import AdminRouteGuard from "../../../components/shared/AdminRouteGuard";
import AdminLayout from "../../../components/layout/AdminLayout";
import { ADMIN_PERMISSIONS } from "../../../constants/permissions";
import { useAdminAuth } from "../../../context/AuthContext";
import useSubscriptions from "../../../hooks/useSubscriptions";
import { adminSubscriptionsService } from "../../../services/adminSubscriptionsService";
import SubscriptionStats from "../../../components/subscriptions/SubscriptionStats";
import SubscriptionsToolbar from "../../../components/subscriptions/SubscriptionsToolbar";
import SubscriptionsTable from "../../../components/subscriptions/SubscriptionsTable";
import SubscriptionsMobileCards from "../../../components/subscriptions/SubscriptionsMobileCards";
import UsersPagination from "../../../components/users/UsersPagination";
import styles from "./subscriptions.module.css";

export default function SubscriptionsPage() {
  const router = useRouter();
  const { adminUser } = useAdminAuth();
  const canManage = adminUser?.permissions?.includes(ADMIN_PERMISSIONS.SUBSCRIPTIONS_MANAGE) || false;

  const {
    subscriptions, totalSubscriptions, totalPages, isLoading, error,
    page, search, status, plan, billingPeriod, sortBy, sortOrder,
    setPage, setSearch, setFilter, setSort, retry,
  } = useSubscriptions();

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    adminSubscriptionsService.getSubscriptionStats()
      .then(setStats).catch(() => setStats(null)).finally(() => setStatsLoading(false));
  }, []);

  const handleClick = useCallback((sub) => { router.push(`/dashboard/subscriptions/${sub.id}`); }, [router]);
  const filters = { status, plan, billingPeriod };

  return (
    <AdminRouteGuard permissions={[ADMIN_PERMISSIONS.SUBSCRIPTIONS_VIEW]}>
      <AdminLayout>
        <div className={styles.page}>
          <div className={styles.pageHeader}>
            <div>
              <h1 className={styles.title}>Subscriptions &amp; Payments</h1>
              <p className={styles.subtitle}>Manage plans, billing, and payment history</p>
            </div>
          </div>
          <SubscriptionStats stats={stats} isLoading={statsLoading} />
          <SubscriptionsToolbar search={search} onSearchChange={setSearch} filters={filters} onFilterChange={setFilter} totalSubscriptions={totalSubscriptions} />
          <div className={styles.tableSection}>
            <SubscriptionsTable subscriptions={subscriptions} isLoading={isLoading} error={error} onSort={setSort} sortBy={sortBy} sortOrder={sortOrder} onSubscriptionClick={handleClick} />
            <SubscriptionsMobileCards subscriptions={subscriptions} isLoading={isLoading} error={error} onSubscriptionClick={handleClick} />
          </div>
          <UsersPagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </AdminLayout>
    </AdminRouteGuard>
  );
}
