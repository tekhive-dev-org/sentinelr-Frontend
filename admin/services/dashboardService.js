import { API_BASE_URL } from "../config/api";
import { ApiError, createApiError, handleAuthorizationResponse } from "../utils/apiErrors";
import { DEMO_DASHBOARD_OVERVIEW, DEMO_DASHBOARD_TRENDS } from "../mocks/dashboard";
import { DEMO_USERS } from "../mocks/users";

const IS_DEMO_MODE = !API_BASE_URL;

function getAuthToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function apiRequest(endpoint, options = {}) {
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

async function safeFetch(fetchFn) {
  try {
    const data = await fetchFn();
    return { data, error: null };
  } catch (error) {
    if (error?.status === 401 || error?.name === "ApiError" || error?.message?.includes("401")) {
      return { data: null, error: "unauthenticated" };
    }
    return { data: null, error: error.message || "Request failed" };
  }
}

export const dashboardService = {
  async getOverview() {
    if (IS_DEMO_MODE) {
      return {
        ...DEMO_DASHBOARD_OVERVIEW,
        errors: {},
      };
    }

    const results = await Promise.allSettled([
      safeFetch(() => apiRequest("/admin/all")),
      safeFetch(() => apiRequest("/admin/blocked?blocked=true")),
      safeFetch(() => apiRequest("/admin/verified?verified=true")),
      safeFetch(() => apiRequest("/alerts?status=active&limit=100")),
    ]);

    const [allUsers, blockedUsers, verifiedUsers, activeAlerts] = results.map(
      (r) => (r.status === "fulfilled" ? r.value : { data: null, error: r.reason?.message || "Request failed" })
    );

    return {
      allUsers: allUsers.data ? (allUsers.data.count ?? allUsers.data.users?.length ?? null) : null,
      blockedUsers: blockedUsers.data ? (blockedUsers.data.count ?? blockedUsers.data.blockedUsers?.length ?? null) : null,
      verifiedUsers: verifiedUsers.data ? (verifiedUsers.data.count ?? verifiedUsers.data.verifiedUsers?.length ?? null) : null,
      activeSOSIncidents: activeAlerts.data
        ? (activeAlerts.data.alerts || []).filter((a) => {
            const type = (a.type || "").toLowerCase();
            return type === "sos" || type === "intruder";
          }).length
        : null,
      errors: {
        allUsers: allUsers.error,
        blockedUsers: blockedUsers.error,
        verifiedUsers: verifiedUsers.error,
        activeAlerts: activeAlerts.error,
      },
    };
  },

  async getUserStats() {
    if (IS_DEMO_MODE) {
      return {
        total: DEMO_DASHBOARD_OVERVIEW.allUsers,
        flagged: DEMO_DASHBOARD_OVERVIEW.flaggedUsers,
        errors: {},
      };
    }

    const [allRes, unverifiedRes] = await Promise.allSettled([
      safeFetch(() => apiRequest("/admin/all")),
      safeFetch(() => apiRequest("/admin/verified?verified=false")),
    ]);

    const allUsers = allRes.status === "fulfilled" ? allRes.value : { data: null, error: allRes.reason?.message };
    const unverified = unverifiedRes.status === "fulfilled" ? unverifiedRes.value : { data: null, error: unverifiedRes.reason?.message };

    return {
      total: allUsers.data ? (allUsers.data.count ?? allUsers.data.users?.length ?? null) : null,
      flagged: unverified.data ? (unverified.data.count ?? unverified.data.verifiedUsers?.length ?? null) : null,
      errors: { total: allUsers.error, flagged: unverified.error },
    };
  },

  async getRecentUsers(limit = 10) {
    if (IS_DEMO_MODE) {
      return {
        users: DEMO_USERS.slice(0, limit).map((user) => ({
          ...user,
          name: user.userName,
        })),
        error: null,
      };
    }

    const result = await safeFetch(() => apiRequest("/admin/all"));
    if (!result.data) return { users: null, error: result.error };

    const users = (result.data.users || []).slice(0, limit);
    return { users, error: null };
  },

  async getTrends() {
    if (IS_DEMO_MODE) {
      return DEMO_DASHBOARD_TRENDS;
    }

    return {
      newUsers: { data: null, error: "API not available: admin metrics/registration-trends endpoint required" },
      activeUsers: { data: null, error: "API not available: admin metrics/active-users endpoint required" },
      subscriptionGrowth: { data: null, error: "API not available: admin metrics/subscription-growth endpoint required" },
      deviceActivity: { data: null, error: "API not available: admin metrics/device-activity endpoint required" },
      sosIncidents: { data: null, error: "API not available: admin metrics/sos-incidents-trend endpoint required" },
    };
  },

  async getSubscriptionsOverview() {
    return {
      data: null,
      error: "API not available: admin subscriptions/overview endpoint required",
    };
  },

  async getDevicesOverview() {
    return {
      data: null,
      error: "API not available: admin devices/overview endpoint required",
    };
  },

  async getFamiliesOverview() {
    return {
      data: null,
      error: "API not available: admin families/overview endpoint required",
    };
  },

  async getRecentAdminActions() {
    return {
      data: null,
      error: "API not available: admin audit/recent endpoint required",
    };
  },

  async getOfflineDevices() {
    return {
      data: null,
      error: "API not available: admin devices/offline endpoint required",
    };
  },

  async getFailedPayments() {
    return {
      data: null,
      error: "API not available: admin subscriptions/failed-payments endpoint required",
    };
  },
};
