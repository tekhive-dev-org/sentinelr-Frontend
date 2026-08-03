import { useState, useCallback } from "react";
import { useRouter } from "next/router";
import AdminRouteGuard from "../../../components/shared/AdminRouteGuard";
import AdminLayout from "../../../components/layout/AdminLayout";
import { ADMIN_PERMISSIONS } from "../../../constants/permissions";
import { useAdminAuth } from "../../../context/AuthContext";
import useTeam from "../../../hooks/useTeam";
import { adminTeamService } from "../../../services/adminTeamService";
import TeamToolbar from "../../../components/team/TeamToolbar";
import TeamTable from "../../../components/team/TeamTable";
import TeamMobileCards from "../../../components/team/TeamMobileCards";
import UsersPagination from "../../../components/users/UsersPagination";
import styles from "./team.module.css";

export default function TeamPage() {
  const router = useRouter(); const { adminUser } = useAdminAuth();
  const { admins, total, totalPages, isLoading, error, page, search, role, status, setPage, setSearch, setFilter, retry } = useTeam();
  const handleClick = useCallback((a) => router.push(`/dashboard/team/${a.id}`), [router]);
  const handleInvite = () => router.push("/dashboard/team/new");

  return (
    <AdminRouteGuard permissions={[ADMIN_PERMISSIONS.TEAM_VIEW]}>
      <AdminLayout>
        <div className={styles.page}>
          <div className={styles.pageHeader}><div><h1 className={styles.title}>Admin Team &amp; Roles</h1><p className={styles.subtitle}>Manage administrators, assign roles, and review access</p></div></div>
          <TeamToolbar search={search} onSearchChange={setSearch} filters={{ role, status }} onFilterChange={setFilter} onInvite={handleInvite} />
          <div className={styles.tableSection}>
            <TeamTable admins={admins} isLoading={isLoading} error={error} onAdminClick={handleClick} />
            <TeamMobileCards admins={admins} isLoading={isLoading} error={error} onAdminClick={handleClick} />
          </div>
          <UsersPagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      </AdminLayout>
    </AdminRouteGuard>
  );
}
