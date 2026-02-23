/**
 * Devices API Service
 * Handles all device pairing and management API calls
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Helper to get auth token
const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

// API request helper
async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...(token && {
        Authorization: `Bearer ${token}`,
        "x-access-token": token,
      }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    // Auto-logout on 401 (expired/invalid token)
    if (response.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    throw new Error(error.message || `API Error: ${response.status}`);
  }

  return response.json();
}

export const devicesService = {
  /**
   * Generate a new pairing code for a child's device
   * @param {object} deviceInfo - { memberUserId, deviceName, deviceType }
   * @returns {Promise<{ pairingCode: string, qrCode: string }>}
   */
  async generatePairingCode({
    memberUserId,
    deviceName,
    deviceType,
    platform,
  }) {
    return apiRequest("/device/generate/pair/code", {
      method: "POST",
      body: JSON.stringify({ memberUserId, deviceName, deviceType, platform }),
    });
  },

  /**
   * Check pairing code status
   * @param {string} code - Pairing code (e.g., "UX5H-2RTM")
   * @returns {Promise<{ status: 'pending'|'paired'|'expired', device? }>}
   */
  async checkCodeStatus(code) {
    return apiRequest(`/device/code-status/${code}`);
  },

  /**
   * Get family devices with optional status filtering
   * @param {object} filters - { pairStatus, limit, offset }
   * @returns {Promise<{ devices: Device[], total: number }>}
   */
  async getFamilyDevices(filters = {}) {
    const params = new URLSearchParams(filters);
    return apiRequest(`/device/family-devices?${params}`);
  },

  /**
   * Get all devices for the current user
   * @param {object} filters - { status, limit, offset }
   * @returns {Promise<{ devices: Device[], total: number }>}
   */
  async getDevices(filters = {}) {
    const params = new URLSearchParams(filters);
    return apiRequest(`/devices?${params}`);
  },

  /**
   * Get single device details
   * @param {string} deviceId - Device ID
   * @returns {Promise<Device>}
   */
  async getDevice(deviceId) {
    return apiRequest(`/devices/${deviceId}`);
  },

  /**
   * Unpair a device — changes pairStatus to "Unpaired".
   * Device remains visible on the dashboard.
   * @param {string} deviceId - Device ID
   * @returns {Promise<{ success: boolean, device: Device }>}
   */
  async unpairDevice(deviceId) {
    return apiRequest(`/device/${deviceId}/unpair`, {
      method: "PATCH",
      body: JSON.stringify({ pairStatus: "Unpaired" }),
    });
  },

  /**
   * Remove a device from the dashboard (soft-delete / hides it).
   * The device record is NOT permanently deleted from the database.
   * @param {string} deviceId - Device ID
   * @returns {Promise<{ success: boolean }>}
   */
  async removeDevice(deviceId) {
    return apiRequest(`/device/${deviceId}`, {
      method: "DELETE",
    });
  },

  /**
   * Update device settings (name, assignedUserId for reassign, etc.)
   * @param {string} deviceId - Device ID
   * @param {object} updates - { name?, assignedUserId? }
   * @returns {Promise<Device>}
   */
  async updateDevice(deviceId, updates) {
    return apiRequest(`/device/${deviceId}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  },

  /**
   * Reassign a device to a different family member.
   * Convenience wrapper around updateDevice.
   * @param {string} deviceId - Device ID
   * @param {number} newUserId - The userId of the new family member
   * @returns {Promise<Device>}
   */
  async reassignDevice(deviceId, newUserId) {
    return apiRequest(`/device/${deviceId}`, {
      method: "PATCH",
      body: JSON.stringify({ assignedUserId: newUserId }),
    });
  },

  /**
   * Get live location data from the web dashboard endpoint.
   * @param {object} filters - { deviceId?, userId? }
   * @returns {Promise<{ success: boolean, locations: LocationEntry[] }>}
   */
  async getLiveLocation(filters = {}) {
    const params = new URLSearchParams();
    if (filters.deviceId != null) params.append("deviceId", filters.deviceId);
    if (filters.userId != null) params.append("userId", filters.userId);
    const query = params.toString();
    return apiRequest(`/location/live${query ? `?${query}` : ""}`);
  },
};

export default devicesService;
