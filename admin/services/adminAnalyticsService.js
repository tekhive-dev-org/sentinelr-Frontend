import { API_BASE_URL } from "../config/api";
import { ApiError, createApiError, handleAuthorizationResponse } from "../utils/apiErrors";

function getAuthToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  if (!token) throw new ApiError("Your session has expired.", { status: 401 });
  const config = { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, "x-access-token": token, ...(options.headers || {}) }, ...options };
  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  if (!response.ok) { handleAuthorizationResponse(response, { endpoint }); const data = await response.json().catch(() => ({})); throw createApiError(response, data, `Request to ${endpoint} failed`); }
  return response.json();
}

function buildParams(range, filters) {
  const q = new URLSearchParams();
  if (range) q.set("range", range);
  if (filters?.plan) q.set("plan", filters.plan);
  if (filters?.platform) q.set("platform", filters.platform);
  if (filters?.country) q.set("country", filters.country);
  if (filters?.accountType) q.set("accountType", filters.accountType);
  return q.toString();
}

export const adminAnalyticsService = {

  async getUserGrowth(range, filters) {
    return apiRequest(`/admin/analytics/user-growth?${buildParams(range, filters)}`);
  },
  async getActiveUsers(range, filters) {
    return apiRequest(`/admin/analytics/active-users?${buildParams(range, filters)}`);
  },
  async getDeviceAdoption(range, filters) {
    return apiRequest(`/admin/analytics/device-adoption?${buildParams(range, filters)}`);
  },
  async getFamilyGrowth(range, filters) {
    return apiRequest(`/admin/analytics/family-growth?${buildParams(range, filters)}`);
  },
  async getSOSTrends(range, filters) {
    return apiRequest(`/admin/analytics/sos-trends?${buildParams(range, filters)}`);
  },
  async getGeofenceActivity(range, filters) {
    return apiRequest(`/admin/analytics/geofence-activity?${buildParams(range, filters)}`);
  },
  async getParentalAdoption(range, filters) {
    return apiRequest(`/admin/analytics/parental-adoption?${buildParams(range, filters)}`);
  },
  async getSubscriptionMetrics(range, filters) {
    return apiRequest(`/admin/analytics/subscription-metrics?${buildParams(range, filters)}`);
  },
  async getAppVersionAdoption(range, filters) {
    return apiRequest(`/admin/analytics/app-versions?${buildParams(range, filters)}`);
  },
  async getPlatformHealth(range, filters) {
    return apiRequest(`/admin/analytics/platform-health?${buildParams(range, filters)}`);
  },

  async getOverview(range, filters) {
    return apiRequest(`/admin/analytics/overview?${buildParams(range, filters)}`);
  },

  async exportCSV(category, range, filters) {
    const params = buildParams(range, filters);
    return apiRequest(`/admin/analytics/${category}/export/csv?${params}`);
  },

  async exportPDF(category, range, filters) {
    const params = buildParams(range, filters);
    return apiRequest(`/admin/analytics/${category}/export/pdf?${params}`, { method: "POST" });
  },
};
