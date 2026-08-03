import SectionCard from '../users/SectionCard';
import LinkIcon from '@mui/icons-material/Link';
import styles from './DeviceDetailPairing.module.css';

const MAX_ENTRIES = 10;

const ACTION_STYLES = {
  Paired: 'paired',
  'Re-paired': 'repaired',
  Unpaired: 'unpaired',
};

export default function DeviceDetailPairing({ pairingHistory, isLoading }) {
  const isEmpty = !pairingHistory || pairingHistory.length === 0;
  const entries = isEmpty ? [] : pairingHistory.slice(0, MAX_ENTRIES);

  return (
    <SectionCard
      title="Pairing History"
      icon={LinkIcon}
      isLoading={isLoading}
      isEmpty={isEmpty}
      emptyText="No pairing history recorded"
    >
      {!isEmpty && (
        <ul className={styles.timeline}>
          {entries.map((entry, idx) => {
            const variant =
              ACTION_STYLES[entry.action] || 'default';
            const isLast = idx === entries.length - 1;

            return (
              <li
                key={entry.id || idx}
                className={`${styles.timelineItem} ${isLast ? styles.timelineItemLast : ''}`}
              >
                <div className={styles.timelineNode}>
                  <span className={`${styles.dot} ${styles[`dot${variant.charAt(0).toUpperCase() + variant.slice(1)}`] || styles.dotDefault}`} />
                  {!isLast && <span className={styles.timelineLine} />}
                </div>

                <div className={styles.timelineBody}>
                  <div className={styles.eventRow}>
                    <span
                      className={`${styles.actionPill} ${styles[`action${variant.charAt(0).toUpperCase() + variant.slice(1)}`] || styles.actionDefault}`}
                    >
                      {entry.action}
                    </span>
                    {entry.date && (
                      <time className={styles.date} dateTime={entry.date}>
                        {new Date(entry.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </time>
                    )}
                  </div>

                  {entry.actor && (
                    <p className={styles.actor}>{entry.actor}</p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </SectionCard>
  );
}
