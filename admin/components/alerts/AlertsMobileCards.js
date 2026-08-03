import { useCallback } from 'react';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ReplayIcon from '@mui/icons-material/Replay';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import styles from './AlertsMobileCards.module.css';

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

function SkeletonCard() {
  return (
    <div className={styles.card}>
      <div className={styles.cardBody}>
        <div className={styles.skeleton} style={{ width: 90, height: 14, marginBottom: 8 }} />
        <div className={styles.skeleton} style={{ width: 64, height: 22, borderRadius: 999, marginBottom: 8 }} />
        <div className={styles.skeleton} style={{ width: 100, height: 12, marginBottom: 4 }} />
        <div className={styles.skeleton} style={{ width: 80, height: 12, marginBottom: 4 }} />
        <div className={styles.skeleton} style={{ width: 60, height: 12 }} />
      </div>
    </div>
  );
}

export default function AlertsMobileCards({
  alerts,
  isLoading,
  error,
  onAlertClick,
}) {
  const handleCardClick = useCallback(
    (alert) => {
      onAlertClick(alert);
    },
    [onAlertClick],
  );

  const severityKey = (severity) => (severity || 'low').toLowerCase();
  const statusKey = (status) => (status || 'active').toLowerCase();
  const isHighlighted = (alert) => {
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

      {isLoading &&
        Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={`skel-card-${i}`} />)}

      {!isLoading && !error && alerts.length === 0 && (
        <div className={styles.emptyState}>
          <SearchOffIcon className={styles.emptyIcon} />
          <p className={styles.emptyTitle}>No incidents match your filters</p>
          <p className={styles.emptyDesc}>
            Try adjusting your search criteria or clearing the filters above.
          </p>
        </div>
      )}

      {!isLoading &&
        !error &&
        alerts.map((alert) => {
          const sev = severityKey(alert.severity);
          const st = statusKey(alert.status);
          const highlighted = isHighlighted(alert);

          return (
            <div
              key={alert.id}
              className={highlighted ? styles.cardHighlighted : styles.card}
              onClick={() => handleCardClick(alert)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleCardClick(alert);
              }}
            >
              <div className={styles.cardBody}>
                <div className={styles.cardTop}>
                  <span className={styles.incidentCode}>{alert.incidentCode || '—'}</span>
                  <span
                    className={`${styles.severityBadge} ${
                      styles[`severity${sev.charAt(0).toUpperCase() + sev.slice(1)}`]
                    }`}
                  >
                    {SEVERITY_LABELS[sev] || alert.severity}
                  </span>
                </div>
                <span className={styles.userText}>
                  {alert.user ? `User: ${alert.user}` : 'No user'}
                </span>
                <span className={styles.deviceText}>
                  {alert.device ? `Device: ${alert.device}` : 'No device'}
                </span>
                <span className={styles.sourceText}>
                  {alert.source ? `Source: ${alert.source}` : 'No source'}
                </span>
                <div className={styles.cardBottom}>
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
                  <span className={styles.timeText}>{formatRelativeTime(alert.created)}</span>
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );
}
