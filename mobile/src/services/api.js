import { API_BASE_URL, ENDPOINTS } from '../utils/constants';
import { storageService } from './storageService';

/**
 * API service for backend communication
 * Uses mock responses until backend is ready
 */

const USE_MOCK = true; // Toggle when backend is ready

// Mock responses
const mockResponses = {
  pairDevice: {
    success: true,
    device_id: 'dev_mock_12345',
    upload_token: 'tok_mock_abc123xyz',
    family_name: 'Demo Family',
  },
  uploadPing: {
    success: true,
    message: 'Ping received',
  },
  heartbeat: {
    success: true,
    server_time: new Date().toISOString(),
  },
};

// Helper for API calls
async function apiRequest(endpoint, data = {}) {
  if (USE_MOCK) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return mockResponses[endpoint] || { success: true };
  }

  const token = await storageService.getUploadToken();
  
  const response = await fetch(`${API_BASE_URL}${ENDPOINTS[endpoint]}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

export const apiService = {
  /**
   * Pair device with pairing code
   * @param {string} code - 6-digit pairing code
   */
  async pairDevice(code) {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (code === '000000') {
        throw new Error('Invalid pairing code');
      }
      return mockResponses.pairDevice;
    }
    return apiRequest('PAIR_DEVICE', { pairing_code: code });
  },

  /**
   * Upload location ping
   * @param {object} location - { latitude, longitude, accuracy, timestamp }
   */
  async uploadPing(location) {
    if (USE_MOCK) {
      console.log('[MOCK] Uploading ping:', location);
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockResponses.uploadPing;
    }
    return apiRequest('UPLOAD_PING', location);
  },

  /**
   * Send heartbeat with device status
   * @param {object} status - { battery_level, is_charging, network_type }
   */
  async sendHeartbeat(status) {
    if (USE_MOCK) {
      console.log('[MOCK] Sending heartbeat:', status);
      await new Promise(resolve => setTimeout(resolve, 200));
      return mockResponses.heartbeat;
    }
    return apiRequest('HEARTBEAT', status);
  },
};
