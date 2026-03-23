import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { apiService } from "./api";
import { storageService } from "./storageService";

const GEOFENCING_TASK_NAME = "sentinelr-geofencing";

// Define the background geofencing task
TaskManager.defineTask(GEOFENCING_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.error("[Geofencing Task] Error:", error);
    return;
  }

  const isPaired = await storageService.isPaired();
  if (!isPaired) {
    return;
  }

  if (data?.eventType && data?.region) {
    const { eventType, region } = data;

    const type =
      eventType === Location.GeofencingEventType.Enter ? "entry" : "exit";

    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      await apiService.reportGeofenceEvent({
        geofenceId: region.identifier,
        type,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        timestamp: new Date().toISOString(),
      });

      console.log(
        `[Geofencing Task] Reported ${type} for region ${region.identifier}`,
      );
    } catch (err) {
      console.error("[Geofencing Task] Failed to report event:", err);
    }
  }
});

export const geofencingService = {
  /**
   * Check if geofencing monitoring is currently running.
   */
  async isRunning() {
    return await Location.hasStartedGeofencingAsync(GEOFENCING_TASK_NAME);
  },

  /**
   * Fetch geofences from the backend and start monitoring them.
   * Replaces any previously monitored regions.
   */
  async syncAndStart() {
    const { status: foreground } =
      await Location.getForegroundPermissionsAsync();
    const { status: background } =
      await Location.getBackgroundPermissionsAsync();

    if (foreground !== "granted" || background !== "granted") {
      console.warn("[Geofencing] Location permissions not granted");
      return;
    }

    try {
      const response = await apiService.getGeofences();
      const geofences = response.geofences || [];

      // Filter to active geofences only
      const activeGeofences = geofences.filter((g) => g.isActive);

      if (activeGeofences.length === 0) {
        await this.stop();
        console.log("[Geofencing] No active geofences, monitoring stopped");
        return;
      }

      // Convert to expo-location region format
      const regions = activeGeofences.map((g) => ({
        identifier: String(g.id),
        latitude: g.center.latitude,
        longitude: g.center.longitude,
        radius: g.radius || 100,
        notifyOnEnter: g.notifyOnEntry !== false,
        notifyOnExit: g.notifyOnExit !== false,
      }));

      // Stop existing monitoring before restarting with new regions
      const isRunning = await this.isRunning();
      if (isRunning) {
        await Location.stopGeofencingAsync(GEOFENCING_TASK_NAME);
      }

      await Location.startGeofencingAsync(GEOFENCING_TASK_NAME, regions);
      console.log(
        `[Geofencing] Monitoring ${regions.length} active geofence(s)`,
      );
    } catch (err) {
      console.error("[Geofencing] Failed to sync and start:", err);
    }
  },

  /**
   * Stop geofencing monitoring.
   */
  async stop() {
    try {
      const isRunning = await this.isRunning();
      if (isRunning) {
        await Location.stopGeofencingAsync(GEOFENCING_TASK_NAME);
        console.log("[Geofencing] Monitoring stopped");
      }
    } catch (err) {
      console.error("[Geofencing] Failed to stop:", err);
    }
  },

  /**
   * Ensure geofencing is running if the device is paired.
   * Call this on app launch to restore state after OS restarts.
   */
  async ensureGeofencingState() {
    try {
      const isPaired = await storageService.isPaired();
      if (!isPaired) {
        return;
      }

      const isRunning = await this.isRunning();
      if (!isRunning) {
        await this.syncAndStart();
        console.log("[Geofencing] Restored monitoring on app launch");
      }
    } catch (err) {
      console.warn(
        "[Geofencing] Failed to restore state:",
        err?.message || err,
      );
    }
  },
};
