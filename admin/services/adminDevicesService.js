import { API_BASE_URL } from "../config/api";
import { ApiError, createApiError, handleAuthorizationResponse } from "../utils/apiErrors";

function getAuthToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  if (!token) throw new ApiError("Your session has expired.", { status: 401 });

  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "x-access-token": token,
      ...(options.headers || {}),
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  if (!response.ok) {
    handleAuthorizationResponse(response, { endpoint });
    const data = await response.json().catch(() => ({}));
    throw createApiError(response, data, `Request to ${endpoint} failed`);
  }
  return response.json();
}

export const adminDevicesService = {

  async getDevices(params = {}) {
    const q = new URLSearchParams();
    if (params.page) q.set("page", params.page);
    if (params.limit) q.set("limit", params.limit);
    if (params.search) q.set("search", params.search);
    if (params.status) q.set("status", params.status);
    if (params.platform) q.set("platform", params.platform);
    if (params.pairingState) q.set("pairingState", params.pairingState);
    if (params.appVersion) q.set("appVersion", params.appVersion);
    if (params.lastSeenBefore) q.set("lastSeenBefore", params.lastSeenBefore);
    if (params.lastSeenAfter) q.set("lastSeenAfter", params.lastSeenAfter);
    if (params.sortBy) q.set("sortBy", params.sortBy);
    if (params.sortOrder) q.set("sortOrder", params.sortOrder);
    const qs = q.toString();
    return apiRequest(`/admin/devices${qs ? `?${qs}` : ""}`);
  },

  async getDeviceStats() {
    return apiRequest("/admin/devices/stats");
  },

  async getDeviceDetail(deviceId) {
    return apiRequest(`/admin/devices/${deviceId}`);
  },

  async revokeDevice(deviceId, reason) {
    return apiRequest(`/admin/devices/${deviceId}/revoke`, {
      method: "PATCH",
      body: JSON.stringify({ reason }),
    });
  },

  async unpairDevice(deviceId, reason) {
    return apiRequest(`/admin/devices/${deviceId}/unpair`, {
      method: "PATCH",
      body: JSON.stringify({ reason }),
    });
  },

  async flagDevice(deviceId, reason) {
    return apiRequest(`/admin/devices/${deviceId}/flag`, {
      method: "PATCH",
      body: JSON.stringify({ reason }),
    });
  },

  async addDeviceNote(deviceId, note) {
    return apiRequest(`/admin/devices/${deviceId}/notes`, {
      method: "POST",
      body: JSON.stringify({ note }),
    });
  },

  async requestReauth(deviceId) {
    return apiRequest(`/admin/devices/${deviceId}/request-reauth`, {
      method: "POST",
    });
  },

  async getDeviceLogs(deviceId, params = {}) {
    const q = new URLSearchParams();
    if (params.limit) q.set("limit", params.limit);
    const qs = q.toString();
    return apiRequest(`/admin/devices/${deviceId}/logs${qs ? `?${qs}` : ""}`);
  },
};
