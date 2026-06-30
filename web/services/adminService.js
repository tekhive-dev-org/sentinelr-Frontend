import { cachedFetch } from '../utils/apiCache';
import { enqueueMutation } from '../utils/requestQueue';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

const getAuthToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

const parseResponse = async (response) => {
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return response.json();
  }
  return response.text();
};

const apiRequest = async (endpoint, options = {}) => {
  return cachedFetch(endpoint, options, async () => {
    const token = getAuthToken();
    if (!token) {
      throw new Error("Missing auth token");
    }

    const maxRetries = options.skipRetry ? 1 : 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
          "x-access-token": token,
          ...options.headers,
        },
        ...options,
      });

      // 429 — retry with exponential backoff
      if (response.status === 429 && attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 8000);
        console.warn(`[adminService] 429 on ${endpoint}, retrying in ${delay}ms (attempt ${attempt}/${maxRetries})`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

      const data = await parseResponse(response);
      if (!response.ok) {
        throw new Error(data?.message || data || "Request failed");
      }

      return data;
    }

    throw new Error("API Error: 429");
  });
};

const adminService = {
  getAllUsers() {
    return apiRequest("/admin/all", { method: "GET" });
  },
  getBlockedUsers() {
    return apiRequest("/admin/blocked?blocked=true", { method: "GET" });
  },
  getVerifiedUsers(verified = true) {
    return apiRequest(`/admin/verified?verified=${verified}`, { method: "GET" });
  },
  updateUserBlockStatus(userId, action) {
    return enqueueMutation(() =>
      apiRequest(`/admin/${userId}/block`, {
        method: "PATCH",
        body: JSON.stringify({ action }),
      })
    );
  },
};

export default adminService;
