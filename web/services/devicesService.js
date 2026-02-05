/**
 * Devices API Service
 * Handles all device pairing and management API calls
 * Uses mock responses until backend is ready
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const USE_MOCK = false; // Set to false to use real API

// Helper to get auth token
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken');
  }
  return null;
};

// Mock data for development
const mockDevices = [
  {
    id: 'dev_001',
    name: 'Sharon Bliss iphone',
    type: 'phone',
    device_type: 'IOS',
    platform: 'ios',
    status: 'offline',
    battery_percentage: 59,
    last_seen: '2025-08-07',
    assigned_user: { id: 'user_1', name: 'Sharon Bliss' },
  },
  {
    id: 'dev_002',
    name: 'Nneka Samsung',
    type: 'phone',
    device_type: 'Android',
    platform: 'android',
    status: 'online',
    battery_percentage: 70,
    last_seen: '2025-08-07',
    assigned_user: { id: 'user_2', name: 'Nneka' },
  },
  {
    id: 'dev_003',
    name: 'Chidieberes Phone',
    type: 'phone',
    device_type: 'Android',
    platform: 'android',
    status: 'online',
    battery_percentage: 65,
    last_seen: '2025-08-07',
    assigned_user: { id: 'user_3', name: 'Chidiebere' },
  },
  {
    id: 'dev_004',
    name: 'Kelvin Chidis iphone',
    type: 'phone',
    device_type: 'IOS',
    platform: 'ios',
    status: 'offline',
    battery_percentage: 55,
    last_seen: '2025-08-07',
    assigned_user: { id: 'user_4', name: 'Kelvin Chidi' },
  },
  {
    id: 'dev_005',
    name: 'Chidi Victors Iphone',
    type: 'phone',
    device_type: 'IOS',
    platform: 'ios',
    status: 'online',
    battery_percentage: 43,
    last_seen: '2025-08-07',
    assigned_user: { id: 'user_5', name: 'Chidi Victor' },
  },
];

// Generate random 6-digit code
const generatePairingCode = () => {
  return Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)).join('');
};

// API request helper
async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `API Error: ${response.status}`);
  }
  
  return response.json();
}

export const devicesService = {
  /**
   * Generate a new pairing code for a child's device
   * @param {object} deviceInfo - { childUserId, deviceName, deviceType }
   * @returns {Promise<{ pairingCode: string, qrCode: string }>}
   */
  async generatePairingCode({ childUserId, deviceName, deviceType }) {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const code = generatePairingCode();
      return {
        pairingCode: code,
        qrCode: `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==`,
      };
    }

    return apiRequest('/device/generate/pair/code', {
      method: 'POST',
      body: JSON.stringify({ childUserId, deviceName, deviceType }),
    });
  },

  /**
   * Check pairing code status
   * @param {string} code - Pairing code (e.g., "UX5H-2RTM")
   * @returns {Promise<{ status: 'pending'|'paired'|'expired', device? }>}
   */
  async checkCodeStatus(code) {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      // Simulate random pairing success for demo
      const random = Math.random();
      if (random < 0.05) {
        return {
          success: true,
          status: 'paired',
          device: {
            id: `dev_${Date.now()}`,
            name: 'New Device',
            type: 'phone',
            device_type: 'IOS',
            status: 'online',
            battery_percentage: 85,
            last_seen: new Date().toISOString(),
          },
        };
      }
      return {
        success: true,
        status: 'pending',
        expires_in_seconds: 180,
      };
    }

    return apiRequest(`/devices/code-status/${code}`);
  },

  /**
   * Get all devices for the current user
   * @param {object} filters - { status, limit, offset }
   * @returns {Promise<{ devices: Device[], total: number }>}
   */
  async getDevices(filters = {}) {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      let devices = [...mockDevices];
      
      if (filters.status && filters.status !== 'all') {
        devices = devices.filter(d => d.status === filters.status);
      }
      
      return {
        success: true,
        devices,
        total: devices.length,
        limit: filters.limit || 50,
        offset: filters.offset || 0,
      };
    }

    const params = new URLSearchParams(filters);
    return apiRequest(`/devices?${params}`);
  },

  /**
   * Get single device details
   * @param {string} deviceId - Device ID
   * @returns {Promise<Device>}
   */
  async getDevice(deviceId) {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      const device = mockDevices.find(d => d.id === deviceId);
      if (!device) {
        throw new Error('Device not found');
      }
      return { success: true, device };
    }

    return apiRequest(`/devices/${deviceId}`);
  },

  /**
   * Remove/unpair a device
   * @param {string} deviceId - Device ID
   * @returns {Promise<{ success: boolean }>}
   */
  async removeDevice(deviceId) {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true, message: 'Device unpaired successfully' };
    }

    return apiRequest(`/devices/${deviceId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Update device settings
   * @param {string} deviceId - Device ID
   * @param {object} updates - { name?, assigned_user_id?, settings? }
   * @returns {Promise<Device>}
   */
  async updateDevice(deviceId, updates) {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true, device: { id: deviceId, ...updates } };
    }

    return apiRequest(`/devices/${deviceId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },
};

export default devicesService;
