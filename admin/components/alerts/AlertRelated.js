import SectionCard from '../users/SectionCard';
import LinkIcon from '@mui/icons-material/Link';
import styles from './AlertRelated.module.css';

const MAX_RELATED = 5;

const SEVERITY_STYLES = {
  critical: styles.pillCritical,
  high: styles.pillHigh,
  medium: styles.pillMedium,
  low: styles.pillLow,
};

const STATUS_STYLES = {
  active: styles.statusActive,
  resolved: styles.statusResolved,
  false_alarm: styles.statusFalseAlarm,
};

export default function AlertRelated({ relatedAlerts, isLoading }) {
  const isEmpty = !relatedAlerts || relatedAlerts.length === 0;
  const items = isEmpty ? [] : relatedAlerts.slice(0, MAX_RELATED);

  return (
    <SectionCard
      title="Related Incidents"
      icon={LinkIcon}
      isLoading={isLoading}
      isEmpty={isEmpty}
      emptyText="No related incidents"
    >
      <ul className={styles.list}>
        {items.map((item) => {
          const severityStyle =
            SEVERITY_STYLES[item.severity] || styles.pillLow;
          const statusStyle =
            STATUS_STYLES[item.status] || styles.statusActive;

          return (
            <li key={item.id} className={styles.row}>
              <div className={styles.rowMain}>
                <a
                  href={`/dashboard/alerts/${item.id}`}
                  className={styles.link}
                >
                  {item.incidentCode || item.id}
                </a>
                <div className={styles.meta}>
                  {item.type && <span>{item.type}</span>}
                  {item.createdAt && (
                    <time>
                      {new Date(item.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </time>
                  )}
                </div>
              </div>
              <div className={styles.pills}>
                <span className={`${styles.pill} ${severityStyle}`}>
                  {item.severity || '—'}
                </span>
                <span className={`${styles.statusPill} ${statusStyle}`}>
                  {item.status_label || item.status || '—'}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </SectionCard>
  );
}
