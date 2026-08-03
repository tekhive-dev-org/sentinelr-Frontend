import Link from 'next/link';
import SectionCard from './SectionCard';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import styles from './UserDetailSOS.module.css';

const MAX_ENTRIES = 5;

export default function UserDetailSOS({ incidents, isLoading }) {
  const isEmpty = !incidents || incidents.length === 0;
  const entries = isEmpty ? [] : incidents.slice(0, MAX_ENTRIES);

  return (
    <SectionCard
      title="SOS Incidents"
      icon={WarningAmberIcon}
      isLoading={isLoading}
      isEmpty={isEmpty}
      emptyText="No SOS incidents"
    >
      {!isEmpty && (
        <>
          <ul className={styles.list}>
            {entries.map((incident) => (
              <li key={incident.id} className={styles.row}>
                <div className={styles.rowHeader}>
                  <span className={styles.code}>{incident.code}</span>
                  <span
                    className={`${styles.status} ${
                      incident.status === 'resolved'
                        ? styles.statusResolved
                        : incident.status === 'active'
                        ? styles.statusActive
                        : styles.statusPending
                    }`}
                  >
                    {incident.status}
                  </span>
                </div>
                <div className={styles.rowMeta}>
                  <time className={styles.date}>
                    {new Date(incident.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </time>
                  {incident.locationSummary && (
                    <span className={styles.location}>
                      &middot; {incident.locationSummary}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>

          {incidents.length > MAX_ENTRIES && (
            <div className={styles.viewAll}>
              <Link href="/dashboard/alerts" className={styles.viewAllLink}>
                View all incidents
              </Link>
            </div>
          )}
        </>
      )}
    </SectionCard>
  );
}
