import { API_BASE_URL, ENDPOINTS } from "../utils/constants";
import { storageService } from "./storageService";

/**
 * API service for backend communication
 */

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
};
