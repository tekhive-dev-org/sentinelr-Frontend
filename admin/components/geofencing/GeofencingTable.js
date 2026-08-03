import { useCallback } from 'react';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ReplayIcon from '@mui/icons-material/Replay';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import styles from './GeofencingTable.module.css';

const TYPE_LABELS = {
  safe: 'Safe',
  danger: 'Danger',
};

const STATUS_LABELS = {
  active: 'Active',
  inactive: 'Inactive',
};

const SORTABLE_COLUMNS = [
  { key: 'name', label: 'Zone Name' },
  { key: 'family', label: 'Family' },
  { key: 'type', label: 'Type' },
  { key: 'status', label: 'Status' },
  { key: 'address', label: 'Address' },
  { key: 'events', label: 'Events' },
  { key: 'radius', label: 'Radius' },
];

function SkeletonRow() {
  return (
    <tr className={styles.row}>
      <td className={styles.cell}><div className={styles.skeleton} style={{ width: 100, height: 14 }} /></td>
      <td className={styles.cell}><div className={styles.skeleton} style={{ width: 80, height: 14 }} /></td>
      <td className={styles.cell}><div className={styles.skeleton} style={{ width: 64, height: 22, borderRadius: 999 }} /></td>
      <td className={styles.cell}><div className={styles.skeleton} style={{ width: 64, height: 22, borderRadius: 999 }} /></td>
      <td className={styles.cell}><div className={styles.skeleton} style={{ width: 140, height: 14 }} /></td>
      <td className={styles.cell}><div className={styles.skeleton} style={{ width: 60, height: 14 }} /></td>
      <td className={styles.cell}><div className={styles.skeleton} style={{ width: 50, height: 14 }} /></td>
    </tr>
  );
}

export default function GeofencingTable({
  zones,
  isLoading,
  error,
  onSort,
  sortBy,
  sortOrder,
  onZoneClick,
}) {
  const handleSort = useCallback(
    (key) => {
      onSort(key);
    },
    [onSort],
  );

  const handleRowClick = useCallback(
    (zone) => {
      onZoneClick(zone);
    },
    [onZoneClick],
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

  const typeKey = (type) => (type || 'safe').toLowerCase();
  const statusKey = (status) => (status || 'active').toLowerCase();

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
              {renderHeaderCell('name', 'Zone Name')}
              {renderHeaderCell('family', 'Family')}
              {renderHeaderCell('type', 'Type')}
              {renderHeaderCell('status', 'Status')}
              {renderHeaderCell('address', 'Address')}
              {renderHeaderCell('events', 'Events')}
              {renderHeaderCell('radius', 'Radius')}
            </tr>
          </thead>
          <tbody>
            {isLoading &&
              Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={`skel-${i}`} />)}

            {!isLoading && !error && zones.length === 0 && (
              <tr>
                <td colSpan={7} className={styles.emptyCell}>
                  <div className={styles.emptyState}>
                    <SearchOffIcon className={styles.emptyIcon} />
                    <p className={styles.emptyTitle}>No zones match your filters</p>
                    <p className={styles.emptyDesc}>
                      Try adjusting your search criteria or clearing the filters above.
                    </p>
                  </div>
                </td>
              </tr>
            )}

            {!isLoading &&
              !error &&
              zones.map((zone) => {
                const tp = typeKey(zone.type);
                const st = statusKey(zone.status);

                return (
                  <tr
                    key={zone.id}
                    className={styles.row}
                    onClick={() => handleRowClick(zone)}
                    role="row"
                  >
                    <td className={styles.cell}>
                      <span className={styles.zoneName}>{zone.name || 'Unknown Zone'}</span>
                    </td>
                    <td className={styles.cell}>
                      <span className={styles.secondaryText}>{zone.family || '—'}</span>
                    </td>
                    <td className={styles.cell}>
                      <span
                        className={`${styles.typeBadge} ${
                          styles[`type${tp.charAt(0).toUpperCase() + tp.slice(1)}`]
                        }`}
                      >
                        {TYPE_LABELS[tp] || zone.type}
                      </span>
                    </td>
                    <td className={styles.cell}>
                      <span
                        className={`${styles.statusBadge} ${
                          styles[`status${st.charAt(0).toUpperCase() + st.slice(1)}`]
                        }`}
                      >
                        {STATUS_LABELS[st] || zone.status}
                      </span>
                    </td>
                    <td className={styles.cell}>
                      <span className={styles.secondaryText}>{zone.address || '—'}</span>
                    </td>
                    <td className={styles.cell}>
                      <span className={styles.secondaryText}>
                        {zone.entryCount ?? 0} in / {zone.exitCount ?? 0} out
                      </span>
                    </td>
                    <td className={styles.cell}>
                      <span className={styles.mutedText}>
                        {zone.radius != null ? `${zone.radius}m` : '—'}
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
