import { useCallback } from "react";
import { useRouter } from "next/router";
import AdminRouteGuard from "../../../components/shared/AdminRouteGuard";
import AdminLayout from "../../../components/layout/AdminLayout";
import { ADMIN_PERMISSIONS } from "../../../constants/permissions";
import useParental from "../../../hooks/useParental";
import ParentalStats from "../../../components/parental/ParentalStats";
import ParentalToolbar from "../../../components/parental/ParentalToolbar";
import ParentalTable from "../../../components/parental/ParentalTable";
import ParentalMobileCards from "../../../components/parental/ParentalMobileCards";
import UsersPagination from "../../../components/users/UsersPagination";
import styles from "../geofencing/geofencing.module.css";

export default function ParentalPage() {
  const router = useRouter();
  const { families, total, totalPages, isLoading, error, page, search, monitoring, stats, setPage, setSearch, setFilter, retry } = useParental();
  const handleClick = useCallback((f) => router.push(`/dashboard/parental/${f.id}`), [router]);

  return (
    <AdminRouteGuard permissions={[ADMIN_PERMISSIONS.PARENTAL_VIEW]}>
      <AdminLayout>
        <div className={styles.page}>
          <div className={styles.pageHeader}><div><h1 className={styles.title}>Parental Controls Oversight</h1><p className={styles.subtitle}>Screen time, app blocking, and web filtering across families</p></div></div>
          <ParentalStats stats={stats} isLoading={isLoading} />
          <ParentalToolbar search={search} onSearchChange={setSearch} filters={{ monitoring }} onFilterChange={setFilter} />
          <div className={styles.tableSection}>
            <ParentalTable families={families} isLoading={isLoading} error={error} onFamilyClick={handleClick} />
            <ParentalMobileCards families={families} isLoading={isLoading} error={error} onFamilyClick={handleClick} />
          </div>
          <UsersPagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </AdminLayout>
    </AdminRouteGuard>
  );
}
