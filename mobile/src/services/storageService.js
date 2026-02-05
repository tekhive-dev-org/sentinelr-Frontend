import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/constants';

/**
 * Storage service for persistent data
 */
export const storageService = {
  // Save device credentials after pairing
  async saveDeviceCredentials(deviceId, uploadToken) {
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.DEVICE_ID, deviceId],
      [STORAGE_KEYS.UPLOAD_TOKEN, uploadToken],
      [STORAGE_KEYS.IS_PAIRED, 'true'],
    ]);
  },

  // Get device ID
  async getDeviceId() {
    return await AsyncStorage.getItem(STORAGE_KEYS.DEVICE_ID);
  },

  // Get upload token
  async getUploadToken() {
    return await AsyncStorage.getItem(STORAGE_KEYS.UPLOAD_TOKEN);
  },

  // Set upload token
  async setUploadToken(token) {
    await AsyncStorage.setItem(STORAGE_KEYS.UPLOAD_TOKEN, token);
  },

  // Check if device is paired
  async isPaired() {
    const paired = await AsyncStorage.getItem(STORAGE_KEYS.IS_PAIRED);
    return paired === 'true';
  },

  // Set paired status
  async setIsPaired(paired) {
    await AsyncStorage.setItem(STORAGE_KEYS.IS_PAIRED, paired ? 'true' : 'false');
  },

  // Set tracking enabled state
  async setTrackingEnabled(enabled) {
    await AsyncStorage.setItem(STORAGE_KEYS.TRACKING_ENABLED, enabled ? 'true' : 'false');
  },

  // Get tracking enabled state
  async isTrackingEnabled() {
    const enabled = await AsyncStorage.getItem(STORAGE_KEYS.TRACKING_ENABLED);
    return enabled === 'true';
  },

  // Clear all data (for unpair)
  async clearAll() {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.DEVICE_ID,
      STORAGE_KEYS.UPLOAD_TOKEN,
      STORAGE_KEYS.IS_PAIRED,
      STORAGE_KEYS.TRACKING_ENABLED,
    ]);
  },
};
