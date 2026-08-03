import { useState, useCallback } from "react";
import AdminRouteGuard from "../../../components/shared/AdminRouteGuard";
import AdminLayout from "../../../components/layout/AdminLayout";
import { ADMIN_PERMISSIONS } from "../../../constants/permissions";
import useAudit from "../../../hooks/useAudit";
import { adminAuditService } from "../../../services/adminAuditService";
import { normalizeAuditEntry } from "../../../utils/auditAdapters";
import AuditStats from "../../../components/audit/AuditStats";
import AuditToolbar from "../../../components/audit/AuditToolbar";
import AuditTable from "../../../components/audit/AuditTable";
import AuditMobileCards from "../../../components/audit/AuditMobileCards";
import AuditDetailDrawer from "../../../components/audit/AuditDetailDrawer";
import UsersPagination from "../../../components/users/UsersPagination";
import styles from "./audit.module.css";

export default function AuditPage() {
  const { entries, total, totalPages, isLoading, error, page, search, actor, action, resource, outcome, dateFrom, dateTo, stats, setPage, setSearch, setFilter, setDateFilter, retry } = useAudit();
  const [selectedEntry, setSelectedEntry] = useState(null);

  const handleEntryClick = useCallback(async (entry) => {
    try {
      const data = await adminAuditService.getEntry(entry.id);
      setSelectedEntry(normalizeAuditEntry(data?.entry || data));
    } catch { setSelectedEntry(entry); }
  }, []);

  const filters = { actor, action, resource, outcome, dateFrom, dateTo };

  return (
    <AdminRouteGuard permissions={[ADMIN_PERMISSIONS.AUDIT_VIEW]}>
      <AdminLayout>
        <div className={styles.page}>
          <div className={styles.pageHeader}><div><h1 className={styles.title}>Audit Logs</h1><p className={styles.subtitle}>Immutable record of every administrative action</p></div></div>
          <AuditStats stats={stats} isLoading={isLoading} />
          <AuditToolbar search={search} onSearchChange={setSearch} filters={filters} onFilterChange={setFilter} onDateFilterChange={setDateFilter} totalEntries={total} />
          <div className={styles.tableSection}>
            <AuditTable entries={entries} isLoading={isLoading} error={error} onEntryClick={handleEntryClick} />
            <AuditMobileCards entries={entries} isLoading={isLoading} error={error} onEntryClick={handleEntryClick} />
          </div>
          <UsersPagination page={page} totalPages={totalPages} onPageChange={setPage} />
          <AuditDetailDrawer entry={selectedEntry} isOpen={!!selectedEntry} onClose={() => setSelectedEntry(null)} />
        </div>
      </AdminLayout>
    </AdminRouteGuard>
  );
}
