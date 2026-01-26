import * as Battery from 'expo-battery';
import * as Device from 'expo-device';
import * as Application from 'expo-application';
import { apiService } from './api';
import { storageService } from './storageService';

const HEARTBEAT_INTERVAL = 60000; // 1 minute

let heartbeatTimer = null;

export const heartbeatService = {
  /**
   * Start periodic heartbeat
   */
  start() {
    if (heartbeatTimer) {
      console.log('[Heartbeat] Already running');
      return;
    }

    // Send initial heartbeat
    this.sendHeartbeat();

    // Set up interval
    heartbeatTimer = setInterval(() => {
      this.sendHeartbeat();
    }, HEARTBEAT_INTERVAL);

    console.log('[Heartbeat] Started');
  },

  /**
   * Stop periodic heartbeat
   */
  stop() {
    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
      console.log('[Heartbeat] Stopped');
    }
  },

  /**
   * Send single heartbeat with device status
   */
  async sendHeartbeat() {
    try {
      const isPaired = await storageService.isPaired();
      if (!isPaired) {
        console.log('[Heartbeat] Not paired, skipping');
        return;
      }

      const batteryLevel = await Battery.getBatteryLevelAsync();
      const batteryState = await Battery.getBatteryStateAsync();
      
      const status = {
        battery_level: Math.round(batteryLevel * 100),
        is_charging: batteryState === Battery.BatteryState.CHARGING,
        device_name: Device.deviceName || 'Unknown',
        device_model: Device.modelName || 'Unknown',
        device_brand: Device.brand || 'Unknown',
        os_version: Device.osVersion || 'Unknown',
        app_version: Application.nativeApplicationVersion || '1.0.0',
        timestamp: new Date().toISOString(),
      };

      await apiService.sendHeartbeat(status);
      console.log('[Heartbeat] Sent successfully');
    } catch (error) {
      console.error('[Heartbeat] Failed:', error);
    }
  },
};
