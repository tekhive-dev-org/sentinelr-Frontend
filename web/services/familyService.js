/**
 * Family API Service
 * Handles all family management API calls
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const USE_MOCK = false; // Set to false to use real API

// Helper to get auth token
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('accessToken');
  }
  return null;
};

// Mock data for development
const mockFamily = {
  id: 1,
  familyName: 'Demo Family',
  createdBy: 1,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  deletedAt: null,
  members: [
    { id: 1, userId: 1, relationship: 'Parent', name: 'John Doe' },
    { id: 2, userId: 2, relationship: 'Child', name: 'Jane Doe' },
  ],
};

// API request helper
async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
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
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        success: true,
        message: 'Family created successfully.',
        family: {
          ...mockFamily,
          id: Date.now(),
          familyName,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      };
    }

    return apiRequest('/family/create-family', {
      method: 'POST',
      body: JSON.stringify({ familyName }),
    });
  },

  /**
   * Add a member to a family
   * @param {object} memberData - { familyId, userId, relationship }
   * @returns {Promise<{ message: string }>}
   */
  async addFamilyMember({ familyId, userId, relationship }) {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        message: 'Member added successfully.',
      };
    }

    return apiRequest('/family/add-member', {
      method: 'POST',
      body: JSON.stringify({ familyId, userId, relationship }),
    });
  },

  /**
   * Get family details
   * @param {number} familyId - Family ID
   * @returns {Promise<{ success: boolean, family: object }>}
   */
  async getFamily(familyId) {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return {
        success: true,
        family: mockFamily,
      };
    }

    return apiRequest(`/family/${familyId}`);
  },

  /**
   * Get all families for the current user
   * @returns {Promise<{ success: boolean, families: array }>}
   */
  async getFamilies() {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return {
        success: true,
        families: [mockFamily],
      };
    }

    return apiRequest('/family');
  },

  /**
   * Get family members
   * @param {number} familyId - Family ID
   * @returns {Promise<{ success: boolean, members: array }>}
   */
  async getFamilyMembers(familyId) {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return {
        success: true,
        members: mockFamily.members,
      };
    }

    return apiRequest(`/family/${familyId}/members`);
  },

  /**
   * Remove a member from a family
   * @param {number} familyId - Family ID
   * @param {number} userId - User ID to remove
   * @returns {Promise<{ message: string }>}
   */
  async removeFamilyMember(familyId, userId) {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        message: 'Member removed successfully.',
      };
    }

    return apiRequest(`/family/${familyId}/members/${userId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Update family details
   * @param {number} familyId - Family ID
   * @param {object} updates - { familyName }
   * @returns {Promise<{ success: boolean, family: object }>}
   */
  async updateFamily(familyId, updates) {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        success: true,
        family: { ...mockFamily, ...updates },
      };
    }

    return apiRequest(`/family/${familyId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  },

  /**
   * Delete a family
   * @param {number} familyId - Family ID
   * @returns {Promise<{ message: string }>}
   */
  async deleteFamily(familyId) {
    if (USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        message: 'Family deleted successfully.',
      };
    }

    return apiRequest(`/family/${familyId}`, {
      method: 'DELETE',
    });
  },
};

export default familyService;
