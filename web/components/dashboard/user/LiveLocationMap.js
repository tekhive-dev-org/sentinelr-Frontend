/**
 * LiveLocationMap
 * Renders a Google Map showing the live location of a selected family device.
 * Requires NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env.local
 *
 * NOTE: Must be imported with next/dynamic { ssr: false } in the parent.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useJsApiLoader, GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { devicesService } from '../../../services/devicesService';
import styles from './LiveLocationMap.module.css';

const POLL_MS        = 30_000;
const DEFAULT_ZOOM   = 15;
const DEFAULT_CENTER = { lat: 20, lng: 0 };

// Map type options shown in the controls bar
const MAP_TYPES = [
  { id: 'roadmap',  label: 'Map'       },
  { id: 'satellite', label: 'Satellite' },
  { id: 'hybrid',   label: 'Hybrid'    },
  { id: 'terrain',  label: 'Terrain'   },
];

const MAP_CONTAINER_STYLE = { width: '100%', height: '100%' };

const BASE_MAP_OPTIONS = {
  disableDefaultUI: false,
  mapTypeControl: false,   // we use our own toggle
  streetViewControl: true,
  fullscreenControl: false,
  zoomControl: true,
  scrollwheel: false,
  gestureHandling: 'cooperative',
  clickableIcons: false,
};

export default function LiveLocationMap() {
  const mapRef = useRef(null);

  const [devices, setDevices]           = useState([]);
  const [selectedId, setSelectedId]     = useState('');
  const [locationData, setLocationData] = useState(null);
  const [showInfo, setShowInfo]         = useState(false);
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState(null);
  const [lastUpdated, setLastUpdated]   = useState(null);
  const [mapTypeId, setMapTypeId]       = useState('roadmap');
  const [center, setCenter]             = useState(DEFAULT_CENTER);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  });

  // ── Fetch family devices once on mount ──────────────────────────────────────
  useEffect(() => {
    devicesService
      .getFamilyDevices()
      .then((data) => {
        const list = data.devices || [];
        setDevices(list);
        if (list.length > 0) setSelectedId(String(list[0].id));
      })
      .catch((err) => console.error('[LiveLocationMap] fetch devices:', err));
  }, []);

  // ── Smooth pan to updated position ─────────────────────────────────────────
  const panToLocation = useCallback((lat, lng) => {
    const pos = { lat, lng };
    setCenter(pos);
    if (mapRef.current) {
      mapRef.current.panTo(pos);
      mapRef.current.setZoom(DEFAULT_ZOOM);
    }
  }, []);

  // ── Poll live location whenever selected device changes ─────────────────────
  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;

    const poll = async () => {
      setLoading(true);
      try {
        const data = await devicesService.getLiveLocation({ deviceId: selectedId });
        if (cancelled) return;
        const loc = data.locations?.[0] ?? null;
        setLocationData(loc);
        setError(null);
        setLastUpdated(new Date());
        if (loc?.latitude != null && loc?.longitude != null) {
          panToLocation(loc.latitude, loc.longitude);
        }
      } catch (err) {
        if (!cancelled) { setError(err.message); setLocationData(null); }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    setShowInfo(false);
    setLocationData(null);
    poll();
    const timer = setInterval(poll, POLL_MS);
    return () => { cancelled = true; clearInterval(timer); };
  }, [selectedId, panToLocation]);

  const hasLocation = locationData?.latitude != null && locationData?.longitude != null;
  const markerPos   = hasLocation ? { lat: locationData.latitude, lng: locationData.longitude } : null;

  return (
    <div className={styles.wrapper}>
      {/* ── Controls ──────────────────────────────────────────────────────── */}
      <div className={styles.controls}>
        <select
          className={styles.deviceSelect}
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          disabled={devices.length === 0}
        >
          {devices.length === 0 && <option value="">No devices paired</option>}
          {devices.map((d) => (
            <option key={d.id} value={String(d.id)}>
              {d.name || `Device ${d.id}`}
            </option>
          ))}
        </select>

        {/* Map type toggle */}
        <div className={styles.styleToggle}>
          {MAP_TYPES.map((t) => (
            <button
              key={t.id}
              className={`${styles.toggleBtn} ${mapTypeId === t.id ? styles.toggleActive : ''}`}
              onClick={() => setMapTypeId(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className={styles.meta}>
          {loading && (
            <span className={styles.refreshing}>
              <span className={styles.dot} /> Refreshing…
            </span>
          )}
          {lastUpdated && !loading && (
            <span className={styles.lastUpdated}>
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* ── Map area ──────────────────────────────────────────────────────── */}
      <div className={styles.mapArea}>
        {loadError ? (
          <div className={`${styles.emptyState} ${styles.emptyStateError}`}>
            Failed to load Google Maps. Check your API key.
          </div>
        ) : !isLoaded ? (
          <div className={styles.emptyState} style={{ color: '#6b7280' }}>Loading map…</div>
        ) : devices.length === 0 ? (
          <div className={styles.emptyState}>Please add a device first</div>
        ) : (
          <>
            <GoogleMap
              mapContainerStyle={MAP_CONTAINER_STYLE}
              center={center}
              zoom={hasLocation ? DEFAULT_ZOOM : 2}
              mapTypeId={mapTypeId}
              options={BASE_MAP_OPTIONS}
              onLoad={(map) => { mapRef.current = map; }}
              onUnmount={() => { mapRef.current = null; }}
            >
              {hasLocation && (
                <Marker
                  position={markerPos}
                  title={locationData.userName}
                  animation={2} /* google.maps.Animation.DROP */
                  onClick={() => setShowInfo(true)}
                />
              )}

              {hasLocation && showInfo && (
                <InfoWindow
                  position={markerPos}
                  onCloseClick={() => setShowInfo(false)}
                >
                  <div className={styles.popup}>
                    <strong className={styles.popupName}>{locationData.userName}</strong>
                    {locationData.address && (
                      <p className={styles.popupAddress}>{locationData.address}</p>
                    )}
                    <p className={styles.popupMeta}>Accuracy: {locationData.accuracy}m</p>
                    <p className={styles.popupMeta}>
                      {new Date(locationData.timestamp).toLocaleString()}
                    </p>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>

            {/* Overlay states on top of the live map */}
            {loading && !hasLocation && (
              <div className={styles.mapOverlay}>Loading location…</div>
            )}
            {!loading && !hasLocation && !error && (
              <div className={styles.mapOverlay}>No location data for this device</div>
            )}
            {error && (
              <div className={`${styles.mapOverlay} ${styles.mapOverlayError}`}>{error}</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
