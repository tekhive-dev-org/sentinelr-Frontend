import AdminRouteGuard from "../components/shared/AdminRouteGuard";
import AdminLayout from "../components/layout/AdminLayout";
import { OverviewStats, TrendCharts, OperationalPanels, QuickActions } from "../components/dashboard";
import { ADMIN_PERMISSIONS } from "../constants/permissions";
import useDashboard from "../hooks/useDashboard";
import RefreshOutlinedIcon from "@mui/icons-material/RefreshOutlined";
import styles from "./dashboard.module.css";

export default function Dashboard() {
  const {
    stats,
    trends,
    recentUsers,
    widgetErrors,
    isLoading,
    dateRange,
    setDateRange,
    refreshWidget,
    refreshAll,
    lastRefreshed,
  } = useDashboard();

  return (
    <AdminRouteGuard permissions={[ADMIN_PERMISSIONS.DASHBOARD_VIEW]}>
      <AdminLayout>
        <div className={styles.page}>
          <div className={styles.pageHeader}>
            <div>
              <h1 className={styles.pageTitle}>Admin Overview</h1>
              <p className={styles.pageMeta}>
                {lastRefreshed ? (
                  <span className={styles.lastRefreshed}>
                    Updated {new Date(lastRefreshed).toLocaleTimeString()}
                  </span>
                ) : null}
              </p>
            </div>
            <button
              type="button"
              className={styles.refreshButton}
              onClick={refreshAll}
              disabled={isLoading}
            >
              <RefreshOutlinedIcon className={styles.refreshIcon} />
              {isLoading ? "Refreshing…" : "Refresh all"}
            </button>
          </div>

          <OverviewStats
            stats={stats}
            widgetErrors={widgetErrors}
            isLoading={isLoading}
          />

          <TrendCharts
            trends={trends}
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            isLoading={isLoading}
            errors={widgetErrors}
            onRetry={refreshWidget}
          />

          <QuickActions />

          <OperationalPanels
            widgetErrors={widgetErrors}
            recentUsers={recentUsers}
            isLoading={isLoading}
          />
        </div>
      </AdminLayout>
    </AdminRouteGuard>
  );
}
