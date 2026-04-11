import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { Alert, AppState } from "react-native";
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
  const pairCheckInterval = useRef(null);

  // Query the database directly for the device's current pairStatus
  const checkPairStatusInDb = useCallback(async (id) => {
    const checkId = id || deviceId;
    if (!checkId) return true; // no device to check
    const supabase = getSupabase();
    if (!supabase) return true; // can't check without client, assume still paired
    try {
      const { data, error } = await supabase
        .from("Devices")
        .select("pairStatus")
        .eq("id", checkId)
        .maybeSingle();
      if (error) {
        console.warn("[DeviceContext] pairStatus query error:", error.message);
        return true; // query failed, assume still paired
      }
      if (!data) {
        console.warn("[DeviceContext] Device not found in DB, id:", checkId);
        return true; // row not found — could be RLS, assume still paired
      }
      const status = data.pairStatus;
      console.log("[DeviceContext] DB pairStatus:", status, "for device:", checkId);
      if (status === "Unpaired" || status === "unpaired") {
        return false;
      }
      return true;
    } catch (err) {
      console.warn("[DeviceContext] pairStatus check failed:", err);
      return true; // network/other error, assume still paired
    }
  }, [deviceId]);

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

  // Register global auth-failure handler once.
  // Do not unpair immediately on auth errors; only unpair when backend pairStatus says Unpaired.
  useEffect(() => {
    if (!hasRegisteredAuthHandler.current) {
      apiService.onAuthFailure(async () => {
        const stillPaired = await checkPairStatusInDb();
        if (!stillPaired) {
          await forceUnpair(true);
        }
      });
      hasRegisteredAuthHandler.current = true;
    }
  }, [forceUnpair, checkPairStatusInDb]);

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

  // Re-check pairStatus in DB when app comes back to foreground
  useEffect(() => {
    if (!isPaired || !deviceId) return;

    const subscription = AppState.addEventListener("change", async (nextState) => {
      if (nextState === "active") {
        const stillPaired = await checkPairStatusInDb();
        if (!stillPaired) {
          await forceUnpair(true);
        }
      }
    });

    return () => subscription.remove();
  }, [isPaired, deviceId, forceUnpair, checkPairStatusInDb]);

  // Periodic pairStatus polling as a fallback for the realtime subscription
  useEffect(() => {
    if (!isPaired || !deviceId) {
      if (pairCheckInterval.current) {
        clearInterval(pairCheckInterval.current);
        pairCheckInterval.current = null;
      }
      return;
    }

    pairCheckInterval.current = setInterval(async () => {
      const stillPaired = await checkPairStatusInDb();
      if (!stillPaired) {
        await forceUnpair(true);
      }
    }, 30000); // every 30 seconds

    return () => {
      if (pairCheckInterval.current) {
        clearInterval(pairCheckInterval.current);
        pairCheckInterval.current = null;
      }
    };
  }, [isPaired, deviceId, forceUnpair, checkPairStatusInDb]);

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
      }
      if (savedTracking === "true") setIsTracking(true);
    } catch (error) {
      console.warn("[DeviceContext] loadSavedState error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // After loading saved state, validate pairing in the background (non-blocking)
  useEffect(() => {
    if (!isPaired || !deviceId || isLoading) return;

    let cancelled = false;
    (async () => {
      // Check pairStatus in the database
      const stillPaired = await checkPairStatusInDb(deviceId);
      if (!cancelled && !stillPaired) {
        console.log("[DeviceContext] DB says device is unpaired, forcing unpair");
        await forceUnpair(true);
        return;
      }

      // Also validate whether the token is still accepted.
      // Keep local pairing state when token is invalid to avoid unintended unpairing.
      const isValid = await apiService.validateToken();
      if (!cancelled && !isValid) {
        console.log("[DeviceContext] Token invalid; keeping paired state until backend pairStatus changes");
      }
    })();

    return () => { cancelled = true; };
  }, [isPaired, deviceId, isLoading, checkPairStatusInDb, forceUnpair]);

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
      if (deviceId) {
        // 1) Try the backend API (may fail if device token lacks permission)
        try {
          await apiService.unpairDevice(deviceId);
        } catch {
          // Non-fatal — fall through to direct DB update
        }

        // 2) Update pairStatus directly in Supabase so the web dashboard sees it immediately
        const supabase = getSupabase();
        if (supabase) {
          try {
            await supabase
              .from("Devices")
              .update({ pairStatus: "Unpaired" })
              .eq("id", deviceId);
          } catch {
            // Non-fatal: still clear local state
          }
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
      if (deviceId) {
        // 1) Try the backend API
        try {
          await apiService.removeDevice(deviceId);
        } catch {
          // Non-fatal
        }

        // 2) Update pairStatus directly in Supabase so the web sees it
        const supabase = getSupabase();
        if (supabase) {
          try {
            await supabase
              .from("Devices")
              .update({ pairStatus: "Unpaired" })
              .eq("id", deviceId);
          } catch {
            // Non-fatal
          }
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
