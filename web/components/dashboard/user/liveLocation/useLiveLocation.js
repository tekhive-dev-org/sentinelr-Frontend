import { useState, useEffect, useRef, useCallback } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import { devicesService } from "../../../../services/devicesService";
import { useLocationsSubscription, useDevicesSubscription } from "../../../../context/RealtimeSubscriptionContext";
import { DEFAULT_CENTER, DEFAULT_ZOOM } from "./mapConstants";

export function useLiveLocation() {
  const mapRef = useRef(null);

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

  // Fetch family devices once on mount
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

  // Smooth pan to updated position
  const panToLocation = useCallback((lat, lng) => {
    const pos = { lat, lng };
    setCenter(pos);
    if (mapRef.current) {
      mapRef.current.panTo(pos);
      mapRef.current.setZoom(DEFAULT_ZOOM);
    }
  }, []);

  // Fetch current location then subscribe to real-time inserts
  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;
    const retryTimerRef = { current: null };
    const retryCountRef = { current: 0 };
    const MAX_RETRIES = 5;

    const clearRetryTimer = () => {
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
    };

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
        retryCountRef.current = 0; // reset on success
        if (loc?.latitude != null && loc?.longitude != null) {
          panToLocation(loc.latitude, loc.longitude);
        }
      } catch (err) {
        if (cancelled) return;
        setError(err.message);
        setLocationData(null);

        // Auto-refetch with exponential backoff after apiRequest retries are exhausted
        if (retryCountRef.current < MAX_RETRIES) {
          retryCountRef.current += 1;
          const delay = Math.min(5000 * Math.pow(2, retryCountRef.current - 1), 60000);
          // 5s, 10s, 20s, 40s, 60s (capped)
          console.warn(
            `[useLiveLocation] fetch failed, auto-refetch #${retryCountRef.current} in ${delay / 1000}s`
          );
          retryTimerRef.current = setTimeout(() => {
            if (!cancelled) fetchInitial();
          }, delay);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    setShowInfo(false);
    setLocationData(null);
    setError(null);
    fetchInitial();

    return () => {
      cancelled = true;
      clearRetryTimer();
    };
  }, [selectedId, panToLocation]);

  // Subscribe to Locations inserts via the centralized realtime service
  useLocationsSubscription(
    (payload) => {
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
    { deviceId: selectedId },
    [selectedId, panToLocation],
  );

  // Subscribe to Devices updates — keeps battery, status, lastSeen etc. real-time
  useDevicesSubscription(
    (payload) => {
      const updatedDevice = payload.new;
      if (!updatedDevice?.id) return;
      setDevices((prev) =>
        prev.map((d) =>
          String(d.id) === String(updatedDevice.id)
            ? { ...d, ...updatedDevice }
            : d
        )
      );
    },
    [setDevices],
  );

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

    // Minified SVG with no whitespace for reliable base64 encoding
    const svg =
      '<svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">' +
      '<circle cx="20" cy="20" r="16" fill="rgba(59,130,246,0.18)"/>' +
      '<circle cx="20" cy="20" r="9" fill="#ffffff" stroke="rgba(59,130,246,0.3)" stroke-width="1.5"/>' +
      '<circle cx="20" cy="20" r="5" fill="#3d09d0"/>' +
      '</svg>';

    try {
      return {
        url: "data:image/svg+xml;base64," + window.btoa(svg),
        size: new window.google.maps.Size(40, 40),
        scaledSize: new window.google.maps.Size(40, 40),
        anchor: new window.google.maps.Point(20, 20),
      };
    } catch {
      // Fallback if btoa fails
      return {
        url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg),
        size: new window.google.maps.Size(40, 40),
        scaledSize: new window.google.maps.Size(40, 40),
        anchor: new window.google.maps.Point(20, 20),
      };
    }
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

  return {
    mapRef,
    devices,
    selectedId,
    setSelectedId,
    locationData,
    showInfo,
    setShowInfo,
    loading,
    error,
    lastUpdated,
    mapTypeId,
    setMapTypeId,
    center,
    isLoaded,
    loadError,
    hasLocation,
    markerPos,
    activeDevice,
    activeDeviceName,
    batteryVal,
    getMarkerIcon,
    handleZoomIn,
    handleZoomOut,
    handleRecenter,
    panToLocation,
  };
}
