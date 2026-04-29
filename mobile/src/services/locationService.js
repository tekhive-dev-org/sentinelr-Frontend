import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { apiService } from "./api";
import { storageService } from "./storageService";
import { heartbeatService } from "./heartbeatService";

const LOCATION_TASK_NAME = "sentinelr-background-location";

// Simple in-process event bus for ping updates (works when app is in foreground)
const _listeners = new Set();

export const locationEvents = {
  /** Subscribe to ping events. Returns an unsubscribe function. */
  onPing(callback) {
    _listeners.add(callback);
    return () => _listeners.delete(callback);
  },
  /** @internal */
  _emit(location) {
    for (const cb of _listeners) {
      try { cb(location); } catch {}
    }
  },
};

// Define background task
TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
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
    if (heartbeatErr?.status === 401 || heartbeatErr?.status === 404) {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
      return;
    }
  }

  if (data?.locations?.length) {
    const { locations } = data;

    for (const location of locations) {
      const { latitude, longitude, accuracy, altitude, speed } =
        location.coords;

      const ping = {
          latitude,
          longitude,
          accuracy,
          altitude,
          speed,
          timestamp: new Date(location.timestamp).toISOString(),
          source: "GPS",
        };

      try {
        console.log("[Location] Uploading ping:", JSON.stringify(ping));
        await apiService.uploadPing(ping);
        console.log("[Location] Ping uploaded successfully");
        locationEvents._emit(ping);
      } catch (err) {
        console.warn("[Location] Ping upload failed:", err.message, err.status);
        locationEvents._emit(ping); // still update UI with latest coords
        if (err.status === 401 || err.status === 404) {
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
  },

  /**
   * Stop background location tracking
   */
  async stop() {
    const isRunning = await this.isRunning();

    if (isRunning) {
      await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME);
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
    } catch (err) {
      // silently fail
    }
  },
};
