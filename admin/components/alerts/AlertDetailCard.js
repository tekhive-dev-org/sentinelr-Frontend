import styles from './AlertDetailCard.module.css';

const SEVERITY_STYLES = {
  critical: styles.pillCritical,
  high: styles.pillHigh,
  medium: styles.pillMedium,
  low: styles.pillLow,
};

const STATUS_STYLES = {
  active: styles.statusActive,
  acknowledged: styles.statusAcknowledged,
  escalated: styles.statusEscalated,
  resolved: styles.statusResolved,
  false_alarm: styles.statusFalseAlarm,
};

function getRelativeTime(dateString) {
  const now = Date.now();
  const then = new Date(dateString).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function AlertDetailCard({ alert, isLoading }) {
  if (isLoading) {
    return (
      <div className={styles.card} aria-busy="true">
        <div className={styles.skeletonHeader}>
          <div className={styles.skeletonCode} />
          <div className={styles.skeletonPill} />
        </div>
        <div className={styles.skeletonBody}>
          <span className={styles.skeletonLine} />
          <span className={`${styles.skeletonLine} ${styles.skeletonLineShort}`} />
        </div>
      </div>
    );
  }

  if (!alert) return null;

  const isHighActive =
    alert.status === 'active' &&
    (alert.severity === 'high' || alert.severity === 'critical');
  const isFalseAlarm = alert.status === 'false_alarm';
  const severityStyle = SEVERITY_STYLES[alert.severity] || styles.pillLow;
  const statusStyle = STATUS_STYLES[alert.status] || styles.statusActive;

  return (
    <div
      className={`${styles.card} ${isHighActive ? styles.cardHighActive : ''}`}
    >
      <header className={styles.header}>
        <span className={styles.incidentCode}>
          {alert.incidentCode || '—'}
        </span>
        <div className={styles.pills}>
          <span className={`${styles.pill} ${severityStyle}`}>
            {alert.severity || 'unknown'}
          </span>
          <span className={`${styles.statusPill} ${statusStyle}`}>
            {alert.status_label || alert.status || 'unknown'}
          </span>
        </div>
      </header>

      <div className={styles.body}>
        <div className={styles.metaRow}>
          <span className={styles.typeLabel}>
            {alert.type || 'Uncategorized'}
          </span>
          <span className={styles.metaSeparator} aria-hidden="true">&middot;</span>
          <time>
            Created {alert.createdAt ? getRelativeTime(alert.createdAt) : '—'}
          </time>
        </div>

        {isFalseAlarm && (
          <div className={styles.falseAlarmBanner}>
            Marked as false alarm
          </div>
        )}
      </div>
    </div>
  );
}
