import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import AdminRouteGuard from "../../../components/shared/AdminRouteGuard";
import AdminLayout from "../../../components/layout/AdminLayout";
import { ADMIN_PERMISSIONS } from "../../../constants/permissions";
import useAlerts from "../../../hooks/useAlerts";
import { adminAlertsService } from "../../../services/adminAlertsService";
import AlertStats from "../../../components/alerts/AlertStats";
import AlertsToolbar from "../../../components/alerts/AlertsToolbar";
import AlertsTable from "../../../components/alerts/AlertsTable";
import AlertsMobileCards from "../../../components/alerts/AlertsMobileCards";
import UsersPagination from "../../../components/users/UsersPagination";
import styles from "./alerts.module.css";

export default function AlertsPage() {
  const router = useRouter();
  const {
    alerts, totalAlerts, totalPages, isLoading, error, activeCount,
    page, search, status, severity, source, sortBy, sortOrder,
    setPage, setSearch, setFilter, setSort, retry,
  } = useAlerts();

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    adminAlertsService.getAlertStats()
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setStatsLoading(false));
  }, []);

  const handleAlertClick = useCallback((alert) => {
    router.push(`/dashboard/alerts/${alert.id}`);
  }, [router]);

  const filters = { status, severity, source };

  return (
    <AdminRouteGuard permissions={[ADMIN_PERMISSIONS.ALERTS_VIEW]}>
      <AdminLayout badges={{ activeAlerts: activeCount }}>
        <div className={styles.page}>
          <div className={styles.pageHeader}>
            <div>
              <h1 className={styles.title}>SOS Incidents</h1>
              <p className={styles.subtitle}>
                <span className={styles.liveIndicator}>
                  <span className={styles.liveDot} />
                  {activeCount} active {activeCount === 1 ? "incident" : "incidents"}
                </span>
              </p>
            </div>
          </div>

          <AlertStats stats={stats} isLoading={statsLoading} />

          <AlertsToolbar
            search={search}
            onSearchChange={setSearch}
            filters={filters}
            onFilterChange={setFilter}
            totalAlerts={totalAlerts}
          />

          <div className={styles.tableSection}>
            <AlertsTable
              alerts={alerts}
              isLoading={isLoading}
              error={error}
              onSort={setSort}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onAlertClick={handleAlertClick}
            />
            <AlertsMobileCards
              alerts={alerts}
              isLoading={isLoading}
              error={error}
              onAlertClick={handleAlertClick}
            />
          </div>

          <UsersPagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </AdminLayout>
    </AdminRouteGuard>
  );
}
