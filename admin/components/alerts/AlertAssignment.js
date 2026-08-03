import SectionCard from '../users/SectionCard';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import styles from './AlertAssignment.module.css';

export default function AlertAssignment({ assignmentHistory, isLoading }) {
  const isEmpty = !assignmentHistory || assignmentHistory.length === 0;

  return (
    <SectionCard
      title="Assignment History"
      icon={AssignmentIndIcon}
      isLoading={isLoading}
      isEmpty={isEmpty}
      emptyText="No assignment history"
    >
      <div className={styles.content}>
        <ol className={styles.timeline}>
          {assignmentHistory.map((entry) => (
            <li key={entry.id} className={styles.entryRow}>
              <span className={styles.dot} aria-hidden="true" />
              <div className={styles.entryBody}>
                <span className={styles.entryText}>
                  <span className={styles.entryActor}>
                    {entry.assignedBy || 'System'}
                  </span>{' '}
                  assigned to{' '}
                  <span className={styles.entryActor}>
                    {entry.assignedTo || '—'}
                  </span>
                </span>
                <time className={styles.entryTime}>
                  {entry.timestamp
                    ? new Date(entry.timestamp).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '—'}
                </time>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </SectionCard>
  );
}
