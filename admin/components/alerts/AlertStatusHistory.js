import SectionCard from '../users/SectionCard';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import styles from './AlertStatusHistory.module.css';

export default function AlertStatusHistory({ statusHistory, isLoading }) {
  const isEmpty = !statusHistory || statusHistory.length === 0;

  return (
    <SectionCard
      title="Status History"
      icon={ChangeCircleIcon}
      isLoading={isLoading}
      isEmpty={isEmpty}
      emptyText="No status changes recorded"
    >
      <div className={styles.content}>
        <ul className={styles.list}>
          {statusHistory.map((change) => (
            <li key={change.id} className={styles.row}>
              <div className={styles.changeInfo}>
                <span className={styles.changeText}>
                  <span className={styles.statusFrom}>
                    {change.fromStatus || '—'}
                  </span>
                  <span className={styles.arrow} aria-hidden="true">
                    {' → '}
                  </span>
                  <span className={styles.statusTo}>
                    {change.toStatus || '—'}
                  </span>
                </span>
                <div className={styles.changeMeta}>
                  {change.actor && (
                    <span className={styles.changeActor}>
                      {change.actor}
                    </span>
                  )}
                  {change.timestamp && (
                    <time>
                      {new Date(change.timestamp).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </time>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </SectionCard>
  );
}
