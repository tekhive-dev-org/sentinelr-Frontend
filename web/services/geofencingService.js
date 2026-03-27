/**
 * Geofencing API Service
 * Handles all geofence CRUD and event API calls
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && {
        Authorization: `Bearer ${token}`,
        'x-access-token': token,
      }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    if (response.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    throw new Error(error.message || `API Error: ${response.status}`);
  }

  return response.json();
}

export const geofencingService = {
  /**
   * Get all geofences
   * @returns {Promise<{ geofences: Geofence[] }>}
   */
  async getGeofences() {
    return apiRequest('/geofences');
  },

  /**
   * Create a new geofence
   * @param {object} geofence - { name, type, center, radius, address, notifyOnEntry, notifyOnExit, assignedUserIds, schedule }
   */
  async createGeofence(geofence) {
    return apiRequest('/create/geofence', {
      method: 'POST',
      body: JSON.stringify(geofence),
    });
  },

  /**
   * Update an existing geofence
   * @param {string|number} geofenceId
   * @param {object} updates
   */
  async updateGeofence(geofenceId, updates) {
    return apiRequest(`/geofences/${encodeURIComponent(geofenceId)}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  /**
   * Delete a geofence
   * @param {string|number} geofenceId
   */
  async deleteGeofence(geofenceId) {
    return apiRequest(`/geofences/${encodeURIComponent(geofenceId)}`, {
      method: 'DELETE',
    });
  },

  /**
   * Toggle geofence active state
   * @param {string|number} geofenceId
   * @param {boolean} isActive
   */
  async toggleGeofence(geofenceId, isActive) {
    return apiRequest(`/geofences/${encodeURIComponent(geofenceId)}/toggle`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    });
  },

  /**
   * Get geofence events/history
   * @param {string|number} geofenceId
   */
  async getGeofenceEvents(geofenceId) {
    return apiRequest(`/geofences/${encodeURIComponent(geofenceId)}/events`);
  },
};
