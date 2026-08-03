import { API_BASE_URL } from "../config/api";
import { ApiError, createApiError, handleAuthorizationResponse } from "../utils/apiErrors";
import { DEMO_USERS, getDemoUsers } from "../mocks/users";

const IS_DEMO_MODE = !API_BASE_URL;

function getAuthToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function apiRequest(endpoint, options = {}) {
  if (IS_DEMO_MODE) {
    return { success: true, demo: true };
  }

  const token = getAuthToken();
  if (!token) {
    throw new ApiError("Your session has expired. Please sign in again.", { status: 401 });
  }

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

export const adminUsersService = {

  async getUsers(params = {}) {
    if (IS_DEMO_MODE) {
      return getDemoUsers(params);
    }

    const query = new URLSearchParams();
    if (params.page) query.set("page", params.page);
    if (params.limit) query.set("limit", params.limit);
    if (params.search) query.set("search", params.search);
    if (params.role) query.set("role", params.role);
    if (params.verified !== undefined) query.set("verified", params.verified);
    if (params.blocked !== undefined) query.set("blocked", params.blocked);
    if (params.sortBy) query.set("sortBy", params.sortBy);
    if (params.sortOrder) query.set("sortOrder", params.sortOrder);
    if (params.registeredAfter) query.set("registeredAfter", params.registeredAfter);
    if (params.lastActiveBefore) query.set("lastActiveBefore", params.lastActiveBefore);

    const qs = query.toString();
    return apiRequest(`/admin/all${qs ? `?${qs}` : ""}`);
  },

  async getUserDetail(userId) {
    if (IS_DEMO_MODE) {
      const user = DEMO_USERS.find((candidate) => candidate.id === userId);
      if (!user) throw new ApiError("User not found", { status: 404 });
      return { user };
    }

    return apiRequest(`/admin/${userId}`);
  },

  async blockUser(userId, reason) {
    return apiRequest(`/admin/${userId}/block`, {
      method: "PATCH",
      body: JSON.stringify({ action: "block", reason }),
    });
  },

  async unblockUser(userId, reason) {
    return apiRequest(`/admin/${userId}/block`, {
      method: "PATCH",
      body: JSON.stringify({ action: "unblock", reason }),
    });
  },

  async verifyUser(userId) {
    return apiRequest(`/admin/${userId}/verify`, {
      method: "PATCH",
      body: JSON.stringify({ verified: true }),
    });
  },

  async rejectUser(userId, reason) {
    return apiRequest(`/admin/${userId}/verify`, {
      method: "PATCH",
      body: JSON.stringify({ verified: false, reason }),
    });
  },

  async suspendUser(userId, { reason, durationDays }) {
    return apiRequest(`/admin/${userId}/suspend`, {
      method: "PATCH",
      body: JSON.stringify({ reason, durationDays }),
    });
  },

  async restoreUser(userId) {
    return apiRequest(`/admin/${userId}/restore`, {
      method: "PATCH",
    });
  },

  async forceLogout(userId) {
    return apiRequest(`/admin/${userId}/force-logout`, {
      method: "POST",
    });
  },

  async initiatePasswordReset(userId) {
    return apiRequest(`/admin/${userId}/initiate-password-reset`, {
      method: "POST",
    });
  },

  async addAdminNote(userId, note) {
    return apiRequest(`/admin/${userId}/notes`, {
      method: "POST",
      body: JSON.stringify({ note }),
    });
  },

  async changeAccountType(userId, newType) {
    return apiRequest(`/admin/${userId}/account-type`, {
      method: "PATCH",
      body: JSON.stringify({ accountType: newType }),
    });
  },

  async removeFromFamily(userId, familyId) {
    return apiRequest(`/admin/${userId}/family/${familyId}`, {
      method: "DELETE",
    });
  },

  async exportUserData(userId) {
    return apiRequest(`/admin/${userId}/export`, {
      method: "POST",
    });
  },

  async initiateAccountDeletion(userId, reason) {
    return apiRequest(`/admin/${userId}/delete`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    });
  },
};
