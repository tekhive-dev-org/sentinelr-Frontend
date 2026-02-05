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
  const token = getAuthToken();
  if (!token) {
    throw new Error("Missing auth token");
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
      "x-access-token": token,
      ...options.headers,
    },
    ...options,
  });

  const data = await parseResponse(response);
  if (!response.ok) {
    throw new Error(data?.message || data || "Request failed");
  }

  return data;
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
    return apiRequest(`/admin/${userId}/block`, {
      method: "PATCH",
      body: JSON.stringify({ action }),
    });
  },
};

export default adminService;
