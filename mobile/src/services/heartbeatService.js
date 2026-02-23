import * as Battery from "expo-battery";
import * as Device from "expo-device";
import { apiService } from "./api";
import { storageService } from "./storageService";

const HEARTBEAT_INTERVAL = 60000; // 1 minute
const KEEP_ALIVE_INTERVAL = 5 * 60 * 1000; // 5 minutes

let heartbeatTimer = null;
let errorCallback = null;

// Track last sent status to avoid redundant uploads
let lastStatus = null;
let lastSentTime = 0;

export const heartbeatService = {
  /**
   * Start periodic heartbeat
   * @param {Function} onError - Callback for critical errors (e.g. auth failure)
   */
  start(onError) {
    if (onError) {
      errorCallback = onError;
    }

    if (heartbeatTimer) {
      // console.log("[Heartbeat] Already running");
      return;
    }

    // Send initial heartbeat
    this.sendHeartbeat();

    // Set up interval
    heartbeatTimer = setInterval(() => {
      this.sendHeartbeat();
    }, HEARTBEAT_INTERVAL);

    // console.log("[Heartbeat] Started");
  },

  /**
   * Stop periodic heartbeat
   */
  stop() {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
      errorCallback = null;
      console.log("[Heartbeat] Stopped");
    }
  },

  /**
   * Send single heartbeat with device status
   */
  async sendHeartbeat() {
    try {
      const isPaired = await storageService.isPaired();
      if (!isPaired) {
        console.log("[Heartbeat] Not paired, skipping");
        return;
      }

      const batteryLevel = await Battery.getBatteryLevelAsync();
      const batteryState = await Battery.getBatteryStateAsync();

      const status = {
        batteryLevel: Math.round(batteryLevel * 100),
        isCharging: batteryState === Battery.BatteryState.CHARGING,
        deviceName: Device.deviceName || "Unknown",
        deviceModel: Device.modelName || "Unknown",
        brand: Device.brand || "Unknown",
        osVersion: Device.osVersion || "Unknown",
        // timestamp is generated at send time
      };

      // Check if we should send (change in status or keep-alive)
      const now = Date.now();
      const shouldSend =
        !lastStatus ||
        status.batteryLevel !== lastStatus.batteryLevel ||
        status.isCharging !== lastStatus.isCharging ||
        now - lastSentTime > KEEP_ALIVE_INTERVAL;

      if (!shouldSend) {
        // console.log("[Heartbeat] No changes, skipping");
        return;
      }

      // Add timestamp for API
      const payload = {
        ...status,
        timestamp: new Date().toISOString(),
      };

      await apiService.sendHeartbeat(payload);

      // Update last state
      lastStatus = status;
      lastSentTime = now;
      console.log("[Heartbeat] Sent successfully");
    } catch (error) {
      console.error(
        "[Heartbeat] Failed:",
        error.message,
        "Status:",
        error.status,
      );

      // Handle auth errors (401/404) by invoking callback
      if (
        (error.status === 401 ||
          error.status === 404 ||
          error.code === "DEVICE_AUTH_INVALID") &&
        errorCallback
      ) {
        console.log("[Heartbeat] Auth validaton failed, calling error handler");
        errorCallback(error);
        this.stop(); // Stop service to prevent spam
      }
    }
  },
};
