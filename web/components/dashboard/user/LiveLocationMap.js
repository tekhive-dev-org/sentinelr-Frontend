import {
  GoogleMap,
  Marker,
  InfoWindow,
  Circle,
} from "@react-google-maps/api";
import styles from "./LiveLocationMap.module.css";
import { MapSkeleton } from "../../ui/loaders";

// Material Icons
import BatteryChargingFullIcon from "@mui/icons-material/BatteryChargingFull";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

// Constants & Hooks
import {
  DEFAULT_ZOOM,
  MAP_CONTAINER_STYLE,
  MAP_OPTIONS,
  MAP_TYPES,
  timeAgo,
} from "./liveLocation/mapConstants";
import { useLiveLocation } from "./liveLocation/useLiveLocation";

export default function LiveLocationMap({ showDetails = true }) {
  const {
    mapRef,
    devices,
    selectedId,
    setSelectedId,
    locationData,
    showInfo,
    setShowInfo,
    loading,
    error,
    mapTypeId,
    setMapTypeId,
    center,
    isLoaded,
    loadError,
    hasLocation,
    markerPos,
    activeDeviceName,
    batteryVal,
    getMarkerIcon,
    handleZoomIn,
    handleZoomOut,
    handleRecenter,
  } = useLiveLocation();

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
      {/* Overlay controls (top-left panel) */}
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

      {/* Map area wrapper */}
      <div className={styles.mapWrapper}>
        {/* Map Style toggle (top-right overlay) */}
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

        {/* Zoom and Recenter controls (bottom-right overlay) */}
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
                      strokeColor: "#3d09d0",
                      strokeOpacity: 0.22,
                      strokeWeight: 1,
                      fillColor: "#3d09d0",
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
