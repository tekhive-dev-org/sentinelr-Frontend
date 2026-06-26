import { useState, useEffect, useRef, useCallback } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import { devicesService } from "../../../../services/devicesService";
import { supabase } from "../../../../services/supabaseClient";
import { DEFAULT_CENTER, DEFAULT_ZOOM } from "./mapConstants";

export function useLiveLocation() {
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
          <circle cx="20" cy="20" r="5" fill="#3d09d0" />
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
