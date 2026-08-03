import { useCallback } from 'react';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ReplayIcon from '@mui/icons-material/Replay';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import styles from './AlertsTable.module.css';

const SEVERITY_LABELS = {
  critical: 'Critical',
  medium: 'Medium',
  low: 'Low',
};

const STATUS_LABELS = {
  active: 'Active',
  acknowledged: 'Acknowledged',
  escalated: 'Escalated',
  resolved: 'Resolved',
  falseAlarm: 'False Alarm',
};

function formatRelativeTime(dateStr) {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const SORTABLE_COLUMNS = [
  { key: 'severity', label: 'Severity' },
  { key: 'status', label: 'Status' },
  { key: 'created', label: 'Created' },
];

function SkeletonRow() {
  return (
    <tr className={styles.row}>
      <td className={styles.cell}><div className={styles.skeleton} style={{ width: 80, height: 14 }} /></td>
      <td className={styles.cell}><div className={styles.skeleton} style={{ width: 100, height: 14 }} /></td>
      <td className={styles.cell}><div className={styles.skeleton} style={{ width: 90, height: 14 }} /></td>
      <td className={styles.cell}><div className={styles.skeleton} style={{ width: 64, height: 22, borderRadius: 999 }} /></td>
      <td className={styles.cell}><div className={styles.skeleton} style={{ width: 80, height: 22, borderRadius: 999 }} /></td>
      <td className={styles.cell}><div className={styles.skeleton} style={{ width: 72, height: 14 }} /></td>
      <td className={styles.cell}><div className={styles.skeleton} style={{ width: 60, height: 12 }} /></td>
      <td className={styles.cell}><div className={styles.skeleton} style={{ width: 24, height: 24 }} /></td>
    </tr>
  );
}

export default function AlertsTable({
  alerts,
  isLoading,
  error,
  onSort,
  sortBy,
  sortOrder,
  onAlertClick,
}) {
  const handleSort = useCallback(
    (key) => {
      onSort(key);
    },
    [onSort],
  );

  const handleRowClick = useCallback(
    (alert) => {
      onAlertClick(alert);
    },
    [onAlertClick],
  );

  const isSortable = (key) => SORTABLE_COLUMNS.some((col) => col.key === key);

  const renderHeaderCell = (key, label) => {
    if (!isSortable(key)) {
      return (
        <th key={key} className={styles.headerCellNonSortable}>
          {label}
        </th>
      );
    }

    return (
      <th
        key={key}
        className={styles.headerCell}
        onClick={() => handleSort(key)}
        role="columnheader"
        aria-sort={
          sortBy === key
            ? sortOrder === 'asc'
              ? 'ascending'
              : 'descending'
            : 'none'
        }
      >
        <span className={styles.headerContent}>
          {label}
          {sortBy === key && (
            <span className={styles.sortIcon}>
              {sortOrder === 'asc' ? (
                <ArrowUpwardIcon className={styles.sortArrow} />
              ) : (
                <ArrowDownwardIcon className={styles.sortArrow} />
              )}
            </span>
          )}
        </span>
      </th>
    );
  };

  const severityKey = (severity) => (severity || 'low').toLowerCase();
  const statusKey = (status) => (status || 'active').toLowerCase();
  const isHighSeverityActive = (alert) => {
    const sev = severityKey(alert.severity);
    const st = statusKey(alert.status);
    return sev === 'critical' && st === 'active';
  };

  return (
    <div className={styles.wrapper}>
      {error && (
        <div className={styles.errorBanner} role="alert">
          <ErrorOutlineIcon className={styles.errorIcon} />
          <span className={styles.errorText}>{error}</span>
          <button
            type="button"
            className={styles.retryBtn}
            onClick={() => window.location.reload()}
          >
            <ReplayIcon className={styles.retryIcon} />
            Retry
          </button>
        </div>
      )}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.headerRow}>
              <th className={styles.headerCellNonSortable}>Incident Code</th>
              <th className={styles.headerCellNonSortable}>User</th>
              <th className={styles.headerCellNonSortable}>Device</th>
              {renderHeaderCell('severity', 'Severity')}
              {renderHeaderCell('status', 'Status')}
              <th className={styles.headerCellNonSortable}>Source</th>
              {renderHeaderCell('created', 'Created')}
              <th className={styles.headerCellNonSortable}>
                <span className={styles.srOnly}>Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading &&
              Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={`skel-${i}`} />)}

            {!isLoading && !error && alerts.length === 0 && (
              <tr>
                <td colSpan={8} className={styles.emptyCell}>
                  <div className={styles.emptyState}>
                    <SearchOffIcon className={styles.emptyIcon} />
                    <p className={styles.emptyTitle}>No incidents match your filters</p>
                    <p className={styles.emptyDesc}>
                      Try adjusting your search criteria or clearing the filters above.
                    </p>
                  </div>
                </td>
              </tr>
            )}

            {!isLoading &&
              !error &&
              alerts.map((alert) => {
                const sev = severityKey(alert.severity);
                const st = statusKey(alert.status);
                const isHighlighted = isHighSeverityActive(alert);

                return (
                  <tr
                    key={alert.id}
                    className={isHighlighted ? styles.rowHighlighted : styles.row}
                    onClick={() => handleRowClick(alert)}
                    role="row"
                  >
                    <td className={styles.cell}>
                      <span className={styles.incidentCode}>{alert.incidentCode || '—'}</span>
                    </td>
                    <td className={styles.cell}>
                      <span className={styles.secondaryText}>{alert.user || '—'}</span>
                    </td>
                    <td className={styles.cell}>
                      <span className={styles.secondaryText}>{alert.device || '—'}</span>
                    </td>
                    <td className={styles.cell}>
                      <span
                        className={`${styles.severityBadge} ${
                          styles[`severity${sev.charAt(0).toUpperCase() + sev.slice(1)}`]
                        }`}
                      >
                        {SEVERITY_LABELS[sev] || alert.severity}
                      </span>
                    </td>
                    <td className={styles.cell}>
                      <span
                        className={`${styles.statusBadge} ${
                          styles[`status${st.charAt(0).toUpperCase() + st.slice(1)}`]
                        }`}
                      >
                        {st === 'active' && (
                          <FiberManualRecordIcon className={styles.statusPulseDot} />
                        )}
                        {STATUS_LABELS[st] || alert.status}
                      </span>
                    </td>
                    <td className={styles.cell}>
                      <span className={styles.secondaryText}>{alert.source || '—'}</span>
                    </td>
                    <td className={styles.cell}>
                      <span className={styles.mutedText}>{formatRelativeTime(alert.created)}</span>
                    </td>
                    <td className={styles.cell} />
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
