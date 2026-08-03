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
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, "x-access-token": token, ...(options.headers || {}) },
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

export const adminAlertsService = {

  async getAlerts(params = {}) {
    const q = new URLSearchParams();
    if (params.page) q.set("page", params.page);
    if (params.limit) q.set("limit", params.limit);
    if (params.status) q.set("status", params.status);
    if (params.severity) q.set("severity", params.severity);
    if (params.source) q.set("source", params.source);
    if (params.search) q.set("search", params.search);
    if (params.sortBy) q.set("sortBy", params.sortBy);
    if (params.sortOrder) q.set("sortOrder", params.sortOrder);
    const qs = q.toString();
    return apiRequest(`/admin/alerts${qs ? `?${qs}` : ""}`);
  },

  async getAlertStats() {
    return apiRequest("/admin/alerts/stats");
  },

  async getAlertDetail(alertId) {
    return apiRequest(`/admin/alerts/${alertId}`);
  },

  async acknowledgeAlert(alertId) {
    return apiRequest(`/admin/alerts/${alertId}/acknowledge`, { method: "PATCH" });
  },

  async assignAlert(alertId, assigneeId) {
    return apiRequest(`/admin/alerts/${alertId}/assign`, { method: "PATCH", body: JSON.stringify({ assigneeId }) });
  },

  async escalateAlert(alertId, reason) {
    return apiRequest(`/admin/alerts/${alertId}/escalate`, { method: "PATCH", body: JSON.stringify({ reason }) });
  },

  async addAlertNote(alertId, note) {
    return apiRequest(`/admin/alerts/${alertId}/notes`, { method: "POST", body: JSON.stringify({ note }) });
  },

  async recordContactState(alertId, state) {
    return apiRequest(`/admin/alerts/${alertId}/contact-state`, { method: "PATCH", body: JSON.stringify({ contactState: state }) });
  },

  async markFalseAlarm(alertId, reason) {
    return apiRequest(`/admin/alerts/${alertId}/false-alarm`, { method: "PATCH", body: JSON.stringify({ reason }) });
  },

  async resolveAlert(alertId, resolution) {
    return apiRequest(`/admin/alerts/${alertId}/resolve`, { method: "PATCH", body: JSON.stringify({ resolution, status: "resolved" }) });
  },

  async reopenAlert(alertId, reason) {
    return apiRequest(`/admin/alerts/${alertId}/reopen`, { method: "PATCH", body: JSON.stringify({ reason }) });
  },

  async getActiveCount() {
    const data = await apiRequest("/admin/alerts?status=active,acknowledged,escalated&limit=1");
    return data?.total ?? 0;
  },
};
