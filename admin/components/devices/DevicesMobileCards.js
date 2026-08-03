import { useCallback } from 'react';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ReplayIcon from '@mui/icons-material/Replay';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import DevicesOutlinedIcon from '@mui/icons-material/DevicesOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import styles from './DevicesMobileCards.module.css';

const STATUS_STYLES = {
  online: 'Online',
  offline: 'Offline',
  stale: 'Stale',
  revoked: 'Revoked',
  unpaired: 'Unpaired',
};

function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((part) => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function SkeletonCard() {
  return (
    <div className={styles.card}>
      <div className={styles.deviceIcon}>
        <div className={styles.skeleton} style={{ width: 24, height: 24 }} />
      </div>
      <div className={styles.cardBody}>
        <div className={styles.skeleton} style={{ width: 120, height: 16, marginBottom: 6 }} />
        <div className={styles.skeleton} style={{ width: 80, height: 12, marginBottom: 4 }} />
        <div className={styles.skeleton} style={{ width: 100, height: 12, marginBottom: 8 }} />
        <div className={styles.skeleton} style={{ width: 60, height: 22, borderRadius: 999 }} />
      </div>
    </div>
  );
}

export default function DevicesMobileCards({
  devices,
  isLoading,
  error,
  onDeviceClick,
}) {
  const handleCardClick = useCallback(
    (device) => {
      onDeviceClick(device);
    },
    [onDeviceClick],
  );

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

      {isLoading &&
        Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={`skel-card-${i}`} />)}

      {!isLoading && !error && devices.length === 0 && (
        <div className={styles.emptyState}>
          <SearchOffIcon className={styles.emptyIcon} />
          <p className={styles.emptyTitle}>No devices match your filters</p>
          <p className={styles.emptyDesc}>
            Try adjusting your search criteria or clearing the filters above.
          </p>
        </div>
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
            <div
              key={device.id}
              className={isStale ? styles.cardStale : styles.card}
              onClick={() => handleCardClick(device)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleCardClick(device);
              }}
            >
              <div className={styles.deviceIcon}>
                <DevicesOutlinedIcon className={styles.deviceIconSvg} />
              </div>
              <div className={styles.cardBody}>
                <div className={styles.cardTop}>
                  <span className={styles.deviceName}>{device.name || 'Unknown Device'}</span>
                  <span
                    className={`${styles.statusBadge} ${
                      styles[`status${statusStyle.charAt(0).toUpperCase() + statusStyle.slice(1)}`]
                    }`}
                  >
                    {STATUS_STYLES[statusStyle] || statusStyle}
                  </span>
                </div>
                <span className={styles.ownerText}>
                  {device.owner ? `Owner: ${device.owner}` : 'No owner'}
                </span>
                <span className={styles.familyText}>
                  {device.family ? `Family: ${device.family}` : 'No family'}
                </span>
                {isStale && (
                  <div className={styles.staleWarning}>
                    <WarningAmberIcon className={styles.staleWarningIcon} />
                    <span className={styles.staleLabel}>Stale device</span>
                  </div>
                )}
                <div className={styles.cardBottom}>
                  <span className={styles.lastSeenText}>
                    {device.lastSeen
                      ? `Last seen: ${device.lastSeen}`
                      : 'Never seen'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );
}
