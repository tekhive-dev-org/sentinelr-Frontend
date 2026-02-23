import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { apiService } from "./api";
import { storageService } from "./storageService";
import { heartbeatService } from "./heartbeatService";

const LOCATION_TASK_NAME = "sentinelr-background-location";

// Define background task
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error("[Location Task] Error:", error);
    return;
  }

  const isPaired = await storageService.isPaired();
  const isTracking = await storageService.isTrackingEnabled();

  if (!isPaired || !isTracking) {
    return;
  }

  // Always attempt heartbeat when the background task wakes.
  // sendHeartbeat() is internally throttled by keep-alive rules.
  try {
    await heartbeatService.sendHeartbeat();
  } catch (heartbeatErr) {
    console.error("[Location Task] Heartbeat send failed:", heartbeatErr);
    if (heartbeatErr?.status === 401 || heartbeatErr?.status === 404) {
      console.log("[Location Task] Invalid token on heartbeat, stopping updates");
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      return;
    }
  }

  if (data?.locations?.length) {
    const { locations } = data;

    for (const location of locations) {
      const { latitude, longitude, accuracy, altitude, speed } =
        location.coords;

      try {
        await apiService.uploadPing({
          latitude,
          longitude,
          accuracy,
          altitude,
          speed,
          timestamp: new Date(location.timestamp).toISOString(),
          source: "GPS",
        });
        console.log("[Location Task] Ping uploaded successfully");
      } catch (err) {
        console.error("[Location Task] Failed to upload ping:", err);
        if (err.status === 401 || err.status === 404) {
          console.log(
            "[Location Task] Invalid token (401/404), stopping updates",
          );
          await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
          return;
        }
      }
    }
  }
});

export const locationService = {
  /**
   * Check if background tracking is running
   */
  async isRunning() {
    return await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME);
  },

  /**
   * Start background location tracking
   */
  async start() {
    // Check permissions first
    const { status: foreground } =
      await Location.getForegroundPermissionsAsync();
    const { status: background } =
      await Location.getBackgroundPermissionsAsync();

    if (foreground !== "granted" || background !== "granted") {
      throw new Error("Location permissions not granted");
    }

    // Check if already running
    const isRunning = await this.isRunning();
    if (isRunning) {
      console.log("[Location Service] Already running");
      return;
    }

    // Start background location updates
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.High,
      distanceInterval: 0, // send even when stationary (time-driven heartbeat)
      timeInterval: 30000, // 30 seconds
      deferredUpdatesInterval: 30000, // flush every 30s to keep backend up to date
      deferredUpdatesDistance: 0, // do not wait for movement before dispatching
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: "Sentinelr",
        notificationBody: "Location tracking is active",
        notificationColor: "#db323f",
        killServiceOnDestroy: false,
      },
      pausesUpdatesAutomatically: false,
    });

    // Mark as enabled in storage
    await storageService.setTrackingEnabled(true);
    console.log("[Location Service] Started background tracking");
  },

  /**
   * Stop background location tracking
   */
  async stop() {
    const isRunning = await this.isRunning();

    if (isRunning) {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      console.log("[Location Service] Stopped background tracking");
    }

    await storageService.setTrackingEnabled(false);
  },

  /**
   * Get current location once
   */
  async getCurrentLocation() {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy,
      timestamp: new Date(location.timestamp).toISOString(),
    };
  },

  /**
   * Ensure background tracking is running when app launches again.
   * This is important for cases where the OS restarted/terminated the app.
   */
  async ensureTrackingState() {
    try {
      const [isPaired, isTrackingEnabled, isRunning] = await Promise.all([
        storageService.isPaired(),
        storageService.isTrackingEnabled(),
        this.isRunning(),
      ]);

      if (!isPaired || !isTrackingEnabled || isRunning) {
        return;
      }

      await this.start();
      console.log("[Location Service] Restored background tracking on app launch");
    } catch (err) {
      console.warn("[Location Service] Failed to restore tracking state:", err?.message || err);
    }
  },
};
