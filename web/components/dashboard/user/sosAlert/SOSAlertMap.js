import React, { useMemo } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import styles from './SOSAlert.module.css';
import { MapSkeleton } from '../../../ui/loaders';

const MAP_CONTAINER_STYLE = { width: '100%', height: '100%' };

const MAP_OPTIONS = {
  disableDefaultUI: false,
  fullscreenControl: false,
  mapTypeControl: false,
  clickableIcons: false,
  streetViewControl: false,
  gestureHandling: 'greedy',
};

function formatDateTime(dateValue) {
  if (!dateValue) return 'Awaiting sync';

  const parsedDate = new Date(dateValue);
  if (Number.isNaN(parsedDate.getTime())) return 'Awaiting sync';

  return parsedDate.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function SOSAlertMap({ alert, onOpenMap, onViewDetails }) {
  const latitude = alert?.location?.latitude;
  const longitude = alert?.location?.longitude;
  const hasCoordinates = typeof latitude === 'number' && typeof longitude === 'number';

  const center = useMemo(() => {
    if (!hasCoordinates) {
      return { lat: 0, lng: 0 };
    }

    return { lat: latitude, lng: longitude };
  }, [hasCoordinates, latitude, longitude]);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  });

  return (
    <div className={styles.mapSection}>
      <div className={styles.mapOverlay}>
        <LocationOnIcon />
        <div>
          <span className={styles.mapOverlayLabel}>Last known location</span>
          <strong className={styles.mapOverlayValue}>{alert.locationLabel}</strong>
        </div>
      </div>

      <button type="button" className={styles.mapDetailsLink} onClick={() => onOpenMap(alert)}>
        Open in maps
      </button>

      <div className={styles.mapInfoPanel}>
        <div className={styles.mapInfoMetric}>
          <span className={styles.mapInfoLabel}>Coordinates</span>
          <strong className={styles.mapInfoValue}>{alert.coordinatesLabel}</strong>
        </div>
        <div className={styles.mapInfoMetric}>
          <span className={styles.mapInfoLabel}>Last update</span>
          <strong className={styles.mapInfoValue}>{formatDateTime(alert.lastUpdatedAt)}</strong>
        </div>
        <button type="button" className={styles.secondaryInlineButton} onClick={() => onViewDetails(alert)}>
          <AccessTimeIcon className={styles.inlineActionIcon} />
          View full timeline
        </button>
      </div>

      <div className={styles.mapWrapper}>
        {loadError ? (
          <div className={styles.mapEmptyState}>Google Maps failed to load. Use the map action above to open this incident externally.</div>
        ) : !isLoaded ? (
          <MapSkeleton height="100%" />
        ) : hasCoordinates ? (
          <GoogleMap
            mapContainerStyle={MAP_CONTAINER_STYLE}
            center={center}
            zoom={15}
            options={MAP_OPTIONS}
          >
            <Marker position={center} title={`${alert.userName} · ${alert.incidentCode}`} />
          </GoogleMap>
        ) : (
          <div className={styles.mapEmptyState}>
            Awaiting a GPS fix from the protected device. The incident record remains available with the latest address summary.
          </div>
        )}
      </div>
    </div>
  );
}
