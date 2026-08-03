import { useCallback } from 'react';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ReplayIcon from '@mui/icons-material/Replay';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import styles from './GeofencingMobileCards.module.css';

const TYPE_LABELS = {
  safe: 'Safe',
  danger: 'Danger',
};

const STATUS_LABELS = {
  active: 'Active',
  inactive: 'Inactive',
};

function SkeletonCard() {
  return (
    <div className={styles.card}>
      <div className={styles.cardBody}>
        <div className={styles.skeleton} style={{ width: 120, height: 16, marginBottom: 6 }} />
        <div className={styles.skeleton} style={{ width: 80, height: 12, marginBottom: 4 }} />
        <div className={styles.skeleton} style={{ width: 64, height: 22, borderRadius: 999, marginBottom: 8 }} />
        <div className={styles.skeleton} style={{ width: 140, height: 12, marginBottom: 4 }} />
        <div className={styles.skeleton} style={{ width: 60, height: 12 }} />
      </div>
    </div>
  );
}

export default function GeofencingMobileCards({
  zones,
  isLoading,
  error,
  onZoneClick,
}) {
  const handleCardClick = useCallback(
    (zone) => {
      onZoneClick(zone);
    },
    [onZoneClick],
  );

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

      {isLoading &&
        Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={`skel-card-${i}`} />)}

      {!isLoading && !error && zones.length === 0 && (
        <div className={styles.emptyState}>
          <SearchOffIcon className={styles.emptyIcon} />
          <p className={styles.emptyTitle}>No zones match your filters</p>
          <p className={styles.emptyDesc}>
            Try adjusting your search criteria or clearing the filters above.
          </p>
        </div>
      )}

      {!isLoading &&
        !error &&
        zones.map((zone) => {
          const tp = typeKey(zone.type);
          const st = statusKey(zone.status);

          return (
            <div
              key={zone.id}
              className={styles.card}
              onClick={() => handleCardClick(zone)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleCardClick(zone);
              }}
            >
              <div className={styles.cardBody}>
                <div className={styles.cardTop}>
                  <span className={styles.zoneName}>{zone.name || 'Unknown Zone'}</span>
                  <span
                    className={`${styles.typeBadge} ${
                      styles[`type${tp.charAt(0).toUpperCase() + tp.slice(1)}`]
                    }`}
                  >
                    {TYPE_LABELS[tp] || zone.type}
                  </span>
                </div>
                <span className={styles.familyText}>
                  {zone.family ? `Family: ${zone.family}` : 'No family'}
                </span>
                <span
                  className={`${styles.statusBadge} ${
                    styles[`status${st.charAt(0).toUpperCase() + st.slice(1)}`]
                  }`}
                >
                  {STATUS_LABELS[st] || zone.status}
                </span>
                <span className={styles.addressText}>
                  {zone.address ? zone.address : 'No address'}
                </span>
                <div className={styles.cardBottom}>
                  <span className={styles.eventsText}>
                    {zone.entryCount ?? 0} in / {zone.exitCount ?? 0} out
                  </span>
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );
}
