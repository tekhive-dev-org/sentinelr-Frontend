import { API_BASE_URL } from "../config/api";
import { ApiError, createApiError, handleAuthorizationResponse } from "../utils/apiErrors";

function getAuthToken() { if (typeof window === "undefined") return null; return localStorage.getItem("token"); }
async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  if (!token) throw new ApiError("Your session has expired.", { status: 401 });
  const config = { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, "x-access-token": token, ...(options.headers || {}) }, ...options };
  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  if (!response.ok) { handleAuthorizationResponse(response, { endpoint }); const data = await response.json().catch(() => ({})); throw createApiError(response, data, `Request to ${endpoint} failed`); }
  return response.json();
}

export const adminSettingsService = {

  async getSettings() {
    return apiRequest("/admin/settings");
  },

  async getSettingGroup(groupKey) {
    return apiRequest(`/admin/settings/${groupKey}`);
  },

  async updateSetting(groupKey, key, value, reason) {
    return apiRequest(`/admin/settings/${groupKey}/${key}`, {
      method: "PATCH", body: JSON.stringify({ value, reason }),
    });
  },

  async updateGroup(groupKey, settings, reason) {
    return apiRequest(`/admin/settings/${groupKey}`, {
      method: "PATCH", body: JSON.stringify({ settings, reason }),
    });
  },

  async toggleMaintenanceMode(enabled, reason) {
    return apiRequest("/admin/settings/maintenance", {
      method: "PATCH", body: JSON.stringify({ enabled, reason }),
    });
  },

  async updateFeatureFlag(flagKey, enabled, reason) {
    return apiRequest(`/admin/settings/features/${flagKey}`, {
      method: "PATCH", body: JSON.stringify({ enabled, reason }),
    });
  },

  async testIntegration(integrationKey) {
    return apiRequest(`/admin/settings/integrations/${integrationKey}/test`, { method: "POST" });
  },

  async getIntegrationStatus() {
    return apiRequest("/admin/settings/integrations/status");
  },

  async getSettingHistory(groupKey, key) {
    return apiRequest(`/admin/settings/${groupKey}/${key}/history`);
  },
};
