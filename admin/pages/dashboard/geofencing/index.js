import { useCallback } from "react";
import { useRouter } from "next/router";
import AdminRouteGuard from "../../../components/shared/AdminRouteGuard";
import AdminLayout from "../../../components/layout/AdminLayout";
import { ADMIN_PERMISSIONS } from "../../../constants/permissions";
import useGeofencing from "../../../hooks/useGeofencing";
import GeofencingStats from "../../../components/geofencing/GeofencingStats";
import GeofencingToolbar from "../../../components/geofencing/GeofencingToolbar";
import GeofencingTable from "../../../components/geofencing/GeofencingTable";
import GeofencingMobileCards from "../../../components/geofencing/GeofencingMobileCards";
import UsersPagination from "../../../components/users/UsersPagination";
import styles from "./geofencing.module.css";

export default function GeofencingPage() {
  const router = useRouter();
  const { zones, total, totalPages, isLoading, error, page, search, type, status, stats, setPage, setSearch, setFilter, retry } = useGeofencing();
  const handleClick = useCallback((z) => router.push(`/dashboard/geofencing/${z.id}`), [router]);

  return (
    <AdminRouteGuard permissions={[ADMIN_PERMISSIONS.GEOFENCING_VIEW]}>
      <AdminLayout>
        <div className={styles.page}>
          <div className={styles.pageHeader}><div><h1 className={styles.title}>Geofencing Oversight</h1><p className={styles.subtitle}>Monitor all geofence zones and entry/exit events</p></div></div>
          <GeofencingStats stats={stats} isLoading={isLoading} />
          <GeofencingToolbar search={search} onSearchChange={setSearch} filters={{ type, status }} onFilterChange={setFilter} />
          <div className={styles.tableSection}>
            <GeofencingTable zones={zones} isLoading={isLoading} error={error} onZoneClick={handleClick} />
            <GeofencingMobileCards zones={zones} isLoading={isLoading} error={error} onZoneClick={handleClick} />
          </div>
          <UsersPagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </AdminLayout>
    </AdminRouteGuard>
  );
}
