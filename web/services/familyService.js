/**
 * Family API Service
 * Handles all family management API calls
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Helper to get auth token
const getAuthToken = () => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
};

// API request helper
async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...(token && {
        Authorization: `Bearer ${token}`,
        "x-access-token": token,
      }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    // Auto-logout on 401 (expired/invalid token)
    if (response.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    throw new Error(error.message || `API Error: ${response.status}`);
  }

  return response.json();
}

export const familyService = {
  /**
   * Create a new family
   * @param {string} familyName - Name of the family
   * @returns {Promise<{ success: boolean, message: string, family: object }>}
   */
  async createFamily(familyName) {
    return apiRequest("/family/create-family", {
      method: "POST",
      body: JSON.stringify({ familyName }),
    });
  },

  /**
   * Add a member to a family
   * @param {object} memberData - { familyId, userId, relationship }
   * @returns {Promise<{ message: string }>}
   */
  async addFamilyMember({
    familyId,
    userId,
    email,
    name,
    relationship,
    phone,
  }) {
    // Build payload: use userId if available, otherwise add new member details
    const payload = { familyId, relationship, role: "Member" };
    if (userId) {
      payload.userId = userId;
    } else {
      payload.userId = null;
      payload.email = email;
      payload.name = name;
      payload.phone = phone;
    }

    return apiRequest("/family/add-member", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  /**
   * Create a child user
   * @param {object} data - { userName, email, phone }
   * @returns {Promise<{ message: string, user: object }>}
   */
  async createChild({ userName, email, phone }) {
    return apiRequest("/family/create-child", {
      method: "POST",
      body: JSON.stringify({ userName, email, phone }),
    });
  },

  /**
   * Get family details
   * @param {number} familyId - Family ID
   * @returns {Promise<{ success: boolean, family: object }>}
   */
  async getFamily(familyId) {
    return apiRequest(`/family/${familyId}`);
  },

  /**
   * Get all families for the current user
   * @returns {Promise<{ success: boolean, families: array }>}
   */
  async getFamilies() {
    return apiRequest("/family");
  },

  /**
   * Get family members for the authenticated user's family
   * @returns {Promise<{ success: boolean, family: object }>}
   */
  async getFamilyMembers() {
    return apiRequest("/family/my-family/members");
  },

  /**
   * Remove a member from a family
   * @param {number} familyId - Family ID
   * @param {number} userId - User ID to remove
   * @returns {Promise<{ message: string }>}
   */
  async removeFamilyMember(familyId, userId) {
    return apiRequest(`/family/${familyId}/members/${userId}`, {
      method: "DELETE",
    });
  },

  /**
   * Update family details
   * @param {number} familyId - Family ID
   * @param {object} updates - { familyName }
   * @returns {Promise<{ success: boolean, family: object }>}
   */
  async updateFamily(familyId, updates) {
    return apiRequest(`/family/${familyId}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  },

  /**
   * Delete a family
   * @param {number} familyId - Family ID
   * @returns {Promise<{ message: string }>}
   */
  async deleteFamily(familyId) {
    return apiRequest(`/family/${familyId}`, {
      method: "DELETE",
    });
  },
};

export default familyService;
