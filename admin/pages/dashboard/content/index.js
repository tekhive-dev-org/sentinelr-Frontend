import { useCallback } from "react";
import { useRouter } from "next/router";
import AdminRouteGuard from "../../../components/shared/AdminRouteGuard";
import AdminLayout from "../../../components/layout/AdminLayout";
import { ADMIN_PERMISSIONS } from "../../../constants/permissions";
import useContent from "../../../hooks/useContent";
import ContentToolbar from "../../../components/content/ContentToolbar";
import ContentTable from "../../../components/content/ContentTable";
import ContentMobileCards from "../../../components/content/ContentMobileCards";
import UsersPagination from "../../../components/users/UsersPagination";
import styles from "./content.module.css";

export default function ContentPage() {
  const router = useRouter();
  const { items, total, totalPages, isLoading, error, page, search, type, status, audience, sortBy, sortOrder, setPage, setSearch, setFilter, setSort, retry } = useContent();
  const handleClick = useCallback((item) => router.push(`/dashboard/content/${item.id}`), [router]);

  return (
    <AdminRouteGuard permissions={[ADMIN_PERMISSIONS.CONTENT_VIEW]}>
      <AdminLayout>
        <div className={styles.page}>
          <div className={styles.pageHeader}><div><h1 className={styles.title}>Content Management</h1><p className={styles.subtitle}>Help articles, FAQs, announcements, and platform notices</p></div></div>
          <ContentToolbar search={search} onSearchChange={setSearch} filters={{ type, status, audience }} onFilterChange={setFilter} />
          <div className={styles.tableSection}>
            <ContentTable items={items} isLoading={isLoading} error={error} onSort={setSort} sortBy={sortBy} sortOrder={sortOrder} onItemClick={handleClick} />
            <ContentMobileCards items={items} isLoading={isLoading} error={error} onItemClick={handleClick} />
          </div>
          <UsersPagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </AdminLayout>
    </AdminRouteGuard>
  );
}
