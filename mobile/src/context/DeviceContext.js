import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
      if (savedPaired === "true") setIsPaired(true);
      if (savedTracking === "true") setIsTracking(true);
    } catch (error) {
      console.error("Error loading saved state:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const completePairing = async (newDeviceId, newToken) => {
    if (!newDeviceId) {
      console.error(
        "[DeviceContext] completePairing called with null/undefined deviceId",
      );
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

      console.log("[DeviceContext] Pairing completed:", newDeviceId);
    } catch (error) {
      console.error("Error saving pairing data:", error);
      throw error;
    }
  };

  const unpairDevice = async () => {
    try {
      // Notify backend first so the web dashboard reflects "Unpaired" status
      if (deviceId) {
        try {
          const { apiService } = await import("../services/api");
          await apiService.unpairDevice(deviceId);
          console.log("[DeviceContext] Backend notified of unpair");
        } catch (apiErr) {
          // Non-fatal: still clear local state even if backend call fails
          console.warn(
            "[DeviceContext] Backend unpair call failed (continuing):",
            apiErr.message,
          );
        }
      }

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

      console.log("[DeviceContext] Device unpaired");
    } catch (error) {
      console.error("Error unpairing device:", error);
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
          const { apiService } = await import("../services/api");
          await apiService.removeDevice(deviceId);
          console.log("[DeviceContext] Backend notified of device removal");
        } catch (apiErr) {
          console.warn(
            "[DeviceContext] Backend remove call failed (continuing):",
            apiErr.message,
          );
        }
      }

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

      console.log("[DeviceContext] Device removed from dashboard");
    } catch (error) {
      console.error("Error removing device:", error);
      throw error;
    }
  };

  const toggleTracking = (value) => {
    const nextValue = typeof value === "boolean" ? value : !isTracking;
    setIsTracking(nextValue);
    AsyncStorage.setItem(
      STORAGE_KEYS.TRACKING_ENABLED,
      nextValue ? "true" : "false",
    ).catch((error) =>
      console.error("Error persisting tracking state:", error),
    );
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
