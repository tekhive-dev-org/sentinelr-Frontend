import { API_BASE_URL, ENDPOINTS } from '../utils/constants';
import { storageService } from './storageService';

/**
 * API service for backend communication
 * Uses mock responses until backend is ready
 */

const USE_MOCK = false; // Set to false to use real API

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
   * @param {string} code - Pairing code (e.g., "UX5H-2RTM")
   * @returns {Promise<{ success: boolean, message: string, deviceToken: string }>}
   */
  async pairDevice(code) {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (code === '000000') {
        throw new Error('Invalid pairing code');
      }
      return mockResponses.pairDevice;
    }
    
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.PAIR_DEVICE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Pairing failed: ${response.status}`);
    }

    const data = await response.json();
    
    // Store the device token for future authenticated requests
    if (data.deviceToken) {
      await storageService.setUploadToken(data.deviceToken);
      await storageService.setIsPaired(true);
    }
    
    return data;
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
