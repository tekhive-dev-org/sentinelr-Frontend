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

export const adminNotificationsService = {

  async getCampaigns(params = {}) {
    const q = new URLSearchParams();
    if (params.page) q.set("page", params.page);
    if (params.limit) q.set("limit", params.limit);
    if (params.search) q.set("search", params.search);
    if (params.status) q.set("status", params.status);
    if (params.channel) q.set("channel", params.channel);
    if (params.sortBy) q.set("sortBy", params.sortBy);
    if (params.sortOrder) q.set("sortOrder", params.sortOrder);
    return apiRequest(`/admin/notifications${q.toString() ? `?${q}` : ""}`);
  },

  async getCampaign(campaignId) {
    return apiRequest(`/admin/notifications/${campaignId}`);
  },

  async createCampaign(data) {
    return apiRequest("/admin/notifications", { method: "POST", body: JSON.stringify(data) });
  },

  async updateCampaign(campaignId, data) {
    return apiRequest(`/admin/notifications/${campaignId}`, { method: "PATCH", body: JSON.stringify(data) });
  },

  async scheduleCampaign(campaignId, sendAt) {
    return apiRequest(`/admin/notifications/${campaignId}/schedule`, { method: "PATCH", body: JSON.stringify({ sendAt }) });
  },

  async sendCampaign(campaignId) {
    return apiRequest(`/admin/notifications/${campaignId}/send`, { method: "POST" });
  },

  async cancelCampaign(campaignId, reason) {
    return apiRequest(`/admin/notifications/${campaignId}/cancel`, { method: "PATCH", body: JSON.stringify({ reason }) });
  },

  async getDeliveryStatus(campaignId) {
    return apiRequest(`/admin/notifications/${campaignId}/delivery`);
  },

  async requestApproval(campaignId) {
    return apiRequest(`/admin/notifications/${campaignId}/request-approval`, { method: "POST" });
  },

  async approveCampaign(campaignId) {
    return apiRequest(`/admin/notifications/${campaignId}/approve`, { method: "PATCH" });
  },

  async rejectCampaign(campaignId, reason) {
    return apiRequest(`/admin/notifications/${campaignId}/reject`, { method: "PATCH", body: JSON.stringify({ reason }) });
  },
};
