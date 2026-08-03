import SectionCard from '../users/SectionCard';
import PlaceIcon from '@mui/icons-material/Place';
import styles from './AlertLocation.module.css';

function maskCoordinate(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return '—';
  return num.toFixed(2);
}

export default function AlertLocation({ alert, isLoading }) {
  const isEmpty = !alert || !alert.location;
  const locationAvailable = alert?.locationAvailable !== false;

  return (
    <SectionCard
      title="Location"
      icon={PlaceIcon}
      isLoading={isLoading}
      isEmpty={isEmpty && locationAvailable}
      emptyText="Location data unavailable"
    >
      <div className={styles.content}>
        {locationAvailable && alert.location ? (
          <>
            {alert.location.address && (
              <p className={styles.addressLabel}>{alert.location.address}</p>
            )}
            {alert.location.label && !alert.location.address && (
              <p className={styles.addressLabel}>{alert.location.label}</p>
            )}
            {alert.location.latitude != null &&
              alert.location.longitude != null && (
                <p className={styles.coords}>
                  <span className={styles.coordLabel}>Lat:</span>{' '}
                  {maskCoordinate(alert.location.latitude)}
                  {' · '}
                  <span className={styles.coordLabel}>Lng:</span>{' '}
                  {maskCoordinate(alert.location.longitude)}
                </p>
              )}
            <button
              type="button"
              className={styles.mapBtn}
              disabled
              title="Map view coming soon"
            >
              View on map
            </button>
          </>
        ) : (
          <p className={styles.coords}>Location data unavailable</p>
        )}

        <p className={styles.disclaimer}>
          Location shown only when authorized
        </p>
      </div>
    </SectionCard>
  );
}
