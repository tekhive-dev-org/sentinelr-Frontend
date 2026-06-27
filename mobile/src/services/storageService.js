import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/constants';
import { getSupabase } from './supabaseClient';

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

  // Get device user ID (the parent/owner userId linked to this device)
  async getDeviceUserId() {
    return await AsyncStorage.getItem(STORAGE_KEYS.DEVICE_USER_ID);
  },

  // Set device user ID
  async setDeviceUserId(userId) {
    await AsyncStorage.setItem(STORAGE_KEYS.DEVICE_USER_ID, String(userId));
  },

  // Get upload token
  async getUploadToken() {
    return await AsyncStorage.getItem(STORAGE_KEYS.UPLOAD_TOKEN);
  },

  // Set upload token
  async setUploadToken(token) {
    await AsyncStorage.setItem(STORAGE_KEYS.UPLOAD_TOKEN, token);
  },

  // Get auth token (user JWT)
  async getAuthToken() {
    return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  // Set auth token (user JWT)
  async setAuthToken(token) {
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
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
      STORAGE_KEYS.DEVICE_USER_ID,
      STORAGE_KEYS.UPLOAD_TOKEN,
      STORAGE_KEYS.AUTH_TOKEN,
      STORAGE_KEYS.IS_PAIRED,
      STORAGE_KEYS.TRACKING_ENABLED,
    ]);
  },

  /**
   * Verify the device is still active in the database before sending data.
   * Checks pairStatus !== 'Unpaired' AND deletedAt IS NULL.
   * Falls back to true (allow) on network/query errors so transient issues
   * don't silently drop data.
   *
   * @param {string} [deviceId] - Optional; reads from AsyncStorage if omitted.
   * @returns {Promise<boolean>} true = device is active, false = stop sending.
   */
  async checkDeviceActive(deviceId) {
    const id = deviceId || await this.getDeviceId();
    if (!id) return false;

    const supabase = getSupabase();
    if (!supabase) return true; // client not available, allow through

    try {
      const { data, error } = await supabase
        .from('Devices')
        .select('pairStatus, deletedAt')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.warn('[storageService] checkDeviceActive query error:', error.message);
        return true; // query failed, allow through
      }
      if (!data) {
        console.warn('[storageService] checkDeviceActive: device not found in DB, id:', id);
        return true; // RLS may hide it; allow through
      }

      if (data.deletedAt) {
        console.warn('[storageService] Device is deleted, stopping sends.');
        return false;
      }

      const status = (data.pairStatus || '').toLowerCase();
      if (status === 'unpaired') {
        console.warn('[storageService] Device is unpaired, stopping sends.');
        return false;
      }

      return true;
    } catch (err) {
      console.warn('[storageService] checkDeviceActive failed:', err);
      return true; // network error, allow through
    }
  },
};
