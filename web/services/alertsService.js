/**
 * Alerts API Service
 * Handles all alert and SOS-related API calls
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

export const alertsService = {
  /**
   * Get all alerts with optional filters
   * @param {object} filters - { type, status, startDate, endDate, limit, offset }
   */
  async getAlerts(filters = {}) {
    const params = new URLSearchParams(filters);
    return apiRequest(`/alerts?${params}`);
  },

  /**
   * Get SOS alerts only
   */
  async getSOSAlerts() {
    return apiRequest('/alerts/sos');
  },

  /**
   * Resolve an alert
   * @param {string|number} alertId
   * @param {object} data - { resolution, status }
   */
  async resolveAlert(alertId, data = {}) {
    return apiRequest(`/alerts/${encodeURIComponent(alertId)}/resolve`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'resolved', ...data }),
    });
  },

  /**
   * Dismiss/cancel an alert
   * @param {string|number} alertId
   */
  async dismissAlert(alertId) {
    return apiRequest(`/alerts/${encodeURIComponent(alertId)}/dismiss`, {
      method: 'PATCH',
    });
  },
};
