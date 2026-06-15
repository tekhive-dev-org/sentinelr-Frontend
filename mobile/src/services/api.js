import { API_BASE_URL, ENDPOINTS } from "../utils/constants";
import { storageService } from "./storageService";

/**
 * API service for backend communication
 */

// Global callback invoked on 401/404 auth failures
let authFailureCallback = null;

function requireApiBaseUrl() {
  if (!API_BASE_URL) {
    throw new Error(
      "Missing mobile API base URL. Set API_BASE_URL for Expo (app.config.js extra.apiBaseUrl).",
    );
  }
  return API_BASE_URL;
}

function buildDeviceAuthHeaders(token, useRawAuthorization = false) {
  if (!token) {
    return { "Content-Type": "application/json" };
  }

  return {
    "Content-Type": "application/json",
    Authorization: useRawAuthorization ? token : `Bearer ${token}`,
    "x-device-token": token,
    "x-access-token": token,
  };
}

// Helper for alert endpoints that require the device token
async function alertApiRequest(endpoint, data = {}) {
  const deviceToken = await storageService.getUploadToken();
  const url = `${API_BASE_URL}${ENDPOINTS[endpoint]}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(deviceToken && { Authorization: `Bearer ${deviceToken}` }),
      ...(deviceToken && { "x-device-token": deviceToken }),
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

    if (response.status === 401 && authFailureCallback) {
      authFailureCallback(error);
    }

    throw error;
  }

  return response.json();
}

// Helper for authenticated API calls
async function apiRequest(endpoint, data = {}) {
  const token = await storageService.getUploadToken();
  const url = `${API_BASE_URL}${ENDPOINTS[endpoint]}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && {
        Authorization: `Bearer ${token}`,
        "x-device-token": token,
      }),
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
    const token = data.deviceToken || data.device_token || data.upload_token || data.token;
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

    // Extract userId directly from the response (returned as deviceUserId)
    const userId = data.deviceUserId || data.userId || data.user_id;

    // Store the device token and userId for future requests
    if (normalizedData.deviceToken) {
      await storageService.setUploadToken(normalizedData.deviceToken);
      await storageService.setIsPaired(true);
    }
    if (userId) {
      await storageService.setDeviceUserId(userId);
    }

    // console.log('[API] Device paired successfully:', {
    //   deviceId: normalizedData.deviceId,
    //   userId,
    //   hasToken: !!normalizedData.deviceToken,
    //   rawResponse: data,
    // });

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
   * @param {object} data - { latitude, longitude, message }
   * @returns {Promise<{
   *   success: boolean,
   *   message: string,
   *   alert: {
   *     id: number,
   *     type: string,
   *     status: string,
   *     priority: string,
   *     deviceId: number,
   *     userId: number,
   *     location: { latitude: number, longitude: number }
   *   }
   * }>}
   */
  async triggerSOS({ latitude, longitude, message = '' }) {
    const deviceId = await storageService.getDeviceId();
    const deviceUserId = await storageService.getDeviceUserId();

    if (!deviceUserId) {
      throw new Error('User ID not available. Please ensure the device is paired.');
    }

    const params = new URLSearchParams();
    if (deviceId) params.append('deviceId', deviceId);
    params.append('deviceUserId', deviceUserId);
    const url = `${API_BASE_URL}${ENDPOINTS.SOS_TRIGGER}?${params.toString()}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location: { latitude, longitude },
        message,
      }),
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
  },

  /**
   * Report an intruder attempt (wrong PIN capture, etc.).
   * @param {object} data - { attemptType, attemptCount, photo, timestamp }
   * @returns {Promise<{ success: boolean }>}
   */
  async reportIntruderAttempt(data) {
    return alertApiRequest("INTRUDER_REPORT", data);
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
        ...(token && {
          Authorization: `Bearer ${token}`,
          "x-device-token": token,
        }),
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
   * Get full parental control status for the current device.
   * Primary: GET /parental-controls/{userId}/device-status/{deviceId}
   * Fallback: GET /parental-controls/{userId}?deviceId={deviceId}
   * @returns {Promise<{ success: boolean, controls: object }>}
   */
  async getParentalStatus(deviceId) {
    const token = await storageService.getUploadToken();
    console.log("[API] getParentalStatus — hasToken:", !!token);

    const url = `${requireApiBaseUrl()}/parental-controls/device-status/${deviceId}`;
    console.log("[API] getParentalStatus — url:", url);

    let response = await fetch(url, {
      method: "GET",
      headers: buildDeviceAuthHeaders(token, false),
    });

    if ((response.status === 401 || response.status === 403) && token) {
      console.log("[API] getParentalStatus — retrying with raw Authorization header");
      response = await fetch(url, {
        method: "GET",
        headers: buildDeviceAuthHeaders(token, true),
      });
    }

    console.log("[API] getParentalStatus — HTTP", response.status);

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      console.warn("[API] getParentalStatus error body:", errorBody);
      if (response.status === 401 || response.status === 403) {
        return { success: false, controls: null, authError: true };
      }
      const error = new Error(
        errorBody.message || `API Error: ${response.status}`,
      );
      error.status = response.status;
      throw error;
    }

    const data = await response.json();
    console.log("[API] getParentalStatus response:", JSON.stringify(data, null, 2));
    return data;
  },

  /**
   * Get recent parental control activity for the current device.
   * GET /parental-controls/{userId}/activity?deviceId={deviceId}&limit={limit}
   * @param {number} [limit=10]
   * @returns {Promise<{ success: boolean, activities: array }>}
   */
  async getParentalActivity(deviceId, limit = 10) {
    const token = await storageService.getUploadToken();

    const params = new URLSearchParams({ limit: String(limit) });
    const url = `${requireApiBaseUrl()}/parental-controls/devices/${encodeURIComponent(deviceId)}/activity?${params.toString()}`;
    console.log("[API] getParentalActivity — url:", url);

    let response = await fetch(url, {
      method: "GET",
      headers: buildDeviceAuthHeaders(token, false),
    });

    if ((response.status === 401 || response.status === 403) && token) {
      console.log("[API] getParentalActivity — retrying with raw Authorization header");
      response = await fetch(url, {
        method: "GET",
        headers: buildDeviceAuthHeaders(token, true),
      });
    }

    console.log("[API] getParentalActivity — HTTP", response.status);

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      console.warn("[API] getParentalActivity error body:", errorBody);
      if (response.status === 401 || response.status === 403) {
        return { success: false, activities: [], authError: true };
      }
      return { success: false, activities: [] };
    }

    const data = await response.json();
    const activities = data?.activities || [];
    console.log("[API] getParentalActivity response (count):", activities.length);
    return { success: true, activities };
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
      const url = `${requireApiBaseUrl()}${ENDPOINTS.HEARTBEAT}`;
      let response = await fetch(url, {
        method: "POST",
        headers: buildDeviceAuthHeaders(token, false),
        body: JSON.stringify({ timestamp: new Date().toISOString() }),
      });

      if (response.status === 401 || response.status === 403) {
        response = await fetch(url, {
          method: "POST",
          headers: buildDeviceAuthHeaders(token, true),
          body: JSON.stringify({ timestamp: new Date().toISOString() }),
        });
      }

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
