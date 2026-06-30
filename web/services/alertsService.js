/**
 * Alerts API Service
 * Handles all alert and SOS-related API calls
 */

import { cachedFetch } from '../utils/apiCache';
import { enqueueMutation } from '../utils/requestQueue';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

async function apiRequest(endpoint, options = {}) {
  return cachedFetch(endpoint, options, async () => {
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

    const maxRetries = options.skipRetry ? 1 : 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

      // 429 — retry with exponential backoff
      if (response.status === 429 && attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 8000);
        console.warn(`[alertsService] 429 on ${endpoint}, retrying in ${delay}ms (attempt ${attempt}/${maxRetries})`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }

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

    throw new Error('API Error: 429');
  });
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
    try {
      // First try the dedicated /sos-alerts endpoint
      return await apiRequest('/sos-alerts');
    } catch (error) {
      // 429 (rate limit) — don't cascade, re-throw immediately
      if (error.message?.includes('429') || error.message?.toLowerCase?.().includes('too many')) {
        throw error;
      }
      console.warn('[alertsService] getSOSAlerts (/sos-alerts) failed, trying /alerts?type=sos:', error.message);
      try {
        // Fallback to filtering by type=sos on alerts list
        return await apiRequest('/alerts?type=sos');
      } catch (fallbackError) {
        // 429 on fallback — re-throw immediately
        if (fallbackError.message?.includes('429') || fallbackError.message?.toLowerCase?.().includes('too many')) {
          throw fallbackError;
        }
        console.warn('[alertsService] getSOSAlerts (/alerts?type=sos) failed:', fallbackError.message);
        // Last resort fallback: Fetch all alerts and filter client-side for type 'sos'
        try {
          const allAlerts = await apiRequest('/alerts');
          if (allAlerts && allAlerts.alerts) {
            const filtered = allAlerts.alerts.filter(
              (alert) => String(alert?.type).toLowerCase() === 'sos'
            );
            return {
              ...allAlerts,
              alerts: filtered,
            };
          }
          return allAlerts;
        } catch (clientFilterError) {
          console.error('[alertsService] getSOSAlerts client-side fallback failed:', clientFilterError.message);
          throw clientFilterError;
        }
      }
    }
  },

  /**
   * Get intruder alerts only
   */
  async getIntruderAlerts() {
    return apiRequest('/alerts/intruder');
  },

  /**
   * Get geofence alerts only
   */
  async getGeofenceAlerts() {
    return apiRequest('/alerts?type=geofence');
  },

  /**
   * Get screen time alerts only
   */
  async getScreenTimeAlerts() {
    return apiRequest('/alerts?type=screen_time');
  },

  /**
   * Get alerts for a specific device
   * @param {string|number} deviceId
   * @param {object} filters - { type, status, limit, offset }
   * @returns {Promise<{ success: boolean, total: number, device: object, alerts: array }>}
   */
  async getDeviceAlerts(deviceId, filters = {}) {
    const params = new URLSearchParams();
    if (filters.type) params.set('type', filters.type);
    if (filters.status) params.set('status', filters.status);
    if (filters.limit != null) params.set('limit', filters.limit);
    if (filters.offset != null) params.set('offset', filters.offset);

    const qs = params.toString();
    return apiRequest(`/alerts/device/${encodeURIComponent(deviceId)}${qs ? `?${qs}` : ''}`);
  },

  /**
   * Resolve an alert
   * @param {string|number} alertId
   * @param {object} data - { resolution, status }
   */
  async resolveAlert(alertId, data = {}) {
    return enqueueMutation(() =>
      apiRequest(`/alerts/${encodeURIComponent(alertId)}/resolve`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'resolved', ...data }),
      })
    );
  },

  /**
   * Dismiss/cancel an alert
   * @param {string|number} alertId
   */
  async dismissAlert(alertId) {
    return enqueueMutation(() =>
      apiRequest(`/alerts/${encodeURIComponent(alertId)}/dismiss`, {
        method: 'PATCH',
      })
    );
  },
};
