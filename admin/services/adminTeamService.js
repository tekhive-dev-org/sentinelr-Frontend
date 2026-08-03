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

export const adminTeamService = {

  async getAdmins(params = {}) {
    const q = new URLSearchParams();
    if (params.page) q.set("page", params.page); if (params.limit) q.set("limit", params.limit);
    if (params.search) q.set("search", params.search); if (params.role) q.set("role", params.role);
    if (params.status) q.set("status", params.status);
    return apiRequest(`/admin/team${q.toString() ? `?${q}` : ""}`);
  },

  async getAdmin(adminId) {
    return apiRequest(`/admin/team/${adminId}`);
  },

  async inviteAdmin(data) {
    return apiRequest("/admin/team/invite", { method: "POST", body: JSON.stringify(data) });
  },

  async resendInvitation(inviteId) {
    return apiRequest(`/admin/team/invitations/${inviteId}/resend`, { method: "POST" });
  },

  async cancelInvitation(inviteId) {
    return apiRequest(`/admin/team/invitations/${inviteId}`, { method: "DELETE" });
  },

  async updateAdmin(adminId, data) {
    return apiRequest(`/admin/team/${adminId}`, { method: "PATCH", body: JSON.stringify(data) });
  },

  async activateAdmin(adminId) {
    return apiRequest(`/admin/team/${adminId}/activate`, { method: "PATCH" });
  },

  async deactivateAdmin(adminId, reason) {
    return apiRequest(`/admin/team/${adminId}/deactivate`, { method: "PATCH", body: JSON.stringify({ reason }) });
  },

  async assignRole(adminId, role, reason) {
    return apiRequest(`/admin/team/${adminId}/roles`, { method: "PATCH", body: JSON.stringify({ role, reason }) });
  },

  async revokeSessions(adminId) {
    return apiRequest(`/admin/team/${adminId}/revoke-sessions`, { method: "POST" });
  },

  async getPermissions(adminId) {
    return apiRequest(`/admin/team/${adminId}/permissions`);
  },

  async getActivity(adminId, params = {}) {
    const q = new URLSearchParams();
    if (params.limit) q.set("limit", params.limit);
    return apiRequest(`/admin/team/${adminId}/activity${q.toString() ? `?${q}` : ""}`);
  },
};
