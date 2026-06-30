import * as Battery from "expo-battery";
import * as BackgroundTask from "expo-background-task";
import * as Device from "expo-device";
import { AppState } from "react-native";
import * as TaskManager from "expo-task-manager";
import { apiService } from "./api";
import { storageService } from "./storageService";

const BACKGROUND_HEARTBEAT_TASK = "sentinelr-background-heartbeat";
const BACKGROUND_HEARTBEAT_INTERVAL_MINUTES = 15;

let isHeartbeatRunning = false;
let errorCallback = null;
let batteryCallback = null;
let appStateSubscription = null;
let batteryLevelSubscription = null;
let batteryStateSubscription = null;

// Track last sent status to avoid redundant uploads
let lastStatus = null;
let heartbeatInFlight = false;

function statusesMatch(currentStatus, previousStatus) {
  if (!currentStatus || !previousStatus) return false;

  return (
    currentStatus.batteryLevel === previousStatus.batteryLevel &&
    currentStatus.isCharging === previousStatus.isCharging &&
    currentStatus.deviceName === previousStatus.deviceName &&
    currentStatus.deviceModel === previousStatus.deviceModel &&
    currentStatus.brand === previousStatus.brand &&
    currentStatus.osVersion === previousStatus.osVersion
  );
}

async function getCurrentStatus() {
  const batteryLevel = await Battery.getBatteryLevelAsync();
  const batteryState = await Battery.getBatteryStateAsync();
  const batteryPct = Math.round(batteryLevel * 100);

  return {
    batteryLevel: batteryPct,
    isCharging: batteryState === Battery.BatteryState.CHARGING,
    deviceName: Device.deviceName || "Unknown",
    deviceModel: Device.modelName || "Unknown",
    brand: Device.brand || "Unknown",
    osVersion: Device.osVersion || "Unknown",
  };
}

async function registerBackgroundHeartbeat() {
  try {
    await BackgroundTask.registerTaskAsync(BACKGROUND_HEARTBEAT_TASK, {
      minimumInterval: BACKGROUND_HEARTBEAT_INTERVAL_MINUTES,
    });
  } catch (error) {
    console.warn("[Heartbeat] Background heartbeat registration failed:", error?.message || error);
  }
}

async function unregisterBackgroundHeartbeat() {
  try {
    await BackgroundTask.unregisterTaskAsync(BACKGROUND_HEARTBEAT_TASK);
  } catch (error) {
    console.warn("[Heartbeat] Background heartbeat unregister failed:", error?.message || error);
  }
}

TaskManager.defineTask(BACKGROUND_HEARTBEAT_TASK, async () => {
  try {
    await heartbeatService.sendHeartbeat();
    return BackgroundTask.BackgroundTaskResult.Success;
  } catch (error) {
    console.warn("[Heartbeat] Background heartbeat failed:", error?.message || error);
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});

export const heartbeatService = {
  /**
   * Start periodic heartbeat
   * @param {Function} onError - Callback for critical errors (e.g. auth failure)
   */
  start(onError, onBatteryUpdate) {
    if (onError) errorCallback = onError;
    if (onBatteryUpdate) batteryCallback = onBatteryUpdate;

    if (isHeartbeatRunning) {
      // console.log("[Heartbeat] Already running");
      return;
    }

    isHeartbeatRunning = true;

    // Send initial heartbeat after pairing/app restore. Later sends are status-driven.
    this.sendHeartbeat();
    registerBackgroundHeartbeat();

    batteryLevelSubscription = Battery.addBatteryLevelListener(() => {
      this.sendHeartbeat();
    });

    batteryStateSubscription = Battery.addBatteryStateListener(() => {
      this.sendHeartbeat();
    });

    // Refresh status when the app becomes active again without forcing an upload.
    if (!appStateSubscription) {
      appStateSubscription = AppState.addEventListener('change', (nextState) => {
        if (nextState === 'active') {
          this.sendHeartbeat();
        }
      });
    }
  },

  /**
   * Stop periodic heartbeat
   */
  stop() {
    isHeartbeatRunning = false;
    errorCallback = null;
    batteryCallback = null;
    lastStatus = null;
    if (appStateSubscription) {
      appStateSubscription.remove();
      appStateSubscription = null;
    }
    if (batteryLevelSubscription) {
      batteryLevelSubscription.remove();
      batteryLevelSubscription = null;
    }
    if (batteryStateSubscription) {
      batteryStateSubscription.remove();
      batteryStateSubscription = null;
    }
    unregisterBackgroundHeartbeat();
  },

  /**
   * Send single heartbeat with device status
   */
  async sendHeartbeat() {
    if (heartbeatInFlight) {
      return;
    }

    heartbeatInFlight = true;

    try {
      const isPaired = await storageService.isPaired();
      if (!isPaired) {
        return;
      }

      // Verify device is still active in the DB before sending
      const isActive = await storageService.checkDeviceActive();
      if (!isActive) {
        this.stop();
        return;
      }

      const status = await getCurrentStatus();

      // Keep UI in sync with exactly what we send to the API
      if (batteryCallback) batteryCallback(status.batteryLevel);

      // Check if we should send only when status changes.
      const previousStatus = lastStatus || await storageService.getLastHeartbeatStatus();
      const shouldSend = !statusesMatch(status, previousStatus);

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
      await storageService.setLastHeartbeatStatus(status);
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
    } finally {
      heartbeatInFlight = false;
    }
  },
};
