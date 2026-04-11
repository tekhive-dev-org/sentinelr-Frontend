import * as Battery from "expo-battery";
import * as Device from "expo-device";
import { AppState } from "react-native";
import { apiService } from "./api";
import { storageService } from "./storageService";

const HEARTBEAT_INTERVAL = 60000; // 1 minute
const KEEP_ALIVE_INTERVAL = 5 * 60 * 1000; // 5 minutes

let heartbeatTimer = null;
let errorCallback = null;
let appStateSubscription = null;

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

    // Listen for app going to background — send heartbeat immediately
    if (!appStateSubscription) {
      appStateSubscription = AppState.addEventListener('change', (nextState) => {
        if (nextState === 'background' || nextState === 'inactive') {
          // Force-send regardless of change detection
          this.sendHeartbeat(true);
        }
      });
    }
  },

  /**
   * Stop periodic heartbeat
   */
  stop() {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
      errorCallback = null;
    }
    if (appStateSubscription) {
      appStateSubscription.remove();
      appStateSubscription = null;
    }
  },

  /**
   * Send single heartbeat with device status
   */
  async sendHeartbeat(force = false) {
    try {
      const isPaired = await storageService.isPaired();
      if (!isPaired) {
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
        force ||
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
    } catch (error) {
      // Handle definitive auth errors — only 401 or explicit code
      if (
        (error.status === 401 ||
          error.code === "DEVICE_AUTH_INVALID") &&
        errorCallback
      ) {
        errorCallback(error);
        this.stop();
      }
    }
  },
};
