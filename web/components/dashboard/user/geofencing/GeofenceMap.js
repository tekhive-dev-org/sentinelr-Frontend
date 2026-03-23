/**
 * GeofenceMap
 * Google Map showing geofence zones as circles (blue = safe, red = danger).
 * Requires NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env.local
 *
 * NOTE: Must be imported with next/dynamic { ssr: false } in the parent.
 */

import React, { useRef, useCallback, useMemo } from 'react';
import { useJsApiLoader, GoogleMap, Circle, Marker, InfoWindow } from '@react-google-maps/api';
import styles from './Geofencing.module.css';

const DEFAULT_CENTER = { lat: 6.5244, lng: 3.3792 }; // Lagos
const DEFAULT_ZOOM   = 12;
const MAP_CONTAINER_STYLE = { width: '100%', height: '100%' };

const BASE_MAP_OPTIONS = {
  disableDefaultUI: false,
  mapTypeControl: false,
  streetViewControl: true,
  fullscreenControl: false,
  zoomControl: true,
  scrollwheel: true,
  gestureHandling: 'greedy',
  clickableIcons: false,
};

const SAFE_CIRCLE_OPTIONS = {
  strokeColor: '#0f3c5f',
  strokeOpacity: 0.6,
  strokeWeight: 2,
  fillColor: '#3b82f6',
  fillOpacity: 0.12,
};

const DANGER_CIRCLE_OPTIONS = {
  strokeColor: '#ef4444',
  strokeOpacity: 0.5,
  strokeWeight: 2,
  fillColor: '#ef4444',
  fillOpacity: 0.1,
};

export default function GeofenceMap({ geofences = [], selectedZoneId }) {
  const mapRef = useRef(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  });

  const onLoad = useCallback((map) => {
    mapRef.current = map;
  }, []);

  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  // Compute center from geofences or use default
  const mapCenter = useMemo(() => {
    if (geofences.length === 0) return DEFAULT_CENTER;
    // If a zone is selected, center on it
    const target = selectedZoneId
      ? geofences.find((z) => z.id === selectedZoneId)
      : null;
    if (target?.center) {
      return { lat: target.center.latitude, lng: target.center.longitude };
    }
    // Otherwise center on the first zone
    const first = geofences[0];
    if (first?.center) {
      return { lat: first.center.latitude, lng: first.center.longitude };
    }
    return DEFAULT_CENTER;
  }, [geofences, selectedZoneId]);

  if (loadError) {
    return (
      <div className={styles.mapEmptyState}>
        Failed to load Google Maps. Check your API key.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={styles.mapEmptyState} style={{ color: '#6b7280' }}>
        Loading map…
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={MAP_CONTAINER_STYLE}
      center={mapCenter}
      zoom={DEFAULT_ZOOM}
      options={BASE_MAP_OPTIONS}
      onLoad={onLoad}
      onUnmount={onUnmount}
    >
      {geofences
        .filter((z) => z.isActive && z.center)
        .map((zone) => {
          const pos = { lat: zone.center.latitude, lng: zone.center.longitude };
          const isDanger = zone.type === 'danger_zone';
          const circleOpts = isDanger ? DANGER_CIRCLE_OPTIONS : SAFE_CIRCLE_OPTIONS;

          return (
            <React.Fragment key={zone.id}>
              <Circle
                center={pos}
                radius={zone.radius || 250}
                options={circleOpts}
              />
              <Marker
                position={pos}
                title={zone.name}
              />
            </React.Fragment>
          );
        })}
    </GoogleMap>
  );
}
