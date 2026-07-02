import { API_BASE_URL, ENDPOINTS } from "../utils/constants";
import { storageService } from "./storageService";

/**
 * API service for backend communication
 */

// Global callback invoked on 401/404 auth failures
let authFailureCallback = null;
const API_REQUEST_TIMEOUT_MS = 20000;

function requireApiBaseUrl() {
  if (!API_BASE_URL) {
    throw new Error(
      "Missing mobile API base URL. Set API_BASE_URL for Expo (app.config.js extra.apiBaseUrl).",
    );
  }
  return API_BASE_URL;
}

function buildDeviceAuthHeaders(token, useRawAuthorization = false, context = {}) {
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = useRawAuthorization ? token : `Bearer ${token}`;
    headers["x-device-token"] = token;
    headers["x-access-token"] = token;
  }

  if (context.userId) {
    headers["x-device-user-id"] = String(context.userId);
  }

  if (context.deviceId) {
    headers["x-device-id"] = String(context.deviceId);
  }

  return headers;
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
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_REQUEST_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && {
          Authorization: `Bearer ${token}`,
          "x-device-token": token,
        }),
      },
      body: JSON.stringify(data),
      signal: controller.signal,
    });
  } catch (error) {
    if (error.name === "AbortError") {
      const timeoutError = new Error("API request timed out");
      timeoutError.code = "API_REQUEST_TIMEOUT";
      throw timeoutError;
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }

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

async function deviceGetRequest(endpoint, context = {}) {
  const [token, deviceId, deviceUserId] = await Promise.all([
    storageService.getUploadToken(),
    storageService.getDeviceId(),
    storageService.getDeviceUserId(),
  ]);
  const url = `${requireApiBaseUrl()}${ENDPOINTS[endpoint]}`;
  const authContext = {
    deviceId: context.deviceId || deviceId,
    userId: context.userId || deviceUserId,
  };

  let response = await fetch(url, {
    method: "GET",
    headers: buildDeviceAuthHeaders(token, false, authContext),
  });

  if ((response.status === 401 || response.status === 403) && token) {
    response = await fetch(url, {
      method: "GET",
      headers: buildDeviceAuthHeaders(token, true, authContext),
    });
  }

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(
      body.message || `API Error: ${response.status}`,
    );
    error.status = response.status;
    error.code = body.code;
    error.body = body;

    if (response.status === 401 && authFailureCallback) {
      authFailureCallback(error);
    }

    throw error;
  }

  return body;
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
   * @param {object} status - { batteryLevel, isCharging, deviceName, deviceModel, brand, osVersion, timestamp }
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
   * Fetch parental controls assigned to this paired device.
   * @returns {Promise<{ success: boolean, controls: object }>}
   */
  async getMyParentalControls() {
    return deviceGetRequest("MY_PARENTAL_CONTROLS");
  },

  /**
   * Fetch recent parental-control activity for this paired device.
   * @returns {Promise<{ success: boolean, activities: Array }>}
   */
  async getMyParentalActivity() {
    return deviceGetRequest("MY_PARENTAL_ACTIVITY");
  },

  /**
   * Register a callback that fires when any API call gets a 401/404.
   * Used by DeviceContext to trigger re-pairing.
   */
  onAuthFailure(callback) {
    authFailureCallback = callback;
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
