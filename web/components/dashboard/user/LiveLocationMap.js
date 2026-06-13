/**
 * LiveLocationMap
 * Renders a Google Map showing the live location of a selected family device.
 * Redesigned to follow modern SaaS and enterprise location-tracking standards.
 * Premium minimalist style with custom layout controls and details overlay.
 * Requires NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in .env.local
 *
 * NOTE: Must be imported with next/dynamic { ssr: false } in the parent.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import {
  useJsApiLoader,
  GoogleMap,
  Marker,
  InfoWindow,
  Circle,
} from "@react-google-maps/api";
import { devicesService } from "../../../services/devicesService";
import { supabase } from "../../../services/supabaseClient";
import styles from "./LiveLocationMap.module.css";
import { MapSkeleton } from "../../ui/loaders";

// Material Icons
import BatteryChargingFullIcon from "@mui/icons-material/BatteryChargingFull";
import SpeedIcon from "@mui/icons-material/Speed";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

const DEFAULT_ZOOM = 15;
const DEFAULT_CENTER = { lat: 20, lng: 0 };

const MAP_TYPES = [
  { id: "roadmap", label: "Map" },
  { id: "hybrid", label: "Satellite" },
];

const MAP_CONTAINER_STYLE = { width: "100%", height: "100%" };

// Premium clean, minimalist light-gray map style (Silver variant)
const SILVER_MAP_STYLE = [
  {
    featureType: "all",
    elementType: "labels.text.fill",
    stylers: [{ color: "#6b7280" }]
  },
  {
    featureType: "all",
    elementType: "labels.text.stroke",
    stylers: [{ color: "#ffffff" }, { lightness: 16 }]
  },
  {
    featureType: "all",
    elementType: "labels.icon",
    stylers: [{ visibility: "off" }]
  },
  {
    featureType: "administrative",
    elementType: "geometry.fill",
    stylers: [{ color: "#f3f4f6" }]
  },
  {
    featureType: "administrative",
    elementType: "geometry.stroke",
    stylers: [{ color: "#e5e7eb" }, { weight: 1.2 }]
  },
  {
    featureType: "landscape",
    elementType: "geometry",
    stylers: [{ color: "#f9fafb" }]
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#f3f4f6" }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry.fill",
    stylers: [{ color: "#ffffff" }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#e5e7eb" }, { weight: 0.2 }]
  },
  {
    featureType: "road.arterial",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }]
  },
  {
    featureType: "road.local",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }]
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#f3f4f6" }]
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#e0e7ff" }]
  }
];

const MAP_OPTIONS = {
  disableDefaultUI: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  zoomControl: false,
  scrollwheel: true,
  gestureHandling: "greedy",
  clickableIcons: false,
  styles: SILVER_MAP_STYLE,
};

// Simple relative-time formatter
const timeAgo = (date) => {
  if (!date) return "";
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 5) return "Just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default function LiveLocationMap({ showDetails = true }) {
  const mapRef = useRef(null);
  const realtimeDisabledRef = useRef(false);

  const [devices, setDevices] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [locationData, setLocationData] = useState(null);
  const [showInfo, setShowInfo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [mapTypeId, setMapTypeId] = useState("roadmap");
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [tick, setTick] = useState(0);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  });

  // Re-run timeAgo labels periodically
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  // ── Fetch family devices once on mount ──────────────────────────────────────
  useEffect(() => {
    devicesService
      .getFamilyDevices()
      .then((data) => {
        const list = data.devices || [];
        setDevices(list);
        if (list.length > 0) setSelectedId(String(list[0].id));
      })
      .catch((err) => console.error("[LiveLocationMap] fetch devices:", err));
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

  // ── Fetch current location then subscribe to real-time inserts ─────────────
  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;
    let channel = null;

    const fetchInitial = async () => {
      setLoading(true);
      try {
        const data = await devicesService.getLiveLocation({
          deviceId: selectedId,
        });
        if (cancelled) return;
        const loc = data.locations?.[0] ?? null;
        setLocationData(loc);
        setError(null);
        setLastUpdated(new Date());
        if (loc?.latitude != null && loc?.longitude != null) {
          panToLocation(loc.latitude, loc.longitude);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setLocationData(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    setShowInfo(false);
    setLocationData(null);
    fetchInitial();



    if (!realtimeDisabledRef.current) {
      try {
        channel = supabase
          .channel(`live-location:${selectedId}`)
          .on(
            "postgres_changes",
            {
              event: "INSERT",
              schema: "public",
              table: "Locations",
              filter: `deviceId=eq.${selectedId}`,
            },
            (payload) => {
              if (cancelled) return;
              const row = payload.new;
              setLocationData((prev) => ({
                ...prev,
                latitude: row.latitude,
                longitude: row.longitude,
                accuracy: row.accuracy,
                altitude: row.altitude,
                speed: row.speed,
                heading: row.heading,
                battery_level: row.battery_level,
                timestamp: row.timestamp ?? row.created_at,
              }));
              setError(null);
              setLastUpdated(new Date());
              panToLocation(row.latitude, row.longitude);
            },
          )
          .subscribe((status) => {
            if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
              realtimeDisabledRef.current = true;
              setError(
                (currentError) =>
                  currentError ||
                  "Live updates temporarily unavailable. Please refresh.",
              );
            }
          });
      } catch {
        realtimeDisabledRef.current = true;
      }
    }

    return () => {
      cancelled = true;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [selectedId, panToLocation]);

  const hasLocation =
    locationData?.latitude != null && locationData?.longitude != null;
  const markerPos = hasLocation
    ? { lat: locationData.latitude, lng: locationData.longitude }
    : null;

  // Active Device Name
  const activeDevice = devices.find((d) => String(d.id) === selectedId);
  const activeDeviceName = activeDevice
    ? activeDevice.name || activeDevice.deviceName || `Device ${activeDevice.id}`
    : "";

  const batteryVal = locationData?.battery_level ?? activeDevice?.batteryLevel ?? activeDevice?.battery_level ?? null;

  // Dynamic Custom Blue Dot Tracker Marker
  const getMarkerIcon = useCallback(() => {
    if (typeof window === "undefined" || !window.google) return null;
    return {
      url: `data:image/svg+xml;utf8,${encodeURIComponent(`
        <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20" cy="20" r="16" fill="rgba(59, 130, 246, 0.18)" />
          <circle cx="20" cy="20" r="9" fill="#ffffff" stroke="rgba(59, 130, 246, 0.3)" stroke-width="1.5" />
          <circle cx="20" cy="20" r="5" fill="#3b82f6" />
        </svg>
      `)}`,
      scaledSize: new window.google.maps.Size(40, 40),
      anchor: new window.google.maps.Point(20, 20),
    };
  }, []);

  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.setZoom(mapRef.current.getZoom() + 1);
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.setZoom(mapRef.current.getZoom() - 1);
    }
  };

  const handleRecenter = () => {
    if (hasLocation) {
      panToLocation(locationData.latitude, locationData.longitude);
    }
  };

  if (loadError) {
    return (
      <div className={styles.mapEmptyState}>
        Failed to load Google Maps. Check your API key.
      </div>
    );
  }

  if (!isLoaded) {
    return <MapSkeleton height="100%" />;
  }

  return (
    <div className={styles.mapSection}>
      {/* ── Overlay controls (top-left panel) ────────────────────────────── */}
      {devices.length > 0 && showDetails && (
        <div className={styles.dashboardCard}>
          <div className={styles.cardHeader}>
            <span className={styles.cardTitle}>Live Tracker</span>
            <div className={styles.liveIndicator}>
              <span className={styles.liveDot} />
              <span>{loading ? "Syncing" : "Live"}</span>
            </div>
          </div>

          <div className={styles.deviceSelectorWrapper}>
            <select
              className={styles.deviceSelector}
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              disabled={devices.length === 0}
            >
              {devices.map((d) => (
                <option key={d.id} value={String(d.id)}>
                  {d.name || d.deviceName || `Device ${d.id}`}
                </option>
              ))}
            </select>
            <ExpandMoreIcon className={styles.deviceSelectorArrow} />
          </div>

          {hasLocation ? (
            <>
              <div className={styles.addressContainer}>
                <LocationOnIcon className={styles.addressIcon} />
                <div
                  className={styles.addressText}
                  title={locationData.address || "Live Coordinates"}
                >
                  {locationData.address ||
                    `${locationData.latitude.toFixed(5)}, ${locationData.longitude.toFixed(5)}`}
                </div>
              </div>

              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <BatteryChargingFullIcon className={styles.detailIcon} />
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>Battery</span>
                    <span className={styles.detailValue}>
                      {batteryVal != null ? `${Math.round(batteryVal)}%` : "—"}
                    </span>
                  </div>
                </div>

                <div className={styles.detailItem}>
                  <GpsFixedIcon className={styles.detailIcon} />
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>Accuracy</span>
                    <span className={styles.detailValue}>
                      {locationData.accuracy != null ? `±${Math.round(locationData.accuracy)}m` : "—"}
                    </span>
                  </div>
                </div>

                <div className={styles.detailItem}>
                  <AccessTimeIcon className={styles.detailIcon} />
                  <div className={styles.detailContent}>
                    <span className={styles.detailLabel}>Updated</span>
                    <span className={styles.detailValue}>
                      {locationData.timestamp ? timeAgo(locationData.timestamp) : "—"}
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className={styles.noDataState}>
              {loading ? "Locating tracker..." : "No location data received yet"}
            </div>
          )}
        </div>
      )}

      {/* ── Map area wrapper ────────────────────────────────────────────── */}
      <div className={styles.mapWrapper}>
        {/* ── Map Style toggle (top-right overlay) ───────────────────────── */}
        {devices.length > 0 && (
          <div className={styles.floatingStyleToggle}>
            {MAP_TYPES.map((t) => (
              <button
                key={t.id}
                className={`${styles.toggleBtn} ${mapTypeId === t.id ? styles.toggleActive : ""}`}
                onClick={() => setMapTypeId(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        {/* ── Zoom and Recenter controls (bottom-right overlay) ──────────── */}
        {devices.length > 0 && (
          <div className={styles.floatingMapControls}>
            <button
              className={styles.controlBtn}
              onClick={handleRecenter}
              title="Recenter tracking"
              disabled={!hasLocation}
            >
              <MyLocationIcon fontSize="small" />
            </button>
            <button
              className={styles.controlBtn}
              onClick={handleZoomIn}
              title="Zoom In"
            >
              <AddIcon fontSize="small" />
            </button>
            <button
              className={styles.controlBtn}
              onClick={handleZoomOut}
              title="Zoom Out"
            >
              <RemoveIcon fontSize="small" />
            </button>
          </div>
        )}

        {devices.length === 0 ? (
          <div className={styles.mapEmptyState}>
            <p>Please add a device first</p>
            <button
              className={styles.primaryBtn}
              onClick={() => (window.location.href = "/dashboard/devices")}
            >
              Go to Devices
            </button>
          </div>
        ) : (
          <GoogleMap
            mapContainerStyle={MAP_CONTAINER_STYLE}
            center={center}
            zoom={hasLocation ? DEFAULT_ZOOM : 2}
            mapTypeId={mapTypeId}
            options={MAP_OPTIONS}
            onLoad={(map) => {
              mapRef.current = map;
            }}
            onUnmount={() => {
              mapRef.current = null;
            }}
          >
            {hasLocation && (
              <>
                <Marker
                  position={markerPos}
                  title={activeDeviceName || "GPS Tracker"}
                  icon={getMarkerIcon() || undefined}
                  onClick={() => setShowInfo(true)}
                />

                {locationData.accuracy != null && (
                  <Circle
                    center={markerPos}
                    radius={locationData.accuracy}
                    options={{
                      strokeColor: "#3b82f6",
                      strokeOpacity: 0.22,
                      strokeWeight: 1,
                      fillColor: "#3b82f6",
                      fillOpacity: 0.05,
                      clickable: false,
                      editable: false,
                      visible: true,
                      zIndex: 1,
                    }}
                  />
                )}
              </>
            )}

            {hasLocation && showInfo && (
              <InfoWindow
                position={markerPos}
                onCloseClick={() => setShowInfo(false)}
              >
                <div className={styles.popup}>
                  <strong className={styles.popupName}>
                    {activeDeviceName || "Live Tracker"}
                  </strong>
                  {locationData.address && (
                    <p className={styles.popupAddress}>
                      {locationData.address}
                    </p>
                  )}
                  {locationData.battery_level != null && (
                    <p className={styles.popupMeta}>
                      Battery: {locationData.battery_level}%
                    </p>
                  )}
                  <p className={styles.popupMeta}>
                    Accuracy: {locationData.accuracy != null ? `${Math.round(locationData.accuracy)}m` : "—"}
                  </p>
                  <p className={styles.popupMeta}>
                    {locationData.timestamp
                      ? new Date(locationData.timestamp).toLocaleString()
                      : ""}
                  </p>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        )}

        {/* Overlay messages on top of the live map */}
        {!loading && !hasLocation && !error && devices.length > 0 && (
          <div className={styles.mapOverlay}>
            No location data for this device
          </div>
        )}
        {error && (
          <div className={`${styles.mapOverlay} ${styles.mapOverlayError}`}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

