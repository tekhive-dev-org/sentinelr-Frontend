import AdminRouteGuard from "../../../components/shared/AdminRouteGuard";
import AdminLayout from "../../../components/layout/AdminLayout";
import { ADMIN_PERMISSIONS } from "../../../constants/permissions";
import useAnalytics from "../../../hooks/useAnalytics";
import { AnalyticsToolbar, OverviewCards, AnalyticsCharts } from "../../../components/analytics";
import styles from "./analytics.module.css";

export default function AnalyticsPage() {
  const { metrics, metricErrors, isLoading, overview, range, filters, setRange, setFilter } = useAnalytics();

  return (
    <AdminRouteGuard permissions={[ADMIN_PERMISSIONS.ANALYTICS_VIEW]}>
      <AdminLayout>
        <div className={styles.page}>
          <div className={styles.pageHeader}>
            <div>
              <h1 className={styles.title}>Analytics &amp; Reports</h1>
              <p className={styles.subtitle}>User growth, device activity, subscription trends, and platform health</p>
            </div>
          </div>

          <AnalyticsToolbar range={range} onRangeChange={setRange} filters={filters} onFilterChange={setFilter} />

          <OverviewCards overview={overview} isLoading={isLoading} />

          <AnalyticsCharts metrics={metrics} metricErrors={metricErrors} isLoading={isLoading} />
        </div>
      </AdminLayout>
    </AdminRouteGuard>
  );
}
