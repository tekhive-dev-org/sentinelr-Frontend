import Link from 'next/link';
import SectionCard from '../users/SectionCard';
import NotificationsIcon from '@mui/icons-material/Notifications';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import PinDropIcon from '@mui/icons-material/PinDrop';
import styles from './DeviceDetailEvents.module.css';

const MAX_EVENTS = 3;

function formatEventDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function DeviceDetailEvents({ sosEvents, geofenceEvents, isLoading }) {
  const hasSos = Array.isArray(sosEvents) && sosEvents.length > 0;
  const hasGeofence = Array.isArray(geofenceEvents) && geofenceEvents.length > 0;
  const isEmpty = !hasSos && !hasGeofence;

  const sosEntries = hasSos ? sosEvents.slice(0, MAX_EVENTS) : [];
  const geofenceEntries = hasGeofence ? geofenceEvents.slice(0, MAX_EVENTS) : [];

  return (
    <SectionCard
      title="Associated Events"
      icon={NotificationsIcon}
      isLoading={isLoading}
      isEmpty={isEmpty}
      emptyText="No associated events"
    >
      {!isEmpty && (
        <div className={styles.content}>
          {/* ---- SOS Incidents ---- */}
          {hasSos && (
            <div className={styles.subSection}>
              <div className={styles.subHeader}>
                <WarningAmberIcon className={styles.subIcon} aria-hidden="true" />
                <span className={styles.subTitle}>SOS Incidents</span>
              </div>

              <ul className={styles.list}>
                {sosEntries.map((event) => (
                  <li key={event.id} className={styles.row}>
                    <div className={styles.rowHeader}>
                      <span className={styles.eventType}>{event.type || 'SOS'}</span>
                      {event.date && (
                        <time className={styles.date} dateTime={event.date}>
                          {formatEventDate(event.date)}
                        </time>
                      )}
                    </div>
                    {event.summary && (
                      <p className={styles.summary}>{event.summary}</p>
                    )}
                  </li>
                ))}
              </ul>

              {hasSos && sosEvents.length > MAX_EVENTS && (
                <div className={styles.viewAll}>
                  <Link href="/dashboard/alerts" className={styles.viewAllLink}>
                    View all incidents
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* ---- Geofence Events ---- */}
          {hasGeofence && (
            <div className={`${styles.subSection} ${hasSos ? styles.subSectionDivider : ''}`}>
              <div className={styles.subHeader}>
                <PinDropIcon className={styles.subIcon} aria-hidden="true" />
                <span className={styles.subTitle}>Geofence Events</span>
              </div>

              <ul className={styles.list}>
                {geofenceEntries.map((event) => (
                  <li key={event.id} className={styles.row}>
                    <div className={styles.rowHeader}>
                      <span className={styles.eventType}>{event.type || 'Geofence'}</span>
                      {event.date && (
                        <time className={styles.date} dateTime={event.date}>
                          {formatEventDate(event.date)}
                        </time>
                      )}
                    </div>
                    {event.summary && (
                      <p className={styles.summary}>{event.summary}</p>
                    )}
                  </li>
                ))}
              </ul>

              {hasGeofence && geofenceEvents.length > MAX_EVENTS && (
                <div className={styles.viewAll}>
                  <Link href="/dashboard/geofencing" className={styles.viewAllLink}>
                    View all events
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </SectionCard>
  );
}
