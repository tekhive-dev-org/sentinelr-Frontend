import { useCallback } from 'react';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ReplayIcon from '@mui/icons-material/Replay';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import { formatDateTime } from '../../utils/auditAdapters';
import styles from './AuditMobileCards.module.css';

const ACTION_CATEGORY_MAP = {
  user: 'actionUser',
  device: 'actionDevice',
  alert: 'actionAlert',
  subscription: 'actionSubscription',
  content: 'actionContent',
  role: 'actionRole',
  admin: 'actionAdmin',
};

const OUTCOME_STYLE_MAP = {
  success: 'outcomeSuccess',
  failure: 'outcomeFailed',
  denied: 'outcomeDenied',
};

const OUTCOME_LABEL_MAP = {
  success: 'Success',
  failure: 'Failed',
  denied: 'Denied',
};

function getActionCategoryClass(action) {
  if (!action) return 'actionOther';
  const prefix = action.split('.')[0];
  return ACTION_CATEGORY_MAP[prefix] || 'actionOther';
}

function SkeletonCard() {
  return (
    <div className={styles.card}>
      <div className={styles.cardTop}>
        <div className={styles.skeleton} style={{ width: 140, height: 16 }} />
        <div className={styles.skeleton} style={{ width: 64, height: 22, borderRadius: 999 }} />
      </div>
      <div>
        <div className={styles.skeleton} style={{ width: 80, height: 14, marginBottom: 4 }} />
        <div className={styles.skeleton} style={{ width: 100, height: 14, marginBottom: 8 }} />
      </div>
      <div className={styles.cardBottom}>
        <div className={styles.skeleton} style={{ width: 60, height: 22, borderRadius: 999 }} />
        <div className={styles.skeleton} style={{ width: 120, height: 14 }} />
      </div>
    </div>
  );
}

export default function AuditMobileCards({ entries, isLoading, error, onEntryClick }) {
  const handleCardClick = useCallback(
    (entry) => {
      if (onEntryClick) onEntryClick(entry);
    },
    [onEntryClick],
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
        Array.from({ length: 5 }).map((_, i) => (
          <SkeletonCard key={`skel-card-${i}`} />
        ))}

      {!isLoading && !error && entries.length === 0 && (
        <div className={styles.emptyState}>
          <SearchOffIcon className={styles.emptyIcon} />
          <p className={styles.emptyTitle}>No audit entries match your filters</p>
          <p className={styles.emptyDesc}>
            Try adjusting your search criteria or clearing the filters above.
          </p>
        </div>
      )}

      {!isLoading &&
        !error &&
        entries.map((entry) => {
          const actionClass = getActionCategoryClass(entry.action);
          const outcomeKey = entry.outcome || 'success';
          const outcomeClass = OUTCOME_STYLE_MAP[outcomeKey] || 'outcomeSuccess';

          return (
            <div
              key={entry.id}
              className={styles.card}
              onClick={() => handleCardClick(entry)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleCardClick(entry);
              }}
            >
              <div className={styles.cardTop}>
                <span className={styles.timestamp}>
                  {formatDateTime(entry.timestamp)}
                </span>
                <span
                  className={`${styles.outcomePill} ${styles[outcomeClass]}`}
                >
                  {OUTCOME_LABEL_MAP[outcomeKey] || outcomeKey}
                </span>
              </div>

              <div>
                <span className={styles.actor}>
                  <span className={styles.actorName}>{entry.actor || 'System'}</span>
                </span>
              </div>

              <div className={styles.cardBottom}>
                <span
                  className={`${styles.actionPill} ${styles[actionClass]}`}
                >
                  {entry.actionLabel || entry.action || '—'}
                </span>
              </div>

              {entry.summary && (
                <p className={styles.summary}>{entry.summary}</p>
              )}
            </div>
          );
        })}
    </div>
  );
}
