import React, { useMemo } from 'react';
import { Circle, GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
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

function toFiniteNumber(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

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
  const latitude = toFiniteNumber(alert?.location?.latitude ?? alert?.location?.lat);
  const longitude = toFiniteNumber(alert?.location?.longitude ?? alert?.location?.lng);
  const accuracy = toFiniteNumber(alert?.location?.accuracy);
  const hasCoordinates = latitude != null && longitude != null;

  const center = useMemo(() => {
    if (!hasCoordinates) {
      return { lat: 0, lng: 0 };
    }

    return { lat: latitude, lng: longitude };
  }, [hasCoordinates, latitude, longitude]);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  });

  const markerIcon = useMemo(() => {
    if (!isLoaded || typeof window === 'undefined' || !window.google) return undefined;

    const svg =
      '<svg width="54" height="64" viewBox="0 0 54 64" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<ellipse cx="27" cy="59" rx="13" ry="4" fill="rgba(15,23,42,0.24)"/>' +
      '<path d="M27 2C13.8 2 3 12.6 3 25.7C3 43.1 27 59 27 59C27 59 51 43.1 51 25.7C51 12.6 40.2 2 27 2Z" fill="#dc323f" stroke="#fff" stroke-width="5"/>' +
      '<circle cx="27" cy="26" r="9" fill="#fff"/>' +
      '<circle cx="27" cy="26" r="4.5" fill="#dc323f"/>' +
      '</svg>';

    const encodedSvg =
      typeof window.btoa === 'function'
        ? `data:image/svg+xml;base64,${window.btoa(svg)}`
        : `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;

    return {
      url: encodedSvg,
      size: new window.google.maps.Size(54, 64),
      scaledSize: new window.google.maps.Size(54, 64),
      anchor: new window.google.maps.Point(27, 59),
    };
  }, [isLoaded]);

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
            {accuracy != null && (
              <Circle
                center={center}
                radius={accuracy}
                options={{
                  strokeColor: '#dc323f',
                  strokeOpacity: 0.26,
                  strokeWeight: 1,
                  fillColor: '#dc323f',
                  fillOpacity: 0.08,
                  clickable: false,
                  zIndex: 1,
                }}
              />
            )}
            <Marker
              position={center}
              title={`${alert.userName} · ${alert.incidentCode}`}
              icon={markerIcon}
              zIndex={10}
            />
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
