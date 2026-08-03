import { useCallback } from 'react';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ReplayIcon from '@mui/icons-material/Replay';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import styles from './ParentalTable.module.css';

const MONITORING_LABELS = {
  active: 'Active',
  inactive: 'Inactive',
};

const YES_NO = {
  true: 'On',
  false: 'Off',
};

const SORTABLE_COLUMNS = [
  { key: 'family', label: 'Family' },
  { key: 'members', label: 'Members' },
  { key: 'monitoring', label: 'Monitoring' },
  { key: 'screenTime', label: 'Screen Time' },
  { key: 'appBlocking', label: 'App Blocking' },
  { key: 'webFiltering', label: 'Web Filtering' },
  { key: 'bedtime', label: 'Bedtime' },
];

function SkeletonRow() {
  return (
    <tr className={styles.row}>
      <td className={styles.cell}><div className={styles.skeleton} style={{ width: 100, height: 14 }} /></td>
      <td className={styles.cell}><div className={styles.skeleton} style={{ width: 40, height: 14 }} /></td>
      <td className={styles.cell}><div className={styles.skeleton} style={{ width: 64, height: 22, borderRadius: 999 }} /></td>
      <td className={styles.cell}><div className={styles.skeleton} style={{ width: 80, height: 14 }} /></td>
      <td className={styles.cell}><div className={styles.skeleton} style={{ width: 40, height: 22, borderRadius: 999 }} /></td>
      <td className={styles.cell}><div className={styles.skeleton} style={{ width: 40, height: 14 }} /></td>
      <td className={styles.cell}><div className={styles.skeleton} style={{ width: 100, height: 14 }} /></td>
    </tr>
  );
}

export default function ParentalTable({
  families,
  isLoading,
  error,
  onSort,
  sortBy,
  sortOrder,
  onFamilyClick,
}) {
  const handleSort = useCallback(
    (key) => {
      onSort(key);
    },
    [onSort],
  );

  const handleRowClick = useCallback(
    (family) => {
      onFamilyClick(family);
    },
    [onFamilyClick],
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

  const monitoringKey = (monitoring) => (monitoring || 'inactive').toLowerCase();

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
              {renderHeaderCell('family', 'Family')}
              {renderHeaderCell('members', 'Members')}
              {renderHeaderCell('monitoring', 'Monitoring')}
              {renderHeaderCell('screenTime', 'Screen Time')}
              {renderHeaderCell('appBlocking', 'App Blocking')}
              {renderHeaderCell('webFiltering', 'Web Filtering')}
              {renderHeaderCell('bedtime', 'Bedtime')}
            </tr>
          </thead>
          <tbody>
            {isLoading &&
              Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={`skel-${i}`} />)}

            {!isLoading && !error && families.length === 0 && (
              <tr>
                <td colSpan={7} className={styles.emptyCell}>
                  <div className={styles.emptyState}>
                    <SearchOffIcon className={styles.emptyIcon} />
                    <p className={styles.emptyTitle}>No families match your filters</p>
                    <p className={styles.emptyDesc}>
                      Try adjusting your search criteria or clearing the filters above.
                    </p>
                  </div>
                </td>
              </tr>
            )}

            {!isLoading &&
              !error &&
              families.map((family) => {
                const mon = monitoringKey(family.monitoring);

                return (
                  <tr
                    key={family.id}
                    className={styles.row}
                    onClick={() => handleRowClick(family)}
                    role="row"
                  >
                    <td className={styles.cell}>
                      <span className={styles.familyName}>{family.name || 'Unknown Family'}</span>
                    </td>
                    <td className={styles.cell}>
                      <span className={styles.secondaryText}>{family.members ?? '—'}</span>
                    </td>
                    <td className={styles.cell}>
                      <span
                        className={`${styles.monitoringBadge} ${
                          styles[`monitoring${mon.charAt(0).toUpperCase() + mon.slice(1)}`]
                        }`}
                      >
                        {MONITORING_LABELS[mon] || family.monitoring}
                      </span>
                    </td>
                    <td className={styles.cell}>
                      <span className={styles.secondaryText}>
                        {family.screenTimeLimit ? `${family.screenTimeLimit}` : '—'}
                      </span>
                    </td>
                    <td className={styles.cell}>
                      <span className={styles.countPill}>
                        {family.blockedAppsCount ?? 0}
                      </span>
                    </td>
                    <td className={styles.cell}>
                      <span className={styles.secondaryText}>
                        {YES_NO[family.webFiltering] ?? '—'}
                      </span>
                    </td>
                    <td className={styles.cell}>
                      <span className={styles.mutedText}>
                        {family.bedtimeStart && family.bedtimeEnd
                          ? `${family.bedtimeStart} – ${family.bedtimeEnd}`
                          : '—'}
                      </span>
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
