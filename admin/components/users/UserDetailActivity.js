import SectionCard from './SectionCard';
import TimelineIcon from '@mui/icons-material/Timeline';
import styles from './UserDetailActivity.module.css';

const MAX_ENTRIES = 10;

export default function UserDetailActivity({ activities, isLoading }) {
  const isEmpty = !activities || activities.length === 0;
  const entries = isEmpty ? [] : activities.slice(0, MAX_ENTRIES);

  return (
    <SectionCard
      title="Recent Activity"
      icon={TimelineIcon}
      isLoading={isLoading}
      isEmpty={isEmpty}
      emptyText="No recent activity"
    >
      {!isEmpty && (
        <ul className={styles.list}>
          {entries.map((entry) => (
            <li key={entry.id} className={styles.row}>
              <div className={styles.rowHeader}>
                <span className={styles.action}>{entry.action}</span>
                <time className={styles.timestamp}>
                  {new Date(entry.timestamp).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </time>
              </div>
              {entry.detail && (
                <p className={styles.detail}>{entry.detail}</p>
              )}
              {(entry.ip || entry.userAgent) && (
                <p className={styles.meta}>
                  {entry.ip && <span>{entry.ip}</span>}
                  {entry.ip && entry.userAgent && <span> &middot; </span>}
                  {entry.userAgent && (
                    <span className={styles.userAgent}>{entry.userAgent}</span>
                  )}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
