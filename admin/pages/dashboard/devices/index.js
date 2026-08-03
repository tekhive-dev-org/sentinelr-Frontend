import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import AdminRouteGuard from "../../../components/shared/AdminRouteGuard";
import AdminLayout from "../../../components/layout/AdminLayout";
import { ADMIN_PERMISSIONS } from "../../../constants/permissions";
import useDevices from "../../../hooks/useDevices";
import { adminDevicesService } from "../../../services/adminDevicesService";
import DevicesStats from "../../../components/devices/DevicesStats";
import DevicesToolbar from "../../../components/devices/DevicesToolbar";
import DevicesTable from "../../../components/devices/DevicesTable";
import DevicesMobileCards from "../../../components/devices/DevicesMobileCards";
import UsersPagination from "../../../components/users/UsersPagination";
import styles from "./devices.module.css";

export default function DevicesPage() {
  const router = useRouter();
  const {
    devices, totalDevices, totalPages, isLoading, error,
    page, search, status, platform, pairingState, sortBy, sortOrder,
    setPage, setSearch, setFilter, setSort, retry,
  } = useDevices();

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    adminDevicesService.getDeviceStats()
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setStatsLoading(false));
  }, []);

  const handleDeviceClick = useCallback((device) => {
    router.push(`/dashboard/devices/${device.id}`);
  }, [router]);

  const filters = { status, platform, pairingState };

  return (
    <AdminRouteGuard permissions={[ADMIN_PERMISSIONS.DEVICES_VIEW]}>
      <AdminLayout>
        <div className={styles.page}>
          <div className={styles.pageHeader}>
            <div>
              <h1 className={styles.title}>Device Management</h1>
              <p className={styles.subtitle}>Monitor paired devices, connection status, and platform versions</p>
            </div>
          </div>

          <DevicesStats stats={stats} isLoading={statsLoading} />

          <DevicesToolbar
            search={search}
            onSearchChange={setSearch}
            filters={filters}
            onFilterChange={setFilter}
            totalDevices={totalDevices}
          />

          <div className={styles.tableSection}>
            <DevicesTable
              devices={devices}
              isLoading={isLoading}
              error={error}
              onSort={setSort}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onDeviceClick={handleDeviceClick}
            />
            <DevicesMobileCards
              devices={devices}
              isLoading={isLoading}
              error={error}
              onDeviceClick={handleDeviceClick}
            />
          </div>

          <UsersPagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </AdminLayout>
    </AdminRouteGuard>
  );
}
