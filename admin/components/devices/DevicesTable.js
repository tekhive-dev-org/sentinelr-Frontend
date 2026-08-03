import { useCallback } from 'react';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ReplayIcon from '@mui/icons-material/Replay';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import DevicesOutlinedIcon from '@mui/icons-material/DevicesOutlined';
import styles from './DevicesTable.module.css';

const STATUS_STYLES = {
  online: 'Online',
  offline: 'Offline',
  stale: 'Stale',
  revoked: 'Revoked',
  unpaired: 'Unpaired',
};

function formatLastSeen(dateStr) {
  if (!dateStr) return 'Never';
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
  { key: 'name', label: 'Device Name' },
  { key: 'platform', label: 'Platform' },
  { key: 'status', label: 'Status' },
  { key: 'lastSeen', label: 'Last Seen' },
];

function SkeletonRow() {
  return (
    <tr className={styles.row}>
      <td className={styles.cell}>
        <div className={styles.deviceNameCell}>
          <div className={styles.skeleton} style={{ width: 36, height: 36, borderRadius: '50%' }} />
          <div>
            <div className={styles.skeleton} style={{ width: 100, height: 14, marginBottom: 4 }} />
          </div>
        </div>
      </td>
      <td className={styles.cell}><div className={styles.skeleton} style={{ width: 80, height: 14 }} /></td>
      <td className={styles.cell}><div className={styles.skeleton} style={{ width: 70, height: 14 }} /></td>
      <td className={styles.cell}><div className={styles.skeleton} style={{ width: 60, height: 14 }} /></td>
      <td className={styles.cell}><div className={styles.skeleton} style={{ width: 64, height: 22, borderRadius: 999 }} /></td>
      <td className={styles.cell}><div className={styles.skeleton} style={{ width: 50, height: 14 }} /></td>
      <td className={styles.cell}><div className={styles.skeleton} style={{ width: 60, height: 12 }} /></td>
      <td className={styles.cell}><div className={styles.skeleton} style={{ width: 24, height: 24 }} /></td>
    </tr>
  );
}

export default function DevicesTable({
  devices,
  isLoading,
  error,
  onSort,
  sortBy,
  sortOrder,
  onDeviceClick,
}) {
  const handleSort = useCallback(
    (key) => {
      onSort(key);
    },
    [onSort],
  );

  const handleRowClick = useCallback(
    (device) => {
      onDeviceClick(device);
    },
    [onDeviceClick],
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

  const platformLabel = (platform) => {
    if (!platform) return '—';
    return platform.charAt(0).toUpperCase() + platform.slice(1);
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
              {renderHeaderCell('name', 'Device Name')}
              {renderHeaderCell('owner', 'Owner')}
              {renderHeaderCell('family', 'Family')}
              {renderHeaderCell('platform', 'Platform')}
              {renderHeaderCell('status', 'Status')}
              <th className={styles.headerCellNonSortable}>App Version</th>
              {renderHeaderCell('lastSeen', 'Last Seen')}
              <th className={styles.headerCellNonSortable}>
                <span className={styles.srOnly}>Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading &&
              Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={`skel-${i}`} />)}

            {!isLoading && !error && devices.length === 0 && (
              <tr>
                <td colSpan={8} className={styles.emptyCell}>
                  <div className={styles.emptyState}>
                    <SearchOffIcon className={styles.emptyIcon} />
                    <p className={styles.emptyTitle}>No devices match your filters</p>
                    <p className={styles.emptyDesc}>
                      Try adjusting your search criteria or clearing the filters above.
                    </p>
                  </div>
                </td>
              </tr>
            )}

            {!isLoading &&
              !error &&
              devices.map((device) => {
                const statusKey = device.status?.toLowerCase() || 'offline';
                const statusStyle = STATUS_STYLES[statusKey]
                  ? statusKey
                  : 'offline';
                const isStale = device.isStale;

                return (
                  <tr
                    key={device.id}
                    className={isStale ? styles.staleRow : styles.row}
                    onClick={() => handleRowClick(device)}
                    role="row"
                  >
                    <td className={styles.cell}>
                      <div className={styles.deviceNameCell}>
                        <div className={styles.deviceIcon}>
                          <DevicesOutlinedIcon className={styles.deviceIconSvg} />
                        </div>
                        <div>
                          <span className={styles.deviceName}>{device.name || 'Unknown Device'}</span>
                          {isStale && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <WarningAmberIcon className={styles.staleWarningIcon} />
                              <span className={styles.staleLabel}>Stale</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className={styles.cell}>
                      <span className={styles.secondaryText}>{device.owner || '—'}</span>
                    </td>
                    <td className={styles.cell}>
                      <span className={styles.secondaryText}>{device.family || '—'}</span>
                    </td>
                    <td className={styles.cell}>
                      <span className={styles.secondaryText}>{platformLabel(device.platform)}</span>
                    </td>
                    <td className={styles.cell}>
                      <span
                        className={`${styles.statusBadge} ${
                          styles[`status${statusStyle.charAt(0).toUpperCase() + statusStyle.slice(1)}`]
                        }`}
                      >
                        {STATUS_STYLES[statusStyle] || statusStyle}
                      </span>
                    </td>
                    <td className={styles.cell}>
                      <span className={styles.mutedText}>{device.appVersion || '—'}</span>
                    </td>
                    <td className={styles.cell}>
                      <span className={styles.mutedText}>{formatLastSeen(device.lastSeen)}</span>
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
