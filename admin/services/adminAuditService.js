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

export const adminAuditService = {

  async getEntries(params = {}) {
    const q = new URLSearchParams();
    if (params.page) q.set("page", params.page); if (params.limit) q.set("limit", params.limit);
    if (params.search) q.set("search", params.search); if (params.actor) q.set("actor", params.actor);
    if (params.action) q.set("action", params.action); if (params.resource) q.set("resource", params.resource);
    if (params.outcome) q.set("outcome", params.outcome);
    if (params.dateFrom) q.set("dateFrom", params.dateFrom); if (params.dateTo) q.set("dateTo", params.dateTo);
    if (params.sortBy) q.set("sortBy", params.sortBy); if (params.sortOrder) q.set("sortOrder", params.sortOrder);
    return apiRequest(`/admin/audit${q.toString() ? `?${q}` : ""}`);
  },

  async getEntry(entryId) {
    return apiRequest(`/admin/audit/${entryId}`);
  },

  async exportAudit(params = {}) {
    const q = new URLSearchParams();
    if (params.dateFrom) q.set("dateFrom", params.dateFrom); if (params.dateTo) q.set("dateTo", params.dateTo);
    if (params.format) q.set("format", params.format);
    return apiRequest(`/admin/audit/export${q.toString() ? `?${q}` : ""}`);
  },

  async getStats() {
    return apiRequest("/admin/audit/stats");
  },

  async getActionTypes() {
    return apiRequest("/admin/audit/action-types");
  },

  async getResourceTypes() {
    return apiRequest("/admin/audit/resource-types");
  },
};
