import { useCallback } from 'react';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ReplayIcon from '@mui/icons-material/Replay';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import styles from './SupportTable.module.css';

const CATEGORY_LABELS = {
  device: 'Device',
  alerts: 'Alerts',
  billing: 'Billing',
  technical: 'Technical',
  feedback: 'Feedback',
};

const PRIORITY_LABELS = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

const STATUS_LABELS = {
  open: 'Open',
  inProgress: 'In Progress',
  resolved: 'Resolved',
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
  { key: 'subject', label: 'Subject' },
  { key: 'user', label: 'User' },
  { key: 'category', label: 'Category' },
  { key: 'priority', label: 'Priority' },
  { key: 'status', label: 'Status' },
  { key: 'created', label: 'Created' },
  { key: 'messages', label: 'Messages' },
];

function SkeletonRow() {
  return (
    <tr className={styles.row}>
      <td className={styles.cell}><div className={styles.skeleton} style={{ width: 140, height: 14 }} /></td>
      <td className={styles.cell}><div className={styles.skeleton} style={{ width: 90, height: 14 }} /></td>
      <td className={styles.cell}><div className={styles.skeleton} style={{ width: 64, height: 22, borderRadius: 999 }} /></td>
      <td className={styles.cell}><div className={styles.skeleton} style={{ width: 64, height: 22, borderRadius: 999 }} /></td>
      <td className={styles.cell}><div className={styles.skeleton} style={{ width: 64, height: 22, borderRadius: 999 }} /></td>
      <td className={styles.cell}><div className={styles.skeleton} style={{ width: 72, height: 14 }} /></td>
      <td className={styles.cell}><div className={styles.skeleton} style={{ width: 40, height: 14 }} /></td>
    </tr>
  );
}

export default function SupportTable({
  tickets,
  isLoading,
  error,
  onSort,
  sortBy,
  sortOrder,
  onTicketClick,
}) {
  const handleSort = useCallback(
    (key) => {
      onSort(key);
    },
    [onSort],
  );

  const handleRowClick = useCallback(
    (ticket) => {
      onTicketClick(ticket);
    },
    [onTicketClick],
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

  const categoryKey = (cat) => (cat || 'device').toLowerCase();
  const priorityKey = (pri) => (pri || 'low').toLowerCase();
  const statusKey = (st) => (st || 'open').toLowerCase();

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
              {renderHeaderCell('subject', 'Subject')}
              {renderHeaderCell('user', 'User')}
              {renderHeaderCell('category', 'Category')}
              {renderHeaderCell('priority', 'Priority')}
              {renderHeaderCell('status', 'Status')}
              {renderHeaderCell('created', 'Created')}
              {renderHeaderCell('messages', 'Messages')}
            </tr>
          </thead>
          <tbody>
            {isLoading &&
              Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={`skel-${i}`} />)}

            {!isLoading && !error && tickets.length === 0 && (
              <tr>
                <td colSpan={7} className={styles.emptyCell}>
                  <div className={styles.emptyState}>
                    <SearchOffIcon className={styles.emptyIcon} />
                    <p className={styles.emptyTitle}>No tickets match your filters</p>
                    <p className={styles.emptyDesc}>
                      Try adjusting your search criteria or clearing the filters above.
                    </p>
                  </div>
                </td>
              </tr>
            )}

            {!isLoading &&
              !error &&
              tickets.map((ticket) => {
                const cat = categoryKey(ticket.category);
                const pri = priorityKey(ticket.priority);
                const st = statusKey(ticket.status);

                return (
                  <tr
                    key={ticket.id}
                    className={styles.row}
                    onClick={() => handleRowClick(ticket)}
                    role="row"
                  >
                    <td className={styles.cell}>
                      <span className={styles.subjectText}>{ticket.subject || 'Untitled'}</span>
                    </td>
                    <td className={styles.cell}>
                      <span className={styles.secondaryText}>{ticket.user || '—'}</span>
                    </td>
                    <td className={styles.cell}>
                      <span
                        className={`${styles.categoryBadge} ${
                          styles[`category${cat.charAt(0).toUpperCase() + cat.slice(1)}`]
                        }`}
                      >
                        {CATEGORY_LABELS[cat] || ticket.category}
                      </span>
                    </td>
                    <td className={styles.cell}>
                      <span
                        className={`${styles.priorityBadge} ${
                          styles[`priority${pri.charAt(0).toUpperCase() + pri.slice(1)}`]
                        }`}
                      >
                        {PRIORITY_LABELS[pri] || ticket.priority}
                      </span>
                    </td>
                    <td className={styles.cell}>
                      <span
                        className={`${styles.statusBadge} ${
                          styles[`status${st.charAt(0).toUpperCase() + st.slice(1)}`]
                        }`}
                      >
                        {STATUS_LABELS[st] || ticket.status}
                      </span>
                    </td>
                    <td className={styles.cell}>
                      <span className={styles.mutedText}>{formatRelativeTime(ticket.created)}</span>
                    </td>
                    <td className={styles.cell}>
                      <span className={styles.secondaryText}>{ticket.messages ?? 0}</span>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
