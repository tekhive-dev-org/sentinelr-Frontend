import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiService } from "../services/api";
import { getSupabase } from "../services/supabaseClient";

const DeviceContext = createContext(null);

const STORAGE_KEYS = {
  DEVICE_ID: "@sentinelr/device_id",
  UPLOAD_TOKEN: "@sentinelr/upload_token",
  IS_PAIRED: "@sentinelr/is_paired",
  TRACKING_ENABLED: "@sentinelr/tracking_enabled",
};

export function DeviceProvider({ children }) {
  const [deviceId, setDeviceId] = useState(null);
  const [uploadToken, setUploadToken] = useState(null);
  const [isPaired, setIsPaired] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [batteryLevel, setBatteryLevel] = useState(null);
  const [lastPingTime, setLastPingTime] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("offline");
  const hasRegisteredAuthHandler = useRef(false);

  // Clear all local pairing state, stop services, and optionally notify the user
  const forceUnpair = useCallback(async (showAlert = true) => {
    // Stop background services
    try {
      const { locationService } = await import("../services/locationService");
      const { heartbeatService } = await import("../services/heartbeatService");
      await locationService.stop();
      heartbeatService.stop();
    } catch {}

    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEYS.DEVICE_ID),
      AsyncStorage.removeItem(STORAGE_KEYS.UPLOAD_TOKEN),
      AsyncStorage.removeItem(STORAGE_KEYS.IS_PAIRED),
      AsyncStorage.removeItem(STORAGE_KEYS.TRACKING_ENABLED),
    ]);
    setDeviceId(null);
    setUploadToken(null);
    setIsPaired(false);
    setIsTracking(false);
    setCurrentLocation(null);
    setBatteryLevel(null);
    setLastPingTime(null);
    setConnectionStatus("offline");

    if (showAlert) {
      Alert.alert(
        "Device Unpaired",
        "This device has been unpaired from the dashboard. You can re-pair it by entering a new pairing code.",
        [{ text: "OK" }],
      );
    }
  }, []);

  // Register global 401/404 handler once
  useEffect(() => {
    if (!hasRegisteredAuthHandler.current) {
      apiService.onAuthFailure(() => {
        forceUnpair();
      });
      hasRegisteredAuthHandler.current = true;
    }
  }, [forceUnpair]);

  // Real-time subscription — listen for device row changes via Supabase
  useEffect(() => {
    if (!isPaired || !deviceId) return;

    const supabase = getSupabase();
    if (!supabase) return;

    const channel = supabase
      .channel(`device-${deviceId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "Devices",
          filter: `id=eq.${deviceId}`,
        },
        (payload) => {
          const newStatus = payload.new?.pairStatus;
          if (
            newStatus === "Unpaired" ||
            newStatus === "unpaired"
          ) {
            forceUnpair(true);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isPaired, deviceId, forceUnpair]);

  // Load saved state on mount
  useEffect(() => {
    loadSavedState();
  }, []);

  const loadSavedState = async () => {
    try {
      const [savedDeviceId, savedToken, savedPaired, savedTracking] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.DEVICE_ID),
        AsyncStorage.getItem(STORAGE_KEYS.UPLOAD_TOKEN),
        AsyncStorage.getItem(STORAGE_KEYS.IS_PAIRED),
        AsyncStorage.getItem(STORAGE_KEYS.TRACKING_ENABLED),
      ]);

      if (savedDeviceId) setDeviceId(savedDeviceId);
      if (savedToken) setUploadToken(savedToken);
      if (savedPaired === "true") {
        setIsPaired(true);

        // Validate the stored token with the backend
        const isValid = await apiService.validateToken();
        if (!isValid) {
          // Token expired or revoked — clear local state to show pairing screen
          await forceUnpair(true);
          return;
        }
      }
      if (savedTracking === "true") setIsTracking(true);
    } catch (error) {
      // Silent failure
    } finally {
      setIsLoading(false);
    }
  };

  const completePairing = async (newDeviceId, newToken) => {
    if (!newDeviceId) {
      throw new Error("Device ID is required for pairing");
    }

    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.DEVICE_ID, String(newDeviceId)),
        AsyncStorage.setItem(STORAGE_KEYS.UPLOAD_TOKEN, newToken || ""),
        AsyncStorage.setItem(STORAGE_KEYS.IS_PAIRED, "true"),
        AsyncStorage.setItem(STORAGE_KEYS.TRACKING_ENABLED, "false"),
      ]);

      setDeviceId(newDeviceId);
      setUploadToken(newToken);
      setIsPaired(true);
    } catch (error) {
      throw error;
    }
  };

  const unpairDevice = async () => {
    try {
      // Notify backend first so the web dashboard reflects "Unpaired" status
      if (deviceId) {
        try {
          await apiService.unpairDevice(deviceId);
        } catch {
          // Non-fatal: still clear local state even if backend call fails
        }
      }

      await forceUnpair(false);
    } catch (error) {
      throw error;
    }
  };

  /**
   * Remove device from dashboard (soft-delete) and clear local state.
   * Calls DELETE /device/{id} on the backend, then clears local storage.
   */
  const removeDeviceFromDashboard = async () => {
    try {
      // Call backend to hide device from dashboard
      if (deviceId) {
        try {
          await apiService.removeDevice(deviceId);
        } catch {
          // Non-fatal
        }
      }

      await forceUnpair(false);
    } catch (error) {
      throw error;
    }
  };

  const toggleTracking = (value) => {
    const nextValue = typeof value === "boolean" ? value : !isTracking;
    setIsTracking(nextValue);
    AsyncStorage.setItem(
      STORAGE_KEYS.TRACKING_ENABLED,
      nextValue ? "true" : "false",
    ).catch(() => {});
  };

  const updateLocation = (location) => {
    setCurrentLocation(location);
    setLastPingTime(new Date());
  };

  const updateBattery = (level) => {
    setBatteryLevel(level);
  };

  const updateConnectionStatus = (status) => {
    setConnectionStatus(status);
  };

  const value = {
    // Pairing state
    deviceId,
    uploadToken,
    isPaired,
    isLoading,

    // Tracking state
    isTracking,
    currentLocation,
    batteryLevel,
    lastPingTime,
    connectionStatus,

    // Actions
    completePairing,
    unpairDevice,
    removeDeviceFromDashboard,
    toggleTracking,
    updateLocation,
    updateBattery,
    updateConnectionStatus,
  };

  return (
    <DeviceContext.Provider value={value}>{children}</DeviceContext.Provider>
  );
}

export function useDevice() {
  const context = useContext(DeviceContext);
  if (!context) {
    throw new Error("useDevice must be used within DeviceProvider");
  }
  return context;
}
