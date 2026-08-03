import SectionCard from '../users/SectionCard';
import TimelineIcon from '@mui/icons-material/Timeline';
import styles from './AlertTimeline.module.css';

const MAX_ENTRIES = 20;

const DOT_STYLES = {
  created: styles.dotCreated,
  acknowledged: styles.dotAcknowledged,
  escalated: styles.dotEscalated,
  assigned: styles.dotAssigned,
  contacted: styles.dotContacted,
  resolved: styles.dotResolved,
  reopened: styles.dotReopened,
};

const ACTION_LABELS = {
  created: 'Incident created',
  acknowledged: 'Acknowledged',
  escalated: 'Escalated',
  assigned: 'Assigned',
  contacted: 'Contacted',
  resolved: 'Resolved',
  reopened: 'Reopened',
};

function formatTime(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AlertTimeline({ timeline, isLoading }) {
  const isEmpty = !timeline || timeline.length === 0;
  const entries = isEmpty ? [] : timeline.slice(0, MAX_ENTRIES);

  return (
    <SectionCard
      title="Timeline"
      icon={TimelineIcon}
      isLoading={isLoading}
      isEmpty={isEmpty}
      emptyText="No timeline events"
    >
      <div className={styles.content}>
        <ol className={styles.timeline}>
          {entries.map((event) => {
            const dotStyle = DOT_STYLES[event.eventType] || styles.dotCreated;
            const actionLabel =
              ACTION_LABELS[event.eventType] || event.action || event.eventType;

            return (
              <li key={event.id} className={styles.eventRow}>
                <span
                  className={`${styles.dot} ${dotStyle}`}
                  aria-hidden="true"
                />
                <div className={styles.eventBody}>
                  <span className={styles.eventAction}>{actionLabel}</span>
                  <div className={styles.eventMeta}>
                    <time className={styles.eventTime}>
                      {event.timestamp
                        ? formatTime(event.timestamp)
                        : '—'}
                    </time>
                    {event.actor && (
                      <span className={styles.eventActor}>
                        &middot; {event.actor}
                      </span>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </SectionCard>
  );
}
