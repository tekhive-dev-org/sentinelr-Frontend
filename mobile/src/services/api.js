import { API_BASE_URL, ENDPOINTS } from "../utils/constants";
import { storageService } from "./storageService";

/**
 * API service for backend communication
 */

// Global callback invoked on 401/404 auth failures
let authFailureCallback = null;

// Helper for authenticated API calls
async function apiRequest(endpoint, data = {}) {
  const token = await storageService.getUploadToken();
  const url = `${API_BASE_URL}${ENDPOINTS[endpoint]}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const error = new Error(
      errorBody.message || `API Error: ${response.status}`,
    );
    error.status = response.status;
    error.code = errorBody.code;

    // Trigger auth failure callback only on 401 (definitive auth rejection)
    if (response.status === 401 && authFailureCallback) {
      authFailureCallback(error);
    }

    throw error;
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
    const response = await fetch(`${API_BASE_URL}${ENDPOINTS.PAIR_DEVICE}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Pairing failed: ${response.status}`);
    }

    const data = await response.json();

    // Check for nested device object and various casing
    let deviceId = data.deviceId || data.device_id || data.id;
    if (!deviceId && data.device) {
      deviceId =
        data.device.id || data.device.deviceId || data.device.device_id;
    }

    // Attempt to extract deviceId from the JWT token
    // The backend returns the deviceId inside the deviceToken
    const token = data.deviceToken || data.device_token || data.token;
    if (!deviceId && token) {
      try {
        // Simple JWT decode without external library
        // JWT structure: header.payload.signature
        const base64Url = token.split(".")[1];
        if (base64Url) {
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split("")
              .map(function (c) {
                return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
              })
              .join(""),
          );
          const payload = JSON.parse(jsonPayload);

          deviceId = payload.deviceId || payload.device_id || payload.id;
        }
      } catch (e) {
        console.error("[API] Failed to decode token:", e);
      }
    }

    const normalizedData = {
      ...data,
      deviceId: deviceId ? String(deviceId) : undefined,
      deviceToken: token,
    };

    // Store the device token for future authenticated requests
    if (normalizedData.deviceToken) {
      await storageService.setUploadToken(normalizedData.deviceToken);
      await storageService.setIsPaired(true);
    }

    return normalizedData;
  },

  /**
   * Upload location ping
   * @param {object} location - { latitude, longitude, accuracy, timestamp }
   */
  async uploadPing(location) {
    return apiRequest("UPLOAD_PING", location);
  },

  /**
   * Send heartbeat with device status
   * @param {object} status - { battery_level, is_charging, network_type }
   */
  async sendHeartbeat(status) {
    return apiRequest("HEARTBEAT", status);
  },

  /**
   * Unpair this device from the backend.
   * Changes pairStatus to "Unpaired" — device stays visible on the web dashboard.
   * @param {string} deviceId - The device ID to unpair
   * @returns {Promise<{ success: boolean }>}
   */
  async unpairDevice(deviceId) {
    const token = await storageService.getUploadToken();
    const response = await fetch(`${API_BASE_URL}/device/${deviceId}/unpair`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify({ pairStatus: "Unpaired" }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Unpair failed: ${response.status}`);
    }

    return response.json();
  },

  /**
   * Remove this device from the dashboard (soft-delete).
   * The device record is NOT permanently deleted from the database.
   * @param {string} deviceId - The device ID to remove
   * @returns {Promise<{ success: boolean }>}
   */
  async removeDevice(deviceId) {
    const token = await storageService.getUploadToken();
    const response = await fetch(`${API_BASE_URL}/device/${deviceId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Remove failed: ${response.status}`);
    }

    return response.json();
  },

  /**
   * Trigger an SOS emergency alert.
   * Sends the device's current location to notify all family members.
   * @param {object} data - { latitude, longitude, accuracy, timestamp }
   * @returns {Promise<{ success: boolean }>}
   */
  async triggerSOS(data) {
    return apiRequest("SOS_TRIGGER", data);
  },

  /**
   * Fetch all geofences assigned to this device.
   * @returns {Promise<{ success: boolean, geofences: Array }>}
   */
  async getGeofences() {
    const token = await storageService.getUploadToken();
    const url = `${API_BASE_URL}${ENDPOINTS.GEOFENCES}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const error = new Error(
        errorBody.message || `API Error: ${response.status}`,
      );
      error.status = response.status;
      throw error;
    }

    return response.json();
  },

  /**
   * Report a geofence entry or exit event to the backend.
   * @param {object} data - { geofenceId, type: 'entry'|'exit', latitude, longitude, timestamp }
   * @returns {Promise<{ success: boolean }>}
   */
  async reportGeofenceEvent(data) {
    return apiRequest("GEOFENCE_EVENT", data);
  },

  /**
   * Register a callback that fires when any API call gets a 401/404.
   * Used by DeviceContext to trigger re-pairing.
   */
  onAuthFailure(callback) {
    authFailureCallback = callback;
  },

  /**
   * Get parental control status for the current device
   * @returns {Promise<{ success: boolean, controls: object, activities: array }>}
   */
  async getParentalStatus() {
    const token = await storageService.getUploadToken();
    const url = `${API_BASE_URL}${ENDPOINTS.PARENTAL_STATUS}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      const error = new Error(
        errorBody.message || `API Error: ${response.status}`,
      );
      error.status = response.status;
      throw error;
    }

    return response.json();
  },

  /**
   * Validate the stored device token by making a lightweight heartbeat call.
   * Returns true if the token is valid, false only if definitively expired/revoked (401/403).
   * Transient errors (429, 5xx, network) are treated as "still valid".
   */
  async validateToken() {
    const token = await storageService.getUploadToken();
    if (!token) return false;

    try {
      const url = `${API_BASE_URL}${ENDPOINTS.HEARTBEAT}`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ timestamp: new Date().toISOString() }),
      });

      // Only treat 401/403 as definitively invalid
      if (response.status === 401 || response.status === 403) {
        return false;
      }

      // Everything else (200, 429, 5xx, etc.) — assume token is still valid
      return true;
    } catch {
      // Network error — don't invalidate token, assume still valid
      return true;
    }
  },
};
