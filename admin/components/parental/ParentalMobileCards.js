import { useCallback } from 'react';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ReplayIcon from '@mui/icons-material/Replay';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import styles from './ParentalMobileCards.module.css';

const MONITORING_LABELS = {
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
        <div className={styles.skeleton} style={{ width: 100, height: 12, marginBottom: 4 }} />
        <div className={styles.skeleton} style={{ width: 40, height: 22, borderRadius: 999 }} />
      </div>
    </div>
  );
}

export default function ParentalMobileCards({
  families,
  isLoading,
  error,
  onFamilyClick,
}) {
  const handleCardClick = useCallback(
    (family) => {
      onFamilyClick(family);
    },
    [onFamilyClick],
  );

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

      {isLoading &&
        Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={`skel-card-${i}`} />)}

      {!isLoading && !error && families.length === 0 && (
        <div className={styles.emptyState}>
          <SearchOffIcon className={styles.emptyIcon} />
          <p className={styles.emptyTitle}>No families match your filters</p>
          <p className={styles.emptyDesc}>
            Try adjusting your search criteria or clearing the filters above.
          </p>
        </div>
      )}

      {!isLoading &&
        !error &&
        families.map((family) => {
          const mon = monitoringKey(family.monitoring);

          return (
            <div
              key={family.id}
              className={styles.card}
              onClick={() => handleCardClick(family)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleCardClick(family);
              }}
            >
              <div className={styles.cardBody}>
                <div className={styles.cardTop}>
                  <span className={styles.familyName}>{family.name || 'Unknown Family'}</span>
                  <span
                    className={`${styles.monitoringBadge} ${
                      styles[`monitoring${mon.charAt(0).toUpperCase() + mon.slice(1)}`]
                    }`}
                  >
                    {MONITORING_LABELS[mon] || family.monitoring}
                  </span>
                </div>
                <span className={styles.membersText}>
                  {family.members != null ? `${family.members} members` : 'No members'}
                </span>
                <span className={styles.screenTimeText}>
                  {family.screenTimeLimit
                    ? `Screen time: ${family.screenTimeLimit}`
                    : 'No screen time limit'}
                </span>
                <div className={styles.cardBottom}>
                  <span className={styles.blockedCount}>
                    {family.blockedAppsCount ?? 0} blocked apps
                  </span>
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );
}
