import SectionCard from './SectionCard';
import SecurityIcon from '@mui/icons-material/Security';
import styles from './UserDetailSecurity.module.css';

const MAX_ENTRIES = 10;

export default function UserDetailSecurity({ events, isLoading }) {
  const isEmpty = !events || events.length === 0;
  const entries = isEmpty ? [] : events.slice(0, MAX_ENTRIES);

  return (
    <SectionCard
      title="Security Events"
      icon={SecurityIcon}
      isLoading={isLoading}
      isEmpty={isEmpty}
      emptyText="No security events recorded"
    >
      {!isEmpty && (
        <ul className={styles.list}>
          {entries.map((event) => (
            <li key={event.id} className={styles.row}>
              <div className={styles.rowHeader}>
                <span className={styles.eventType}>{event.type}</span>
                <time className={styles.date}>
                  {new Date(event.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </time>
              </div>
              <div className={styles.rowMeta}>
                {event.ip && <span className={styles.metaItem}>{event.ip}</span>}
                {(event.device || event.browser) && (
                  <span className={styles.metaItem}>
                    {[event.device, event.browser].filter(Boolean).join(' / ')}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
