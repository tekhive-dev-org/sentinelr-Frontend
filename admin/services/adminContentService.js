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

export const adminContentService = {

  async getItems(params = {}) {
    const q = new URLSearchParams();
    if (params.page) q.set("page", params.page);
    if (params.limit) q.set("limit", params.limit);
    if (params.search) q.set("search", params.search);
    if (params.type) q.set("type", params.type);
    if (params.status) q.set("status", params.status);
    if (params.audience) q.set("audience", params.audience);
    if (params.sortBy) q.set("sortBy", params.sortBy);
    if (params.sortOrder) q.set("sortOrder", params.sortOrder);
    return apiRequest(`/admin/content${q.toString() ? `?${q}` : ""}`);
  },

  async getItem(contentId) {
    return apiRequest(`/admin/content/${contentId}`);
  },

  async createItem(data) {
    return apiRequest("/admin/content", { method: "POST", body: JSON.stringify(data) });
  },

  async updateItem(contentId, data) {
    return apiRequest(`/admin/content/${contentId}`, { method: "PATCH", body: JSON.stringify(data) });
  },

  async publishItem(contentId) {
    return apiRequest(`/admin/content/${contentId}/publish`, { method: "PATCH" });
  },

  async scheduleItem(contentId, publishAt) {
    return apiRequest(`/admin/content/${contentId}/schedule`, { method: "PATCH", body: JSON.stringify({ publishAt }) });
  },

  async archiveItem(contentId, reason) {
    return apiRequest(`/admin/content/${contentId}/archive`, { method: "PATCH", body: JSON.stringify({ reason }) });
  },

  async getVersionHistory(contentId) {
    return apiRequest(`/admin/content/${contentId}/versions`);
  },

  async previewItem(contentId) {
    return apiRequest(`/admin/content/${contentId}/preview`);
  },
};
